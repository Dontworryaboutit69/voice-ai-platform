import { NextRequest, NextResponse } from 'next/server';
import {
  sendMessageTakenEmail,
  sendAppointmentBookedEmail,
  sendDailySummaryEmail
} from '@/lib/services/email.service';

export async function POST(request: NextRequest) {
  try {
    const { type, testEmail } = await request.json();

    if (!testEmail) {
      return NextResponse.json({
        success: false,
        error: 'testEmail is required'
      }, { status: 400 });
    }

    let result;

    switch (type) {
      case 'message_taken':
        result = await sendMessageTakenEmail({
          to: testEmail,
          businessName: 'Elite Dental Care',
          customerName: 'John Smith',
          customerPhone: '+13055551234',
          customerEmail: 'john.smith@example.com',
          reason: 'Pricing question about teeth whitening',
          callTime: new Date().toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
          }),
          callId: 'test-call-123',
          agentId: 'test-agent-456'
        });
        break;

      case 'appointment_booked':
        result = await sendAppointmentBookedEmail({
          to: testEmail,
          businessName: 'Elite Dental Care',
          customerName: 'Sarah Johnson',
          customerPhone: '+13055559876',
          customerEmail: 'sarah.j@example.com',
          service: 'Teeth Cleaning & Exam',
          appointmentDate: 'March 15, 2026',
          appointmentTime: '2:30 PM EST',
          callId: 'test-call-124',
          agentId: 'test-agent-456'
        });
        break;

      case 'daily_summary':
        result = await sendDailySummaryEmail({
          to: testEmail,
          businessName: 'Elite Dental Care',
          date: new Date().toLocaleDateString('en-US', { dateStyle: 'long' }),
          totalCalls: 12,
          appointmentsBooked: 8,
          messagesTaken: 3,
          callDetails: [
            {
              id: '1',
              time: '9:15 AM',
              duration: '3m 45s',
              outcome: 'booked',
              customerName: 'Alice Brown'
            },
            {
              id: '2',
              time: '10:30 AM',
              duration: '2m 12s',
              outcome: 'message',
              customerName: 'Bob Wilson'
            },
            {
              id: '3',
              time: '11:45 AM',
              duration: '4m 30s',
              outcome: 'booked',
              customerName: 'Carol Davis'
            },
            {
              id: '4',
              time: '1:20 PM',
              duration: '1m 55s',
              outcome: 'completed',
              customerName: 'David Lee'
            },
            {
              id: '5',
              time: '2:45 PM',
              duration: '5m 10s',
              outcome: 'booked',
              customerName: 'Emma Martinez'
            }
          ],
          agentId: 'test-agent-456'
        });
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid type. Use: message_taken, appointment_booked, or daily_summary'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${testEmail}`,
      emailId: result?.id
    });

  } catch (error: any) {
    console.error('[Test Email] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send test email'
    }, { status: 500 });
  }
}
