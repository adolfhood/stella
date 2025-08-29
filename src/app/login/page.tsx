"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { StarFilledIcon } from "@radix-ui/react-icons";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push("/home");
      }
    };

    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push("/home");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid h-screen bg-primary relative">
      <div className="mt-4 px-6">
        <h1 className="text-2xl font-bold text-primary-foreground flex justify-end">
          <StarFilledIcon /> Stellast
        </h1>
      </div>
      <div className="px-6 h-[40vh] max-h-[40vh]">
        <img src="/undraw/undraw_focused_m9bj.svg" className="w-full h-full" />
      </div>
      <Card className="w-full rounded-b-none border-0 bg-white gap-2">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">
            Login
          </CardTitle>
        </CardHeader>
        <CardContent className="rounded-b-none">
          {error && <p className="text-red-500">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-2">
            <div>
              <Input
                placeholder="Email"
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-xs py-6 px-4 rounded-2xl"
              />
            </div>
            <div>
              <Input
                placeholder="Password"
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-xs py-6 px-4 rounded-2xl"
              />
            </div>
            <Button
              disabled={loading}
              className="w-full py-6 rounded-4xl mt-2 text-primary-foreground"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <p className="text-sm mt-4 text-center">
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-primary">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
