-- Remove the old 8 AM schedule
SELECT cron.unschedule('send-daily-exercise-reminders');

-- Schedule daily exercise reminder emails at 3 PM UTC
SELECT cron.schedule(
  'send-daily-exercise-reminders',
  '0 15 * * *',
  $$
  SELECT net.http_post(
    url := 'https://kkvudqvxcjchzehrptvy.supabase.co/functions/v1/send-daily-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdnVkcXZ4Y2pjaHplaHJwdHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNDIzMDYsImV4cCI6MjA3MzkxODMwNn0.28c5wYiUB9Wm1zj3PVN4SlXFO9egiNNrQoiV-KVKJCM"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);