import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-cyan-400" />
          <span className="text-xl font-bold tracking-tight">
            Kuy<span className="text-cyan-400">Recap</span>
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="#" className="transition-colors hover:text-cyan-400 px-2">
            FR Mode
          </Link>
        </div>
      </div>
    </nav>
  );
}
