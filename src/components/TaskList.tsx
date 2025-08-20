"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { CalendarIcon, Edit, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import TaskCard from "./TaskCard";
import { Checkbox } from "@/components/ui/checkbox";
import RepeatModal from "./RepeatModal"; // Import RepeatModal

type Task = {
  id?: string; // Optional id for new tasks
  title: string;
  description: string | null;
  due_date: string | null;
  due_time: string | null;
  status: string; // Add status
  repeat_config: any | null; // Add repeat_config
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

type TaskListProps = {
  tasks: Task[];
  fetchTasks: () => Promise<void>;
};

export default function TaskList({ tasks, fetchTasks }: TaskListProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null); // Null for adding, Task for editing
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [showRepeatModal, setShowRepeatModal] = useState(false);

  const [taskForm, setTaskForm] = useState<Task>({
    title: "",
    description: "",
    due_date: null,
    due_time: null,
    status: "open",
    repeat_config: null, // Initialize repeat_config
  });

  const resetTaskForm = () => {
    setTaskForm({
      title: "",
      description: "",
      due_date: null,
      due_time: null,
      status: "open",
      repeat_config: null,
    });
  };

  const handleOpenDialog = () => {
    resetTaskForm();
    setEditTask(null); // Clear edit task to indicate adding
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    resetTaskForm();
    setEditTask(null);
    setShowRepeatModal(false); // Close repeat modal too
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setTaskForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setTaskForm((prev) => ({ ...prev, due_date: date?.toISOString() || null }));
  };

  const handleStatusChange = (status: string) => {
    setTaskForm((prev) => ({ ...prev, status: status }));
  };

  const handleToggleRepeatModal = () => {
    const newValue = !showRepeatModal;

    if (newValue === false) {
      // Ability to remove repeat_config when necessary
      setTaskForm({
        ...taskForm,
        repeat_config: null,
      });
      setShowRepeatModal(false);
    } else {
      setShowRepeatModal(true);
    }
  };

  const handleSaveRepeatConfig = (repeatConfig: any) => {
    setTaskForm((prev) => ({ ...prev, repeat_config: repeatConfig }));
  };

  const handleCancelRepeatConfig = () => {
    setShowRepeatModal(false);
  };

  const handleAddTask = async () => {
    setLoading(true);

    const { data } = await supabase.auth.getSession();

    // Combine date and time
    let combinedDateTime: string | null = null;
    if (taskForm.due_date && taskForm.due_time) {
      const [hours, minutes] = taskForm.due_time.split(":");
      const newDate = new Date(taskForm.due_date);
      newDate.setHours(parseInt(hours));
      newDate.setMinutes(parseInt(minutes));
      combinedDateTime = newDate.toISOString();
    } else if (taskForm.due_date) {
      combinedDateTime = taskForm.due_date;
    }

    try {
      const { error } = await supabase.from("tasks").insert({
        title: taskForm.title,
        description: taskForm.description,
        due_date: combinedDateTime,
        due_time: taskForm.due_time,
        user_id: data.session?.user.id,
        status: taskForm.status,
        repeat_config: taskForm.repeat_config, // Save repeat_config
      });

      if (error) {
        console.error("Error adding task:", error);
        toast.error("Uh oh! Something went wrong.", {
          description: "There was an error adding the task.",
        });
      } else {
        handleCloseDialog();
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

  const handleEditTask = (task: Task) => {
    setTaskForm(task);
    setEditTask(task);

    if (task.repeat_config) {
      setShowRepeatModal(true);
    } else {
      setShowRepeatModal(false);
    }

    setOpen(true);
  };

  const handleSaveEdit = async () => {
    setLoading(true);

    // Combine date and time
    let combinedDateTime: string | null = null;
    if (taskForm.due_date && taskForm.due_time) {
      const [hours, minutes] = taskForm.due_time.split(":");
      const newDate = new Date(taskForm.due_date);
      newDate.setHours(parseInt(hours));
      newDate.setMinutes(parseInt(minutes));
      combinedDateTime = newDate.toISOString();
    } else if (taskForm.due_date) {
      combinedDateTime = taskForm.due_date;
    }

    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          title: taskForm.title,
          description: taskForm.description,
          due_date: combinedDateTime,
          due_time: taskForm.due_time,
          status: taskForm.status,
          repeat_config: taskForm.repeat_config, // Update repeat_config
        })
        .eq("id", editTask!.id);

      if (error) {
        console.error("Error editing task:", error);
        toast.error("Uh oh! Something went wrong.", {
          description: "There was an error editing the task.",
        });
      } else {
        handleCloseDialog();
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

  const handleSubmit = () => {
    if (editTask) {
      handleSaveEdit();
    } else {
      handleAddTask();
    }
  };

  const handleSaveStatus = async (taskId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          status: status,
        })
        .eq("id", taskId);

      if (error) {
        console.error("Error editing task:", error);
        toast.error("Uh oh! Something went wrong.", {
          description: "There was an error editing the task.",
        });
      } else {
        fetchTasks();
      }
    } catch (error) {
      console.error("Error editing task:", error);
      toast.error("Uh oh! Something went wrong.", {
        description: "There was an error editing the task.",
      });
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

  return (
    <div className="container mx-auto py-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Tasks</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-blue-500 hover:bg-blue-700 text-white"
              onClick={handleOpenDialog}
            >
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editTask ? "Edit Task" : "Add Task"}</DialogTitle>
              <DialogDescription>
                {editTask
                  ? "Edit the fields for this task."
                  : "Create a new task to add to your list."}
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
                  value={taskForm.title}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={taskForm.description || ""}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="due_date" className="text-right">
                  Due Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "col-span-3 justify-start text-left font-normal text-sm",
                        !taskForm.due_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {taskForm.due_date ? (
                        format(new Date(taskForm.due_date), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        taskForm.due_date
                          ? new Date(taskForm.due_date)
                          : undefined
                      }
                      onSelect={handleDateChange}
                      disabled={(date) =>
                        date < new Date(new Date().toDateString())
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="due_time" className="text-right">
                  Time
                </Label>
                <Input
                  type="time"
                  id="due_time"
                  value={(taskForm.due_time as any) || ""}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                {/* Removed repeat interval select */}
              </div>
            </div>
            <Button onClick={handleToggleRepeatModal}>
              {showRepeatModal ? "Clear Repeat" : "Set Repeat"}
            </Button>{" "}
            {/* Open Repeat Modal */}
            {showRepeatModal && (
              <RepeatModal
                onSave={handleSaveRepeatConfig}
                onCancel={handleCancelRepeatConfig}
              />
            )}
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={handleCloseDialog}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-500 hover:bg-green-700 text-white"
              >
                {editTask ? "Save" : "Add"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ul className="space-y-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task as any}>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center relative">
              <div className="col-span-3">
                <div className="flex items-start gap-2">
                  <Checkbox
                    checked={task.status === "completed"}
                    onCheckedChange={(checked) => {
                      const status = checked ? "completed" : "open";
                      handleSaveStatus(task.id!, status);
                    }}
                    className="h-6 w-6 rounded-full border-primary text-primary ring-offset-background focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <div>
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
                </div>
              </div>
              <div className="col-span-1">
                <Select
                  value={task.status}
                  onValueChange={(status) => handleSaveStatus(task.id!, status)}
                >
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1 flex justify-end space-x-1 absolute right-0 top-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditTask(task)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setDeleteTaskId(task.id!);
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TaskCard>
        ))}
      </ul>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm sm:max-w-[425px]">
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
