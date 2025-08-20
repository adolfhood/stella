"use client";

import { useState, useEffect } from "react";
import { format, startOfWeek, addDays, isSameDay, subWeeks } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

import { Task } from "@/types/Task";

interface WeeklyTaskListProps {
  tasks: Task[]; // Tasks are now passed as props
}

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

export default function WeeklyTaskList({ tasks }: WeeklyTaskListProps) {
  const [currentWeekStartDate, setCurrentWeekStartDate] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);

  useEffect(() => {
    calculateCurrentWeek();
  }, [currentWeekStartDate]); // Recalculate week when start date changes

  const calculateCurrentWeek = () => {
    const week = Array.from({ length: 7 }, (_, i) =>
      addDays(currentWeekStartDate, i)
    );
    setCurrentWeek(week);
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(
      (task) => task.due_date && isSameDay(new Date(task.due_date), date)
    );
  };

  const goToPreviousWeek = () => {
    setCurrentWeekStartDate(subWeeks(currentWeekStartDate, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeekStartDate(addDays(currentWeekStartDate, 7));
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <CardTitle className="text-center">
            {format(currentWeekStartDate, "MMMM yyyy")}
          </CardTitle>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex flex-wrap justify-center md:grid md:grid-cols-7 gap-4">
          {currentWeek.map((date) => (
            <div key={date.toISOString()} className="border rounded-md p-2 overflow-scroll">
              <h3 className="text-sm font-semibold mb-1 text-center">
                {format(date, "EEE d")}
              </h3>
              {getTasksForDate(date).length > 0 ? (
                <div>
                  {getTasksForDate(date).map((task) => (
                    <p
                      key={task.id}
                      className={`${
                        statusBorderColors[
                          task.status as keyof typeof statusBorderColors
                        ]
                      } ${
                        statusColors[task.status as keyof typeof statusColors]
                      } text-xs border-1 w-max px-4 py-1 rounded-xl`}
                    >
                      {task.title}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center">
                  No tasks
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
