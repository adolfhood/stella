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
import { CalendarIcon, ListChecks } from "lucide-react"; // Import icons
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-800">
      {/* App Bar */}
      <header className="bg-white shadow h-16 flex items-center justify-between px-4">
        <h1 className="text-xl font-semibold">
          <span className="text-2xl mr-2">⭐</span> Stella
        </h1>

        {/* User Menu */}
        <Popover>
          <PopoverTrigger>
            <Avatar className="cursor-pointer">
              <AvatarImage src={session.user.user_metadata?.avatar_url} />
              <AvatarFallback>
                {session.user.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="px-2 py-1">
              <p className="text-sm font-medium text-gray-800">
                {session.user.email}
              </p>
            </div>
            <div className="py-1">
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start"
              >
                Sign Out
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6">
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList>
            <TabsTrigger value="tasks">
              <ListChecks className="mr-2 h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="weekly">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="daily">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Daily
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tasks" className="mt-4">
            <TaskList />
          </TabsContent>
          <TabsContent value="calendar" className="mt-4">
            <TaskCalendar tasks={tasks} />
          </TabsContent>
          <TabsContent value="weekly" className="mt-4">
            <WeeklyTaskList tasks={tasks} />
          </TabsContent>
          <TabsContent value="daily" className="mt-4">
            <DailyTaskList selectedDate={selectedDate} tasks={tasks} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 text-center py-4 shadow-inner text-gray-600">
        <p>&copy; {new Date().getFullYear()} Stella. All rights reserved.</p>
      </footer>
    </div>
  );
}
