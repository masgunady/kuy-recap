import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto">{children}</div>
      <Footer />
    </div>
  );
}
