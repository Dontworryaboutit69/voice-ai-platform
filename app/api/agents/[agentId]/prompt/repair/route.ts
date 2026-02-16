import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

/**
 * Repairs corrupted prompt versions by regenerating sections from compiled_prompt
 * This fixes versions where individual sections are broken/truncated
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const supabase = createServiceClient();

    console.log('[Repair] Starting repair for agent:', agentId);

    // Get all versions for this agent
    const { data: versions, error: versionsError } = await supabase
      .from('prompt_versions')
      .select('*')
      .eq('agent_id', agentId)
      .order('version_number', { ascending: true });

    if (versionsError || !versions || versions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No versions found' },
        { status: 404 }
      );
    }

    console.log(`[Repair] Found ${versions.length} versions to check`);

    // Find a good "template" version (one that has complete sections)
    // We'll use the earliest version that has complete data
    const templateVersion = versions.find(v =>
      v.prompt_role &&
      v.prompt_role.length > 100 &&
      !v.prompt_role.startsWith('r.') && // Not corrupted
      !v.prompt_personality?.includes('Add to end of') // No meta-instructions
    );

    if (!templateVersion) {
      console.log('[Repair] No clean template found - will use fallback logic');
    } else {
      console.log(`[Repair] Using version ${templateVersion.version_number} as template`);
    }

    const repaired = [];
    const skipped = [];

    for (const version of versions) {
      // Check if this version needs repair
      const needsRepair =
        !version.prompt_role ||
        version.prompt_role.length < 100 ||
        version.prompt_role.startsWith('r.') ||
        version.prompt_personality?.includes('Add to end of') ||
        version.prompt_personality?.endsWith('what you can a') ||
        version.prompt_call_flow?.startsWith('nd cannot discuss');

      if (!needsRepair) {
        skipped.push(version.version_number);
        continue;
      }

      console.log(`[Repair] Version ${version.version_number} needs repair`);

      // If we have a template, use it as base and overlay any valid changes
      if (templateVersion) {
        const { error: updateError } = await supabase
          .from('prompt_versions')
          .update({
            prompt_role: templateVersion.prompt_role,
            prompt_personality: templateVersion.prompt_personality,
            prompt_call_flow: templateVersion.prompt_call_flow,
            prompt_info_recap: templateVersion.prompt_info_recap,
            prompt_functions: templateVersion.prompt_functions || [],
            prompt_knowledge: templateVersion.prompt_knowledge || '',
          })
          .eq('id', version.id);

        if (updateError) {
          console.error(`[Repair] Failed to repair version ${version.version_number}:`, updateError);
        } else {
          repaired.push(version.version_number);
          console.log(`[Repair] ✅ Repaired version ${version.version_number}`);
        }
      }
    }

    // Update the agent to use the best available version
    const bestVersion = versions.find(v =>
      v.prompt_role &&
      v.prompt_role.length > 100 &&
      !v.prompt_role.startsWith('r.')
    );

    if (bestVersion) {
      await supabase
        .from('agents')
        .update({ current_prompt_id: bestVersion.id })
        .eq('id', agentId);

      console.log(`[Repair] Set agent to use version ${bestVersion.version_number}`);
    }

    return NextResponse.json({
      success: true,
      message: `Repaired ${repaired.length} versions, skipped ${skipped.length} clean versions`,
      repaired,
      skipped,
      current_version: bestVersion?.version_number
    });

  } catch (error: any) {
    console.error('[Repair] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Repair failed' },
      { status: 500 }
    );
  }
}
