export const dynamic = "force-dynamic";

import connectDB from "@/lib/mongodb";
import { Match, Team } from "@/lib/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, Swords, Clock, Crown, Star, Shield, Zap } from "lucide-react";
import type { MatchStage } from "@/lib/models/Match";

type MatchData = {
  _id: string;
  stage: MatchStage;
  round: number;
  matchNumber: number;
  team1: { _id: string; name: string; teamCode: string } | null;
  team2: { _id: string; name: string; teamCode: string } | null;
  team1Score: number;
  team2Score: number;
  team1Stars: number;
  team2Stars: number;
  winner: { _id: string; name: string } | null;
  status: "TBD" | "SCHEDULED" | "LIVE" | "COMPLETED";
  scheduledAt: string | null;
  notes: string;
};

// Calculate group standings
function calculateStandings(
  matches: MatchData[],
  group: "GROUP_A" | "GROUP_B",
) {
  const groupMatches = matches.filter(
    (m) => m.stage === group && m.status === "COMPLETED",
  );

  const standings: Record<
    string,
    {
      teamId: string;
      teamName: string;
      played: number;
      won: number;
      lost: number;
      stars: number;
      points: number;
    }
  > = {};

  // Get all teams in this group
  const allGroupMatches = matches.filter((m) => m.stage === group);
  for (const match of allGroupMatches) {
    if (match.team1 && !standings[match.team1._id]) {
      standings[match.team1._id] = {
        teamId: match.team1._id,
        teamName: match.team1.name,
        played: 0,
        won: 0,
        lost: 0,
        stars: 0,
        points: 0,
      };
    }
    if (match.team2 && !standings[match.team2._id]) {
      standings[match.team2._id] = {
        teamId: match.team2._id,
        teamName: match.team2.name,
        played: 0,
        won: 0,
        lost: 0,
        stars: 0,
        points: 0,
      };
    }
  }

  // Calculate standings from completed matches
  for (const match of groupMatches) {
    if (match.team1) {
      standings[match.team1._id].played++;
      standings[match.team1._id].stars += match.team1Stars;
      if (match.winner?._id === match.team1._id) {
        standings[match.team1._id].won++;
        standings[match.team1._id].points += 2;
      } else {
        standings[match.team1._id].lost++;
      }
    }
    if (match.team2) {
      standings[match.team2._id].played++;
      standings[match.team2._id].stars += match.team2Stars;
      if (match.winner?._id === match.team2._id) {
        standings[match.team2._id].won++;
        standings[match.team2._id].points += 2;
      } else {
        standings[match.team2._id].lost++;
      }
    }
  }

  return Object.values(standings).sort(
    (a, b) => b.points - a.points || b.stars - a.stars,
  );
}

function GroupTable({
  standings,
  group,
}: {
  standings: ReturnType<typeof calculateStandings>;
  group: string;
}) {
  if (standings.length === 0) return null;

  return (
    <Card className="bg-zinc-900/80 border-zinc-700">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield
            className={`w-5 h-5 ${group === "A" ? "text-blue-400" : "text-purple-400"}`}
          />
          Group {group} Standings
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 md:p-6 overflow-x-auto">
        <Table className="min-w-[400px]">
          <TableHeader>
            <TableRow className="border-zinc-800">
              <TableHead className="text-zinc-400 w-6 md:w-8 px-1 md:px-2">
                #
              </TableHead>
              <TableHead className="text-zinc-400 px-1 md:px-2">Team</TableHead>
              <TableHead className="text-zinc-400 text-center px-1 md:px-2">
                P
              </TableHead>
              <TableHead className="text-zinc-400 text-center px-1 md:px-2">
                W
              </TableHead>
              <TableHead className="text-zinc-400 text-center px-1 md:px-2">
                L
              </TableHead>
              <TableHead className="text-zinc-400 text-center px-1 md:px-2">
                ⭐
              </TableHead>
              <TableHead className="text-zinc-400 text-center font-bold px-1 md:px-2">
                Pts
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((team, idx) => (
              <TableRow
                key={team.teamId}
                className={`border-zinc-800 ${
                  idx === 0
                    ? "bg-green-500/10"
                    : idx === 1
                      ? "bg-yellow-500/10"
                      : ""
                }`}
              >
                <TableCell className="font-bold text-zinc-400 px-1 md:px-2">
                  {idx + 1}
                </TableCell>
                <TableCell className="text-white font-medium px-1 md:px-2">
                  <div className="flex items-center gap-1 md:gap-2">
                    {idx === 0 && (
                      <Crown className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 flex-shrink-0" />
                    )}
                    <span className="truncate text-sm md:text-base">
                      {team.teamName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center text-zinc-300 text-sm px-1 md:px-2">
                  {team.played}
                </TableCell>
                <TableCell className="text-center text-green-400 text-sm px-1 md:px-2">
                  {team.won}
                </TableCell>
                <TableCell className="text-center text-red-400 text-sm px-1 md:px-2">
                  {team.lost}
                </TableCell>
                <TableCell className="text-center text-yellow-400 text-sm px-1 md:px-2">
                  {team.stars}
                </TableCell>
                <TableCell className="text-center text-white font-bold text-sm px-1 md:px-2">
                  {team.points}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-xs text-zinc-500 mt-2">
          Top 2 teams qualify for playoffs
        </p>
      </CardContent>
    </Card>
  );
}

function MatchCard({
  match,
  showStage = false,
}: {
  match: MatchData;
  showStage?: boolean;
}) {
  const isCompleted = match.status === "COMPLETED";
  const isLive = match.status === "LIVE";

  const getStageBadgeColor = (stage: MatchStage) => {
    const colors: Record<MatchStage, string> = {
      GROUP_A: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      GROUP_B: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      QUALIFIER_1: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      QUALIFIER_2: "bg-yellow-600/20 text-yellow-200 border-yellow-600/30",
      ELIMINATOR_1: "bg-red-500/20 text-red-300 border-red-500/30",
      ELIMINATOR_2: "bg-red-600/20 text-red-200 border-red-600/30",
      QUALIFIER_3: "bg-orange-500/20 text-orange-300 border-orange-500/30",
      QUALIFIER_4: "bg-orange-600/20 text-orange-200 border-orange-600/30",
      SEMI_FINAL_1: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      SEMI_FINAL_2: "bg-cyan-600/20 text-cyan-200 border-cyan-600/30",
      FINAL:
        "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border-yellow-500/30",
      KNOCKOUT: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
    };
    return colors[stage];
  };

  const getStageName = (stage: MatchStage) => {
    const names: Record<MatchStage, string> = {
      GROUP_A: "Group A",
      GROUP_B: "Group B",
      QUALIFIER_1: "Qualifier 1",
      QUALIFIER_2: "Qualifier 2",
      ELIMINATOR_1: "Eliminator 1",
      ELIMINATOR_2: "Eliminator 2",
      QUALIFIER_3: "Qualifier 3",
      QUALIFIER_4: "Qualifier 4",
      SEMI_FINAL_1: "Semi-Final 1",
      SEMI_FINAL_2: "Semi-Final 2",
      FINAL: "🏆 Grand Final",
      KNOCKOUT: "Knockout",
    };
    return names[stage];
  };

  return (
    <div
      className={`relative bg-zinc-900/80 border rounded-lg p-3 md:p-4 w-full ${
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
      </div>

      {/* Stage & Match Info */}
      <div className="flex items-center justify-between mb-3">
        {showStage && (
          <Badge className={getStageBadgeColor(match.stage)}>
            {getStageName(match.stage)}
          </Badge>
        )}
        <span className="text-xs text-zinc-500">#{match.matchNumber}</span>
      </div>

      {/* Team 1 */}
      <div
        className={`flex items-center justify-between p-2 md:p-3 rounded-lg mb-2 ${
          isCompleted && match.winner?._id === match.team1?._id
            ? "bg-green-500/20 border border-green-500/50"
            : "bg-zinc-800"
        }`}
      >
        <div className="flex items-center gap-1.5 md:gap-2 min-w-0 flex-1">
          {isCompleted && match.winner?._id === match.team1?._id && (
            <Crown className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 flex-shrink-0" />
          )}
          <span
            className={`font-medium text-sm md:text-base truncate ${match.team1 ? "text-white" : "text-zinc-500 italic"}`}
          >
            {match.team1?.name || "TBD"}
          </span>
        </div>
        {(isCompleted || isLive) && match.team1 && (
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-sm flex items-center">
              <Star className="w-3 h-3 mr-1" />
              {match.team1Stars}
            </span>
            <span className="text-xl font-bold text-white">
              {match.team1Score}
            </span>
          </div>
        )}
      </div>

      {/* VS Divider */}
      <div className="flex items-center justify-center my-1">
        <Swords className="w-4 h-4 text-zinc-600" />
      </div>

      {/* Team 2 */}
      <div
        className={`flex items-center justify-between p-2 md:p-3 rounded-lg ${
          isCompleted && match.winner?._id === match.team2?._id
            ? "bg-green-500/20 border border-green-500/50"
            : "bg-zinc-800"
        }`}
      >
        <div className="flex items-center gap-1.5 md:gap-2 min-w-0 flex-1">
          {isCompleted && match.winner?._id === match.team2?._id && (
            <Crown className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 flex-shrink-0" />
          )}
          <span
            className={`font-medium text-sm md:text-base truncate ${match.team2 ? "text-white" : "text-zinc-500 italic"}`}
          >
            {match.team2?.name || "TBD"}
          </span>
        </div>
        {(isCompleted || isLive) && match.team2 && (
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-sm flex items-center">
              <Star className="w-3 h-3 mr-1" />
              {match.team2Stars}
            </span>
            <span className="text-xl font-bold text-white">
              {match.team2Score}
            </span>
          </div>
        )}
      </div>

      {/* Notes */}
      {match.notes && (
        <p className="text-xs text-zinc-500 mt-2 italic">{match.notes}</p>
      )}

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
    .sort({ stage: 1, round: 1, matchNumber: 1 })
    .lean();

  const matches: MatchData[] = matchesData.map((m: any) => ({
    _id: m._id.toString(),
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
    winner: m.winnerId
      ? { _id: m.winnerId._id.toString(), name: m.winnerId.name }
      : null,
    status: m.status,
    scheduledAt: m.scheduledAt?.toISOString() || null,
    notes: m.notes || "",
  }));

  // Check if IPL format (has group stages)
  const hasGroups =
    matches.some((m) => m.stage === "GROUP_A") ||
    matches.some((m) => m.stage === "GROUP_B");

  // Calculate group standings
  const groupAStandings = calculateStandings(matches, "GROUP_A");
  const groupBStandings = calculateStandings(matches, "GROUP_B");

  // Get matches by stage
  const groupAMatches = matches.filter((m) => m.stage === "GROUP_A");
  const groupBMatches = matches.filter((m) => m.stage === "GROUP_B");
  const q1Match = matches.find((m) => m.stage === "QUALIFIER_1");
  const q2Match = matches.find((m) => m.stage === "QUALIFIER_2");
  const e1Match = matches.find((m) => m.stage === "ELIMINATOR_1");
  const e2Match = matches.find((m) => m.stage === "ELIMINATOR_2");
  const q3Match = matches.find((m) => m.stage === "QUALIFIER_3");
  const q4Match = matches.find((m) => m.stage === "QUALIFIER_4");
  const sf1Match = matches.find((m) => m.stage === "SEMI_FINAL_1");
  const sf2Match = matches.find((m) => m.stage === "SEMI_FINAL_2");
  const finalMatch = matches.find((m) => m.stage === "FINAL");
  const knockoutMatches = matches.filter((m) => m.stage === "KNOCKOUT");

  // Stats
  const completedMatches = matches.filter(
    (m) => m.status === "COMPLETED",
  ).length;
  const liveMatches = matches.filter((m) => m.status === "LIVE").length;
  const upcomingMatches = matches.filter(
    (m) => m.status === "SCHEDULED" || m.status === "TBD",
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-yellow-950/10 to-black py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600 mb-3 md:mb-4">
            Tournament Bracket
          </h1>
          <p className="text-base md:text-xl text-zinc-300">
            🏆 Clash of Clans - Spring Fiesta 2026
          </p>

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
          <Card className="max-w-lg mx-auto border-yellow-500/20 bg-zinc-950/80">
            <CardContent className="py-16 text-center">
              <Trophy className="w-20 h-20 text-yellow-500/30 mx-auto mb-4" />
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
        ) : hasGroups ? (
          /* IPL Format Display */
          <div className="space-y-12">
            {/* Group Stage Section */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-yellow-500" />
                Group Stage
              </h2>

              {/* Group Standings Tables */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <GroupTable standings={groupAStandings} group="A" />
                <GroupTable standings={groupBStandings} group="B" />
              </div>

              {/* Group Matches */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Group A Matches */}
                {groupAMatches.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-blue-400 mb-4">
                      Group A Matches
                    </h3>
                    <div className="space-y-4">
                      {groupAMatches.map((match) => (
                        <MatchCard key={match._id} match={match} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Group B Matches */}
                {groupBMatches.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-purple-400 mb-4">
                      Group B Matches
                    </h3>
                    <div className="space-y-4">
                      {groupBMatches.map((match) => (
                        <MatchCard key={match._id} match={match} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Playoffs Section */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-500" />
                Playoffs - Extended Format
              </h2>

              {/* Playoff Bracket Visual */}
              <div className="bg-zinc-900/50 rounded-xl p-4 md:p-6 border border-yellow-500/20 overflow-x-auto">
                
                {/* Round 1: Qualifiers & Eliminators */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4 text-center">
                    Round 1 - Qualifiers & Eliminators
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 min-w-[700px] md:min-w-0">
                    {/* Q1 */}
                    <div className="text-center">
                      <h4 className="text-sm font-semibold text-yellow-400 mb-2">Q1</h4>
                      <p className="text-xs text-zinc-500 mb-2">GA1 vs GB2</p>
                      {q1Match ? (
                        <MatchCard match={q1Match} />
                      ) : (
                        <div className="bg-zinc-800 rounded-lg p-6 border border-dashed border-zinc-700">
                          <p className="text-zinc-500 text-sm">TBD</p>
                        </div>
                      )}
                      <p className="text-xs text-green-400 mt-2">W→SF1 | L→Q3</p>
                    </div>

                    {/* Q2 */}
                    <div className="text-center">
                      <h4 className="text-sm font-semibold text-yellow-400 mb-2">Q2</h4>
                      <p className="text-xs text-zinc-500 mb-2">GA2 vs GB1</p>
                      {q2Match ? (
                        <MatchCard match={q2Match} />
                      ) : (
                        <div className="bg-zinc-800 rounded-lg p-6 border border-dashed border-zinc-700">
                          <p className="text-zinc-500 text-sm">TBD</p>
                        </div>
                      )}
                      <p className="text-xs text-green-400 mt-2">W→SF2 | L→Q4</p>
                    </div>

                    {/* E1 */}
                    <div className="text-center">
                      <h4 className="text-sm font-semibold text-red-400 mb-2">E1</h4>
                      <p className="text-xs text-zinc-500 mb-2">GA3 vs GB4</p>
                      {e1Match ? (
                        <MatchCard match={e1Match} />
                      ) : (
                        <div className="bg-zinc-800 rounded-lg p-6 border border-dashed border-zinc-700">
                          <p className="text-zinc-500 text-sm">TBD</p>
                        </div>
                      )}
                      <p className="text-xs text-orange-400 mt-2">W→Q3 | L OUT</p>
                    </div>

                    {/* E2 */}
                    <div className="text-center">
                      <h4 className="text-sm font-semibold text-red-400 mb-2">E2</h4>
                      <p className="text-xs text-zinc-500 mb-2">GA4 vs GB3</p>
                      {e2Match ? (
                        <MatchCard match={e2Match} />
                      ) : (
                        <div className="bg-zinc-800 rounded-lg p-6 border border-dashed border-zinc-700">
                          <p className="text-zinc-500 text-sm">TBD</p>
                        </div>
                      )}
                      <p className="text-xs text-orange-400 mt-2">W→Q4 | L OUT</p>
                    </div>
                  </div>
                </div>

                {/* Round 2: Second Chance Qualifiers */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4 text-center">
                    Round 2 - Second Chance
                  </h3>
                  <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {/* Q3 */}
                    <div className="text-center">
                      <h4 className="text-sm font-semibold text-orange-400 mb-2">Q3</h4>
                      <p className="text-xs text-zinc-500 mb-2">Q1 Loser vs E1 Winner</p>
                      {q3Match ? (
                        <MatchCard match={q3Match} />
                      ) : (
                        <div className="bg-zinc-800 rounded-lg p-6 border border-dashed border-zinc-700">
                          <p className="text-zinc-500 text-sm">TBD</p>
                        </div>
                      )}
                      <p className="text-xs text-green-400 mt-2">Winner → SF2</p>
                    </div>

                    {/* Q4 */}
                    <div className="text-center">
                      <h4 className="text-sm font-semibold text-orange-400 mb-2">Q4</h4>
                      <p className="text-xs text-zinc-500 mb-2">Q2 Loser vs E2 Winner</p>
                      {q4Match ? (
                        <MatchCard match={q4Match} />
                      ) : (
                        <div className="bg-zinc-800 rounded-lg p-6 border border-dashed border-zinc-700">
                          <p className="text-zinc-500 text-sm">TBD</p>
                        </div>
                      )}
                      <p className="text-xs text-green-400 mt-2">Winner → SF1</p>
                    </div>
                  </div>
                </div>

                {/* Semi-Finals */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4 text-center">
                    Semi-Finals
                  </h3>
                  <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {/* SF1 */}
                    <div className="text-center">
                      <h4 className="text-sm font-semibold text-cyan-400 mb-2">SF1</h4>
                      <p className="text-xs text-zinc-500 mb-2">Q1 Winner vs Q4 Winner</p>
                      {sf1Match ? (
                        <MatchCard match={sf1Match} />
                      ) : (
                        <div className="bg-zinc-800 rounded-lg p-6 border border-dashed border-zinc-700">
                          <p className="text-zinc-500 text-sm">TBD</p>
                        </div>
                      )}
                      <p className="text-xs text-green-400 mt-2">Winner → Final</p>
                    </div>

                    {/* SF2 */}
                    <div className="text-center">
                      <h4 className="text-sm font-semibold text-cyan-400 mb-2">SF2</h4>
                      <p className="text-xs text-zinc-500 mb-2">Q2 Winner vs Q3 Winner</p>
                      {sf2Match ? (
                        <MatchCard match={sf2Match} />
                      ) : (
                        <div className="bg-zinc-800 rounded-lg p-6 border border-dashed border-zinc-700">
                          <p className="text-zinc-500 text-sm">TBD</p>
                        </div>
                      )}
                      <p className="text-xs text-green-400 mt-2">Winner → Final</p>
                    </div>
                  </div>
                </div>

                {/* Final */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-4 text-center">
                    🏆 Grand Final
                  </h3>
                  <div className="max-w-md mx-auto text-center">
                    <p className="text-xs text-zinc-500 mb-2">SF1 Winner vs SF2 Winner</p>
                    {finalMatch ? (
                      <MatchCard match={finalMatch} />
                    ) : (
                      <div className="bg-zinc-800 rounded-lg p-8 border border-dashed border-yellow-500/30">
                        <Trophy className="w-10 h-10 text-yellow-500/50 mx-auto mb-2" />
                        <p className="text-zinc-500 text-sm">Championship Match</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Playoff Flow Explanation */}
                <div className="mt-8 p-4 bg-zinc-800/50 rounded-lg">
                  <h4 className="text-sm font-semibold text-white mb-3">
                    Extended Playoff Format (8 Teams):
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-xs text-zinc-400">
                    <div>
                      <p className="font-medium text-white mb-1">Round 1:</p>
                      <ul className="space-y-1 ml-2">
                        <li>• <span className="text-yellow-400">Q1:</span> GA1 vs GB2 (Top teams crossed)</li>
                        <li>• <span className="text-yellow-400">Q2:</span> GA2 vs GB1 (2nd place crossed)</li>
                        <li>• <span className="text-red-400">E1:</span> GA3 vs GB4 (Eliminators)</li>
                        <li>• <span className="text-red-400">E2:</span> GA4 vs GB3 (Eliminators)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-white mb-1">Knockout Rounds:</p>
                      <ul className="space-y-1 ml-2">
                        <li>• <span className="text-orange-400">Q3:</span> Q1 Loser vs E1 Winner → SF2</li>
                        <li>• <span className="text-orange-400">Q4:</span> Q2 Loser vs E2 Winner → SF1</li>
                        <li>• <span className="text-cyan-400">SF1:</span> Q1 Winner vs Q4 Winner</li>
                        <li>• <span className="text-cyan-400">SF2:</span> Q2 Winner vs Q3 Winner</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* Simple Knockout Display */
          <div className="space-y-8">
            {knockoutMatches.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {knockoutMatches.map((match) => (
                  <MatchCard key={match._id} match={match} showStage />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-zinc-400">Live Match</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-zinc-400">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-3 h-3 text-yellow-400" />
            <span className="text-zinc-400">Stars (CoC)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
