"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Tag {
  id: string;
  name: string;
  user_id: string;
}

interface TagContextType {
  tags: Tag[];
  addTag: (name: string) => Promise<void>;
  updateTag: (id: string, name: string) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  fetchTags: () => Promise<void>;
}

const TagContext = createContext<TagContextType | undefined>(undefined);

export const TagProvider = ({ children }: { children: React.ReactNode }) => {
  const [tags, setTags] = useState<Tag[]>([]);

  const fetchTags = async () => {
    try {
      const { data: tagsData, error } = await supabase
        .from("tags")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching tags:", error);
        toast.error("Failed to fetch tags.");
      } else {
        setTags(tagsData || []);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
      toast.error("Failed to fetch tags.");
    }
  };

  const addTag = async (name: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        toast.error("User not authenticated.");
        return;
      }

      const { data, error } = await supabase
        .from("tags")
        .insert([{ user_id: userId, name }])
        .select("*")
        .single();

      if (error) {
        console.error("Error adding tag:", error);
        toast.error("Failed to add tag.");
      } else {
        setTags([...tags, data]);
        toast.success("Tag added successfully!");
      }
    } catch (error) {
      console.error("Error adding tag:", error);
      toast.error("Failed to add tag.");
    }
  };

  const updateTag = async (id: string, name: string) => {
    try {
      const { data, error } = await supabase
        .from("tags")
        .update({ name })
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        console.error("Error updating tag:", error);
        toast.error("Failed to update tag.");
      } else {
        setTags(tags.map((tag) => (tag.id === id ? data : tag)));
        toast.success("Tag updated successfully!");
      }
    } catch (error) {
      console.error("Error updating tag:", error);
      toast.error("Failed to update tag.");
    }
  };

  const deleteTag = async (id: string) => {
    try {
      const { error } = await supabase.from("tags").delete().eq("id", id);

      if (error) {
        console.error("Error deleting tag:", error);
        toast.error("Failed to delete tag.");
      } else {
        setTags(tags.filter((tag) => tag.id !== id));
        toast.success("Tag deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
      toast.error("Failed to delete tag.");
    }
  };

  useEffect(() => {
    fetchTags();

    const tagsSubscription = supabase
      .channel("public:tags")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tags" },
        (payload) => {
          // console.log("Change received!", payload);
          fetchTags();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tagsSubscription);
    };
  }, []);

  const value: TagContextType = {
    tags,
    addTag,
    updateTag,
    deleteTag,
    fetchTags,
  };

  return <TagContext.Provider value={value}>{children}</TagContext.Provider>;
};

export const useTagContext = () => {
  const context = useContext(TagContext);
  if (!context) {
    throw new Error("useTagContext must be used within a TagProvider");
  }
  return context;
};
