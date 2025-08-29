"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
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
import {
  CalendarIcon,
  Edit,
  Trash2,
  Search,
  SortAsc,
  SortDesc,
  Plus,
} from "lucide-react";
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

import { Task } from "@/types/Task";
import TagsDialog from "./TagsDialog";
import { useTagContext } from "@/contexts/TagContext";
import TagSelector from "./TagSelector";
import { Badge } from "@/components/ui/badge";
import { useTaskContext } from "@/contexts/TaskContext";
import { useTaskSortContext } from "@/contexts/TaskSortContext"; // Import TaskSortContext
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  PointerActivationConstraint,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { debounce } from "lodash"; // Import debounce

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

export default function TaskList() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null); // Null for adding, Task for editing
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const { tags } = useTagContext();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { tasks, addTask, updateTask, deleteTask, fetchTasks } =
    useTaskContext();
  const {
    sortBy: contextSortBy,
    sortOrder: contextSortOrder,
    taskOrder: contextTaskOrder,
    fetchTaskSorting,
    updateTaskSorting,
  } = useTaskSortContext(); // Use TaskSortContext

  const [taskForm, setTaskForm] = useState<Omit<Task, "id" | "user_id">>({
    title: "",
    description: "",
    due_date: null,
    due_time: null,
    status: "open",
    repeat_config: null, // Initialize repeat_config
    tag_ids: [],
  });

  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  // Sorting functionality
  const [sortBy, setSortBy] = useState<"title" | "due_date">(
    (contextSortBy as "title" | "due_date") || "due_date"
  ); // Initialize from context
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (contextSortOrder as "asc" | "desc") || "asc"
  ); // Initialize from context

  const resetTaskForm = () => {
    setTaskForm({
      title: "",
      description: "",
      due_date: null,
      due_time: null,
      status: "open",
      repeat_config: null,
      tag_ids: [],
    });
    setSelectedTags([]);
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

  const handleSaveRepeatConfig = (repeatConfig: any) => {
    setTaskForm((prev) => ({ ...prev, repeat_config: repeatConfig }));
  };

  const handleCancelRepeatConfig = () => {
    setShowRepeatModal(false);
  };

  const handleCreateTask = async () => {
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
      await addTask({
        title: taskForm.title,
        description: taskForm.description,
        due_date: combinedDateTime,
        due_time: taskForm.due_time,
        status: taskForm.status,
        repeat_config: taskForm.repeat_config, // Save repeat_config
        tag_ids: taskForm.tag_ids,
      });

      handleCloseDialog();
      toast.success("Task added successfully!", {
        description: "The task has been added to your list.",
      });
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
    setSelectedTags(task.tag_ids || []); // Initialize selected tags for editing

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
      if (editTask) {
        await updateTask({
          ...editTask,
          title: taskForm.title,
          description: taskForm.description,
          due_date: combinedDateTime,
          due_time: taskForm.due_time,
          status: taskForm.status,
          repeat_config: taskForm.repeat_config, // Update repeat_config
          tag_ids: taskForm.tag_ids,
        });
      }

      handleCloseDialog();
      toast.success("Task edited successfully!", {
        description: "The task has been updated in your list.",
      });
    } catch (error) {
      console.error("Error editing task:", error);
      toast.error("Uh oh! Something went wrong.", {
        description: "There was an error editing the task.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    try {
      if (deleteTaskId) {
        await deleteTask(deleteTaskId);
      }

      toast.success("Task deleted successfully!", {
        description: "The task has been deleted from your list.",
      });
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

  const handleSubmit = () => {
    if (editTask) {
      handleSaveEdit();
    } else {
      handleCreateTask();
    }
  };

  const handleSaveStatus = async (task: Task, status: string) => {
    try {
      if (task) {
        await updateTask({
          ...task,
          status: status,
        });
      }
    } catch (error) {
      console.error("Error editing task:", error);
      toast.error("Uh oh! Something went wrong.", {
        description: "There was an error editing the task.",
      });
    }
  };

  const handleTagChange = (tagIds: string[]) => {
    setSelectedTags(tagIds);
    setTaskForm((prev) => ({ ...prev, tag_ids: tagIds }));
  };

  const [filteredAndSortedTasks, setFilteredAndSortedTasks] = useState<Task[]>(
    []
  );

  useEffect(() => {
    let result = [...tasks];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      if (sortBy === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === "due_date") {
        const dateA = a.due_date ? new Date(a.due_date).getTime() : 0;
        const dateB = b.due_date ? new Date(b.due_date).getTime() : 0;
        comparison = dateA - dateB;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredAndSortedTasks(result);
  }, [tasks, searchQuery, sortBy, sortOrder]);

  const [reorderedTasks, setReorderedTasks] = useState<Task[]>([]);

  // Update reorderedTasks whenever filteredAndSortedTasks changes
  useEffect(() => {
    if (contextTaskOrder) {
      const orderedTasks: Task[] = [];
      contextTaskOrder.forEach((taskId) => {
        const task = filteredAndSortedTasks.find((task) => task.id === taskId);
        if (task) {
          orderedTasks.push(task);
        }
      });
      // Add any tasks not in taskOrder to the end
      filteredAndSortedTasks.forEach((task) => {
        if (!contextTaskOrder.includes(task.id!)) {
          orderedTasks.push(task);
        }
      });
      setReorderedTasks(orderedTasks);
    } else {
      setReorderedTasks([...filteredAndSortedTasks]);
    }
  }, [filteredAndSortedTasks, contextTaskOrder]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = reorderedTasks.findIndex(
        (task) => task.id === active.id
      );
      const newIndex = reorderedTasks.findIndex((task) => task.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newReorderedTasks = arrayMove(reorderedTasks, oldIndex, newIndex);
        setReorderedTasks(newReorderedTasks);

        // Update task order in context
        const newTaskOrder = newReorderedTasks.map((task) => task.id!);
        debouncedUpdateTaskSorting(sortBy, sortOrder, newTaskOrder); // Save new order
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
      } as PointerActivationConstraint,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Function to update sorting preferences
  const handleSortChange = async (newSortBy: "title" | "due_date") => {
    setSortBy(newSortBy);
    debouncedUpdateTaskSorting(newSortBy, sortOrder, null);
  };

  const handleSortOrderChange = async (newSortOrder: "asc" | "desc") => {
    setSortOrder(newSortOrder);
    debouncedUpdateTaskSorting(sortBy, newSortOrder, null);
  };

  const debouncedUpdateTaskSorting = useCallback(
    debounce(async (newSortBy: any, newSortOrder: any, newTaskOrder: any) => {
      await updateTaskSorting(newSortBy, newSortOrder, newTaskOrder);
    }, 300),
    [updateTaskSorting]
  );

  const handleToggleRepeatModal = () => {
    if (showRepeatModal) {
      setShowRepeatModal(false);
      setTaskForm({ ...taskForm, repeat_config: null });

      if (editTask) {
        setEditTask({ ...editTask, repeat_config: null });
      }
    } else {
      setShowRepeatModal(true);
    }
  };

  return (
    <div className="py-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Tasks</h2>
        <div className="flex gap-2">
          <TagsDialog />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="default" onClick={handleOpenDialog}>
                <Plus className="w-4 h-4 mr-1" />
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
                  <Popover modal>
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
                  <Label htmlFor="tags" className="text-right">
                    Tags
                  </Label>
                  <div className="col-span-3 relative z-10">
                    <TagSelector
                      selectedTags={selectedTags}
                      onChange={handleTagChange}
                    />
                  </div>
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
      </div>

      {/* Search and Sort Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative flex items-center">
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <Search className="h-4 w-4 absolute right-3 text-gray-500" />
        </div>

        <div className="flex items-center space-x-2">
          <Label htmlFor="sort">Sort by:</Label>
          <Select
            value={sortBy}
            onValueChange={(value) => handleSortChange(value as any)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="due_date">Due Date</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="default"
            size="sm"
            onClick={() => {
              const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
              handleSortOrderChange(newSortOrder);
            }}
          >
            {sortOrder === "asc" ? (
              <SortAsc className="w-4 h-4" />
            ) : (
              <SortDesc className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <SortableContext
          items={reorderedTasks.map((task) => task.id!)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2">
            {reorderedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task as any}
                handleSaveStatus={handleSaveStatus}
                handleEditTask={handleEditTask}
                setDeleteTaskId={setDeleteTaskId}
                setDeleteOpen={setDeleteOpen}
                tags={tags}
                statusColors={statusColors}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

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
              onClick={() => {
                handleDeleteTask();
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const TaskItem = ({
  task,
  handleSaveStatus,
  handleEditTask,
  setDeleteTaskId,
  setDeleteOpen,
  tags,
  statusColors,
}: {
  task: Task;
  handleSaveStatus: (task: Task, status: string) => Promise<void>;
  handleEditTask: (task: Task) => void;
  setDeleteTaskId: (taskId: string) => void;
  setDeleteOpen: (open: boolean) => void;
  tags: any[];
  statusColors: any;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task as any}>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center relative">
          <div className="col-span-3">
            <div className="flex items-start gap-2">
              <Checkbox
                checked={task.status === "completed"}
                onCheckedChange={(checked) => {
                  const status = checked ? "completed" : "open";
                  handleSaveStatus(task, status);
                }}
                className="h-6 w-6 rounded-full border-primary text-primary ring-offset-background focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <div>
                <p
                  className={`${
                    (statusColors as any)[
                      task.status as keyof typeof statusColors
                    ]
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
            {task.tag_ids && task.tag_ids.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {(tags as any)
                  .filter((tag: any) => task.tag_ids?.includes(tag.id))
                  .map((tag: any) => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
              </div>
            )}
          </div>
          {/* <div className="col-span-1">
            <Select
              value={task.status}
              onValueChange={(status) => handleSaveStatus(task, status)}
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
          </div> */}
          <div className="col-span-1 flex justify-end space-x-1 absolute right-0 top-0">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => handleEditTask(task)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
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
    </div>
  );
};
