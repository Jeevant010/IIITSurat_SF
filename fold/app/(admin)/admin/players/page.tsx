export const dynamic = "force-dynamic";

import connectDB from "@/lib/mongodb";
import { User, Team } from "@/lib/models";
import { PlayerManagementClient } from "./player-management-client";

export default async function AdminPlayersPage() {
  await connectDB();

  // Fetch all players with team info
  const playersData = await User.find({ role: "USER" })
    .populate("teamId", "name teamCode")
    .lean();

  const players = playersData.map((p) => ({
    _id: p._id.toString(),
    email: p.email,
    name: p.name,
    rollNumber: p.rollNumber,
    ign: p.ign,
    teamRole: p.teamRole,
    team: p.teamId
      ? {
          _id: (p.teamId as any)._id.toString(),
          name: (p.teamId as any).name,
          teamCode: (p.teamId as any).teamCode,
        }
      : null,
    createdAt: p.createdAt?.toISOString(),
  }));

  // Fetch all teams for dropdown
  const teamsData = await Team.find().lean();
  const teams = teamsData.map((t) => ({
    _id: t._id.toString(),
    name: t.name,
    teamCode: t.teamCode,
  }));

  // Stats
  const totalPlayers = players.length;
  const playersInTeams = players.filter((p) => p.team).length;
  const freeAgents = players.filter((p) => !p.team).length;
  const teamLeaders = players.filter((p) => p.teamRole === "LEADER").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Player Management</h1>
        <p className="text-zinc-400 mt-2">
          Manage all players for IIIT Surat Spring Fiesta 2026
        </p>
      </div>

      <PlayerManagementClient
        initialPlayers={players}
        teams={teams}
        stats={{
          totalPlayers,
          playersInTeams,
          freeAgents,
          teamLeaders,
        }}
      />
    </div>
  );
}
