-- This migration adds the discord_webhook_url column to the user_settings table.

ALTER TABLE user_settings
ADD COLUMN discord_webhook_url TEXT;

-- You might want to add a default value or a NOT NULL constraint depending on your requirements.
-- For example, to add a default empty string:
-- ALTER TABLE user_settings
-- ALTER COLUMN discord_webhook_url SET DEFAULT '';