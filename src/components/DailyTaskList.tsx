"use client";

import { format, isSameDay, parseISO, addDays, subDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import TaskCard from "./TaskCard";

import { Task } from "@/types/Task";

interface DailyTaskListProps {
  tasks: Task[]; // Tasks are now passed as props
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date) => void;
}

export default function DailyTaskList({
  tasks,
  selectedDate,
  setSelectedDate,
}: DailyTaskListProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());

  const getTasksForDate = (date: Date) => {
    return tasks.filter(
      (task) => task.due_date && isSameDay(new Date(task.due_date), date)
    );
  };

  const tasksForSelectedDate = getTasksForDate(currentDate);

  const handlePrevDay = () => {
    const newDate = subDays(currentDate, 1);
    setCurrentDate(newDate);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = addDays(currentDate, 1);
    setCurrentDate(newDate);
    setSelectedDate(newDate);
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handlePrevDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle>
            {currentDate
              ? `Tasks for ${format(currentDate, "PPP")}`
              : "Select a date"}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {currentDate ? (
            tasksForSelectedDate.length > 0 ? (
              <div>
                {tasksForSelectedDate.map((task) => (
                  <div key={task.id}>
                    <TaskCard task={task} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No tasks for this day.</p>
            )
          ) : (
            <p className="text-muted-foreground">
              Select a date to view tasks.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
