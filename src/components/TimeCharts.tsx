"use client";

import {
  format,
  isSameDay,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useTimeLogsContext } from "@/contexts/TimeLogsContext";
import { TimeLogCard } from "./TimeLogCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { TimeLog } from "@/types/TimeLog";
import { toZonedTime } from "date-fns-tz";
import TimeLogTypeDialog from "./TimeLogTypesDialog";
import { useTimeLogTypeContext } from "@/contexts/TimeLogTypeContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icons } from "@/lib/lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { TimePicker } from "@/components/TimePicker";
import { DatePicker } from "@/components/DatePicker";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface TimeChartsProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date) => void;
  timeRange: "day" | "week" | "month" | "year";
}

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Time Log Analysis",
    },
  },
};

export default function TimeCharts({
  selectedDate,
  setSelectedDate,
  timeRange,
}: TimeChartsProps) {
  const { timeLogs } = useTimeLogsContext();
  const { timeLogTypes } = useTimeLogTypeContext();
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const [chartType, setChartType] = useState("pie"); // Default chart type

  const getTimeLogsForDate = (date: Date) => {
    return timeLogs
      .filter((timeLog) => {
        if (!timeLog.start_date) return false;
        if (timeRange === "day") {
          return isSameDay(new Date(timeLog.start_date), date);
        } else if (timeRange === "week") {
          const start = startOfWeek(date, { weekStartsOn: 0 });
          const end = endOfWeek(date, { weekStartsOn: 0 });
          return isWithinInterval(new Date(timeLog.start_date), { start, end });
        } else if (timeRange === "month") {
          const start = startOfMonth(date);
          const end = endOfMonth(date);
          return isWithinInterval(new Date(timeLog.start_date), { start, end });
        } else if (timeRange === "year") {
          const start = startOfYear(date);
          const end = endOfYear(date);
          return isWithinInterval(new Date(timeLog.start_date), { start, end });
        }
        return false;
      })
      .sort(
        (a, b) =>
          new Date(a.start_date || new Date()).getTime() -
          new Date(b.start_date || new Date()).getTime()
      );
  };

  const timeLogsForSelectedDate = getTimeLogsForDate(currentDate);

  const handlePrevDay = () => {
    let newDate: Date;
    if (timeRange === "day") {
      newDate = subDays(currentDate, 1);
    } else if (timeRange === "week") {
      newDate = subDays(currentDate, 7);
    } else if (timeRange === "month") {
      newDate = subDays(currentDate, 30); // Approximate
    } else {
      newDate = subDays(currentDate, 365); // Approximate
    }
    setCurrentDate(newDate);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    let newDate: Date;
    if (timeRange === "day") {
      newDate = addDays(currentDate, 1);
    } else if (timeRange === "week") {
      newDate = addDays(currentDate, 7);
    } else if (timeRange === "month") {
      newDate = addDays(currentDate, 30); // Approximate
    } else {
      newDate = addDays(currentDate, 365); // Approximate
    }
    setCurrentDate(newDate);
    setSelectedDate(newDate);
  };

  const getDisplayDate = () => {
    if (timeRange === "day") {
      return `${format(currentDate, "PPP")}`;
    } else if (timeRange === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      return `${format(start, "PPP")} - ${format(end, "PPP")}`;
    } else if (timeRange === "month") {
      return `${format(currentDate, "MMMM yyyy")}`;
    } else {
      return `${format(currentDate, "yyyy")}`;
    }
  };

  // Prepare data for charts
  const chartData = () => {
    const typeCounts: { [key: string]: number } = {};
    timeLogsForSelectedDate.forEach((timeLog) => {
      if (timeLog.type) {
        typeCounts[timeLog.type] = (typeCounts[timeLog.type] || 0) + 1;
      }
    });

    const labels = Object.keys(typeCounts);
    const data = Object.values(typeCounts);
    const backgroundColor = [
      "rgba(255, 99, 132, 0.2)",
      "rgba(54, 162, 235, 0.2)",
      "rgba(255, 206, 86, 0.2)",
      "rgba(75, 192, 192, 0.2)",
      "rgba(153, 102, 255, 0.2)",
      "rgba(255, 159, 64, 0.2)",
    ];
    const borderColor = [
      "rgba(255, 99, 132, 1)",
      "rgba(54, 162, 235, 1)",
      "rgba(255, 206, 86, 1)",
      "rgba(75, 192, 192, 1)",
      "rgba(153, 102, 255, 1)",
      "rgba(255, 159, 64, 1)",
    ];

    return {
      labels,
      datasets: [
        {
          label: "Number of Logs",
          data,
          backgroundColor,
          borderColor,
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className="container mx-auto py-2">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Time Log Charts
        </h2>
        <div className="flex flex-row items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={handlePrevDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <b>{currentDate ? getDisplayDate() : "Time Logs"}</b>
          <Button variant="ghost" size="sm" onClick={handleNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Select onValueChange={(value) => setChartType(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select chart type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pie">Pie Chart</SelectItem>
            <SelectItem value="bar">Bar Chart</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full max-w-xl mx-auto">
        {timeLogsForSelectedDate.length > 0 ? (
          <div>
            {chartType === "pie" && (
              <Pie data={chartData()} options={chartOptions} />
            )}
            {chartType === "bar" && (
              <Bar data={chartData()} options={chartOptions} />
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-center">
            No time logs for this {timeRange}.
          </p>
        )}
      </div>
    </div>
  );
}
