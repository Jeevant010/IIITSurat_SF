import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SessionProvider } from "@/components/session-provider";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IIIT Surat - Spring Fiesta 2026",
  description: "Official Spring Fiesta Gaming Tournament Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          inter.className,
          "min-h-screen bg-black text-white antialiased selection:bg-yellow-500 selection:text-black",
        )}
      >
        <SessionProvider>
          <Navbar />
          <main className="relative flex min-h-screen flex-col">
            {children}
          </main>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
