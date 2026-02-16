import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import Retell from 'retell-sdk';

const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY!,
});

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
  request: Request,
  { params }: { params: { agentId: string } }
) {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('agent_data_collection_configs')
      .select('*')
      .eq('agent_id', params.agentId)
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
 * Save data collection configuration and update Retell agent
 */
export async function POST(
  request: Request,
  { params }: { params: { agentId: string } }
) {
  try {
    const body = await request.json();
    const { fields } = body as { fields: DataField[] };

    const supabase = createServiceClient();

    // Get agent details
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('retell_agent_id, business_name')
      .eq('id', params.agentId)
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

    // Prepare Retell analysis config
    const retellConfig = {
      extract_fields: enabledFields.map(f => ({
        name: f.id,
        label: f.label,
        type: f.type,
        required: f.required,
      })),
    };

    // Generate updated prompt instructions for data collection
    const dataCollectionInstructions = generateDataCollectionPrompt(enabledFields);

    // Save to database
    const { error: upsertError } = await supabase
      .from('agent_data_collection_configs')
      .upsert(
        {
          agent_id: params.agentId,
          fields: fields,
          retell_analysis_config: retellConfig,
        },
        {
          onConflict: 'agent_id',
        }
      );

    if (upsertError) throw upsertError;

    // Update Retell agent with new prompt instructions
    if (agent.retell_agent_id) {
      try {
        // Get current agent from Retell
        const currentAgent = await retellClient.agent.retrieve(agent.retell_agent_id);

        // Append data collection instructions to the agent's general prompt
        const updatedPrompt = updatePromptWithDataCollection(
          (currentAgent as unknown as Record<string, unknown>).general_prompt as string || '',
          dataCollectionInstructions
        );

        // Update Retell agent
        await retellClient.agent.update(agent.retell_agent_id, {
          general_prompt: updatedPrompt,
        } as Parameters<typeof retellClient.agent.update>[1]);

        console.log(`[data-collection] Updated Retell agent ${agent.retell_agent_id} with data collection instructions`);
      } catch (retellError) {
        console.error('[data-collection] Failed to update Retell agent:', retellError);
        // Don't fail the request if Retell update fails
        // The config is still saved in our database
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Data collection settings saved',
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
      // Remove old section, keep everything after
      basePrompt =
        existingPrompt.substring(0, startIndex) +
        restOfPrompt.substring(nextSectionMatch.index);
    } else {
      // Remove to end
      basePrompt = existingPrompt.substring(0, startIndex).trim();
    }
  }

  // Add new instructions at the end
  return basePrompt + newInstructions;
}
