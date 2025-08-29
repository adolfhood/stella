"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ClockIcon } from "lucide-react"; // Import icons
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TimeLogList from "@/components/TimeLogList";
import TimeCharts from "@/components/TimeCharts";
import LoadingComponent from "@/components/LoadingComponent";

export default function TimeLoggerPage() {
  const [session, setSession] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">(
    "day"
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (!session) {
    return <LoadingComponent />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 py-4 sm:py-6 app-width">
        <Tabs defaultValue="day" className="w-full">
          <TabsList className="flex flex-wrap md:flex-nowrap h-max gap-1 sm:space-x-4 p-1 rounded-md shadow-sm">
            <TabsTrigger
              value="day"
              onClick={() => setTimeRange("day")}
              className="text-sm sm:text-base whitespace-nowrap justify-start"
            >
              <ClockIcon className="mr-2 h-4 w-4" />
              Day
            </TabsTrigger>
            <TabsTrigger
              value="week"
              onClick={() => setTimeRange("week")}
              className="text-sm sm:text-base whitespace-nowrap justify-start"
            >
              <ClockIcon className="mr-2 h-4 w-4" />
              Week
            </TabsTrigger>
            <TabsTrigger
              value="month"
              onClick={() => setTimeRange("month")}
              className="text-sm sm:text-base whitespace-nowrap justify-start"
            >
              <ClockIcon className="mr-2 h-4 w-4" />
              Month
            </TabsTrigger>
            <TabsTrigger
              value="year"
              onClick={() => setTimeRange("year")}
              className="text-sm sm:text-base whitespace-nowrap justify-start"
            >
              <ClockIcon className="mr-2 h-4 w-4" />
              Year
            </TabsTrigger>
          </TabsList>
          <div className="mt-2">
            <TimeLogList
              selectedDate={new Date()}
              setSelectedDate={(date) => console.log(date)}
              timeRange={timeRange}
            />
            {/* <TimeCharts
              selectedDate={new Date()}
              setSelectedDate={(date) => console.log(date)}
              timeRange={timeRange}
            /> */}
          </div>
        </Tabs>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
