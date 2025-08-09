"use client";

import Link from "next/link";
import { HomeIcon, Settings, X } from "lucide-react"; // Assuming you're using Lucide Icons
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { StarFilledIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

export default function Sidebar({ className, ...props }: any) {
  const pathname = usePathname();

  const routes = [
    {
      href: "/home",
      label: "Home",
      icon: HomeIcon,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <div
      className={cn(
        "w-64 min-h-screen p-4 bg-gray-50 border-r flex flex-col",
        className
      )}
      {...props}
    >
      <div className="mb-8 flex justify-between items-center">
        <p className="text-xl font-semibold flex items-center space-x-1">
          <StarFilledIcon />
          <span>Stella</span>
        </p>
        <Button variant="ghost" size="icon" onClick={props.toggleSidebar}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <nav className="flex-1">
        <ul>
          {routes.map((route) => (
            <li key={route.href} className="mb-2">
              <Link
                href={route.href}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors",
                  pathname === route.href
                    ? "bg-gray-100 font-medium"
                    : "text-gray-600"
                )}
              >
                <route.icon className="h-4 w-4" />
                <span>{route.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
