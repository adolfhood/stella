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

interface TimeLogListProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date) => void;
  timeRange: "day" | "week" | "month" | "year";
}

// Function to format the date to YYYY-MM-DDTHH:MM with timezone offset
function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function convertToUTCDateString(dateString: string | undefined) {
  // Get the current timezone
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (dateString) {
    const localDate = new Date(dateString);
    const utcDate = toZonedTime(localDate, timeZone);
    return utcDate.toISOString();
  } else {
    const localDate = new Date();
    const utcDate = toZonedTime(localDate, timeZone);
    return utcDate.toISOString();
  }
}

export default function TimeLogList({
  selectedDate,
  setSelectedDate,
  timeRange,
}: TimeLogListProps) {
  const { timeLogs, addTimeLog, updateTimeLog, deleteTimeLog } =
    useTimeLogsContext();
  const { timeLogTypes } = useTimeLogTypeContext();
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const [open, setOpen] = useState(false);
  const [editTimeLog, setEditTimeLog] = useState<TimeLog | null>(null);
  const [deleteTimeLogId, setDeleteTimeLogId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [searchQuery, setSearchQuery] = useState("");

  const [timeLogForm, setTimeLogForm] = useState<
    Omit<TimeLog, "id" | "user_id" | "created_at" | "updated_at">
  >({
    type_id: "",
    type: "",
    comment: "",
    start_date: formatDate(new Date()),
    end_date: formatDate(new Date()),
  });

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [selectedDateField, setSelectedDateField] = useState<
    "start_date" | "end_date" | null
  >(null);
  const [selectedDateValue, setSelectedDateValue] = useState<Date | undefined>(
    undefined
  );

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

  const handleOpenDialog = () => {
    setTimeLogForm({
      type_id: "",
      type: "",
      comment: "",
      start_date: formatDate(new Date()),
      end_date: formatDate(new Date()),
    });
    setEditTimeLog(null);
    setOpen(true);
    setErrors({});
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditTimeLog(null);
    setErrors({});
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setTimeLogForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleTypeChange = (type: string, type_id: string) => {
    setTimeLogForm((prev) => ({ ...prev, type, type_id }));
  };

  const validateForm = () => {
    let valid = true;
    const newErrors: { [key: string]: string } = {};

    if (!timeLogForm.type_id) {
      newErrors.type_id = "Type is required";
      valid = false;
    }

    if (!timeLogForm.start_date) {
      newErrors.start_date = "Start Date is required";
      valid = false;
    }

    if (!timeLogForm.end_date) {
      newErrors.end_date = "End Date is required";
      valid = false;
    }

    if (
      timeLogForm.start_date &&
      timeLogForm.end_date &&
      new Date(timeLogForm.end_date) < new Date(timeLogForm.start_date)
    ) {
      newErrors.end_date = "End Date must be after Start Date";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleCreateTimeLog = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const utcStartTime = convertToUTCDateString(timeLogForm.start_date);
      const utcEndTime = convertToUTCDateString(timeLogForm.end_date);

      await addTimeLog({
        ...timeLogForm,
        start_date: utcStartTime,
        end_date: utcEndTime,
      });

      handleCloseDialog();
      toast.success("Time log added successfully!");
    } catch (error) {
      console.error("Error adding time log:", error);
      toast.error("Failed to add time log.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTimeLog = (timeLog: TimeLog) => {
    setTimeLogForm({
      type_id: timeLog.type_id,
      type: timeLog.type,
      comment: timeLog.comment || "",
      start_date: formatDate(new Date(timeLog.start_date || "")),
      end_date: formatDate(new Date(timeLog.end_date || "")),
    });
    setEditTimeLog(timeLog);
    setOpen(true);
    setErrors({});
  };

  const handleSaveEdit = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      if (editTimeLog) {
        // Get the current timezone
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const utcStartTime = convertToUTCDateString(timeLogForm.start_date);
        const utcEndTime = convertToUTCDateString(timeLogForm.end_date);

        await updateTimeLog({
          ...editTimeLog,
          ...timeLogForm,
          start_date: utcStartTime,
          end_date: utcEndTime,
        });
        handleCloseDialog();
        toast.success("Time log updated successfully!");
      }
    } catch (error) {
      console.error("Error updating time log:", error);
      toast.error("Failed to update time log.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTimeLog = async () => {
    try {
      if (deleteTimeLogId) {
        await deleteTimeLog(deleteTimeLogId);
      }
      toast.success("Time log deleted successfully!");
    } catch (error) {
      console.error("Error deleting time log:", error);
      toast.error("Failed to delete time log.");
    } finally {
      setDeleteOpen(false);
      setDeleteTimeLogId(null);
    }
  };

  const handleSubmit = () => {
    if (editTimeLog) {
      handleSaveEdit();
    } else {
      handleCreateTimeLog();
    }
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

  // Group time logs by day
  const groupedTimeLogs = () => {
    const groups: { [key: string]: TimeLog[] } = {};
    timeLogsForSelectedDate.forEach((timeLog) => {
      if (!timeLog.start_date) return;
      const day = format(new Date(timeLog.start_date), "yyyy-MM-dd");
      if (!groups[day]) {
        groups[day] = [timeLog];
      } else {
        groups[day].push(timeLog);
      }
    });
    return groups;
  };

  const timeLogsGrouped = groupedTimeLogs();

  const handleTimeSelection = (date: Date, willCloseSelection: Boolean) => {
    if (selectedDateField === "start_date") {
      setTimeLogForm((prev) => ({
        ...prev,
        start_date: formatDate(date || new Date()),
      }));
    } else if (selectedDateField === "end_date") {
      setTimeLogForm((prev) => ({
        ...prev,
        end_date: formatDate(date || new Date()),
      }));
    }

    if (willCloseSelection) {
      setTimePickerOpen(false);
    }
  };

  const handleOpenDatePicker = (field: "start_date" | "end_date") => {
    setSelectedDateField(field);
    setDatePickerOpen(true);
  };

  const handleDatePickerClose = () => {
    setDatePickerOpen(false);
    setSelectedDateField(null);
  };

  const handleDateChange = (date: Date) => {
    if (selectedDateField === "start_date") {
      setTimeLogForm((prev) => ({
        ...prev,
        start_date: formatDate(date || new Date()),
      }));
    } else if (selectedDateField === "end_date") {
      setTimeLogForm((prev) => ({
        ...prev,
        end_date: formatDate(date || new Date()),
      }));
    }
    setTimePickerOpen(true);
    setDatePickerOpen(false);
  };

  return (
    <div className="container mx-auto py-2">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Time Logs</h2>
        <div className="flex flex-row items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={handlePrevDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <b>{currentDate ? getDisplayDate() : "Time Logs"}</b>
          <Button variant="ghost" size="sm" onClick={handleNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <TimeLogTypeDialog />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialog}>Add Time Log</Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>
                  {editTimeLog ? "Edit Time Log" : "Add Time Log"}
                </DialogTitle>
                <DialogDescription>
                  {editTimeLog
                    ? "Edit the fields for this time log."
                    : "Create a new time log."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Select
                    onValueChange={(value) => {
                      const timeLogType = timeLogTypes.find(
                        (item) => item.id === value
                      );

                      if (timeLogType) {
                        handleTypeChange(timeLogType.name, timeLogType.id);
                      }
                    }}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue
                        placeholder="Select a type"
                        defaultValue={timeLogForm.type_id}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {timeLogTypes.map((type) => {
                        const Icon = Icons[type.icon];

                        return (
                          <SelectItem key={type.id} value={type.id}>
                            <Icon className="mr-2 h-4 w-4" />
                            {type.name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {errors.type_id && (
                    <p className="text-red-500 col-span-4 text-sm">
                      {errors.type_id}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="comment" className="text-right">
                    Comment
                  </Label>
                  <Textarea
                    id="comment"
                    value={timeLogForm.comment || ""}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="start_date" className="text-right">
                    Start Date
                  </Label>
                  <Button
                    onClick={() => handleOpenDatePicker("start_date")}
                    className="w-max font-normal col-span-3"
                    variant="outline"
                  >
                    {format(
                      new Date(timeLogForm.start_date || ""),
                      "MMMM dd, yyyy hh:mmaaa"
                    )}
                  </Button>
                  {errors.start_date && (
                    <p className="text-red-500 col-span-4 text-sm">
                      {errors.start_date}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="end_date" className="text-right">
                    End Date
                  </Label>
                  <Button
                    onClick={() => handleOpenDatePicker("end_date")}
                    className="w-max font-normal col-span-3"
                    variant="outline"
                  >
                    {format(
                      new Date(timeLogForm.end_date || ""),
                      "MMMM dd, yyyy hh:mmaaa"
                    )}
                  </Button>
                  {errors.end_date && (
                    <p className="text-red-500 col-span-4 text-sm">
                      {errors.end_date}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="secondary"
                  onClick={handleCloseDialog}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-700 text-white"
                >
                  {editTimeLog ? "Save" : "Add"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Date Picker Dialog */}
      <Dialog open={datePickerOpen} onOpenChange={handleDatePickerClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Date</DialogTitle>
            <DialogDescription>
              Select the date for the time log.
            </DialogDescription>
          </DialogHeader>
          <DatePicker
            onDateSelected={handleDateChange}
            selectedDate={
              selectedDateField === "start_date"
                ? new Date(timeLogForm.start_date || "")
                : new Date(timeLogForm.end_date || "")
            }
          />
        </DialogContent>
      </Dialog>

      {/* Time Picker Dialog */}
      <Dialog open={timePickerOpen} onOpenChange={setTimePickerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Time</DialogTitle>
            <DialogDescription>
              Select the time for the time log.
            </DialogDescription>
          </DialogHeader>
          <TimePicker
            onTimeSelected={handleTimeSelection}
            selectedDate={selectedDateValue || new Date()}
          />
        </DialogContent>
      </Dialog>

      {/* Search and Sort Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative flex items-center">
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <Search className="h-4 w-4 absolute right-3 text-gray-500" />
        </div>
      </div>

      {currentDate ? (
        timeLogsForSelectedDate.length > 0 ? (
          timeRange === "day" ? (
            <div>
              {timeLogsForSelectedDate.map((timeLog) => {
                let TypeIcon = Icons.Clock;

                const timeLogType = timeLogTypes.find(
                  (type) => type.id === timeLog.type_id
                );

                if (timeLogType) {
                  TypeIcon = Icons[timeLogType.icon];
                }

                return (
                  <TimeLogCard
                    key={timeLog.id}
                    timeLog={timeLog}
                    onEdit={handleEditTimeLog}
                    setDeleteTimeLogId={setDeleteTimeLogId}
                    setDeleteOpen={setDeleteOpen}
                    TypeIcon={TypeIcon}
                  />
                );
              })}
            </div>
          ) : (
            <div>
              {Object.entries(timeLogsGrouped).map(([date, timeLogs]) => (
                <div key={date} className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    {format(new Date(date), "PPP")}
                  </h3>
                  {timeLogs.map((timeLog) => {
                    let TypeIcon = Icons.Clock;

                    const timeLogType = timeLogTypes.find(
                      (type) => type.id === timeLog.type_id
                    );

                    if (timeLogType) {
                      TypeIcon = Icons[timeLogType.icon];
                    }

                    return (
                      <TimeLogCard
                        key={timeLog.id}
                        timeLog={timeLog}
                        onEdit={handleEditTimeLog}
                        setDeleteTimeLogId={setDeleteTimeLogId}
                        setDeleteOpen={setDeleteOpen}
                        TypeIcon={TypeIcon}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          )
        ) : (
          <p className="text-muted-foreground text-center">
            No time logs for this {timeRange}.
          </p>
        )
      ) : (
        <p className="text-muted-foreground text-center">
          Select a date to view time logs.
        </p>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm sm:max-w-[425px">
          <DialogHeader>
            <DialogTitle>Delete Time Log</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this time log? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={loading}
              onClick={handleDeleteTimeLog}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
