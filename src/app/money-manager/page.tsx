"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingComponent from "@/components/LoadingComponent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, CalendarIcon, Clock } from "lucide-react";
import DailyMoneyList from "@/components/money-manager/DailyMoneyList";
import MoneyCalendar from "@/components/money-manager/MoneyCalendar";
import MonthlyMoneyList from "@/components/money-manager/MonthlyMoneyList";

export default function MoneyManagerPage() {
  const [session, setSession] = useState<any>(null);

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
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="flex flex-wrap md:flex-nowrap h-max gap-1 sm:space-x-4 p-1 rounded-md shadow-sm bg-gray-200">
            <TabsTrigger
              value="daily"
              className="text-sm sm:text-base whitespace-nowrap justify-start data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
            >
              <Clock className="mr-2 h-4 w-4" />
              Daily
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="text-sm sm:text-base whitespace-nowrap justify-start"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger
              value="monthly"
              className="text-sm sm:text-base whitespace-nowrap justify-start"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Monthly
            </TabsTrigger>
            <TabsTrigger
              value="total"
              className="text-sm sm:text-base whitespace-nowrap justify-start"
            >
              <Calculator className="mr-2 h-4 w-4" />
              Total
            </TabsTrigger>
          </TabsList>
          <TabsContent value="daily">
            <DailyMoneyList />
          </TabsContent>
          <TabsContent value="calendar">
            <MoneyCalendar />
          </TabsContent>
          <TabsContent value="monthly">
            <MonthlyMoneyList />
          </TabsContent>
          <TabsContent value="total"></TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
