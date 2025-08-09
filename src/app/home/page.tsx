"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import TaskList from "@/components/TaskList";
import { Button } from "@/components/ui/button";
import TaskCalendar from "@/components/TaskCalendar";
import WeeklyTaskList from "@/components/WeeklyTaskList";
import DailyTaskList from "@/components/DailyTaskList";
import { parseISO } from "date-fns";

type Task = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  due_time: string | null;
  status: string; // Add status
};

export default function HomePage() {
  const [session, setSession] = useState<any>(null);
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
      } else {
        const parsedTasks =
          data?.map((task) => ({
            ...task,
            due_date: task.due_date
              ? parseISO(task.due_date).toISOString()
              : null,
          })) || [];
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (!session) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-md py-6">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <a href="#" className="text-2xl font-semibold text-indigo-700">
            <span className="text-3xl mr-2">⭐</span> Stella
          </a>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <a href="#features" className="hover:text-indigo-500">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-indigo-500">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-indigo-500">
                  Contact
                </a>
              </li>
              <li>
                <Button onClick={handleSignOut} variant="ghost">
                  Sign Out
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-1 px-4 py-8">
        <TaskList />
        <TaskCalendar tasks={tasks} />
        <WeeklyTaskList tasks={tasks} />
        <DailyTaskList selectedDate={selectedDate} tasks={tasks} />
      </main>

      {/* Footer */}
      <footer className="bg-white text-center py-4 shadow-inner">
        <p className="text-gray-600">
          &copy; {new Date().getFullYear()} Stella. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
