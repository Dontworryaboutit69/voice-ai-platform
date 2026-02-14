import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

export async function GET() {
  try {
    console.log('[test-insert] Starting test...');
    console.log('[test-insert] ENV check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL
    });

    const supabase = createServiceClient();
    console.log('[test-insert] Client created');

    const testData = {
      retell_call_id: `test_endpoint_${Date.now()}`,
      agent_id: 'f02fd2dc-32d7-42b8-8378-126d354798f7',
      from_number: '+15555551234',
      to_number: '+15555555678',
      started_at: new Date().toISOString(),
      call_status: 'in_progress' as const
    };

    console.log('[test-insert] Inserting:', testData);

    const { data, error } = await supabase
      .from('calls')
      .insert(testData)
      .select();

    console.log('[test-insert] Insert complete');
    console.log('[test-insert] Error:', error);
    console.log('[test-insert] Data:', data);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        fullError: error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Insert succeeded',
      data,
      callId: testData.retell_call_id
    });

  } catch (err: any) {
    console.error('[test-insert] Exception:', err);
    return NextResponse.json({
      success: false,
      error: err.message,
      stack: err.stack
    }, { status: 500 });
  }
}
