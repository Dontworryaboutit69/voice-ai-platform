import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    // Create a client with direct database URL for migrations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        db: {
          schema: 'public'
        }
      }
    );

    // Run each ALTER statement separately
    const migrations = [
      `alter table public.agents add column if not exists email_notifications_enabled boolean default true`,
      `alter table public.agents add column if not exists email_message_taken boolean default true`,
      `alter table public.agents add column if not exists email_appointment_booked boolean default true`,
      `alter table public.agents add column if not exists email_daily_summary boolean default true`
    ];

    for (const sql of migrations) {
      const { error } = await supabase.rpc('exec_sql', { query: sql });
      if (error) {
        console.error('Migration error:', error);
      }
    }

    console.log('✅ Email preferences migration complete!');

    return NextResponse.json({
      success: true,
      message: 'Email preferences columns added successfully'
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
