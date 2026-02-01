import Link from "next/link"
import { Shield, Users, Trophy, Settings, LayoutDashboard, Sword } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-black">
      {/* 1. SIDEBAR (Fixed Left) */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-950 hidden md:flex flex-col">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-2 text-yellow-500">
          <Shield className="h-6 w-6" />
          <span className="font-bold tracking-wider">GOD MODE</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin/dashboard">
            <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-900">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
            </Button>
          </Link>
          <Link href="/admin/players">
            <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-900">
              <Users className="mr-2 h-4 w-4" /> Player Roster
            </Button>
          </Link>
          <Link href="/admin/teams">
            <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-900">
              <Sword className="mr-2 h-4 w-4" /> Clan Manager
            </Button>
          </Link>
          <Link href="/admin/matches">
            <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-900">
              <Trophy className="mr-2 h-4 w-4" /> Tournament Bracket
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-900">
              <Settings className="mr-2 h-4 w-4" /> Site Config
            </Button>
          </Link>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="text-xs text-zinc-600 text-center">
            Authorized Personnel Only
            <br />
            ID: ADMIN_001
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 overflow-auto bg-black text-white p-8">
        {children}
      </main>
    </div>
  )
}