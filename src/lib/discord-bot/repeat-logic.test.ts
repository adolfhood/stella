// src/lib/discord-bot/repeat-logic.test.ts

import reopenRepeatingTasks from "./repeat-logic.mjs"; // Replace with the actual path
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import * as dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ADMIN_KEY;

// Initialize Supabase client (for testing)
const supabase = createClient(supabaseUrl || "", supabaseKey || "", {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Helper function to create a task (for testing)
async function createTask(repeatConfig: any, status: string = "open") {
  const { data, error } = await supabase
    .from("tasks")
    .insert([
      {
        title: "Test Task",
        description: "Test Description",
        user_id: "4b8d3f73-c5f7-4699-a328-649d400dfd03",
        status: status,
        repeat_config: repeatConfig,
      },
    ])
    .select("*");

  if (error) {
    console.error("Error creating task:", error);
    throw error;
  }
  return data[0]; // Return the created task
}

// Helper function to clean up tasks after testing
async function cleanupTask(taskId: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) {
    console.error("Error cleaning up task:", error);
  }
}

// Mock the Date object to control the current date (very important for testing)
describe("reopenRepeatingTasks", () => {
  let originalDate: any;

  beforeAll(() => {
    originalDate = Date; // Store original Date object
  });

  afterAll(() => {
    (global as any).Date = originalDate; // Restore original Date object
  });

  // Mock Date implementation
  function mockDate(isoDate: string) {
    (global as any).Date = class extends Date {
      constructor(...args: [number] | [string] | []) {
        if (args.length === 0) {
          super(isoDate);
        } else {
          super(...args);
        }
      }
    } as any;
  }

  it("should not reopen tasks if repeat_config is null", async () => {
    mockDate("2024-01-20T00:00:00.000Z");
    const task = await createTask(null);
    await reopenRepeatingTasks();
    const { data: updatedTask } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", task.id)
      .single();
    expect(updatedTask!.status).toBe("open");
    await cleanupTask(task.id!);
  });

  describe("Daily Repetition", () => {
    it("should reopen a daily repeating task", async () => {
      mockDate("2024-01-21T00:00:00.000Z");
      const task = await createTask({
        everyNumber: 1,
        everyUnit: "day",
        startDate: "2024-01-20T00:00:00.000Z",
        ends: "never",
      });

      await reopenRepeatingTasks();

      const { data: updatedTask } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", task.id)
        .single();
      expect(updatedTask!.status).toBe("open");
      await cleanupTask(task.id!);
    });

    it("should not reopen a daily repeating task if the interval is not met", async () => {
      mockDate("2024-01-22T00:00:00.000Z");
      const task = await createTask({
        everyNumber: 2,
        everyUnit: "day",
        startDate: "2024-01-20T00:00:00.000Z",
        ends: "never",
      });

      await reopenRepeatingTasks();

      const { data: updatedTask } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", task.id)
        .single();
      expect(updatedTask!.status).toBe("open");
      await cleanupTask(task.id!);
    });

    it("should not reopen a daily repeating task before the start date", async () => {
      mockDate("2024-01-19T00:00:00.000Z");
      const task = await createTask({
        everyNumber: 1,
        everyUnit: "day",
        startDate: "2024-01-20T00:00:00.000Z",
        ends: "never",
      });

      await reopenRepeatingTasks();

      const { data: updatedTask } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", task.id)
        .single();
      expect(updatedTask!.status).toBe("open");
      await cleanupTask(task.id!);
    });

    it("should not reopen a daily repeating task after the end date (on)", async () => {
      mockDate("2024-01-22T00:00:00.000Z");
      const task = await createTask({
        everyNumber: 1,
        everyUnit: "day",
        startDate: "2024-01-20T00:00:00.000Z",
        ends: "on",
        endDate: "2024-01-21T00:00:00.000Z",
      });

      await reopenRepeatingTasks();

      const { data: updatedTask } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", task.id)
        .single();
      expect(updatedTask!.status).toBe("open");
      await cleanupTask(task.id!);
    });

    it("should not reopen a daily repeating task after the end date (after occurrences)", async () => {
      mockDate("2024-01-22T00:00:00.000Z");
      const task = await createTask({
        everyNumber: 1,
        everyUnit: "day",
        startDate: "2024-01-20T00:00:00.000Z",
        ends: "after",
        occurrences: 2,
      });

      await reopenRepeatingTasks();

      const { data: updatedTask } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", task.id)
        .single();
      expect(updatedTask!.status).toBe("open");
      await cleanupTask(task.id!);
    });
  });

  describe("Weekly Repetition", () => {
    it("should reopen a weekly repeating task on the selected day", async () => {
      mockDate("2024-01-22T00:00:00.000Z"); // This is a Monday
      const task = await createTask({
        everyNumber: 1,
        everyUnit: "week",
        startDate: "2024-01-22T00:00:00.000Z",
        ends: "never",
        selectedDays: ["Mon"],
      });

      await reopenRepeatingTasks();

      const { data: updatedTask } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", task.id)
        .single();
      expect(updatedTask!.status).toBe("open");
      await cleanupTask(task.id!);
    });

    it("should not reopen a weekly repeating task if not the selected day", async () => {
      mockDate("2024-01-23T00:00:00.000Z"); // This is a Tuesday
      const task = await createTask({
        everyNumber: 1,
        everyUnit: "week",
        startDate: "2024-01-22T00:00:00.000Z", // Monday
        ends: "never",
        selectedDays: ["Mon"],
      });

      await reopenRepeatingTasks();

      const { data: updatedTask } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", task.id)
        .single();
      expect(updatedTask!.status).toBe("open");
      await cleanupTask(task.id!);
    });

    it("should reopen a weekly repeating task with interval", async () => {
      mockDate("2024-02-05T00:00:00.000Z"); // This is a Monday, 2 weeks after start date
      const task = await createTask({
        everyNumber: 2,
        everyUnit: "week",
        startDate: "2024-01-22T00:00:00.000Z", // Monday
        ends: "never",
        selectedDays: ["Mon"],
      });

      await reopenRepeatingTasks();

      const { data: updatedTask } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", task.id)
        .single();
      expect(updatedTask!.status).toBe("open");
      await cleanupTask(task.id!);
    });

    it("should handle multiple selected days correctly", async () => {
      mockDate("2024-01-25T00:00:00.000Z"); // This is a Thursday
      const task = await createTask({
        everyNumber: 1,
        everyUnit: "week",
        startDate: "2024-01-22T00:00:00.000Z", // Monday
        ends: "never",
        selectedDays: ["Mon", "Thu"],
      });

      await reopenRepeatingTasks();

      const { data: updatedTask } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", task.id)
        .single();
      expect(updatedTask!.status).toBe("open");
      await cleanupTask(task.id!);
    });
  });

  describe("Monthly Repetition", () => {
    it("should reopen a monthly repeating task on the same day of the month", async () => {
      mockDate("2024-02-20T00:00:00.000Z");
      const task = await createTask({
        everyNumber: 1,
        everyUnit: "month",
        startDate: "2024-01-20T00:00:00.000Z",
        ends: "never",
      });

      await reopenRepeatingTasks();

      const { data: updatedTask } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", task.id)
        .single();
      expect(updatedTask!.status).toBe("open");
      await cleanupTask(task.id!);
    });

    it("should handle end of month repetition (start on 31st)", async () => {
      mockDate("2024-03-31T00:00:00.000Z");
      const task = await createTask({
        everyNumber: 1,
        everyUnit: "month",
        startDate: "2024-01-31T00:00:00.000Z",
        ends: "never",
      });

      await reopenRepeatingTasks();

      const { data: updatedTask } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", task.id)
        .single();
      expect(updatedTask!.status).toBe("open");
      await cleanupTask(task.id!);
    });

    it("should handle end of month repetition (start on 29th Feb on a leap year)", async () => {
      mockDate("2025-02-28T00:00:00.000Z");
      const task = await createTask({
        everyNumber: 1,
        everyUnit: "month",
        startDate: "2024-02-29T00:00:00.000Z",
        ends: "never",
      });
      await reopenRepeatingTasks();
      const { data: updatedTask } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", task.id)
        .single();
      expect(updatedTask!.status).toBe("open");
      await cleanupTask(task.id!);
    });

    it("should not reopen before start date", async () => {
      mockDate("2024-01-19T00:00:00.000Z");
      const task = await createTask({
        everyNumber: 1,
        everyUnit: "month",
        startDate: "2024-01-20T00:00:00.000Z",
        ends: "never",
      });

      await reopenRepeatingTasks();

      const { data: updatedTask } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", task.id)
        .single();
      expect(updatedTask!.status).toBe("open");
      await cleanupTask(task.id!);
    });

    it("should respect the 'everyNumber' interval", async () => {
      mockDate("2024-03-20T00:00:00.000Z");
      const task = await createTask({
        everyNumber: 2,
        everyUnit: "month",
        startDate: "2024-01-20T00:00:00.000Z",
        ends: "never",
      });

      await reopenRepeatingTasks();

      const { data: updatedTask } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", task.id)
        .single();
      expect(updatedTask!.status).toBe("open");
      await cleanupTask(task.id!);
    });
  });

  describe("Yearly Repetition", () => {
    it("should reopen a yearly repeating task on the same day of the year", async () => {
      mockDate("2025-01-20T00:00:00.000Z");
      const task = await createTask({
        everyNumber: 1,
        everyUnit: "year",
        startDate: "2024-01-20T00:00:00.000Z",
        ends: "never",
      });

      await reopenRepeatingTasks();

      const { data: updatedTask } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", task.id)
        .single();
      expect(updatedTask!.status).toBe("open");
      await cleanupTask(task.id!);
    });

    it("should handle leap years correctly (start on Feb 29)", async () => {
      mockDate("2028-02-29T00:00:00.000Z");
      const task = await createTask({
        everyNumber: 1,
        everyUnit: "year",
        startDate: "2024-02-29T00:00:00.000Z",
        ends: "never",
      });

      await reopenRepeatingTasks();

      const { data: updatedTask } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", task.id)
        .single();
      expect(updatedTask!.status).toBe("open");
      await cleanupTask(task.id!);
    });

    it("should handle yearly repetition when current year's Feb doesn't have 29 days", async () => {
      mockDate("2025-02-28T00:00:00.000Z");
      const task = await createTask({
        everyNumber: 1,
        everyUnit: "year",
        startDate: "2024-02-29T00:00:00.000Z",
        ends: "never",
      });

      await reopenRepeatingTasks();

      const { data: updatedTask } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", task.id)
        .single();
      expect(updatedTask!.status).toBe("open");
      await cleanupTask(task.id!);
    });

    it("should respect the 'everyNumber' interval for yearly tasks", async () => {
      mockDate("2026-01-20T00:00:00.000Z");
      const task = await createTask({
        everyNumber: 2,
        everyUnit: "year",
        startDate: "2024-01-20T00:00:00.000Z",
        ends: "never",
      });

      await reopenRepeatingTasks();

      const { data: updatedTask } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", task.id)
        .single();
      expect(updatedTask!.status).toBe("open");
      await cleanupTask(task.id!);
    });
  });

  describe("Ends After Occurrences", () => {
    it("should decrement occurrences and not reopen after occurrences reach 0", async () => {
      mockDate("2024-01-21T00:00:00.000Z");
      const task = await createTask(
        {
          everyNumber: 1,
          everyUnit: "day",
          startDate: "2024-01-20T00:00:00.000Z",
          ends: "after",
          occurrences: 1,
        },
        "open"
      );

      await reopenRepeatingTasks();

      // Check that the task is reopened and occurrences are decremented
      let { data: updatedTask } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", task.id)
        .single();

      expect(updatedTask!.status).toBe("open");
      expect(updatedTask!.repeat_config.occurrences).toBe(0);

      mockDate("2024-01-22T00:00:00.000Z");
      await reopenRepeatingTasks();

      // Verify that the task isn't reopened again
      ({ data: updatedTask } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", task.id)
        .single());
      expect(updatedTask!.status).toBe("open");

      await cleanupTask(task.id!);
    });
  });
});
