export const dynamic = "force-dynamic";

import connectDB from "@/lib/mongodb";
import { User, Team, JoinRequest, SiteSettings } from "@/lib/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeamManagementClient } from "./team-management-client";

export default async function AdminTeamsPage() {
  await connectDB();

  // Get site settings for max team size
  let settings = await SiteSettings.findOne().lean();
  const maxTeamSize = settings?.maxTeamSize || 5;

  // Fetch all teams with leader info and member counts
  const teamsData = await Team.find().populate("leaderId", "name email").lean();

  const teams = await Promise.all(
    teamsData.map(async (team) => {
      const members = await User.find({ teamId: team._id }).lean();
      const pendingRequests = await JoinRequest.countDocuments({
        teamId: team._id,
        status: "PENDING",
      });

      return {
        _id: team._id.toString(),
        name: team.name,
        teamCode: team.teamCode,
        description: team.description || "",
        leader: {
          _id: (team.leaderId as any)._id.toString(),
          name: (team.leaderId as any).name,
          email: (team.leaderId as any).email,
        },
        members: members.map((m) => ({
          _id: m._id.toString(),
          name: m.name,
          email: m.email,
          teamRole: m.teamRole,
        })),
        memberCount: members.length,
        pendingRequests,
      };
    }),
  );

  // Fetch all users without teams
  const freeAgents = await User.find({ teamId: null, role: "USER" })
    .select("_id name email")
    .lean();

  // Fetch all pending join requests
  const allPendingRequests = await JoinRequest.find({ status: "PENDING" })
    .populate("userId", "name email")
    .populate("teamId", "name")
    .lean();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Team Overseer (God Mode)
        </h1>
        <p className="text-zinc-400 mt-2">
          Manage all teams with unrestricted access
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400">Total Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{teams.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400">Free Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {freeAgents.length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400">
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {allPendingRequests.length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400">
              Total Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {teams.reduce((acc, t) => acc + t.memberCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client-side interactive component */}
      <TeamManagementClient
        teams={teams}
        freeAgents={freeAgents.map((u) => ({
          _id: u._id.toString(),
          name: u.name,
          email: u.email,
        }))}
        pendingRequests={allPendingRequests.map((r: any) => ({
          _id: r._id.toString(),
          userId: {
            _id: r.userId._id.toString(),
            name: r.userId.name,
            email: r.userId.email,
          },
          teamId: {
            _id: r.teamId._id.toString(),
            name: r.teamId.name,
          },
          status: r.status,
          createdAt: r.createdAt.toISOString(),
        }))}
        maxTeamSize={maxTeamSize}
      />
    </div>
  );
}
