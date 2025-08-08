"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

type Task = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  due_time: string | null;
};

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>(
    undefined
  );
  const [newTaskDueTime, setNewTaskDueTime] = useState<string | undefined>(
    undefined
  );
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Uh oh! Something went wrong.", {
          description: "There was an error fetching the tasks.",
        });
      } else {
        setTasks(data || []);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Uh oh! Something went wrong.", {
        description: "There was an error fetching the tasks.",
      });
    }
  };

  const handleAddTask = async () => {
    setLoading(true);

    const { data } = await supabase.auth.getSession();

    // Combine date and time
    let combinedDateTime: string | null = null;
    if (newTaskDueDate && newTaskDueTime) {
      const [hours, minutes] = newTaskDueTime.split(":");
      const newDate = new Date(newTaskDueDate);
      newDate.setHours(parseInt(hours));
      newDate.setMinutes(parseInt(minutes));
      combinedDateTime = newDate.toISOString();
    } else if (newTaskDueDate) {
      combinedDateTime = newTaskDueDate.toISOString();
    }

    try {
      const { error } = await supabase.from("tasks").insert({
        title: newTaskTitle,
        description: newTaskDescription,
        due_date: combinedDateTime,
        due_time: newTaskDueTime,
        user_id: data.session?.user.id,
      });

      if (error) {
        console.error("Error adding task:", error);
        toast.error("Uh oh! Something went wrong.", {
          description: "There was an error adding the task.",
        });
      } else {
        setNewTaskTitle("");
        setNewTaskDescription("");
        setNewTaskDueDate(undefined);
        setNewTaskDueTime(undefined);
        setOpen(false);
        fetchTasks(); // Refresh task list
        toast.success("Task added successfully!", {
          description: "The task has been added to your list.",
        });
      }
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Uh oh! Something went wrong.", {
        description: "There was an error adding the task.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) {
        console.error("Error deleting task:", error);
        toast.error("Uh oh! Something went wrong.", {
          description: "There was an error deleting the task.",
        });
      } else {
        fetchTasks(); // Refresh task list
        toast.success("Task deleted successfully!", {
          description: "The task has been deleted from your list.",
        });
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Uh oh! Something went wrong.", {
        description: "There was an error deleting the task.",
      });
    } finally {
      setDeleteOpen(false);
      setDeleteTaskId(null);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditTask(task);
    setEditOpen(true);
  };

  const handleSaveEdit = async (
    taskId: string,
    title: string,
    description: string | null,
    dueDate: Date | undefined,
    dueTime: string | null
  ) => {
    setLoading(true);

    // Combine date and time
    let combinedDateTime: string | null = null;
    if (dueDate && dueTime) {
      const [hours, minutes] = dueTime.split(":");
      const newDate = new Date(dueDate);
      newDate.setHours(parseInt(hours));
      newDate.setMinutes(parseInt(minutes));
      combinedDateTime = newDate.toISOString();
    } else if (dueDate) {
      combinedDateTime = dueDate.toISOString();
    }

    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          title: title,
          description: description,
          due_date: combinedDateTime,
          due_time: dueTime,
        })
        .eq("id", taskId);

      if (error) {
        console.error("Error editing task:", error);
        toast.error("Uh oh! Something went wrong.", {
          description: "There was an error editing the task.",
        });
      } else {
        setEditOpen(false);
        setEditTask(null);
        fetchTasks();
        toast.success("Task edited successfully!", {
          description: "The task has been updated in your list.",
        });
      }
    } catch (error) {
      console.error("Error editing task:", error);
      toast.error("Uh oh! Something went wrong.", {
        description: "There was an error editing the task.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditOpen(false);
    setEditTask(null);
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>Manage your tasks here</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Add Task</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px">
              <DialogHeader>
                <DialogTitle>Add Task</DialogTitle>
                <DialogDescription>
                  Create a new task to add to your list.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    type="text"
                    id="title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dueDate" className="text-right">
                    Due Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !newTaskDueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newTaskDueDate ? (
                          format(newTaskDueDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newTaskDueDate}
                        onSelect={setNewTaskDueDate}
                        disabled={(date) =>
                          date < new Date(new Date().toDateString())
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="time" className="text-right">
                    Time
                  </Label>
                  <Input
                    type="time"
                    id="time"
                    value={newTaskDueTime}
                    onChange={(e) => setNewTaskDueTime(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <Button onClick={handleAddTask} disabled={loading}>
                Add
              </Button>
            </DialogContent>
          </Dialog>

          <Table>
            <TableCaption>A list of your tasks.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>
                    {task.due_date
                      ? new Date(task.due_date).toLocaleString()
                      : "No Due Date"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTask(task)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDeleteTaskId(task.id);
                        setDeleteOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Edit Dialog */}
      {editTask && (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>
                Edit the fields for this task.
              </DialogDescription>
            </DialogHeader>
            <EditTaskForm
              task={editTask}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={loading}
              onClick={() => handleDeleteTask(deleteTaskId!)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type EditTaskFormProps = {
  task: Task;
  onSave: (
    taskId: string,
    title: string,
    description: string | null,
    dueDate: Date | undefined,
    dueTime: string | null
  ) => void;
  onCancel: () => void;
  loading: boolean;
};

function EditTaskForm({ task, onSave, onCancel, loading }: EditTaskFormProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.due_date ? new Date(task.due_date) : undefined
  );
  const [dueTime, setDueTime] = useState<string | null>(task.due_time);

  function getTimeOptions() {
    const times = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 30) {
        const hour = i.toString().padStart(2, "0");
        const minute = j.toString().padStart(2, "0");
        times.push(`${hour}:${minute}`);
      }
    }
    return times;
  }

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="title" className="text-right">
          Title
        </Label>
        <Input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="description" className="text-right">
          Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="dueDate" className="text-right">
          Due Date
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !dueDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              disabled={(date) => date < new Date(new Date().toDateString())}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="time" className="text-right">
          Time
        </Label>
        <Input
          type="time"
          id="time"
          value={dueTime as any}
          onChange={(e) => setDueTime(e.target.value)}
          className="col-span-3"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={() => onSave(task.id, title, description, dueDate, dueTime)}
          disabled={loading}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
