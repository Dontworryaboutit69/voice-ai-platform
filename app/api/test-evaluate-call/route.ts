import { NextResponse } from 'next/server';
import { evaluateCall } from '@/lib/services/ai-manager.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const callId = searchParams.get('callId');

    if (!callId) {
      return NextResponse.json({ error: 'callId required' }, { status: 400 });
    }

    console.log(`[Test] Evaluating call ${callId}...`);

    const result = await evaluateCall(callId);

    if (!result) {
      return NextResponse.json({
        message: 'Call was filtered out (non-interactive)',
        callId,
      });
    }

    return NextResponse.json({
      message: 'Evaluation completed',
      callId,
      evaluation: result,
    });
  } catch (error: any) {
    console.error('[Test] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
