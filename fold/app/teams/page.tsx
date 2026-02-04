export const dynamic = "force-dynamic";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Plus, Crown, Search } from "lucide-react";
import { requestToJoinTeam } from "@/app/actions/join-actions";
import connectDB from "@/lib/mongodb";
import { User, Team } from "@/lib/models";
import { Suspense } from "react";
import LoadingScreen from "@/components/loading-screen";

async function TeamsList() {
  await connectDB();

  // Fetch all teams with member info
  const teamsData = await Team.find().populate("leaderId", "name").lean();

  const teams = await Promise.all(
    teamsData.map(async (team) => {
      const members = await User.find({ teamId: team._id })
        .select("name email")
        .lean();
      return {
        id: team._id.toString(),
        name: team.name,
        teamCode: team.teamCode,
        description: team.description || "",
        memberCount: members.length,
        leader: { name: (team.leaderId as any).name },
        members: members.map((m) => ({
          name: m.name,
          email: m.email,
        })),
      };
    }),
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map((team) => (
        <Card
          key={team.id}
          className="bg-zinc-900/50 border-purple-500/20 hover:border-purple-500/40 transition-all backdrop-blur group"
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                  {team.name}
                </CardTitle>
                <CardDescription className="text-zinc-500 mt-1">
                  {team.teamCode}
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className={`font-mono ${
                  team.memberCount >= 5
                    ? "border-red-500 text-red-500"
                    : "border-green-500 text-green-500"
                }`}
              >
                {team.memberCount}/5
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {team.description && (
              <p className="text-sm text-zinc-400 line-clamp-2">
                {team.description}
              </p>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Crown className="w-4 h-4 text-purple-400" />
                <span className="text-zinc-400">Leader:</span>
                <span className="text-white font-medium">
                  {team.leader.name}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-zinc-400">Members:</span>
                <span className="text-white">{team.memberCount}</span>
              </div>
            </div>

            {/* Member list preview */}
            {team.members.length > 0 && (
              <div className="pt-2 border-t border-zinc-800">
                <div className="flex -space-x-2">
                  {team.members.slice(0, 5).map((member, idx) => (
                    <Avatar
                      key={idx}
                      className="w-8 h-8 border-2 border-zinc-900"
                    >
                      <AvatarFallback className="text-xs bg-purple-600 text-white">
                        {member.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter>
            <form
              action={async () => {
                "use server";
                await requestToJoinTeam(team.id);
              }}
              className="w-full"
            >
              <Button
                className={`w-full ${
                  team.memberCount >= 5
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                }`}
                disabled={team.memberCount >= 5}
              >
                {team.memberCount >= 5 ? "Team Full" : "Request to Join"}
              </Button>
            </form>
          </CardFooter>
        </Card>
      ))}

      {teams.length === 0 && (
        <div className="col-span-full text-center py-20 bg-zinc-900/50 rounded-lg border border-dashed border-purple-500/20">
          <Users className="w-16 h-16 text-purple-500/50 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">No Teams Yet</h3>
          <p className="text-zinc-400 mb-6">
            Be the first to create a team for Spring Fiesta 2026!
          </p>
          <Link href="/teams/create">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="w-4 h-4 mr-2" /> Create First Team
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function TeamsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            Browse Teams
          </h1>
          <p className="text-xl text-zinc-300 mb-6">
            Find your squad for IIIT Surat Spring Fiesta 2026
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/teams/create">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-6">
                <Plus className="w-5 h-5 mr-2" /> Create Your Team
              </Button>
            </Link>
            <Link href="/teams/my-team">
              <Button
                variant="outline"
                className="border-purple-500/50 text-purple-300 hover:bg-purple-950 text-lg px-8 py-6"
              >
                My Team
              </Button>
            </Link>
          </div>
        </div>

        {/* Teams List */}
        <Suspense fallback={<LoadingScreen />}>
          <TeamsList />
        </Suspense>
      </div>
    </div>
  );
}
