export const dynamic = "force-dynamic";

import connectDB from "@/lib/mongodb";
import { Match, Team } from "@/lib/models";
import { BracketManagementClient } from "./bracket-management-client";

export default async function AdminBracketsPage() {
  await connectDB();

  // Fetch all matches with team info
  const matchesData = await Match.find()
    .populate("team1Id", "name teamCode")
    .populate("team2Id", "name teamCode")
    .populate("winnerId", "name")
    .sort({ stage: 1, round: 1, matchNumber: 1 })
    .lean();

  const matches = matchesData.map((m: any) => ({
    _id: m._id.toString(),
    tournamentName: m.tournamentName,
    stage: m.stage || "KNOCKOUT",
    round: m.round,
    matchNumber: m.matchNumber,
    team1: m.team1Id
      ? {
          _id: m.team1Id._id.toString(),
          name: m.team1Id.name,
          teamCode: m.team1Id.teamCode,
        }
      : null,
    team2: m.team2Id
      ? {
          _id: m.team2Id._id.toString(),
          name: m.team2Id.name,
          teamCode: m.team2Id.teamCode,
        }
      : null,
    team1Score: m.team1Score || 0,
    team2Score: m.team2Score || 0,
    team1Stars: m.team1Stars || 0,
    team2Stars: m.team2Stars || 0,
    winnerId: m.winnerId?._id.toString() || null,
    status: m.status,
    scheduledAt: m.scheduledAt?.toISOString() || null,
    notes: m.notes || "",
  }));

  // Fetch all teams for assignment
  const teamsData = await Team.find({ status: "ACTIVE" }).lean();
  const teams = teamsData.map((t) => ({
    _id: t._id.toString(),
    name: t.name,
    teamCode: t.teamCode,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Tournament Bracket Manager
        </h1>
        <p className="text-zinc-400 mt-2">
          Create and manage tournament brackets. Supports IPL-style format with
          groups, eliminators, and qualifiers.
        </p>
      </div>

      <BracketManagementClient matches={matches} teams={teams} />
    </div>
  );
}
