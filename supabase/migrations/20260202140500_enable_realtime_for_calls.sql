-- Enable Realtime for prospect_calls table to support live email status updates
ALTER PUBLICATION supabase_realtime ADD TABLE prospect_calls;
