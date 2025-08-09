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
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { StarFilledIcon } from "@radix-ui/react-icons";

export default function Header() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="bg-white shadow h-14 flex items-center justify-between px-4">
      <Link href="/" className="text-xl font-semibold flex items-center space-x-1">
        <StarFilledIcon />
        <span>Stella</span>
      </Link>

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
              <p className="text-sm font-medium text-gray-800">
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
    </header>
  );
}
