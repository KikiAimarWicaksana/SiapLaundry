import { SellerSidebar } from "@/components/layout/SellerSidebar";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas-cream">
      <SellerSidebar />
      <main className="ml-[240px] min-h-screen p-xl">{children}</main>
    </div>
  );
}
