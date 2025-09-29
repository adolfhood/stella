"use client";

import { useMoneyItemContext } from "@/contexts/MoneyItemContext";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const MonthlyMoneyList = () => {
  const { moneyItems } = useMoneyItemContext();
  const [openMonths, setOpenMonths] = useState<string[]>([]);

  const currentYear = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(currentYear, i, 1).toLocaleString("default", {
      month: "long",
    });
    return month;
  });

  const getWeeksInMonth = (month: number, year: number) => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    let firstWeekDay = firstDayOfMonth.getDay();
    const lastDate = lastDayOfMonth.getDate();

    let currentWeekStartDate = 1;
    let weeks = [];

    while (currentWeekStartDate <= lastDate) {
      let currentWeekEndDate = Math.min(
        currentWeekStartDate + 6 - firstWeekDay,
        lastDate
      );
      weeks.push({
        start: currentWeekStartDate,
        end: currentWeekEndDate,
      });
      currentWeekStartDate = currentWeekEndDate + 1;
      firstWeekDay = 0; // Reset for subsequent weeks
    }

    return weeks;
  };

  const toggleMonth = (month: string) => {
    setOpenMonths((prevOpenMonths) =>
      prevOpenMonths.includes(month)
        ? prevOpenMonths.filter((openMonth) => openMonth !== month)
        : [...prevOpenMonths, month]
    );
  };

  const getMonthTotal = (month: string, type: "income" | "expense") => {
    const monthIndex = months.indexOf(month);
    const monthMoneyItems = moneyItems.filter((item) => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getMonth() === monthIndex &&
        itemDate.getFullYear() === currentYear &&
        item.type === type
      );
    });

    return monthMoneyItems.reduce((acc, item) => acc + item.amount, 0);
  };

  const getWeekTotal = (
    month: string,
    weekStart: number,
    weekEnd: number,
    type: "income" | "expense"
  ) => {
    const monthIndex = months.indexOf(month);
    const monthMoneyItems = moneyItems.filter((item) => {
      const itemDate = new Date(item.date);
      const itemDateDay = itemDate.getDate();
      return (
        itemDate.getMonth() === monthIndex &&
        itemDate.getFullYear() === currentYear &&
        item.type === type &&
        itemDateDay >= weekStart &&
        itemDateDay <= weekEnd
      );
    });

    return monthMoneyItems.reduce((acc, item) => acc + item.amount, 0);
  };

  const isCurrentWeek = (month: string, weekStart: number, weekEnd: number) => {
    const today = new Date();
    const monthIndex = months.indexOf(month);
    const currentYear = today.getFullYear();

    return (
      today.getFullYear() === currentYear &&
      today.getMonth() === monthIndex &&
      today.getDate() >= weekStart &&
      today.getDate() <= weekEnd
    );
  };

  return (
    <div>
      {months
        .filter((month) => months.indexOf(month) <= new Date().getMonth()) // Filter out future months
        .sort((a, b) => months.indexOf(b) - months.indexOf(a)) // Sort months in descending order
        .map((month) => {
          const weeks = getWeeksInMonth(months.indexOf(month), currentYear);
          const totalIncome = getMonthTotal(month, "income");
          const totalExpense = getMonthTotal(month, "expense");

          return (
            <Collapsible key={month} className="w-full space-y-2">
              <CollapsibleTrigger className="flex items-center justify-between py-2">
                {month} - Income: ${totalIncome} - Expense: ${totalExpense}
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4">
                {weeks.map((week, index) => {
                  const weekStart = week.start;
                  const weekEnd = week.end;
                  const weekIncome = getWeekTotal(
                    month,
                    weekStart,
                    weekEnd,
                    "income"
                  );
                  const weekExpense = getWeekTotal(
                    month,
                    weekStart,
                    weekEnd,
                    "expense"
                  );

                  const startDate = new Date(
                    currentYear,
                    months.indexOf(month),
                    weekStart
                  );
                  const endDate = new Date(
                    currentYear,
                    months.indexOf(month),
                    weekEnd
                  );

                  const formattedStartDate = startDate.toLocaleDateString(
                    undefined,
                    {
                      month: "2-digit",
                      day: "2-digit",
                    }
                  );
                  const formattedEndDate = endDate.toLocaleDateString(
                    undefined,
                    {
                      month: "2-digit",
                      day: "2-digit",
                    }
                  );

                  const isCurrent = isCurrentWeek(month, weekStart, weekEnd);

                  return (
                    <div
                      key={index}
                      className={`flex justify-between items-center relative p-2 border ${
                        isCurrent ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <div className="grid grid-cols-3 items-center relative w-full">
                        <div className="flex items-center w-full">
                          <p className="text-xs text-gray-500">
                            {formattedStartDate} - {formattedEndDate}
                          </p>
                        </div>
                        <div>
                          <p className="text-primary text-right">
                            ${weekIncome}
                          </p>
                        </div>
                        <div>
                          <p className="text-destructive text-right">
                            ${weekExpense}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
    </div>
  );
};

export default MonthlyMoneyList;
