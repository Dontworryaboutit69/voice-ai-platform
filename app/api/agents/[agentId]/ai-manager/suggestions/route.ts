import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { applySuggestion } from '@/lib/services/improvement-suggestion.service';

/**
 * GET /api/agents/[agentId]/ai-manager/suggestions
 * List all suggestions for an agent (optionally filter by status)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // pending, accepted, rejected

    const supabase = createServiceClient();

    // Simple query without joins since source_call_ids is an array
    let query = supabase
      .from('ai_improvement_suggestions')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false});

    if (status) {
      query = query.eq('status', status);
    }

    const { data: suggestions, error } = await query;

    if (error) {
      console.error('[ai-manager/suggestions GET] Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch suggestions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('[ai-manager/suggestions GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents/[agentId]/ai-manager/suggestions
 * Accept or reject a suggestion
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    console.log('[ai-manager/suggestions POST] AgentId:', agentId);

    const body = await request.json();
    console.log('[ai-manager/suggestions POST] Request body:', body);

    const { suggestionId, action, userId } = body as {
      suggestionId?: string;
      action: 'accept' | 'reject' | 'reject_all';
      userId?: string;
    };

    if (!action) {
      return NextResponse.json(
        { error: 'Missing required field: action' },
        { status: 400 }
      );
    }

    if (action !== 'reject_all' && (!suggestionId || !userId)) {
      console.error('[ai-manager/suggestions POST] Missing fields:', { suggestionId, action, userId });
      return NextResponse.json(
        { error: 'Missing required fields: suggestionId, action, userId' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Handle reject_all before individual suggestion lookup
    if (action === 'reject_all') {
      const { data: rejected, error: updateError } = await supabase
        .from('ai_improvement_suggestions')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
        })
        .eq('agent_id', agentId)
        .eq('status', 'pending')
        .select('id');

      if (updateError) {
        console.error('[ai-manager/suggestions POST] Bulk reject error:', updateError);
        return NextResponse.json(
          { error: 'Failed to reject suggestions' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Rejected ${rejected?.length || 0} pending suggestions`,
        count: rejected?.length || 0,
      });
    }

    // Verify suggestion belongs to this agent
    const { data: suggestion, error: suggestionError } = await supabase
      .from('ai_improvement_suggestions')
      .select('id, agent_id, status')
      .eq('id', suggestionId)
      .single();

    if (suggestionError || !suggestion) {
      return NextResponse.json(
        { error: 'Suggestion not found' },
        { status: 404 }
      );
    }

    if (suggestion.agent_id !== agentId) {
      return NextResponse.json(
        { error: 'Suggestion does not belong to this agent' },
        { status: 403 }
      );
    }

    if (suggestion.status !== 'pending') {
      return NextResponse.json(
        { error: 'Suggestion has already been reviewed' },
        { status: 400 }
      );
    }

    if (action === 'accept') {
      // Apply the suggestion and create new prompt version
      console.log('[ai-manager/suggestions POST] Applying suggestion:', suggestionId);

      try {
        const newVersionId = await applySuggestion(suggestionId, userId);
        console.log('[ai-manager/suggestions POST] New version created:', newVersionId);

        return NextResponse.json({
          success: true,
          message: 'Suggestion accepted and applied',
          newVersionId,
        });
      } catch (applyError: any) {
        console.error('[ai-manager/suggestions POST] Apply error:', applyError);
        return NextResponse.json(
          { error: `Failed to apply suggestion: ${applyError.message}` },
          { status: 500 }
        );
      }
    } else if (action === 'reject') {
      // Just update status to rejected
      // reviewed_by is a UUID FK — only set if userId looks like a valid UUID
      const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
      const { error: updateError } = await supabase
        .from('ai_improvement_suggestions')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          ...(isValidUuid ? { reviewed_by: userId } : {}),
        })
        .eq('id', suggestionId);

      if (updateError) {
        console.error('[ai-manager/suggestions POST] Update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to reject suggestion' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Suggestion rejected',
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "accept", "reject", or "reject_all"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[ai-manager/suggestions POST] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
