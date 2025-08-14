"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Session } from "@supabase/supabase-js";
import { StarFilledIcon } from "@radix-ui/react-icons"; // Import Menu Icon
import Sidebar from "@/components/Sidebar"; // Import Sidebar
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (
        sidebarRef.current &&
        !(sidebarRef.current as any).contains(event.target)
      ) {
        setIsSidebarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarRef]);

  return (
    <header className="bg-primary shadow-sm h-14 flex items-center justify-between px-4 relative">
      <div className="flex items-center">
        <Button className="text-primary-foreground" variant="ghost" size="icon" onClick={toggleSidebar}>
          {isSidebarOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
        <Link
          href="/"
          className="text-primary-foreground text-xl font-semibold flex items-center space-x-1"
        >
          <StarFilledIcon />
          <span>Stella</span>
        </Link>
      </div>

      {/* User Menu */}
      {session ? (
        <Popover>
          <PopoverTrigger>
            <Avatar className="cursor-pointer">
              <AvatarImage src={session?.user?.user_metadata?.avatar_url} />
              <AvatarFallback>
                {session?.user?.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="px-2 py-1">
              <p className="text-sm font-medium text-foreground">
                {session?.user?.email}
              </p>
            </div>
            <div className="py-1">
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start text-sm"
              >
                Sign Out
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <Link href="/login">Login</Link>
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          "fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar toggleSidebar={toggleSidebar} />
      </div>

      {/* Darkened Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black/50 z-40"
          onClick={toggleSidebar}
        />
      )}
    </header>
  );
}
