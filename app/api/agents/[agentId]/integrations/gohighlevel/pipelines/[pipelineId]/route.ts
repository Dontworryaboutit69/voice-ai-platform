import { NextRequest, NextResponse } from 'next/server';
import { GoHighLevelIntegration } from '@/lib/integrations/gohighlevel';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string; pipelineId: string }> }
) {
  try {
    const { agentId, pipelineId } = await params;
    const { api_key, location_id } = await request.json();

    if (!api_key || !location_id) {
      return NextResponse.json(
        { success: false, error: 'API key and location ID required' },
        { status: 400 }
      );
    }

    // Create temporary GHL integration instance to fetch stages
    const tempConnection = {
      api_key,
      config: { location_id }
    };

    const ghl = new GoHighLevelIntegration(tempConnection);
    const result = await ghl.getPipelineStages(pipelineId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to fetch stages' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      stages: result.data
    });
  } catch (error: any) {
    console.error('Error fetching GHL pipeline stages:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
