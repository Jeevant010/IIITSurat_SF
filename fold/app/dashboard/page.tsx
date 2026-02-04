import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Users,
  Gamepad2,
  ArrowRight,
  Crown,
  Shield,
  Settings,
} from "lucide-react";
import Link from "next/link";
import connectDB from "@/lib/mongodb";
import { User, Team, JoinRequest } from "@/lib/models";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (!currentUser.isProfileComplete) {
    redirect("/profile/complete");
  }

  await connectDB();

  // Fetch user's team
  let team = null;
  let teamMembers: unknown[] = [];
  if (currentUser.teamId) {
    team = await Team.findById(currentUser.teamId).lean();
    if (team) {
      teamMembers = await User.find({ teamId: team._id }).lean();
    }
  }

  // Fetch pending join requests (for team leaders)
  let pendingRequests: unknown[] = [];
  if (team && currentUser.teamRole === "LEADER") {
    pendingRequests = await JoinRequest.find({
      teamId: team._id,
      status: "PENDING",
    })
      .populate("userId", "name email")
      .lean();
  }

  // Fetch user's pending requests (if not in a team)
  let myPendingRequests: unknown[] = [];
  if (!team) {
    myPendingRequests = await JoinRequest.find({
      userId: currentUser._id,
      status: "PENDING",
    })
      .populate("teamId", "name teamCode")
      .lean();
  }

  // Calculate quick stats
  const totalTeams = await Team.countDocuments({ status: "ACTIVE" });
  const totalPlayers = await User.countDocuments({
    isActive: true,
    isProfileComplete: true,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-4 border-purple-500/50">
                <AvatarImage src={currentUser.avatarUrl || ""} />
                <AvatarFallback className="bg-purple-600 text-white text-xl">
                  {currentUser.name?.charAt(0)?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Welcome, {currentUser.name?.split(" ")[0]}!
                </h1>
                <p className="text-zinc-400">
                  {currentUser.ign && (
                    <span className="text-purple-400">@{currentUser.ign}</span>
                  )}
                  {currentUser.teamRole === "LEADER" && (
                    <Badge className="ml-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                      <Crown className="w-3 h-3 mr-1" />
                      Team Leader
                    </Badge>
                  )}
                  {currentUser.role === "ADMIN" && (
                    <Badge className="ml-2 bg-red-500/20 text-red-400 border-red-500/50">
                      Admin
                    </Badge>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/profile">
                <Button
                  variant="outline"
                  className="border-zinc-700 hover:bg-zinc-800"
                >
                  Edit Profile
                </Button>
              </Link>
              <Link href="/settings">
                <Button
                  variant="outline"
                  className="border-zinc-700 hover:bg-zinc-800"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalTeams}</p>
                  <p className="text-zinc-400 text-sm">Active Teams</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 border-pink-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {totalPlayers}
                  </p>
                  <p className="text-zinc-400 text-sm">Players</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {team?.wins || 0}
                  </p>
                  <p className="text-zinc-400 text-sm">Team Wins</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {team?.score || 0}
                  </p>
                  <p className="text-zinc-400 text-sm">Team Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content - Left 2 columns */}
          <div className="md:col-span-2 space-y-6">
            {/* Team Card */}
            {team ? (
              <Card className="border-purple-500/20 bg-zinc-950/80 backdrop-blur-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-purple-400" />
                      My Team
                    </CardTitle>
                    <Link href="/teams/my-team">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-purple-400 hover:text-purple-300"
                      >
                        Manage Team <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl font-bold text-white">
                      {(team as { name: string }).name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white">
                        {(team as { name: string }).name}
                      </h3>
                      <p className="text-zinc-400 font-mono">
                        {(team as { teamCode: string }).teamCode}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-purple-400">
                        {(team as { score: number }).score}
                      </p>
                      <p className="text-zinc-500 text-sm">Points</p>
                    </div>
                  </div>

                  {/* Team Stats */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-zinc-900/50 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">
                        {(team as { wins: number }).wins}
                      </p>
                      <p className="text-zinc-500 text-sm">Wins</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-400">
                        {(team as { losses: number }).losses}
                      </p>
                      <p className="text-zinc-500 text-sm">Losses</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-zinc-400">
                        {teamMembers.length}/
                        {(team as { maxMembers: number }).maxMembers}
                      </p>
                      <p className="text-zinc-500 text-sm">Members</p>
                    </div>
                  </div>

                  {/* Team Members Preview */}
                  <div className="mt-4">
                    <p className="text-zinc-400 text-sm mb-2">Team Members</p>
                    <div className="flex -space-x-2">
                      {teamMembers.slice(0, 5).map((member: unknown) => {
                        const m = member as {
                          _id: { toString: () => string };
                          avatarUrl?: string;
                          name: string;
                        };
                        return (
                          <Avatar
                            key={m._id.toString()}
                            className="w-8 h-8 border-2 border-zinc-900"
                          >
                            <AvatarImage src={m.avatarUrl || ""} />
                            <AvatarFallback className="bg-purple-600 text-white text-xs">
                              {m.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pending Join Requests for Leaders */}
                  {currentUser.teamRole === "LEADER" &&
                    pendingRequests.length > 0 && (
                      <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-yellow-400 font-medium mb-2">
                          {pendingRequests.length} Pending Join Request
                          {pendingRequests.length > 1 ? "s" : ""}
                        </p>
                        <Link href="/teams/my-team">
                          <Button
                            size="sm"
                            className="bg-yellow-500 text-black hover:bg-yellow-400"
                          >
                            Review Requests
                          </Button>
                        </Link>
                      </div>
                    )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-purple-500/20 bg-zinc-950/80 backdrop-blur-xl">
                <CardContent className="py-12 text-center">
                  <Users className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No Team Yet
                  </h3>
                  <p className="text-zinc-400 mb-6">
                    Join a team or create your own to participate!
                  </p>

                  {/* Show pending requests if any */}
                  {myPendingRequests.length > 0 && (
                    <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-left">
                      <p className="text-blue-400 font-medium mb-2">
                        Your Pending Requests:
                      </p>
                      {myPendingRequests.map((req: unknown) => {
                        const r = req as {
                          _id: { toString: () => string };
                          teamId: { name: string; teamCode: string };
                        };
                        return (
                          <div
                            key={r._id.toString()}
                            className="flex items-center justify-between py-2"
                          >
                            <span className="text-white">{r.teamId.name}</span>
                            <Badge
                              variant="outline"
                              className="border-blue-500/50 text-blue-400"
                            >
                              Pending
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex gap-3 justify-center">
                    <Link href="/teams/create">
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <Crown className="w-4 h-4 mr-2" />
                        Create Team
                      </Button>
                    </Link>
                    <Link href="/teams">
                      <Button variant="outline" className="border-zinc-700">
                        Browse Teams
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Right column */}
          <div className="space-y-6">
            {/* Quick Links */}
            <Card className="border-purple-500/20 bg-zinc-950/80 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">
                  Quick Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link
                  href="/leaderboard"
                  className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg hover:bg-zinc-900 transition-colors"
                >
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-zinc-300">Leaderboard</span>
                </Link>
                <Link
                  href="/teams"
                  className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg hover:bg-zinc-900 transition-colors"
                >
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-zinc-300">All Teams</span>
                </Link>
                <Link
                  href="/leaderboard?tab=players"
                  className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg hover:bg-zinc-900 transition-colors"
                >
                  <Gamepad2 className="w-5 h-5 text-pink-400" />
                  <span className="text-zinc-300">All Players</span>
                </Link>
                {currentUser.role === "ADMIN" && (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg hover:bg-yellow-500/20 transition-colors border border-yellow-500/30"
                  >
                    <Shield className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-300">Admin Panel</span>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Profile Info */}
            <Card className="border-purple-500/20 bg-zinc-950/80 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-zinc-900/50 rounded-lg">
                  <p className="text-zinc-500 text-xs">Email</p>
                  <p className="text-white text-sm truncate">
                    {currentUser.email}
                  </p>
                </div>
                <div className="p-3 bg-zinc-900/50 rounded-lg">
                  <p className="text-zinc-500 text-xs">In-Game Name</p>
                  <p className="text-purple-400 font-mono">
                    {currentUser.ign || "Not set"}
                  </p>
                </div>
                <div className="p-3 bg-zinc-900/50 rounded-lg">
                  <p className="text-zinc-500 text-xs">Roll Number</p>
                  <p className="text-white font-mono">
                    {currentUser.rollNumber || "Not set"}
                  </p>
                </div>
                <Link href="/profile">
                  <Button
                    variant="outline"
                    className="w-full mt-2 border-zinc-700"
                  >
                    Edit Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
