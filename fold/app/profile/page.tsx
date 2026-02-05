import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gamepad2, Hash, Users, Crown, Castle, Tag } from "lucide-react";
import Link from "next/link";
import connectDB from "@/lib/mongodb";
import { Team } from "@/lib/models";
import { getAvatarUrl } from "@/lib/avatar";
import { ProfileEditForm } from "./profile-edit-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // If profile not complete, redirect to complete page
  if (!user.isProfileComplete) {
    redirect("/profile/complete");
  }

  // Get team info if user is in a team
  let team = null;
  if (user.teamId) {
    await connectDB();
    team = await Team.findById(user.teamId).lean();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>

        {/* Profile Card */}
        <Card className="border-purple-500/20 bg-zinc-950/80 backdrop-blur-xl mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 border-4 border-purple-500/50">
                <AvatarImage src={getAvatarUrl(user.avatarId, user.name)} />
                <AvatarFallback className="bg-purple-600 text-white text-xl">
                  {user.name?.charAt(0)?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl text-white flex items-center gap-2">
                  {user.name}
                  {user.role === "ADMIN" && (
                    <Badge className="bg-yellow-500 text-black">Admin</Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  {user.email}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Info Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg">
                <Gamepad2 className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-xs text-zinc-500">In-Game Name</p>
                  <p className="text-white font-medium">
                    {user.ign || "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg">
                <Castle className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-xs text-zinc-500">Town Hall</p>
                  <p className="text-white font-medium">
                    {user.townHall ? `TH ${user.townHall}` : "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg">
                <Hash className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-xs text-zinc-500">Roll Number</p>
                  <p className="text-white font-medium">
                    {user.rollNumber || "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg">
                <Tag className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-xs text-zinc-500">Player Tag</p>
                  <p className="text-white font-medium font-mono">
                    {user.playerTag || "Not set"}
                  </p>
                </div>
              </div>
            </div>

            {/* Team Info */}
            {team ? (
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{team.name}</p>
                      <p className="text-zinc-400 text-sm font-mono">
                        {team.teamCode}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.teamRole === "LEADER" && (
                      <Badge className="bg-yellow-500 text-black">
                        <Crown className="w-3 h-3 mr-1" />
                        Leader
                      </Badge>
                    )}
                    <Link href="/teams/my-team">
                      <Button variant="outline" size="sm">
                        View Team
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-center">
                <Users className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-zinc-400 mb-3">You're not in a team yet</p>
                <Link href="/teams">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Browse Teams
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Profile Card with Avatar Selection */}
        <ProfileEditForm user={user} />
      </div>
    </div>
  );
}
