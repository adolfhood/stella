import { supabase } from "@/lib/supabase";

export async function setupAccount(userId: string) {
  const { data, error } = await supabase
    .from("time_log_types")
    .insert([
      {
        user_id: userId,
        name: "Sleep",
        icon: "Bed",
      },
      {
        user_id: userId,
        name: "Exercise",
        icon: "Dumbbell",
      },
      {
        user_id: userId,
        name: "Eat",
        icon: "Utensils",
      },
      {
        user_id: userId,
        name: "Work",
        icon: "Briefcase",
      },
      {
        user_id: userId,
        name: "Study",
        icon: "Book",
      },
    ])
    .select("*");

  return { data, error };
}
