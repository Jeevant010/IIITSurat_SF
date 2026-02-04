export const dynamic = "force-dynamic";

import connectDB from "@/lib/mongodb";
import { User, Team } from "@/lib/models"; // Import from index to ensure models are registered
import { PublicPlayersClient } from "./players-client";

export default async function PublicPlayersPage() {
  await connectDB();

  // Fetch all players with team info
  const playersData = await User.find({ role: "USER" })
    .populate("teamId", "name teamCode")
    .lean();

  const players = playersData.map((p) => ({
    _id: p._id.toString(),
    name: p.name,
    ign: p.ign,
    teamRole: p.teamRole,
    team: p.teamId
      ? {
          _id: (p.teamId as any)._id.toString(),
          name: (p.teamId as any).name,
          teamCode: (p.teamId as any).teamCode,
        }
      : null,
  }));

  const totalPlayers = players.length;
  const playersInTeams = players.filter((p) => p.team).length;
  const freeAgents = players.filter((p) => !p.team).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            IIIT Surat Spring Fiesta 2026
          </h1>
          <p className="text-xl text-zinc-300">All Registered Players</p>
        </div>

        <PublicPlayersClient
          players={players}
          stats={{ totalPlayers, playersInTeams, freeAgents }}
        />
      </div>
    </div>
  );
}
