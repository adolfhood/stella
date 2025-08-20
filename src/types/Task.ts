export type Task = {
  id?: string; // Optional id for new tasks
  title: string;
  description: string | null;
  due_date: string | null;
  due_time: string | null;
  status: string; // Add status
  repeat_config: any | null; // Add repeat_config
};
