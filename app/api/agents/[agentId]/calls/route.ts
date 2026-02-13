import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = createServiceClient();

    // Build query
    let query = supabase
      .from('calls')
      .select('*', { count: 'exact' })
      .eq('agent_id', agentId)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('call_status', status);
    }

    if (search) {
      query = query.or(`from_number.ilike.%${search}%,to_number.ilike.%${search}%`);
    }

    const { data: calls, error, count } = await query;

    if (error) {
      console.error('Error fetching calls:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch calls' },
        { status: 500 }
      );
    }

    // Calculate analytics
    const { data: analytics } = await supabase
      .from('calls')
      .select('duration_ms, call_status')
      .eq('agent_id', agentId)
      .gte('started_at', new Date(new Date().setDate(1)).toISOString()); // This month

    const totalCalls = analytics?.length || 0;
    const totalMinutes = Math.ceil((analytics?.reduce((sum, call) => sum + (call.duration_ms || 0), 0) || 0) / 60000);
    const avgDuration = totalCalls > 0 ? Math.ceil(totalMinutes / totalCalls) : 0;
    const completedCalls = analytics?.filter(call => call.call_status === 'completed').length || 0;
    const successRate = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;

    return NextResponse.json({
      success: true,
      calls,
      total: count || 0,
      analytics: {
        totalCalls,
        totalMinutes,
        avgDuration,
        successRate
      }
    });

  } catch (error: any) {
    console.error('Error in calls API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch calls' },
      { status: 500 }
    );
  }
}
