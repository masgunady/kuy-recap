"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // Fungsi helper bawaan shadcn

export function Navbar() {
  const pathname = usePathname();

  const isBiostar = pathname === "/biostar";
  const linkHref = isBiostar ? "/" : "/biostar";
  const linkLabel = isBiostar ? "-> FR Mode" : "-> Biostar Mode";

  const themeColorClass = isBiostar ? "text-teal-500" : "text-cyan-400";
  const themeBgClass = isBiostar ? "bg-teal-500" : "bg-cyan-400";

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-8 w-8 rounded transition-colors duration-500",
              themeBgClass,
            )}
          />
          <span className="text-xl font-bold tracking-tight">
            Kuy
            <span
              className={cn("transition-colors duration-500", themeColorClass)}
            >
              ReCap
            </span>
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm font-medium">
          <Link
            href={linkHref}
            className={cn(
              "transition-all duration-300 px-3 py-2 rounded-md hover:bg-slate-100",
              themeColorClass,
            )}
          >
            {linkLabel}
          </Link>
        </div>
      </div>
    </nav>
  );
}
