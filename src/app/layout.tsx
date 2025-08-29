import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { TagProvider } from "@/contexts/TagContext";
import { TaskProvider } from "@/contexts/TaskContext";
import { TaskSortProvider } from "@/contexts/TaskSortContext";
import { TimeLogsProvider } from "@/contexts/TimeLogsContext";
import { TimeLogTypeProvider } from "@/contexts/TimeLogTypeContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stellast",
  description: "A powerful AI assistant for your daily tasks",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body style={{ fontFamily: "var(--font-inter)" }}>
        <TaskProvider>
          <TaskSortProvider>
            <TagProvider>
              <TimeLogsProvider>
                <TimeLogTypeProvider>{children}</TimeLogTypeProvider>
              </TimeLogsProvider>
            </TagProvider>
          </TaskSortProvider>
        </TaskProvider>
        <Toaster />
      </body>
    </html>
  );
}
