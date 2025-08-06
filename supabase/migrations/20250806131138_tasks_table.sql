-- SQL Migration (e.g., tasks_table.sql)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for users based on user_id" ON tasks
AS PERMISSIVE FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable insert access for users based on user_id" ON tasks
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for users based on user_id" ON tasks
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete access for users based on user_id" ON tasks
AS PERMISSIVE FOR DELETE
TO authenticated
USING (auth.uid() = user_id);