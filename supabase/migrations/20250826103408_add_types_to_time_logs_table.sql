ALTER TABLE time_logs DROP COLUMN type;

ALTER TABLE time_logs ADD COLUMN type UUID REFERENCES public.time_log_types(id) NOT NULL;