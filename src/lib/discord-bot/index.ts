import * as dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch"; // Import node-fetch

// Load environment variables (replace with your preferred method)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ADMIN_KEY;
const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL || ""; // Webhook URL

if (!supabaseUrl || !supabaseKey || !discordWebhookUrl) {
  console.error("Missing environment variables!");
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Function to fetch tasks from Supabase
async function fetchTasks() {
  const now = new Date();
  const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .lte("due_date", fifteenMinutesFromNow.toISOString())
    .gt("due_date", now.toISOString());

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }

  return tasks;
}

// Function to send a notification to Discord via webhook
async function sendNotification(
  taskName: string,
  taskDueDate: string,
  taskDueTime: string | null
) {
  let dueDateFormatted = new Date(taskDueDate).toLocaleString();
  // if (taskDueTime) {
  //   dueDateFormatted += ` ${taskDueTime}`;
  // }
  try {
    const response = await fetch(discordWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `"${taskName}" is due on ${dueDateFormatted}`,
      }),
    });

    if (!response.ok) {
      console.error(
        `Failed to send notification: ${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

// Main function to fetch and notify about tasks
async function main() {
  console.log("Fetching tasks from Supabase...");
  const tasks = await fetchTasks();

  for (const task of tasks) {
    await sendNotification(task.title, task.due_date, task.due_time);
    console.log(`Notification sent for task: ${task.title}`);
  }
}

// Run function on startup
main();

// Run the main function every 5 minutes (adjust as needed)
setInterval(main, 300000);

console.log("Discord webhook integration started.");
