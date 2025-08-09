"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const characterOptions = [
  { value: "0", label: "Professor Promptly" },
  { value: "1", label: "Motivatron 5000" },
  { value: "2", label: "Sarcastic Sammy" },
  { value: "3", label: "Zen Master Zennith" },
  { value: "4", label: "Bardolph the Brave" },
  { value: "5", label: "Chef Remy Reminder" },
  { value: "6", label: "Detective Dirk Deadline" },
  { value: "7", label: "Space Cadet Sparkle" },
  { value: "8", label: "Gloomy Gus Grimsworth" },
  { value: "9", label: "Crazy Carl Countdown" },
];

export default function SettingsPage() {
  const [session, setSession] = useState<any>(null);
  const [selectedCharacter, setSelectedCharacter] = useState("0"); // Default character
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      if (session?.user?.id) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from("user_settings")
            .select("selected_character")
            .eq("user_id", session.user.id)
            .single();

          if (error) {
            console.error("Error fetching settings:", error);
            toast.error("Uh oh! Something went wrong.", {
              description: "Failed to fetch settings.",
            });
          } else if (data) {
            setSelectedCharacter(data.selected_character);
          }
        } finally {
          setLoading(false);
        }
      }
    };

    if (session) {
      fetchSettings();
    }
  }, [session]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const handleCharacterChange = (value: string) => {
    setSelectedCharacter(value);
  };

  const handleSaveSettings = async () => {
    if (session?.user?.id) {
      try {
        const { data, error } = await supabase
          .from("user_settings")
          .upsert(
            {
              user_id: session.user.id,
              selected_character: selectedCharacter,
            },
            { onConflict: "user_id" }
          )
          .select();

        if (error) {
          console.error("Error saving settings:", error);
          toast.error("Uh oh! Something went wrong.", {
            description: "Failed to save settings.",
          });
        } else {
          toast.success("Settings saved!", {
            description: "Your settings have been successfully saved.",
          });
        }
      } catch (error) {
        console.error("Unexpected error saving settings:", error);
        toast.error("Uh oh! Something went wrong.", {
          description: "Failed to save settings due to an unexpected error.",
        });
      }
    } else {
      toast.error("Uh oh! Something went wrong.", {
        description: "Not authenticated.",
      });
    }
  };

  if (!session) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-md py-6">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <a href="/" className="text-2xl font-semibold text-indigo-700">
            <span className="text-3xl mr-2">⭐</span> Stella
          </a>
          <nav>
            <ul className="flex space-x-6">
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
        <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-4">Settings</h2>

          {loading ? (
            <p>Loading settings...</p>
          ) : (
            <>
              {/* Character Selection */}
              <div className="mb-4">
                <label
                  htmlFor="characterSelect"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Reminder Character:
                </label>
                <Select
                  value={selectedCharacter}
                  onValueChange={handleCharacterChange}
                >
                  <SelectTrigger className="w-[180px">
                    <SelectValue placeholder="Select a character" />
                  </SelectTrigger>
                  <SelectContent>
                    {characterOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Save Button */}
              <Button onClick={handleSaveSettings}>Save Settings</Button>
            </>
          )}
        </div>
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
