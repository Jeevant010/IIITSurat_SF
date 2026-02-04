export const dynamic = "force-dynamic";

import connectDB from "@/lib/mongodb";
import { Match, Team } from "@/lib/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Swords, Clock, Crown } from "lucide-react";

// Helper to get round name
function getRoundName(round: number, totalRounds: number): string {
  if (round === totalRounds) return "🏆 Finals";
  if (round === totalRounds - 1) return "Semi Finals";
  if (round === totalRounds - 2) return "Quarter Finals";
  if (round === totalRounds - 3) return "Round of 16";
  return `Round ${round}`;
}

type MatchData = {
  _id: string;
  round: number;
  matchNumber: number;
  team1: { _id: string; name: string; teamCode: string } | null;
  team2: { _id: string; name: string; teamCode: string } | null;
  team1Score: number;
  team2Score: number;
  winner: { _id: string; name: string } | null;
  status: "TBD" | "SCHEDULED" | "LIVE" | "COMPLETED";
  scheduledAt: string | null;
};

function MatchCard({ match }: { match: MatchData }) {
  const isCompleted = match.status === "COMPLETED";
  const isLive = match.status === "LIVE";
  const isTBD = match.status === "TBD" || (!match.team1 && !match.team2);

  return (
    <div
      className={`relative bg-zinc-900/80 border rounded-lg p-4 min-w-[280px] ${
        isLive
          ? "border-red-500 shadow-lg shadow-red-500/20"
          : isCompleted
            ? "border-green-500/50"
            : "border-zinc-700"
      }`}
    >
      {/* Status Badge */}
      <div className="absolute -top-2 right-2">
        {isLive && (
          <Badge className="bg-red-500 text-white animate-pulse">🔴 LIVE</Badge>
        )}
        {isCompleted && (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
            ✓ Completed
          </Badge>
        )}
        {isTBD && (
          <Badge variant="outline" className="border-zinc-600 text-zinc-500">
            TBD
          </Badge>
        )}
      </div>

      {/* Match Number */}
      <p className="text-xs text-zinc-500 mb-3">Match #{match.matchNumber}</p>

      {/* Team 1 */}
      <div
        className={`flex items-center justify-between p-3 rounded-lg mb-2 ${
          isCompleted && match.winner?._id === match.team1?._id
            ? "bg-green-500/20 border border-green-500/50"
            : "bg-zinc-800"
        }`}
      >
        <div className="flex items-center gap-2">
          {isCompleted && match.winner?._id === match.team1?._id && (
            <Crown className="w-4 h-4 text-yellow-400" />
          )}
          <span
            className={`font-medium ${match.team1 ? "text-white" : "text-zinc-500 italic"}`}
          >
            {match.team1?.name || "TBD"}
          </span>
        </div>
        {(isCompleted || isLive) && match.team1 && (
          <span className="text-xl font-bold text-white">
            {match.team1Score}
          </span>
        )}
      </div>

      {/* VS Divider */}
      <div className="flex items-center justify-center my-1">
        <Swords className="w-4 h-4 text-zinc-600" />
      </div>

      {/* Team 2 */}
      <div
        className={`flex items-center justify-between p-3 rounded-lg ${
          isCompleted && match.winner?._id === match.team2?._id
            ? "bg-green-500/20 border border-green-500/50"
            : "bg-zinc-800"
        }`}
      >
        <div className="flex items-center gap-2">
          {isCompleted && match.winner?._id === match.team2?._id && (
            <Crown className="w-4 h-4 text-yellow-400" />
          )}
          <span
            className={`font-medium ${match.team2 ? "text-white" : "text-zinc-500 italic"}`}
          >
            {match.team2?.name || "TBD"}
          </span>
        </div>
        {(isCompleted || isLive) && match.team2 && (
          <span className="text-xl font-bold text-white">
            {match.team2Score}
          </span>
        )}
      </div>

      {/* Schedule */}
      {match.scheduledAt && !isCompleted && (
        <div className="flex items-center gap-2 mt-3 text-xs text-zinc-500">
          <Clock className="w-3 h-3" />
          {new Date(match.scheduledAt).toLocaleString("en-IN", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}
    </div>
  );
}

export default async function BracketsPage() {
  await connectDB();

  // Fetch all matches with team info
  const matchesData = await Match.find()
    .populate("team1Id", "name teamCode")
    .populate("team2Id", "name teamCode")
    .populate("winnerId", "name")
    .sort({ round: 1, matchNumber: 1 })
    .lean();

  const matches: MatchData[] = matchesData.map((m: any) => ({
    _id: m._id.toString(),
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
    winner: m.winnerId
      ? { _id: m.winnerId._id.toString(), name: m.winnerId.name }
      : null,
    status: m.status,
    scheduledAt: m.scheduledAt?.toISOString() || null,
  }));

  // Group matches by round
  const maxRound =
    matches.length > 0 ? Math.max(...matches.map((m) => m.round)) : 0;
  const rounds: { [key: number]: MatchData[] } = {};

  for (const match of matches) {
    if (!rounds[match.round]) {
      rounds[match.round] = [];
    }
    rounds[match.round].push(match);
  }

  // Stats
  const completedMatches = matches.filter(
    (m) => m.status === "COMPLETED",
  ).length;
  const liveMatches = matches.filter((m) => m.status === "LIVE").length;
  const upcomingMatches = matches.filter(
    (m) => m.status === "SCHEDULED" || m.status === "TBD",
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            Tournament Bracket
          </h1>
          <p className="text-xl text-zinc-300">IIIT Surat Spring Fiesta 2026</p>

          {/* Stats */}
          <div className="flex justify-center gap-6 mt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">
                {completedMatches}
              </p>
              <p className="text-sm text-zinc-500">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-400">{liveMatches}</p>
              <p className="text-sm text-zinc-500">Live</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-zinc-400">
                {upcomingMatches}
              </p>
              <p className="text-sm text-zinc-500">Upcoming</p>
            </div>
          </div>
        </div>

        {matches.length === 0 ? (
          /* Empty State */
          <Card className="max-w-lg mx-auto border-purple-500/20 bg-zinc-950/80">
            <CardContent className="py-16 text-center">
              <Trophy className="w-20 h-20 text-purple-500/30 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Brackets Coming Soon
              </h3>
              <p className="text-zinc-400">
                The tournament bracket will be revealed soon. Stay tuned!
              </p>
              <p className="text-zinc-500 text-sm mt-4">
                Teams are still being finalized for Spring Fiesta 2026
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Bracket Display */
          <div className="overflow-x-auto pb-8">
            <div className="flex gap-8 min-w-max px-4">
              {Object.keys(rounds)
                .map(Number)
                .sort((a, b) => a - b)
                .map((round) => (
                  <div key={round} className="flex flex-col items-center">
                    {/* Round Header */}
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-white text-center">
                        {getRoundName(round, maxRound)}
                      </h2>
                      <p className="text-sm text-zinc-500 text-center">
                        {rounds[round].length} match
                        {rounds[round].length > 1 ? "es" : ""}
                      </p>
                    </div>

                    {/* Matches in this round */}
                    <div className="flex flex-col gap-6 justify-around h-full">
                      {rounds[round].map((match) => (
                        <MatchCard key={match._id} match={match} />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-12 flex justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-zinc-400">Live Match</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-zinc-400">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-zinc-600 rounded-full"></div>
            <span className="text-zinc-400">TBD / Upcoming</span>
          </div>
        </div>
      </div>
    </div>
  );
}
