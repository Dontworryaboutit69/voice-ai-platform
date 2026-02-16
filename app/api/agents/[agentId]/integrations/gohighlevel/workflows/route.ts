import { NextRequest, NextResponse } from 'next/server';
import { GoHighLevelIntegration } from '@/lib/integrations/gohighlevel';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const { api_key, location_id } = await request.json();

    if (!api_key || !location_id) {
      return NextResponse.json(
        { success: false, error: 'API key and location ID required' },
        { status: 400 }
      );
    }

    // Create temporary GHL integration instance to fetch workflows
    const tempConnection = {
      api_key,
      config: { location_id }
    };

    const ghl = new GoHighLevelIntegration(tempConnection);
    const result = await ghl.getWorkflows();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to fetch workflows' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      workflows: result.data
    });
  } catch (error: any) {
    console.error('Error fetching GHL workflows:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
