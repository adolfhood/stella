"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import TaskCard from "./TaskCard";

import { Task } from "@/types/Task";

interface TaskCalendarProps {
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

  const DayContent = ({
    date,
    setSelectedDate,
  }: {
    date: Date;
    setSelectedDate: (date: Date) => void;
  }) => {
    const tasksForDate = getTasksForDate(date);
    const dayNumber = date.getDate();

    return (
      <td
        className="grow w-[calc(100%/7)] flex flex-col align-center p-1 rounded-md hover:bg-secondary hover:text-secondary-foreground transition-colors"
        style={{ aspectRatio: "16/9" }}
        onClick={() => setSelectedDate(date)}
      >
        {/* Day Number */}
        <span className="text-sm font-medium text-gray-600 w-full text-center">
          {dayNumber}
        </span>

        {/* Task Badges */}
        {tasksForDate.length > 0 && (
          <span className="w-full flex flex-col items-center justify-center mt-1">
            {tasksForDate.slice(0, 2).map((task) => (
              <span
                key={task.id}
                className="bg-secondary text-secondary-foreground rounded-md px-1 py-0.5 text-[0.6rem] mb-0.5 w-full text-center overflow-hidden text-ellipsis whitespace-nowrap"
                title={task.title}
              >
                {task.title}
              </span>
            ))}
            {tasksForDate.length > 2 && (
              <span className="bg-muted text-muted-foreground rounded-md px-1 py-0.5 text-[0.6rem">
                +{tasksForDate.length - 2} more
              </span>
            )}
          </span>
        )}
      </td>
    );
  };

  return (
    <div className="container mx-auto py-2 px-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Task Calendar
      </h2>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
        className="rounded-md border w-full md:w-4/5 mb-4 mx-auto"
        components={{
          Day: ({ day, modifiers }) => (
            <DayContent
              date={new Date(day.date)}
              setSelectedDate={setSelectedDate}
            />
          ),
        }}
      />
      {selectedDate && (
        <div className="text-center w-full md:w-4/5 mb-4 mx-auto">
          <h3 className="text-lg font-semibold mb-2">
            Tasks for {format(selectedDate, "PPP")}:
          </h3>
          {getTasksForDate(selectedDate).length > 0 ? (
            <div>
              {getTasksForDate(selectedDate).map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No tasks for this day.</p>
          )}
        </div>
      )}
    </div>
  );
}
