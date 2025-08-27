import { useState } from "react";
import { TimeClock as MuiTimePicker, TimeView } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface TimePickerProps {
  onTimeSelected: (date: Date, willCloseSelection: Boolean) => void;
  selectedDate: Date;
}

export function TimePicker({ onTimeSelected, selectedDate }: TimePickerProps) {
  const [selectedTime, setSelectedTime] = useState<Date>(selectedDate);
  const [view, setView] = useState<TimeView | undefined>("hours");

  const handleTimeChange = (newTime: Date | null) => {
    if (newTime) {
      setSelectedTime(newTime);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <b>{format(selectedTime, "hh:mmaaa")}</b>
      <MuiTimePicker
        value={selectedTime}
        onChange={handleTimeChange}
        ampm
        ampmInClock
        onViewChange={(view) => setView(view)}
        view={view}
      />
      <div
        className={`${
          view === "minutes"
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } flex justify-center gap-2`}
      >
        <Button variant="outline" onClick={() => setView("hours")}>
          Back
        </Button>
        <Button
          variant="default"
          onClick={() => onTimeSelected(selectedTime, true)}
        >
          Save
        </Button>
      </div>
    </LocalizationProvider>
  );
}
