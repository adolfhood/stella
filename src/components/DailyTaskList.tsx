"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { format, isSameDay, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Task = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  due_time: string | null;
  status: string;
};

interface DailyTaskListProps {
  selectedDate: Date | undefined;
}

export default function DailyTaskList({ selectedDate }: DailyTaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetchTasks();
  }, [selectedDate]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
      } else {
        const parsedTasks =
          data?.map((task) => ({
            ...task,
            due_date: task.due_date
              ? parseISO(task.due_date).toISOString()
              : null,
          })) || [];
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const getTasksForDate = (date: Date | undefined) => {
    if (!date) return [];

    return tasks.filter(
      (task) => task.due_date && isSameDay(new Date(task.due_date), date)
    );
  };

  const tasksForSelectedDate = getTasksForDate(selectedDate);

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate
              ? `Tasks for ${format(selectedDate, "PPP")}`
              : "Select a date"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDate ? (
            tasksForSelectedDate.length > 0 ? (
              <ul className="list-disc pl-5">
                {tasksForSelectedDate.map((task) => (
                  <li key={task.id} className="mb-1">
                    {task.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No tasks for this day.</p>
            )
          ) : (
            <p className="text-muted-foreground">Select a date to view tasks.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}