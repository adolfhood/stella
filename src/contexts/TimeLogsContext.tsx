"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { TimeLog } from "@/types/TimeLog";

interface TimeLogsContextType {
  timeLogs: TimeLog[];
  fetchTimeLogs: () => Promise<void>;
  addTimeLog: (
    timeLog: Omit<TimeLog, "id" | "user_id" | "created_at" | "updated_at">
  ) => Promise<void>;
  updateTimeLog: (timeLog: TimeLog) => Promise<void>;
  deleteTimeLog: (timeLogId: string) => Promise<void>;
}

const TimeLogsContext = createContext<TimeLogsContextType | undefined>(
  undefined
);

export const TimeLogsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);

  const fetchTimeLogs = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        console.warn("User not authenticated.");
        return;
      }

      const { data: timeLogsData, error } = await supabase
        .from("time_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching time logs:", error);
        toast.error("Failed to fetch time logs.");
      } else {
        setTimeLogs(timeLogsData || []);
      }
    } catch (error) {
      console.error("Error fetching time logs:", error);
      toast.error("Failed to fetch time logs.");
    }
  };

  const addTimeLog = async (
    timeLog: Omit<TimeLog, "id" | "user_id" | "created_at" | "updated_at">
  ) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        toast.error("User not authenticated.");
        return;
      }

      const { data, error } = await supabase
        .from("time_logs")
        .insert([{ ...timeLog, user_id: userId }])
        .select("*")
        .single();

      if (error) {
        console.error("Error adding time log:", error);
        toast.error("Failed to add time log.");
      } else {
        setTimeLogs([...timeLogs, data]);
        toast.success("Time log added successfully!");
      }
    } catch (error) {
      console.error("Error adding time log:", error);
      toast.error("Failed to add time log.");
    }
  };

  const updateTimeLog = async (timeLog: TimeLog) => {
    try {
      const { data, error } = await supabase
        .from("time_logs")
        .update(timeLog)
        .eq("id", timeLog.id)
        .select("*")
        .single();

      if (error) {
        console.error("Error updating time log:", error);
        toast.error("Failed to update time log.");
      } else {
        setTimeLogs(timeLogs.map((t) => (t.id === timeLog.id ? data : t)));
        toast.success("Time log updated successfully!");
      }
    } catch (error) {
      console.error("Error updating time log:", error);
      toast.error("Failed to update time log.");
    }
  };

  const deleteTimeLog = async (timeLogId: string) => {
    try {
      const { error } = await supabase
        .from("time_logs")
        .delete()
        .eq("id", timeLogId);

      if (error) {
        console.error("Error deleting time log:", error);
        toast.error("Failed to delete time log.");
      } else {
        setTimeLogs(timeLogs.filter((timeLog) => timeLog.id !== timeLogId));
        toast.success("Time log deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting time log:", error);
      toast.error("Failed to delete time log.");
    }
  };

  useEffect(() => {
    fetchTimeLogs();

    const timeLogsSubscription = supabase
      .channel("public:time_logs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "time_logs" },
        (payload) => {
          fetchTimeLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(timeLogsSubscription);
    };
  }, []);

  const value: TimeLogsContextType = {
    timeLogs,
    fetchTimeLogs,
    addTimeLog,
    updateTimeLog,
    deleteTimeLog,
  };

  return (
    <TimeLogsContext.Provider value={value}>
      {children}
    </TimeLogsContext.Provider>
  );
};

export const useTimeLogsContext = () => {
  const context = useContext(TimeLogsContext);
  if (!context) {
    throw new Error(
      "useTimeLogsContext must be used within a TimeLogsProvider"
    );
  }
  return context;
};
