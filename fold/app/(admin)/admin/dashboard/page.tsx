import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Sword, Trophy, Activity } from "lucide-react";
export const dynamic = "force-dynamic";

import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Team from "@/lib/models/Team";

export default async function AdminDashboard() {
  await connectDB();

  // Fetch real stats from your database
  const playerCount = await User.countDocuments();
  const teamCount = await Team.countDocuments();
  // const matchCount = await Match.countDocuments() // When we add matches

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-white">
        Command Center
      </h1>

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
            <p className="text-xs text-zinc-500">+2 since last hour</p>
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
            <div className="text-2xl font-bold text-white">{teamCount}</div>
            <p className="text-xs text-zinc-500">Ready for battle</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Tournament Progress
            </CardTitle>
            <Trophy className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Qualifiers</div>
            <p className="text-xs text-zinc-500">Round 1 In Progress</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Server Health
            </CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Stable</div>
            <p className="text-xs text-zinc-500">Latency: 45ms</p>
          </CardContent>
        </Card>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">
              Recent Registration Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {/* We will put a Recharts Graph here later */}
            <div className="h-[200px] flex items-center justify-center text-zinc-600 border border-dashed border-zinc-800 rounded">
              Graph Component Placeholder
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
