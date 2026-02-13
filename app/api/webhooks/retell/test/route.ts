import { NextResponse } from 'next/server';

// Test endpoint to verify webhook is accessible
// Visit: https://your-domain.com/api/webhooks/retell/test
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Retell webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    callEventsUrl: '/api/webhooks/retell/call-events'
  });
}

// Also handle POST for testing
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('[webhook-test] Received test webhook:', JSON.stringify(body, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Test webhook received successfully',
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[webhook-test] Error processing test webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process test webhook' },
      { status: 500 }
    );
  }
}
