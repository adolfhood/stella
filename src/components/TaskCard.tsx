import { Card, CardContent } from "@/components/ui/card";

type Task = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  due_time: string | null;
  status: string;
};

const statusColors = {
  open: "bg-gray-50 text-gray-700",
  in_progress: "bg-blue-50 text-blue-700",
  completed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

const statusBorderColors = {
  open: "border-gray-300",
  in_progress: "border-blue-300",
  completed: "border-green-300",
  cancelled: "border-red-300",
};

interface TaskCardProps {
  task: Task;
  children?: React.ReactNode;
}

export default function TaskCard({ task, children }: TaskCardProps) {
  return (
    <Card
      key={task.id}
      className={`border-2 ${
        statusBorderColors[task.status as keyof typeof statusBorderColors]
      } ${statusColors[task.status as keyof typeof statusColors]}`}
    >
      <CardContent className="px-4">
        {children ? (
          children
        ) : (
          <div className="flex flex-col gap-2 items-center relative">
            <div className="col-span-3">
              <p
                className={`${
                  statusColors[task.status as keyof typeof statusColors]
                } bg-none`}
              >
                {task.title}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {task.description || "No description"}
              </p>
              {task.due_date && (
                <p className="text-xs text-muted-foreground">
                  Due: {new Date(task.due_date).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex justify-center">
              <div
                className={`${
                  statusBorderColors[
                    task.status as keyof typeof statusBorderColors
                  ]
                } ${
                  statusColors[task.status as keyof typeof statusColors]
                } text-xs border-1 w-max px-4 py-1 rounded-xl`}
              >
                {task.status[0].toUpperCase() + task.status.slice(1)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}