-- This is an example of how to create a table with a foreign key to the auth.users table.
-- Make sure to enable Row Level Security (RLS) on this table.
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_character VARCHAR(255) NOT NULL DEFAULT '0', -- Default character is 'Professor Promptly' (index 0)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) to ensure users can only access their own settings.
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to insert their own settings.
CREATE POLICY "Allow users to insert their own settings" ON public.user_settings FOR
INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create a policy that allows users to update their own settings.
CREATE POLICY "Allow users to update their own settings" ON public.user_settings FOR
UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create a policy that allows users to select their own settings.
CREATE POLICY "Allow users to select their own settings" ON public.user_settings FOR
SELECT
  USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();