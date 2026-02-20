import { NextResponse } from 'next/server';
import { generateRewriteForIssues } from '@/lib/services/ai-manager.service';

/**
 * POST /api/agents/[agentId]/ai-manager/generate-fix
 * Generate a rewrite suggestion for selected issues.
 * Called when user selects issues and clicks "Generate Fix".
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const body = await request.json();

    const { issues, analysisId } = body as {
      issues: Array<{
        issue: string;
        severity: string;
        target_section: string;
        fix_guidance: string;
        evidence: string[];
      }>;
      analysisId?: string;
    };

    if (!issues || !Array.isArray(issues) || issues.length === 0) {
      return NextResponse.json(
        { error: 'No issues provided. Select at least one issue to fix.' },
        { status: 400 }
      );
    }

    // Filter out platform-level issues (target_section = "none")
    const fixableIssues = issues.filter(i => i.target_section && i.target_section !== 'none');
    if (fixableIssues.length === 0) {
      return NextResponse.json(
        { error: 'All selected issues are platform-level (not fixable via prompt). Adjust Retell speech settings instead.' },
        { status: 400 }
      );
    }

    console.log(`[generate-fix] Generating fix for ${fixableIssues.length} issues (agent: ${agentId})`);

    const suggestionId = await generateRewriteForIssues(agentId, fixableIssues, analysisId);

    if (!suggestionId) {
      return NextResponse.json(
        { error: 'Failed to generate a fix. The rewrite produced no usable content.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      suggestionId,
      message: `Generated fix for ${fixableIssues.length} issue${fixableIssues.length > 1 ? 's' : ''}`,
    });
  } catch (error: any) {
    console.error('[generate-fix] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate fix' },
      { status: 500 }
    );
  }
}
