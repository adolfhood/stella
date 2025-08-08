"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import TaskList from "@/components/TaskList";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

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

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-6">
            Manage Your Tasks with Stella
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your friendly daily task bot, designed to keep you organized and
            motivated.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-1 px-4 py-8">
        <TaskList />
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
