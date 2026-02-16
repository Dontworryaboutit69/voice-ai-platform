-- Add email notification preferences to agents table

alter table public.agents
  add column email_notifications_enabled boolean default true,
  add column email_message_taken boolean default true,
  add column email_appointment_booked boolean default true,
  add column email_daily_summary boolean default true;

-- Add comment for documentation
comment on column public.agents.email_notifications_enabled is 'Master toggle for all email notifications';
comment on column public.agents.email_message_taken is 'Send email when customer leaves message';
comment on column public.agents.email_appointment_booked is 'Send email when appointment is booked';
comment on column public.agents.email_daily_summary is 'Send daily summary at 9am if calls occurred';
