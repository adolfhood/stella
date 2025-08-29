"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingComponent from "@/components/LoadingComponent";

export default function HomePage() {
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
      <main className="flex-1 py-4 sm:py-6 app-width"></main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
