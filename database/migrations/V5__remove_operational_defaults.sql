-- Remove demo operational defaults from replication telemetry.
ALTER TABLE data.replication_status
    ALTER COLUMN replication_lag_ms DROP DEFAULT,
    ALTER COLUMN last_replicated_at DROP DEFAULT,
    ALTER COLUMN total_replicated_transactions SET DEFAULT 0,
    ALTER COLUMN updated_at DROP DEFAULT;
