export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0 bg-slate-50">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-sm text-muted-foreground text-center md:text-left">
          &copy; 2026{" "}
          <span className="text-cyan-500 font-semibold">CSV Recap Tool</span>.
          Built with Heart.
        </p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <a href="#" className="hover:underline">
            NextJS + Shadcn UI
          </a>
        </div>
      </div>
    </footer>
  );
}
