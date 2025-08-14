-- Add the status column using the enum type
ALTER TABLE tasks
ADD COLUMN status text DEFAULT '' NOT NULL;