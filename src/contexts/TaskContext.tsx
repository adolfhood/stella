"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Task } from "@/types/Task";

interface TaskContextType {
  tasks: Task[];
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, "id" | "user_id">) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        console.warn("User not authenticated.");
        return;
      }

      const { data: tasksData, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to fetch tasks.");
      } else {
        setTasks(tasksData || []);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to fetch tasks.");
    }
  };

  const addTask = async (task: Omit<Task, "id" | "user_id">) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        toast.error("User not authenticated.");
        return;
      }

      const { data, error } = await supabase
        .from("tasks")
        .insert([{ ...task, user_id: userId }])
        .select("*")
        .single();

      if (error) {
        console.error("Error adding task:", error);
        toast.error("Failed to add task.");
      } else {
        setTasks([...tasks, data]);
        toast.success("Task added successfully!");
      }
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to add task.");
    }
  };

  const updateTask = async (task: Task) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .update(task)
        .eq("id", task.id)
        .select("*")
        .single();

      if (error) {
        console.error("Error updating task:", error);
        toast.error("Failed to update task.");
      } else {
        setTasks(tasks.map((t) => (t.id === task.id ? data : t)));
        toast.success("Task updated successfully!");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task.");
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) {
        console.error("Error deleting task:", error);
        toast.error("Failed to delete task.");
      } else {
        setTasks(tasks.filter((task) => task.id !== taskId));
        toast.success("Task deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task.");
    }
  };

  useEffect(() => {
    fetchTasks();

    const tasksSubscription = supabase
      .channel("public:tasks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        (payload) => {
        //   console.log("Change received!", payload);
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksSubscription);
    };
  }, []);

  const value: TaskContextType = {
    tasks,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
};
