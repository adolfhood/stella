// src/components/MoneyCalendar.tsx
"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

import { useMoneyItemContext } from "@/contexts/MoneyItemContext";
import { MoneyItem } from "@/types/MoneyItem";

const MoneyCalendar = () => {
  const { moneyItems } = useMoneyItemContext();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const getMoneyItemsForDate = (date: Date) => {
    return moneyItems.filter(
      (item) => item.date && isSameDay(new Date(item.date), date)
    );
  };

  const calculateDailyTotals = (date: Date) => {
    const items = getMoneyItemsForDate(date);

    let income = 0;
    let expense = 0;
    let transfer = 0;

    items.forEach((item) => {
      if (item.type === "income") {
        income += item.amount;
      } else if (item.type === "expense") {
        expense += item.amount;
      } else if (item.type === "transfer") {
        transfer += item.amount;
      }
    });

    return { income, expense, transfer };
  };

  const DayContent = ({
    date,
    setSelectedDate,
  }: {
    date: Date;
    setSelectedDate: (date: Date) => void;
  }) => {
    const dailyTotals = calculateDailyTotals(date);
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

        {/* Totals */}
        <span className="w-full flex flex-col items-center justify-center mt-1">
          <span className="text-[0.6rem] text-green-500">
            +{dailyTotals.income}
          </span>
          <span className="text-[0.6rem] text-red-500">
            -{dailyTotals.expense}
          </span>
          {/* <span className="text-[0.6rem] text-gray-500">
            {dailyTotals.transfer}
          </span> */}
        </span>
      </td>
    );
  };

  return (
    <div className="py-2 px-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Money Calendar
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
            Money Items for {format(selectedDate, "PPP")}:
          </h3>
          {getMoneyItemsForDate(selectedDate).length > 0 ? (
            <div>
              {getMoneyItemsForDate(selectedDate).map((item) => (
                <div key={item.id}>
                  {item.type}: {item.amount}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No money items for this day.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MoneyCalendar;
