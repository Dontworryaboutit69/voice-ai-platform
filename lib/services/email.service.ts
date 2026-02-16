import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder_key');

// Base email configuration
// TODO: Update with your verified domain after setting up in Resend (https://resend.com/domains)
// For now using Resend's test email address which works immediately
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

interface MessageTakenEmailParams {
  to: string;
  businessName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  reason: string;
  callTime: string;
  callId: string;
  agentId: string;
}

interface AppointmentBookedEmailParams {
  to: string;
  businessName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  service: string;
  appointmentDate: string;
  appointmentTime: string;
  callId: string;
  agentId: string;
}

interface DailySummaryEmailParams {
  to: string;
  businessName: string;
  date: string;
  totalCalls: number;
  appointmentsBooked: number;
  messagesTaken: number;
  callDetails: Array<{
    id: string;
    time: string;
    duration: string;
    outcome: string;
    customerName?: string;
  }>;
  agentId: string;
}

/**
 * Send email notification when a customer leaves a message (failed transfer or no transfer available)
 */
export async function sendMessageTakenEmail(params: MessageTakenEmailParams) {
  const {
    to,
    businessName,
    customerName,
    customerPhone,
    customerEmail,
    reason,
    callTime,
    callId,
    agentId
  } = params;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `🔔 Urgent: New Message from ${customerName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">🔔 New Customer Message</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Callback Needed ASAP</p>
            </div>

            <!-- Content -->
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">

              <p style="font-size: 16px; margin-bottom: 25px;">
                You have a new message from a customer who needs your attention:
              </p>

              <!-- Customer Details Card -->
              <div style="background: #f9fafb; padding: 25px; border-radius: 8px; border-left: 4px solid #667eea; margin-bottom: 25px;">
                <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #111827;">Customer Details</h3>

                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #6b7280; width: 100px;">Name:</td>
                    <td style="padding: 8px 0; color: #111827;">${customerName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Phone:</td>
                    <td style="padding: 8px 0;">
                      <a href="tel:${customerPhone}" style="color: #667eea; text-decoration: none; font-weight: 600;">
                        ${customerPhone}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Email:</td>
                    <td style="padding: 8px 0;">
                      <a href="mailto:${customerEmail}" style="color: #667eea; text-decoration: none;">
                        ${customerEmail}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Reason:</td>
                    <td style="padding: 8px 0; color: #111827;">${reason}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Time:</td>
                    <td style="padding: 8px 0; color: #111827;">${callTime}</td>
                  </tr>
                </table>
              </div>

              <!-- Action Buttons -->
              <div style="margin: 30px 0;">
                <a href="tel:${customerPhone}"
                   style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-right: 10px; margin-bottom: 10px;">
                  📞 Call Now
                </a>

                <a href="${appUrl}/agents/${agentId}/calls?call=${callId}"
                   style="display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-bottom: 10px;">
                  📊 View Call Details
                </a>
              </div>

              <!-- Alert Box -->
              <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; margin-top: 25px;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  ⚠️ <strong>This customer is expecting a callback as soon as possible.</strong>
                </p>
              </div>

            </div>

            <!-- Footer -->
            <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Sent by your AI Voice Agent for <strong>${businessName}</strong>
              </p>
              <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                <a href="${appUrl}/agents/${agentId}/settings" style="color: #667eea; text-decoration: none;">
                  Manage notification settings
                </a>
              </p>
            </div>

          </body>
        </html>
      `
    });

    if (error) {
      console.error('[Email] Failed to send message taken email:', error);
      throw error;
    }

    console.log('[Email] Message taken email sent successfully:', data?.id);
    return data;
  } catch (error) {
    console.error('[Email] Error sending message taken email:', error);
    throw error;
  }
}

/**
 * Send email notification when an appointment is booked
 */
export async function sendAppointmentBookedEmail(params: AppointmentBookedEmailParams) {
  const {
    to,
    businessName,
    customerName,
    customerPhone,
    customerEmail,
    service,
    appointmentDate,
    appointmentTime,
    callId,
    agentId
  } = params;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `✅ New Appointment Booked: ${customerName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">✅ Appointment Booked!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your AI just scheduled a new customer</p>
            </div>

            <!-- Content -->
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">

              <p style="font-size: 16px; margin-bottom: 25px;">
                Great news! Your AI voice agent successfully booked an appointment:
              </p>

              <!-- Appointment Details Card -->
              <div style="background: #ecfdf5; padding: 25px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 25px;">
                <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #111827;">Appointment Details</h3>

                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #6b7280; width: 120px;">Customer:</td>
                    <td style="padding: 8px 0; color: #111827; font-weight: 600;">${customerName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Date:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 18px; font-weight: 600;">${appointmentDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Time:</td>
                    <td style="padding: 8px 0; color: #111827; font-size: 18px; font-weight: 600;">${appointmentTime}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">Service:</td>
                    <td style="padding: 8px 0; color: #111827;">${service}</td>
                  </tr>
                </table>
              </div>

              <!-- Customer Contact Card -->
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h4 style="margin: 0 0 12px 0; font-size: 16px; color: #111827;">Customer Contact</h4>
                <p style="margin: 5px 0; color: #6b7280;">
                  📞 <a href="tel:${customerPhone}" style="color: #667eea; text-decoration: none;">${customerPhone}</a>
                </p>
                <p style="margin: 5px 0; color: #6b7280;">
                  ✉️ <a href="mailto:${customerEmail}" style="color: #667eea; text-decoration: none;">${customerEmail}</a>
                </p>
              </div>

              <!-- Action Button -->
              <div style="margin: 30px 0; text-align: center;">
                <a href="${appUrl}/agents/${agentId}/calls?call=${callId}"
                   style="display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  📊 View Full Call Details
                </a>
              </div>

            </div>

            <!-- Footer -->
            <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Sent by your AI Voice Agent for <strong>${businessName}</strong>
              </p>
              <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                <a href="${appUrl}/agents/${agentId}/settings" style="color: #667eea; text-decoration: none;">
                  Manage notification settings
                </a>
              </p>
            </div>

          </body>
        </html>
      `
    });

    if (error) {
      console.error('[Email] Failed to send appointment booked email:', error);
      throw error;
    }

    console.log('[Email] Appointment booked email sent successfully:', data?.id);
    return data;
  } catch (error) {
    console.error('[Email] Error sending appointment booked email:', error);
    throw error;
  }
}

/**
 * Send daily summary email with call statistics
 */
export async function sendDailySummaryEmail(params: DailySummaryEmailParams) {
  const {
    to,
    businessName,
    date,
    totalCalls,
    appointmentsBooked,
    messagesTaken,
    callDetails,
    agentId
  } = params;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `📊 Daily Summary: ${totalCalls} calls on ${date}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

            <!-- Header -->
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">📊 Daily Call Summary</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">${date}</p>
            </div>

            <!-- Content -->
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">

              <p style="font-size: 16px; margin-bottom: 25px;">
                Here's how your AI voice agent performed today:
              </p>

              <!-- Stats Grid -->
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 30px;">

                <div style="background: #eff6ff; padding: 20px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 32px; font-weight: 700; color: #3b82f6;">${totalCalls}</div>
                  <div style="font-size: 14px; color: #6b7280; margin-top: 5px;">Total Calls</div>
                </div>

                <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 32px; font-weight: 700; color: #10b981;">${appointmentsBooked}</div>
                  <div style="font-size: 14px; color: #6b7280; margin-top: 5px;">Appointments</div>
                </div>

                <div style="background: #fef3c7; padding: 20px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 32px; font-weight: 700; color: #f59e0b;">${messagesTaken}</div>
                  <div style="font-size: 14px; color: #6b7280; margin-top: 5px;">Messages</div>
                </div>

              </div>

              <!-- Call Details -->
              ${callDetails.length > 0 ? `
              <div style="margin-top: 30px;">
                <h3 style="font-size: 18px; color: #111827; margin-bottom: 15px;">Recent Calls</h3>

                ${callDetails.slice(0, 5).map(call => `
                  <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 3px solid #667eea;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div>
                        <div style="font-weight: 600; color: #111827;">${call.customerName || 'Unknown Caller'}</div>
                        <div style="font-size: 14px; color: #6b7280;">${call.time} • ${call.duration}</div>
                      </div>
                      <div style="background: ${call.outcome === 'booked' ? '#10b981' : call.outcome === 'message' ? '#f59e0b' : '#6b7280'}; color: white; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                        ${call.outcome}
                      </div>
                    </div>
                  </div>
                `).join('')}

                ${callDetails.length > 5 ? `
                  <p style="text-align: center; margin-top: 15px; color: #6b7280; font-size: 14px;">
                    + ${callDetails.length - 5} more calls
                  </p>
                ` : ''}
              </div>
              ` : ''}

              <!-- Action Button -->
              <div style="margin: 30px 0; text-align: center;">
                <a href="${appUrl}/agents/${agentId}/calls"
                   style="display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  📊 View All Call Details
                </a>
              </div>

              <!-- Tip Box -->
              <div style="background: #eff6ff; border: 1px solid #3b82f6; padding: 15px; border-radius: 8px; margin-top: 25px;">
                <p style="margin: 0; color: #1e40af; font-size: 14px;">
                  💡 <strong>Tip:</strong> Review call transcripts to identify areas for improvement and train your AI agent.
                </p>
              </div>

            </div>

            <!-- Footer -->
            <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Sent by your AI Voice Agent for <strong>${businessName}</strong>
              </p>
              <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                <a href="${appUrl}/agents/${agentId}/settings" style="color: #667eea; text-decoration: none;">
                  Manage notification settings
                </a>
              </p>
            </div>

          </body>
        </html>
      `
    });

    if (error) {
      console.error('[Email] Failed to send daily summary email:', error);
      throw error;
    }

    console.log('[Email] Daily summary email sent successfully:', data?.id);
    return data;
  } catch (error) {
    console.error('[Email] Error sending daily summary email:', error);
    throw error;
  }
}
