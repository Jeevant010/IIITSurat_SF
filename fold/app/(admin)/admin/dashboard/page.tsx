import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Sword,
  Trophy,
  Activity,
  Megaphone,
  UserPlus,
  Clock,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

import connectDB from "@/lib/mongodb";
import { User, Team, JoinRequest, Match, Announcement } from "@/lib/models";

export default async function AdminDashboard() {
  await connectDB();

  // Fetch real stats from your database
  const [
    playerCount,
    teamCount,
    freeAgentCount,
    pendingRequestCount,
    matchCount,
    completedMatchCount,
    announcementCount,
    activeTeamCount,
  ] = await Promise.all([
    User.countDocuments({ role: "USER" }),
    Team.countDocuments(),
    User.countDocuments({ role: "USER", teamId: null }),
    JoinRequest.countDocuments({ status: "PENDING" }),
    Match.countDocuments(),
    Match.countDocuments({ status: "COMPLETED" }),
    Announcement.countDocuments({ isActive: true }),
    Team.countDocuments({ status: "ACTIVE" }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Shield className="w-8 h-8 text-yellow-500" />
          Command Center
        </h1>
        <p className="text-zinc-400 mt-1">
          Clash of Clans Tournament • Spring Fiesta 2026
        </p>
      </div>

      {/* STATS GRID */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Total Players
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{playerCount}</div>
            <p className="text-xs text-zinc-500">
              {freeAgentCount} free agents
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Active Clans
            </CardTitle>
            <Sword className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {activeTeamCount}
            </div>
            <p className="text-xs text-zinc-500">{teamCount} total clans</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Tournament Matches
            </CardTitle>
            <Trophy className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{matchCount}</div>
            <p className="text-xs text-zinc-500">
              {completedMatchCount} completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Pending Requests
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {pendingRequestCount}
            </div>
            <p className="text-xs text-zinc-500">needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-green-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/teams">
              <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white justify-start">
                <Sword className="w-4 h-4 mr-2" />
                Manage Clans ({teamCount})
              </Button>
            </Link>
            <Link href="/admin/players">
              <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white justify-start">
                <Users className="w-4 h-4 mr-2" />
                Manage Players ({playerCount})
              </Button>
            </Link>
            <Link href="/admin/announcements">
              <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white justify-start">
                <Megaphone className="w-4 h-4 mr-2" />
                Announcements ({announcementCount})
              </Button>
            </Link>
            <Link href="/admin/matches">
              <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white justify-start">
                <Trophy className="w-4 h-4 mr-2" />
                Match Results
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
              <span className="text-zinc-400">Database</span>
              <span className="flex items-center gap-2 text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
              <span className="text-zinc-400">Registration</span>
              <span className="text-green-400">Open</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
              <span className="text-zinc-400">Active Announcements</span>
              <span className="text-yellow-400">{announcementCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Tournament Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
              <h3 className="font-bold text-yellow-400">Clash of Clans</h3>
              <p className="text-sm text-zinc-400 mt-1">Spring Fiesta 2026</p>
              <p className="text-xs text-zinc-500 mt-2">IIIT Surat</p>
            </div>
            <div className="text-center text-sm text-zinc-400">
              {teamCount > 0 ? (
                <p>🎮 {teamCount} clans battling for glory!</p>
              ) : (
                <p>⏳ Waiting for clans to register...</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
