"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { TimeLogType } from "@/types/TimeLogType";

interface TimeLogTypeContextType {
  timeLogTypes: TimeLogType[];
  addTimeLogType: (name: string, icon: string) => Promise<void>;
  updateTimeLogType: (id: string, name: string, icon: string) => Promise<void>;
  deleteTimeLogType: (id: string) => Promise<void>;
  fetchTimeLogTypes: () => Promise<void>;
}

const TimeLogTypeContext = createContext<TimeLogTypeContextType | undefined>(
  undefined
);

export const TimeLogTypeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [timeLogTypes, setTimeLogTypes] = useState<TimeLogType[]>([]);

  const fetchTimeLogTypes = async () => {
    try {
      const { data: typesData, error } = await supabase
        .from("time_log_types")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching types:", error);
        toast.error("Failed to fetch types.");
      } else {
        setTimeLogTypes(typesData || []);
      }
    } catch (error) {
      console.error("Error fetching types:", error);
      toast.error("Failed to fetch types.");
    }
  };

  const addTimeLogType = async (name: string, icon: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        toast.error("User not authenticated.");
        return;
      }

      const { data, error } = await supabase
        .from("time_log_types")
        .insert([{ user_id: userId, name, icon }])
        .select("*")
        .single();

      if (error) {
        console.error("Error adding time log type:", error);
        toast.error("Failed to add time log type.");
      } else {
        setTimeLogTypes([...timeLogTypes, data]);
        toast.success("TimeLogType added successfully!");
      }
    } catch (error) {
      console.error("Error adding time log type:", error);
      toast.error("Failed to add time log type.");
    }
  };

  const updateTimeLogType = async (id: string, name: string, icon: string) => {
    try {
      const { data, error } = await supabase
        .from("time_log_types")
        .update({ name, icon })
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        console.error("Error updating time log type:", error);
        toast.error("Failed to update time log type.");
      } else {
        setTimeLogTypes(
          timeLogTypes.map((timeLogType) =>
            timeLogType.id === id ? data : timeLogType
          )
        );
        toast.success("TimeLogType updated successfully!");
      }
    } catch (error) {
      console.error("Error updating time log type:", error);
      toast.error("Failed to update time log type.");
    }
  };

  const deleteTimeLogType = async (id: string) => {
    try {
      const { error } = await supabase
        .from("time_log_types")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting time log type:", error);
        toast.error("Failed to delete time log type.");
      } else {
        setTimeLogTypes(
          timeLogTypes.filter((timeLogType) => timeLogType.id !== id)
        );
        toast.success("TimeLogType deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting time log type:", error);
      toast.error("Failed to delete time log type.");
    }
  };

  useEffect(() => {
    fetchTimeLogTypes();

    const typesSubscription = supabase
      .channel("public:types")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "time_log_types" },
        (payload) => {
          // console.log("Change received!", payload);
          fetchTimeLogTypes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(typesSubscription);
    };
  }, []);

  const value: TimeLogTypeContextType = {
    timeLogTypes,
    addTimeLogType,
    updateTimeLogType,
    deleteTimeLogType,
    fetchTimeLogTypes,
  };

  return (
    <TimeLogTypeContext.Provider value={value}>
      {children}
    </TimeLogTypeContext.Provider>
  );
};

export const useTimeLogTypeContext = () => {
  const context = useContext(TimeLogTypeContext);
  if (!context) {
    throw new Error(
      "useTimeLogTypeContext must be used within a TimeLogTypeProvider"
    );
  }
  return context;
};
