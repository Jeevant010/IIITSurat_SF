import type { Metadata } from "next";
import { Inter } from "next/font/google"; // We can change this to a gaming font later
import "./globals.css"; 
import { cn } from "@/lib/utils"; // Shadcn utility for cleaner classes

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IIIT Surat - Clash of Clans",
  description: "Official Spring Fiesta Gaming Tournament Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // We force "dark" class here to ensure the Gaming UI is always active
    <html lang="en" className="dark"> 
      <body 
        className={cn(
          inter.className, 
          "min-h-screen bg-black text-white antialiased selection:bg-yellow-500 selection:text-black"
        )}
      >
        {/* We will add the Navbar here later */}
        <main className="relative flex min-h-screen flex-col">
          {children}
        </main>
        {/* We will add the Footer here later */}
      </body>
    </html>
  );
}