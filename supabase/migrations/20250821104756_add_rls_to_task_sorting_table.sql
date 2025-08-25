-- This migration adds Row Level Security (RLS) to the task_sorting table
-- and enforces a unique constraint on the user_id column.

-- Enforce a unique constraint on user_id
ALTER TABLE task_sorting
ADD CONSTRAINT unique_user_id UNIQUE (user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE task_sorting ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to select their own task sorting settings
CREATE POLICY "Allow users to select their own task sorting settings" ON task_sorting
FOR SELECT
USING (auth.uid() = user_id);

-- Create a policy that allows users to insert their own task sorting settings
CREATE POLICY "Allow users to insert their own task sorting settings" ON task_sorting
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create a policy that allows users to update their own task sorting settings
CREATE POLICY "Allow users to update their own task sorting settings" ON task_sorting
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- No delete policy is needed as the table is cascade deleted on user deletion.