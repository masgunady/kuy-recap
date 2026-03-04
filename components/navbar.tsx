"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const routes = [
    { href: "/", label: "Cross System Mode", color: "text-sky-400", bg: "bg-sky-400" },
    { href: "/biostar", label: "Biostar Mode", color: "text-teal-500", bg: "bg-teal-500" },
    { href: "/fr", label: "FR Mode", color: "text-cyan-400", bg: "bg-cyan-400" },
  ];

  const currentRoute = routes.find((r) => r.href === pathname) || routes[0];
  const otherRoutes = routes.filter((r) => r.href !== pathname);

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className={cn("h-8 w-8 rounded transition-colors duration-500", currentRoute.bg)} />
          <span className="text-xl font-bold tracking-tight">
            Ri<span className={cn("transition-colors duration-500", currentRoute.color)}>Cap</span>
          </span>
        </div>

        {/* 3. Hubungkan state 'open' ke Sheet */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[250px]">
            <SheetHeader>
              <SheetTitle className="text-left">Switch Mode</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 mt-8">
              {otherRoutes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  // 4. Tambahkan onClick untuk menutup sheet
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg border transition-all hover:bg-slate-50",
                    route.color,
                    "border-slate-100 font-semibold"
                  )}
                >
                  <div className={cn("h-3 w-3 rounded-full", route.bg)} />
                  {route.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}