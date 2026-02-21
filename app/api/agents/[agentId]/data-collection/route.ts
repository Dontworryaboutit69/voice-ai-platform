import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import Retell from 'retell-sdk';

const RETELL_API_KEY = process.env.RETELL_API_KEY || '';

interface DataField {
  id: string;
  type: 'text' | 'phone' | 'email' | 'select';
  label: string;
  required: boolean;
  enabled: boolean;
  isCustom?: boolean;
}

/**
 * GET /api/agents/[agentId]/data-collection
 * Get current data collection configuration
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('agent_data_collection_configs')
      .select('*')
      .eq('agent_id', agentId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[data-collection GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents/[agentId]/data-collection
 * Save data collection configuration and update Retell agent with:
 * 1. post_call_analysis_data (native Retell extraction)
 * 2. Prompt instructions for natural data collection during calls
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const body = await request.json();
    const { fields } = body as { fields: DataField[] };

    const supabase = createServiceClient();

    // Get agent details
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('retell_agent_id, retell_llm_id, business_name')
      .eq('id', agentId)
      .single();

    if (agentError) throw agentError;
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Filter enabled fields
    const enabledFields = fields.filter(f => f.enabled);

    if (enabledFields.length === 0) {
      return NextResponse.json(
        { error: 'At least one field must be selected' },
        { status: 400 }
      );
    }

    // Prepare Retell analysis config for our DB
    const retellConfig = {
      extract_fields: enabledFields.map(f => ({
        name: f.id,
        label: f.label,
        type: f.type,
        required: f.required,
      })),
    };

    // Save to database
    const { error: upsertError } = await supabase
      .from('agent_data_collection_configs')
      .upsert(
        {
          agent_id: agentId,
          fields: fields,
          retell_analysis_config: retellConfig,
        },
        {
          onConflict: 'agent_id',
        }
      );

    if (upsertError) throw upsertError;

    // Sync to Retell
    if (agent.retell_agent_id && RETELL_API_KEY) {
      const retell = new Retell({ apiKey: RETELL_API_KEY });

      try {
        // 1. Set native post_call_analysis_data on the Retell agent
        //    This uses Retell's built-in extraction after each call
        const postCallAnalysisData = enabledFields.map(f => {
          // Map our field types to Retell's analysis types
          if (f.type === 'phone' || f.type === 'email') {
            return {
              type: 'string' as const,
              name: f.id,
              description: `${f.label} (${f.type} format)${f.required ? ' - Required' : ''}`,
            };
          }
          return {
            type: 'string' as const,
            name: f.id,
            description: `${f.label}${f.required ? ' - Required' : ''}`,
          };
        });

        await retell.agent.update(agent.retell_agent_id, {
          post_call_analysis_data: postCallAnalysisData,
        } as Parameters<typeof retell.agent.update>[1]);

        console.log(`[data-collection] Updated Retell agent ${agent.retell_agent_id} with ${postCallAnalysisData.length} post_call_analysis_data fields`);
      } catch (retellError) {
        console.error('[data-collection] Failed to update Retell agent post_call_analysis_data:', retellError);
      }

      // 2. Update prompt on the LLM so the agent naturally collects the data during calls
      if (agent.retell_llm_id) {
        try {
          const currentLlm = await retell.llm.retrieve(agent.retell_llm_id);
          const currentPrompt = (currentLlm as any).general_prompt || '';
          const dataCollectionInstructions = generateDataCollectionPrompt(enabledFields);
          const updatedPrompt = updatePromptWithDataCollection(currentPrompt, dataCollectionInstructions);

          await retell.llm.update(agent.retell_llm_id, {
            general_prompt: updatedPrompt,
          });

          console.log(`[data-collection] Updated Retell LLM ${agent.retell_llm_id} prompt with data collection instructions`);
        } catch (llmError) {
          console.error('[data-collection] Failed to update Retell LLM prompt:', llmError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Data collection settings saved and synced to Retell',
      enabledFieldsCount: enabledFields.length,
    });
  } catch (error) {
    console.error('[data-collection POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}

/**
 * Generate prompt instructions for data collection based on enabled fields
 */
function generateDataCollectionPrompt(fields: DataField[]): string {
  const requiredFields = fields.filter(f => f.required);
  const optionalFields = fields.filter(f => !f.required);

  let instructions = '\n\n## Information Collection\n\n';
  instructions += 'During the call, naturally collect the following information:\n\n';

  if (requiredFields.length > 0) {
    instructions += '**Required Information:**\n';
    requiredFields.forEach(field => {
      instructions += `- ${field.label}: Must be collected before ending the call\n`;
    });
    instructions += '\n';
  }

  if (optionalFields.length > 0) {
    instructions += '**Optional Information (if relevant):**\n';
    optionalFields.forEach(field => {
      instructions += `- ${field.label}\n`;
    });
    instructions += '\n';
  }

  instructions += 'Important Guidelines:\n';
  instructions += '- Ask for information naturally during the conversation flow\n';
  instructions += '- Don\'t ask for multiple pieces of information at once\n';
  instructions += '- If the customer already provided information, don\'t ask again\n';
  instructions += '- For required fields, ensure you have collected them before ending the call\n';

  return instructions;
}

/**
 * Update existing prompt with data collection instructions
 * Removes old data collection section if exists and adds new one
 */
function updatePromptWithDataCollection(
  existingPrompt: string,
  newInstructions: string
): string {
  // Remove existing data collection section if present
  const sectionMarker = '## Information Collection';
  const startIndex = existingPrompt.indexOf(sectionMarker);

  let basePrompt = existingPrompt;
  if (startIndex !== -1) {
    // Find the next section or end of prompt
    const restOfPrompt = existingPrompt.substring(startIndex);
    const nextSectionMatch = restOfPrompt.match(/\n##\s+[A-Z]/);

    if (nextSectionMatch && nextSectionMatch.index) {
      basePrompt =
        existingPrompt.substring(0, startIndex) +
        restOfPrompt.substring(nextSectionMatch.index);
    } else {
      basePrompt = existingPrompt.substring(0, startIndex).trim();
    }
  }

  return basePrompt + newInstructions;
}
