// src/lib/discord-bot/repeat-logic.js

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ADMIN_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl || "", supabaseKey || "", {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

async function reopenRepeatingTasks() {
  console.log("Running daily repeat task check...");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Midnight today

  try {
    // Fetch tasks with repeat_config and not completed
    const { data: tasksToRepeat, error } = await supabase
      .from("tasks")
      .select("*")
      .not("repeat_config", "is", null)
      .neq("status", "completed");

    if (error) {
      console.error("Error fetching tasks to repeat:", error);
      return;
    }

    if (!tasksToRepeat || tasksToRepeat.length === 0) {
      console.log("No tasks to repeat today.");
      return;
    }

    // Filter tasks to reopen based on repeat_config
    const tasksToReopen = tasksToRepeat.filter((task) => {
      if (!task.repeat_config) return false;

      const repeatConfig = task.repeat_config;
      const startDate = new Date(repeatConfig.startDate);
      const endDate =
        repeatConfig.ends === "on" ? new Date(repeatConfig.endDate) : null;

      // Check if task has started
      if (startDate > today) return false;

      // Check if task has ended
      if (endDate && endDate < today) return false;

      // Check 'endsAfter' condition
      if (repeatConfig.ends === "after" && repeatConfig.occurrences <= 0) {
        return false; // Skip if occurrences have reached zero (or are negative)
      }

      // Daily logic
      if (repeatConfig.everyUnit === "day") {
        const diffInDays = Math.floor(
          (today.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
        );
        return diffInDays % repeatConfig.everyNumber === 0;
      }
      // Weekly logic
      else if (repeatConfig.everyUnit === "week") {
        const diffInWeeks = Math.floor(
          (today.getTime() - startDate.getTime()) / (1000 * 3600 * 24 * 7)
        );
        const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "short" }); // e.g., "Sun"
        return (
          diffInWeeks % repeatConfig.everyNumber === 0 &&
          repeatConfig.selectedDays.includes(dayOfWeek)
        );
      }
      else if (repeatConfig.everyUnit === "month") {
        const diffInMonths =
          (today.getFullYear() - startDate.getFullYear()) * 12 +
          (today.getMonth() - startDate.getMonth());

        if (diffInMonths % repeatConfig.everyNumber !== 0) {
          return false;
        }

        const startDayOfMonth = startDate.getDate();
        const todayDayOfMonth = today.getDate();
        const todayLastDayOfMonth = getLastDayOfMonth(
          today.getFullYear(),
          today.getMonth()
        );

        if (startDayOfMonth > todayLastDayOfMonth) {
          // Start date is beyond the end of this month, so check if today is the last day
          return todayDayOfMonth === todayLastDayOfMonth;
        } else {
          //Check if the date is same
          return todayDayOfMonth === startDayOfMonth;
        }
      }
      else if (repeatConfig.everyUnit === "year") {
        const diffInYears = today.getFullYear() - startDate.getFullYear();
        if (diffInYears % repeatConfig.everyNumber !== 0) {
          return false;
        }

        const startMonth = startDate.getMonth();
        const startDay = startDate.getDate();
        const todayMonth = today.getMonth();
        const todayDay = today.getDate();

        if (startMonth === todayMonth) {
          const todayLastDayOfMonth = getLastDayOfMonth(
            today.getFullYear(),
            todayMonth
          );
          if (startDay > todayLastDayOfMonth) {
            return todayDay === todayLastDayOfMonth;
          } else {
            return todayDay === startDay;
          }
        }
        return false;
      }

      return false; // Default: do not repeat
    });

    // Update the status of tasks to "open"
    if (tasksToReopen.length > 0) {
      const { data, error } = await supabase
        .from("tasks")
        .update({ status: "open" })
        .in(
          "id",
          tasksToReopen.map((task) => task.id)
        );

      if (error) {
        console.error("Error updating task statuses:", error);
      } else {
        console.log(`Reopened ${tasksToReopen.length} repeating tasks.`);
      }
      // Decrement occurrences if 'endsAfter'
      for (const task of tasksToReopen) {
        if (task.repeat_config?.ends === "after") {
          const newOccurrences = (task.repeat_config.occurrences || 1) - 1;

          await supabase
            .from("tasks")
            .update({
              repeat_config: {
                ...task.repeat_config,
                occurrences: newOccurrences,
              },
            })
            .eq("id", task.id);
        }
      }
    }
  } catch (err) {
    console.error("Error in reopenRepeatingTasks:", err);
  }
}

export default reopenRepeatingTasks;
