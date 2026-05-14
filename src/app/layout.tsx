import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthHydrator } from "@/components/layout/AuthHydrator";
import { IdleLogout } from "@/components/layout/IdleLogout";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SiapLaundry - Marketplace Laundry Terdekat",
  description:
    "Platform marketplace laundry dengan jemput-antar. Temukan laundry terdekat, pesan mudah, dan lacak cucian Anda secara real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-body">
        <ToastProvider>
          <AuthHydrator>
            <IdleLogout />
            {children}
          </AuthHydrator>
        </ToastProvider>
      </body>
    </html>
  );
}
