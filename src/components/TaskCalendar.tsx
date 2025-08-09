"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

type Task = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  due_time: string | null;
  status: string;
};

interface TaskCalendarProps {
  tasks: Task[]; // Tasks are now passed as props
}

export default function TaskCalendar({ tasks }: TaskCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(
      (task) => task.due_date && isSameDay(new Date(task.due_date), date)
    );
  };

  const DayContent = ({ date }: { date: Date }) => {
    const tasksForDate = getTasksForDate(date);
    const dayNumber = date.getDate();

    return (
      <div
        className="grow w-[calc(100%/7)] flex flex-col align-center p-1 rounded-md hover:bg-secondary hover:text-secondary-foreground transition-colors"
        style={{ aspectRatio: "16/9" }}
      >
        {/* Day Number */}
        <div className="text-sm font-medium text-gray-600 w-full text-center">
          {dayNumber}
        </div>

        {/* Task Badges */}
        {tasksForDate.length > 0 && (
          <div className="w-full flex flex-col items-center justify-center mt-1">
            {tasksForDate.slice(0, 2).map((task) => (
              <div
                key={task.id}
                className="bg-secondary text-secondary-foreground rounded-md px-1 py-0.5 text-[0.6rem] mb-0.5 w-full text-center overflow-hidden text-ellipsis whitespace-nowrap"
                title={task.title}
              >
                {task.title}
              </div>
            ))}
            {tasksForDate.length > 2 && (
              <div className="bg-muted text-muted-foreground rounded-md px-1 py-0.5 text-[0.6rem]">
                +{tasksForDate.length - 2} more
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Task Calendar</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border w-4/5 mx-auto"
            components={{
              Day: ({ day, modifiers }) => (
                <DayContent date={new Date(day.date)} />
              ),
            }}
          />
          {selectedDate && (
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Tasks for {format(selectedDate, "PPP")}:
              </h3>
              {getTasksForDate(selectedDate).length > 0 ? (
                <ul className="list-disc pl-5">
                  {getTasksForDate(selectedDate).map((task) => (
                    <li key={task.id} className="mb-1">
                      {task.title} - {task.status}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No tasks for this day.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
