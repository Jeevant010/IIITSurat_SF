export const dynamic = "force-dynamic";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Trophy, Medal, Crown, Users, Gamepad2 } from "lucide-react";
import Link from "next/link";
import connectDB from "@/lib/mongodb";
import { User, Team } from "@/lib/models";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  await connectDB();

  const params = await searchParams;
  const tab = params.tab || "teams";
  const query = params.q || "";

  // Fetch teams sorted by score
  const teams = await Team.find(
    query && tab === "teams" ? { name: { $regex: query, $options: "i" } } : {},
  )
    .sort({ score: -1, wins: -1 })
    .lean();

  // Fetch players with team info
  const players = await User.find(
    query && tab === "players"
      ? { name: { $regex: query, $options: "i" }, isProfileComplete: true }
      : { isProfileComplete: true },
  )
    .populate("teamId", "name score")
    .sort({ name: 1 })
    .lean();

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-zinc-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return (
      <span className="text-zinc-500 font-mono w-6 text-center">{rank}</span>
    );
  };

  const getRankBg = (rank: number) => {
    if (rank === 1)
      return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/30";
    if (rank === 2)
      return "bg-gradient-to-r from-zinc-400/20 to-zinc-500/10 border-zinc-400/30";
    if (rank === 3)
      return "bg-gradient-to-r from-amber-600/20 to-amber-700/10 border-amber-600/30";
    return "border-zinc-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-white flex items-center justify-center gap-2 md:gap-3 mb-2">
            <Trophy className="w-7 h-7 md:w-10 md:h-10 text-yellow-400" />
            Leaderboard
          </h1>
          <p className="text-sm md:text-base text-zinc-400">Spring Fiesta 2026 Rankings</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-2 mb-6 md:mb-8 px-2">
          <Link href="/leaderboard?tab=teams">
            <Button
              variant={tab === "teams" ? "default" : "outline"}
              size="sm"
              className={`text-xs md:text-sm ${
                tab === "teams"
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "border-zinc-700"
              }`}
            >
              <Users className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Team </span>Rankings
            </Button>
          </Link>
          <Link href="/leaderboard?tab=players">
            <Button
              variant={tab === "players" ? "default" : "outline"}
              size="sm"
              className={`text-xs md:text-sm ${
                tab === "players"
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "border-zinc-700"
              }`}
            >
              <Gamepad2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Player </span>Roster
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="flex justify-center mb-6 md:mb-8 px-2">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
            <form>
              <input type="hidden" name="tab" value={tab} />
              <Input
                name="q"
                placeholder={
                  tab === "teams" ? "Search teams..." : "Search players..."
                }
                className="pl-10 bg-zinc-900 border-zinc-700 text-white h-11"
                defaultValue={query}
              />
            </form>
          </div>
        </div>

        {tab === "teams" ? (
          <>
            {/* Top 3 Teams Showcase */}
            {teams.length >= 3 && !query && (
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {/* 2nd Place */}
                <div className="order-2 md:order-1 md:mt-8">
                  <Card className={`${getRankBg(2)} border`}>
                    <CardContent className="pt-6 text-center">
                      <div className="w-16 h-16 bg-zinc-400/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <Medal className="w-8 h-8 text-zinc-300" />
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        {(teams[1] as { name: string }).name}
                      </h3>
                      <p className="text-zinc-400 text-sm font-mono mb-2">
                        {(teams[1] as { teamCode: string }).teamCode}
                      </p>
                      <p className="text-3xl font-bold text-zinc-300">
                        {(teams[1] as { score: number }).score}
                      </p>
                      <p className="text-zinc-500 text-sm">points</p>
                      <div className="flex justify-center gap-4 mt-3 text-sm">
                        <span className="text-green-400">
                          {(teams[1] as { wins: number }).wins}W
                        </span>
                        <span className="text-red-400">
                          {(teams[1] as { losses: number }).losses}L
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 1st Place */}
                <div className="order-1 md:order-2">
                  <Card className={`${getRankBg(1)} border scale-105`}>
                    <CardContent className="pt-6 text-center">
                      <div className="w-20 h-20 bg-yellow-500/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <Crown className="w-10 h-10 text-yellow-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">
                        {(teams[0] as { name: string }).name}
                      </h3>
                      <p className="text-zinc-400 text-sm font-mono mb-2">
                        {(teams[0] as { teamCode: string }).teamCode}
                      </p>
                      <p className="text-4xl font-bold text-yellow-400">
                        {(teams[0] as { score: number }).score}
                      </p>
                      <p className="text-zinc-500 text-sm">points</p>
                      <div className="flex justify-center gap-4 mt-3 text-sm">
                        <span className="text-green-400">
                          {(teams[0] as { wins: number }).wins}W
                        </span>
                        <span className="text-red-400">
                          {(teams[0] as { losses: number }).losses}L
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 3rd Place */}
                <div className="order-3 md:mt-12">
                  <Card className={`${getRankBg(3)} border`}>
                    <CardContent className="pt-6 text-center">
                      <div className="w-14 h-14 bg-amber-600/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <Medal className="w-7 h-7 text-amber-600" />
                      </div>
                      <h3 className="text-lg font-bold text-white">
                        {(teams[2] as { name: string }).name}
                      </h3>
                      <p className="text-zinc-400 text-sm font-mono mb-2">
                        {(teams[2] as { teamCode: string }).teamCode}
                      </p>
                      <p className="text-2xl font-bold text-amber-500">
                        {(teams[2] as { score: number }).score}
                      </p>
                      <p className="text-zinc-500 text-sm">points</p>
                      <div className="flex justify-center gap-4 mt-3 text-sm">
                        <span className="text-green-400">
                          {(teams[2] as { wins: number }).wins}W
                        </span>
                        <span className="text-red-400">
                          {(teams[2] as { losses: number }).losses}L
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Full Team Rankings Table */}
            <Card className="border-purple-500/20 bg-zinc-950/80">
              <CardHeader className="px-3 md:px-6">
                <CardTitle className="text-white text-lg md:text-xl">Full Rankings</CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-6 overflow-x-auto">
                <Table className="min-w-[500px]">
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="w-12 md:w-16 text-zinc-400 text-xs md:text-sm">Rank</TableHead>
                      <TableHead className="text-zinc-400 text-xs md:text-sm">Team</TableHead>
                      <TableHead className="text-center text-zinc-400 text-xs md:text-sm">
                        W/L
                      </TableHead>
                      <TableHead className="text-center text-zinc-400 text-xs md:text-sm">
                        Win Rate
                      </TableHead>
                      <TableHead className="text-right text-zinc-400 text-xs md:text-sm">
                        Score
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teams.map((team: unknown, index: number) => {
                      const t = team as {
                        _id: { toString: () => string };
                        name: string;
                        teamCode: string;
                        score: number;
                        wins: number;
                        losses: number;
                      };
                      const winRate =
                        t.wins + t.losses > 0
                          ? Math.round((t.wins / (t.wins + t.losses)) * 100)
                          : 0;
                      return (
                        <TableRow
                          key={t._id.toString()}
                          className={`border-zinc-800 ${getRankBg(index + 1)}`}
                        >
                          <TableCell>
                            <div className="flex items-center justify-center">
                              {getRankIcon(index + 1)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/teams/${t._id.toString()}`}
                              className="flex items-center gap-3 hover:text-purple-400 transition-colors"
                            >
                              <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center text-purple-400 font-bold">
                                {t.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-white">
                                  {t.name}
                                </p>
                                <p className="text-zinc-500 text-xs font-mono">
                                  {t.teamCode}
                                </p>
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-green-400">{t.wins}</span>
                            <span className="text-zinc-600 mx-1">/</span>
                            <span className="text-red-400">{t.losses}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={
                                winRate >= 70
                                  ? "border-green-500/50 text-green-400"
                                  : winRate >= 50
                                    ? "border-yellow-500/50 text-yellow-400"
                                    : "border-zinc-600 text-zinc-400"
                              }
                            >
                              {winRate}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-xl font-bold text-purple-400">
                              {t.score}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {teams.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-12 text-zinc-500"
                        >
                          {query
                            ? "No teams found matching your search"
                            : "No teams registered yet"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        ) : (
          /* Players Tab */
          <Card className="border-purple-500/20 bg-zinc-950/80">
            <CardHeader className="px-3 md:px-6">
              <CardTitle className="text-white flex items-center gap-2 text-lg md:text-xl">
                <Gamepad2 className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                Player Roster
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-6 overflow-x-auto">
              <Table className="min-w-[500px]">
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-400 text-xs md:text-sm">Player</TableHead>
                    <TableHead className="text-zinc-400 text-xs md:text-sm">Roll Number</TableHead>
                    <TableHead className="text-zinc-400 text-xs md:text-sm">Team</TableHead>
                    <TableHead className="text-zinc-400 text-xs md:text-sm">Role</TableHead>
                    <TableHead className="text-right text-zinc-400 text-xs md:text-sm">
                      IGN
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.map((player: unknown) => {
                    const p = player as {
                      _id: { toString: () => string };
                      name: string;
                      avatarUrl?: string;
                      rollNumber?: string;
                      ign?: string;
                      teamId?: {
                        _id: { toString: () => string };
                        name: string;
                      } | null;
                      teamRole?: string;
                    };
                    return (
                      <TableRow
                        key={p._id.toString()}
                        className="border-zinc-800 hover:bg-zinc-900/50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9">
                              <AvatarImage src={p.avatarUrl || ""} />
                              <AvatarFallback className="bg-purple-600/50 text-white text-sm">
                                {p.name?.charAt(0)?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-white">
                              {p.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-zinc-500 font-mono text-sm">
                          {p.rollNumber || "N/A"}
                        </TableCell>
                        <TableCell>
                          {p.teamId ? (
                            <Link href={`/teams/${p.teamId._id.toString()}`}>
                              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50 hover:bg-purple-500/30">
                                {p.teamId.name}
                              </Badge>
                            </Link>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-zinc-700 text-zinc-500"
                            >
                              Free Agent
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {p.teamRole === "LEADER" ? (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                              <Crown className="w-3 h-3 mr-1" />
                              Leader
                            </Badge>
                          ) : p.teamRole === "MEMBER" ? (
                            <Badge
                              variant="outline"
                              className="border-zinc-700 text-zinc-400"
                            >
                              Member
                            </Badge>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-right text-purple-400 font-mono text-sm">
                          {p.ign || "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {players.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-12 text-zinc-500"
                      >
                        {query
                          ? "No players found matching your search"
                          : "No players registered yet"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
