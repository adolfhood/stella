import { useState } from "react";
import { DateCalendar as MuiDatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";

interface DatePickerProps {
  onDateSelected: (date: Date) => void;
  selectedDate: Date;
}

export function DatePicker({ onDateSelected, selectedDate }: DatePickerProps) {
  const [selectedDateInternal, setSelectedDateInternal] = useState<Date>(selectedDate);

  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      setSelectedDateInternal(newDate);
      onDateSelected(newDate);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <b>{format(selectedDateInternal, "yyyy-MM-dd")}</b>
      <MuiDatePicker
        value={selectedDateInternal}
        onChange={handleDateChange}
      />
    </LocalizationProvider>
  );
}