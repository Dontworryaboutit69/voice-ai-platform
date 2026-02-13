import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

export async function GET() {
  try {
    const supabase = createServiceClient();

    // Get all recent calls
    const { data: calls, error } = await supabase
      .from('calls')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      });
    }

    return NextResponse.json({
      success: true,
      totalCalls: calls?.length || 0,
      calls: calls || [],
      message: calls?.length ? `Found ${calls.length} recent calls` : 'No calls found in database'
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to check calls'
    }, { status: 500 });
  }
}
