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

// Function to fetch tasks from Supabase
async function fetchTasks() {
  const now = new Date();
  const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .lte("due_date", fifteenMinutesFromNow.toISOString())
    .gt("due_date", now.toISOString())
    .in("status", ["open", "in_progress"]);

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }

  return tasks;
}

// Function to generate a creative reminder using the Gemini API
async function generateCreativeReminder(
  taskName: string,
  characterIndex: number
): Promise<string> {
  // const prompt = `Create a short, creative, and slightly humorous reminder that the user should complete the task "${taskName}" which is due soon. Try to be motivational but not too serious. Limit to 1 sentence`;

  const prompt =
    characterPrompts[characterIndex].prompt.replace("[taskName]", taskName) +
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
  characterName: string
) {
  try {
    const response = await fetch(discordWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `[${taskName}]\n\n${creativeReminder}`, // Use the creative reminder
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
  console.log("Fetching tasks from Supabase...");
  const tasks = await fetchTasks();

  const selectedCharacterIndex = Math.floor(
    Math.random() * characterPrompts.length
  );

  for (const task of tasks) {
    const creativeReminder = await generateCreativeReminder(
      task.title,
      selectedCharacterIndex
    );
    await sendNotification(
      task.title,
      creativeReminder,
      characterPrompts[selectedCharacterIndex].name
    );
    console.log(`Notification sent for task: ${task.title}`);
  }
}

// Run function on startup
main();

// Run the main function every 5 minutes (adjust as needed)
setInterval(main, 300000);

console.log("Discord webhook integration started.");
