"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RepeatModalProps = {
  onSave: (repeatConfig: any) => void;
  onCancel: () => void;
};

export default function RepeatModal({ onSave, onCancel }: RepeatModalProps) {
  const [everyNumber, setEveryNumber] = useState(1);
  const [everyUnit, setEveryUnit] = useState("day");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [ends, setEnds] = useState("never"); // 'never', 'on', 'after'
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [occurrences, setOccurrences] = useState(10);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => {
    const repeatConfig = {
      everyNumber,
      everyUnit,
      selectedDays,
      startDate,
      ends,
      endDate,
      occurrences,
    };
    onSave(repeatConfig);
  };

  useEffect(() => {
    handleSave();
  }, [
    everyNumber,
    everyUnit,
    selectedDays,
    startDate,
    ends,
    endDate,
    occurrences,
  ]);

  return (
    <div className="grid gap-4 py-4">
      <div>
        <Label className="mb-2">Every</Label>
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            value={everyNumber}
            onChange={(e) => setEveryNumber(parseInt(e.target.value))}
            className="w-20"
          />
          <Select value={everyUnit} onValueChange={setEveryUnit}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day(s)</SelectItem>
              <SelectItem value="week">Week(s)</SelectItem>
              <SelectItem value="month">Month(s)</SelectItem>
              <SelectItem value="year">Year(s)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {everyUnit === "week" && (
        <div>
          <Label className="mb-2">Days of the Week</Label>
          <div className="flex space-x-2">
            {daysOfWeek.map((day) => (
              <Button
                key={day}
                variant={selectedDays.includes(day) ? "default" : "outline"}
                onClick={() => toggleDay(day)}
              >
                {day}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div>
        <Label className="mb-2">Starts</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label className="mb-2">Ends</Label>
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Switch
              id="endsNever"
              checked={ends === "never"}
              onCheckedChange={(checked) => checked && setEnds("never")}
            />
            <Label htmlFor="endsNever">Never</Label>
          </div>

          <div className="flex items-center space-x-2 mb-2">
            <Switch
              id="endsOn"
              checked={ends === "on"}
              onCheckedChange={(checked) => checked && setEnds("on")}
            />
            <Label htmlFor="endsOn">On</Label>
            {ends === "on" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    {endDate ? (
                      format(endDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          <div className="flex items-center space-x-2 mb-2">
            <Switch
              id="endsAfter"
              checked={ends === "after"}
              onCheckedChange={(checked) => checked && setEnds("after")}
            />
            <Label htmlFor="endsAfter">After</Label>
            {ends === "after" && (
              <>
                <Input
                  type="number"
                  value={occurrences}
                  onChange={(e) => setOccurrences(parseInt(e.target.value))}
                  className="w-20"
                />
                occurrences
              </>
            )}
          </div>
        </div>
      </div>

      {/* <div className="flex justify-end space-x-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div> */}
    </div>
  );
}
