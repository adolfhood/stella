import * as dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";

// Load environment variables (replace with your preferred method)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ADMIN_KEY;
const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL || ""; // Webhook URL
const geminiApiKey = process.env.GEMINI_API_KEY; // Add Gemini API Key

const characterPrompts = [
  {
    name: "Professor Promptly",
    prompt:
      "You are Professor Promptly, a punctual and slightly eccentric academic. Give the user a reminder about task [taskName], due soon, in the style of a formal academic announcement. Keep it brief and encouraging.",
  },
  {
    name: "Motivatron 5000",
    prompt:
      "You are Motivatron 5000, a relentlessly optimistic robot. Give the user a reminder about task [taskName], due soon, with maximum enthusiasm and motivational buzzwords. Must include the phrase: 'You've got this!'",
  },
  {
    name: "Sarcastic Sammy",
    prompt:
      "You are Sarcastic Sammy, a cynical and sarcastic teenager. Give the user a reminder about task [taskName], due soon, with a healthy dose of sarcasm and teenage angst. Make sure to convey that it's their responsibility.",
  },
  {
    name: "Zen Master Zennith",
    prompt:
      "You are Zen Master Zennith, a peaceful and enlightened guru. Give the user a reminder about task [taskName], due soon, with a calm and mindful tone, emphasizing inner peace and balance. In short sentence.",
  },
  {
    name: "Bardolph the Brave",
    prompt:
      "You are Bardolph the Brave, a heroic medieval knight. Give the user a reminder about task [taskName], due soon, as if delivering a royal decree or a call to adventure. Use knightly language.",
  },
  {
    name: "Chef Remy Reminder",
    prompt:
      "You are Chef Remy Reminder, a demanding and passionate French chef. Give the user a reminder about task [taskName], due soon, as if it were a crucial ingredient in a masterpiece dish. Use French culinary terms.",
  },
  {
    name: "Detective Dirk Deadline",
    prompt:
      "You are Detective Dirk Deadline, a hard-boiled detective. Give the user a reminder about task [taskName], due soon, as if investigating a high-stakes case. Keep it noir and suspenseful.",
  },
  {
    name: "Space Cadet Sparkle",
    prompt:
      "You are Space Cadet Sparkle, a bubbly and excitable astronaut. Give the user a reminder about task [taskName], due soon, with a cosmic and futuristic theme. Use space-related metaphors and exclamation points.",
  },
  {
    name: "Gloomy Gus Grimsworth",
    prompt:
      "You are Gloomy Gus Grimsworth, a perpetually pessimistic Victorian butler. Give the user a reminder about task [taskName], due soon, in a mournful and overly dramatic fashion. Emphasize the inevitability of failure.",
  },
  {
    name: "Crazy Carl Countdown",
    prompt:
      "You are Crazy Carl Countdown, an unhinged doomsday prepper. Give the user a reminder about task [taskName], due soon, with a frantic and paranoid tone, emphasizing the dire consequences of procrastination. Must mention the word 'imminent'.",
  },
];

if (!supabaseUrl || !supabaseKey || !discordWebhookUrl || !geminiApiKey) {
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

const BATCH_SIZE = 500; // Define the batch size

// Function to fetch tasks from Supabase with pagination

async function fetchTasks(page: number, maxDueDate: Date) {
  const now = new Date();
  now.setSeconds(0, 0);

  const start = page * BATCH_SIZE;
  const end = start + BATCH_SIZE - 1;

  let tasks = [];

  const {
    data: dbTasks,
    error,
    count,
  } = await supabase
    .from("tasks")
    .select("*", { count: "exact" }) // Request the total count

    .lte("due_date", maxDueDate.toISOString())
    .gte("due_date", now.toISOString())
    .in("status", ["open", "in_progress"])
    .range(start, end); // Use range for pagination

  if (dbTasks && dbTasks.length > 0) {
    tasks = dbTasks;
  }

  if (error) {
    console.error("Error fetching tasks:", error);
    return { tasks: [], totalCount: 0 };
  }

  return { tasks: tasks || [], totalCount: count || 0 };
}

// Function to generate a creative reminder using the Gemini API
async function generateCreativeReminder(
  taskName: string,
  characterIndex: number,
  timeFrame: string
): Promise<string> {
  const prompt =
    characterPrompts[characterIndex].prompt.replace("[taskName", taskName) +
    ` This is a reminder for ${timeFrame}.` +
    "Keep it brief and engaging.";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      console.error(
        `Gemini API error: ${response.status} ${response.statusText}`
      );
      return `Reminder: Task "${taskName}" is due soon!`; // Fallback reminder
    }

    const data = (await response.json()) as any;

    // Extract the generated reminder from the Gemini API response
    const reminder = data.candidates[0].content.parts[0].text;
    return reminder;
  } catch (error) {
    console.error("Error generating creative reminder:", error);
    return `Reminder: Task "${taskName}" is due soon!`; // Fallback reminder
  }
}

// Function to send a notification to Discord via webhook
async function sendNotification(
  taskName: string,
  creativeReminder: string,
  characterName: string,
  discordWebhookUrl: string // Add discordWebhookUrl parameter
) {
  try {
    const response = await fetch(discordWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `**${taskName}**\n\n${creativeReminder}`, // Use the creative reminder
        username: characterName,
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
  console.log("Processing tasks for all time frames...");
  const now = new Date();
  now.setSeconds(0, 0);

  const fifteenMinutes = new Date(now.getTime() + 15 * 60 * 1000);
  fifteenMinutes.setSeconds(1, 0);

  let allTasks: any[] = [];
  let page = 0;
  let totalCount = 0;

  do {
    const { tasks, totalCount: currentTotalCount } = await fetchTasks(
      page,

      fifteenMinutes
    );

    if (page === 0) {
      totalCount = currentTotalCount;

      console.log(`Total tasks to process: ${totalCount}`);
    }

    if (tasks.length === 0) {
      break; // No more tasks to process
    }

    allTasks = allTasks.concat(tasks);
    page++;
  } while (page * BATCH_SIZE < totalCount);

  // Process exact minute reminders
  const exactTasks = allTasks.filter(
    (task) => new Date(task.due_date).toISOString() === now.toISOString()
  );
  await processTasks(exactTasks, "exact");

  // Process 5-minute reminders
  const fiveMinuteTasks = allTasks.filter(
    (task) =>
      new Date(task.due_date).toISOString() ==
      new Date(now.getTime() + 5 * 60 * 1000).toISOString()
  );
  await processTasks(fiveMinuteTasks, "5min");

  // Process 15-minute reminders
  const fifteenMinuteTasks = allTasks.filter(
    (task) =>
      new Date(task.due_date).toISOString() ==
      new Date(now.getTime() + 15 * 60 * 1000).toISOString()
  );
  await processTasks(fifteenMinuteTasks, "15min");

  console.log("All tasks processed for this cycle.");
}

async function processTasks(tasks: any[], timeFrame: string) {
  if (tasks.length === 0) {
    console.log(`No tasks to process for ${timeFrame}.`);
    return;
  }

  console.log(`Processing ${tasks.length} tasks for ${timeFrame}...`);

  // Fetch all user IDs from the tasks
  const userIds = tasks.map((task) => task.user_id);

  // Fetch user settings for all user IDs in a single query
  const { data: userSettingsList, error: userSettingsError } = await supabase
    .from("user_settings")
    .select("user_id, selected_character, discord_webhook_url")
    .in("user_id", userIds);

  if (userSettingsError) {
    console.error("Error fetching user settings:", userSettingsError);
    return;
  }

  // Create a map of user settings for easy lookup
  const userSettingsMap = new Map();
  userSettingsList.forEach((settings) => {
    userSettingsMap.set(settings.user_id, settings);
  });

  for (const task of tasks) {
    const userId = task.user_id;

    // Retrieve user settings from the map
    const userSettings = userSettingsMap.get(userId);

    let selectedCharacterIndex = 0; // Default to Professor Promptly
    let webhookUrl = discordWebhookUrl; // Default to the environment variable

    if (userSettings) {
      selectedCharacterIndex = parseInt(
        userSettings.selected_character || "0",
        10
      );

      webhookUrl = userSettings.discord_webhook_url || discordWebhookUrl;
    } else {
      console.log(
        `No user settings found for user ${userId}, defaulting to Professor Promptly and default webhook`
      );
    }

    const creativeReminder = await generateCreativeReminder(
      task.title,
      selectedCharacterIndex,
      timeFrame
    );

    await sendNotification(
      task.title,
      creativeReminder,
      characterPrompts[selectedCharacterIndex].name,
      webhookUrl // Pass the webhook URL
    );
    console.log(`Notification sent for task: ${task.title} for ${timeFrame}`);
  }

  console.log(`All tasks processed for ${timeFrame}.`);
}

// Run the main function every minute

main();
setInterval(main, 60000);

console.log("Discord webhook integration started.");
