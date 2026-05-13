import { DriverBottomNav } from "@/components/layout/DriverBottomNav";

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas-cream">
      <DriverBottomNav />
      {/* Main content: margin-left on desktop for sidebar, padding-bottom on mobile for bottom nav */}
      <main className="min-h-screen p-xl md:ml-[240px] pb-[80px] md:pb-xl">
        {children}
      </main>
    </div>
  );
}
