-- Add a unique constraint to the user_id column in the user_settings table.
ALTER TABLE public.user_settings
ADD CONSTRAINT user_id_unique UNIQUE (user_id);