"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  Sword,
  Trophy,
  ClipboardList,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/players", label: "Players", icon: Users },
    { href: "/admin/teams", label: "Teams", icon: Sword },
    { href: "/admin/brackets", label: "Tournament Bracket", icon: Trophy },
    { href: "/admin/matches", label: "Match Results", icon: ClipboardList },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Admin Header */}
      <div className="border-b border-yellow-500/20 bg-zinc-950 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-zinc-400 hover:text-white p-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <Shield className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
            <span className="text-white font-bold text-base md:text-lg">Admin Panel</span>
            <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded font-bold hidden sm:inline">
              GOD MODE
            </span>
          </div>
          <Link
            href="/"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            ← Back
          </Link>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="container mx-auto px-4 md:px-6 py-4 md:py-8 flex flex-col md:flex-row gap-4 md:gap-8">
        {/* Sidebar - Mobile: Slide-in, Desktop: Static */}
        <aside
          className={`
            fixed md:relative top-0 left-0 h-full md:h-auto
            w-64 md:w-64 flex-shrink-0 bg-zinc-950 md:bg-transparent
            transform transition-transform duration-300 ease-in-out z-50 md:z-auto
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            pt-20 md:pt-0 px-4 md:px-0
            border-r border-zinc-800 md:border-none
          `}
        >
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all group"
                >
                  <Icon className="w-5 h-5 group-hover:text-yellow-500" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
