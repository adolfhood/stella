CREATE TABLE IF NOT EXISTS task_sorting (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    sort_by VARCHAR(20) NOT NULL DEFAULT 'due_date',
    sort_order VARCHAR(4) NOT NULL DEFAULT 'asc',
    task_order JSONB
);