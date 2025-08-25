"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface TaskSortContextType {
  sortBy: string;
  sortOrder: string;
  taskOrder: string[] | null;
  fetchTaskSorting: () => Promise<void>;
  updateTaskSorting: (
    sortBy: string,
    sortOrder: string,
    taskOrder: string[] | null
  ) => Promise<void>;
}

const TaskSortContext = createContext<TaskSortContextType | undefined>(
  undefined
);

export const TaskSortProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [sortBy, setSortBy] = useState<string>("due_date");
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [taskOrder, setTaskOrder] = useState<string[] | null>(null);

  const fetchTaskSorting = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        console.warn("User not authenticated.");
        return;
      }

      const { data, error } = await supabase
        .from("task_sorting")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        // console.error("Error fetching task sorting:", error);
        // toast.error("Failed to fetch task sorting.");
      } else {
        if (data) {
          setSortBy(data.sort_by || "due_date");
          setSortOrder(data.sort_order || "asc");
          setTaskOrder(data.task_order || null);
        }
      }
    } catch (error) {
      console.error("Error fetching task sorting:", error);
      toast.error("Failed to fetch task sorting.");
    }
  };

  const updateTaskSorting = async (
    sortBy: string,
    sortOrder: string,
    taskOrder: string[] | null
  ) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        toast.error("User not authenticated.");
        return;
      }

      const { error } = await supabase
        .from("task_sorting")
        .upsert(
          {
            user_id: userId,
            sort_by: sortBy,
            sort_order: sortOrder,
            task_order: taskOrder,
          },
          {
            onConflict: "user_id",
            ignoreDuplicates: true,
          }
        )
        .eq("user_id", userId);

      if (error) {
        console.error("Error updating task sorting:", error);
        toast.error("Failed to update task sorting.");
      } else {
        setSortBy(sortBy);
        setSortOrder(sortOrder);
        setTaskOrder(taskOrder);
        toast.success("Task sorting updated successfully!");
      }
    } catch (error) {
      console.error("Error updating task sorting:", error);
      toast.error("Failed to update task sorting.");
    }
  };

  useEffect(() => {
    fetchTaskSorting();
  }, []);

  const value: TaskSortContextType = {
    sortBy,
    sortOrder,
    taskOrder,
    fetchTaskSorting,
    updateTaskSorting,
  };

  return (
    <TaskSortContext.Provider value={value}>
      {children}
    </TaskSortContext.Provider>
  );
};

export const useTaskSortContext = () => {
  const context = useContext(TaskSortContext);
  if (!context) {
    throw new Error(
      "useTaskSortContext must be used within a TaskSortProvider"
    );
  }
  return context;
};
