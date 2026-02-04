"use client";

import { useState } from "react";
import {
  Trophy,
  Crown,
  Clock,
  CheckCircle,
  Circle,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Team {
  _id: string;
  name: string;
  score: number;
  wins: number;
  losses: number;
}

interface Match {
  _id: string;
  tournamentName: string;
  round: number;
  matchNumber: number;
  team1Id: { _id: string; name: string } | null;
  team2Id: { _id: string; name: string } | null;
  team1Score: number;
  team2Score: number;
  winnerId: { _id: string; name: string } | null;
  status: "TBD" | "SCHEDULED" | "LIVE" | "COMPLETED";
  scheduledAt: string | null;
  completedAt: string | null;
  notes: string;
}

interface MatchResultsClientProps {
  matches: Match[];
  teams: Team[];
}

export default function MatchResultsClient({
  matches,
  teams,
}: MatchResultsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const completedMatches = matches.filter((m) => m.status === "COMPLETED");
  const liveMatches = matches.filter((m) => m.status === "LIVE");
  const upcomingMatches = matches.filter(
    (m) => m.status === "SCHEDULED" || m.status === "TBD",
  );

  const filteredMatches = matches.filter((match) => {
    const matchesSearch =
      searchQuery === "" ||
      match.team1Id?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.team2Id?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.tournamentName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || match.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            Completed
          </Badge>
        );
      case "LIVE":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
            🔴 Live
          </Badge>
        );
      case "SCHEDULED":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            Scheduled
          </Badge>
        );
      case "TBD":
        return (
          <Badge className="bg-zinc-500/20 text-zinc-400 border-zinc-500/30">
            TBD
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRoundName = (round: number, totalRounds: number) => {
    if (round === totalRounds) return "Finals";
    if (round === totalRounds - 1) return "Semi-Finals";
    if (round === totalRounds - 2) return "Quarter-Finals";
    return `Round ${round}`;
  };

  const maxRound = Math.max(...matches.map((m) => m.round), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Match Results
        </h1>
        <p className="text-zinc-400 mt-1">
          View all tournament match results and standings
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {completedMatches.length}
              </p>
              <p className="text-sm text-zinc-400">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Circle className="w-5 h-5 text-red-500 animate-pulse" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {liveMatches.length}
              </p>
              <p className="text-sm text-zinc-400">Live Now</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {upcomingMatches.length}
              </p>
              <p className="text-sm text-zinc-400">Upcoming</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{matches.length}</p>
              <p className="text-sm text-zinc-400">Total Matches</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Search by team or tournament..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800 text-white"
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "LIVE", "COMPLETED", "SCHEDULED", "TBD"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={
                statusFilter === status
                  ? "bg-yellow-500 text-black hover:bg-yellow-600"
                  : "border-zinc-700 text-zinc-400 hover:text-white"
              }
            >
              {status === "ALL"
                ? "All"
                : status.charAt(0) + status.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Live Matches Section */}
      {liveMatches.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            Live Matches
          </h2>
          <div className="grid gap-4">
            {liveMatches.map((match) => (
              <div
                key={match._id}
                className="bg-zinc-900/80 border border-red-500/30 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-400 text-sm">
                      {getRoundName(match.round, maxRound)} • Match{" "}
                      {match.matchNumber}
                    </span>
                  </div>
                  {getStatusBadge(match.status)}
                </div>
                <div className="mt-3 flex items-center justify-center gap-6">
                  <div className="text-right flex-1">
                    <p className="text-lg font-bold text-white">
                      {match.team1Id?.name || "TBD"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-yellow-500">
                      {match.team1Score}
                    </span>
                    <span className="text-zinc-600">-</span>
                    <span className="text-3xl font-bold text-yellow-500">
                      {match.team2Score}
                    </span>
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-lg font-bold text-white">
                      {match.team2Id?.name || "TBD"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Match Results Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400">Round</TableHead>
              <TableHead className="text-zinc-400">Match</TableHead>
              <TableHead className="text-zinc-400">Team 1</TableHead>
              <TableHead className="text-zinc-400 text-center">Score</TableHead>
              <TableHead className="text-zinc-400">Team 2</TableHead>
              <TableHead className="text-zinc-400">Winner</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMatches.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-zinc-400"
                >
                  No matches found
                </TableCell>
              </TableRow>
            ) : (
              filteredMatches.map((match) => (
                <TableRow
                  key={match._id}
                  className="border-zinc-800 hover:bg-zinc-800/50"
                >
                  <TableCell className="text-white">
                    {getRoundName(match.round, maxRound)}
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    #{match.matchNumber}
                  </TableCell>
                  <TableCell
                    className={
                      match.winnerId?._id === match.team1Id?._id
                        ? "text-yellow-500 font-bold"
                        : "text-white"
                    }
                  >
                    {match.team1Id?.name || "TBD"}
                    {match.winnerId?._id === match.team1Id?._id && (
                      <Crown className="w-4 h-4 inline ml-2 text-yellow-500" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {match.status === "COMPLETED" || match.status === "LIVE" ? (
                      <span className="text-white font-mono">
                        {match.team1Score} - {match.team2Score}
                      </span>
                    ) : (
                      <span className="text-zinc-500">- vs -</span>
                    )}
                  </TableCell>
                  <TableCell
                    className={
                      match.winnerId?._id === match.team2Id?._id
                        ? "text-yellow-500 font-bold"
                        : "text-white"
                    }
                  >
                    {match.team2Id?.name || "TBD"}
                    {match.winnerId?._id === match.team2Id?._id && (
                      <Crown className="w-4 h-4 inline ml-2 text-yellow-500" />
                    )}
                  </TableCell>
                  <TableCell>
                    {match.winnerId ? (
                      <span className="text-yellow-500 font-semibold flex items-center gap-1">
                        <Crown className="w-4 h-4" />
                        {match.winnerId.name}
                      </span>
                    ) : (
                      <span className="text-zinc-500">—</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(match.status)}</TableCell>
                  <TableCell className="text-zinc-400">
                    {match.completedAt
                      ? new Date(match.completedAt).toLocaleDateString()
                      : match.scheduledAt
                        ? new Date(match.scheduledAt).toLocaleDateString()
                        : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Team Standings */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Team Standings
        </h2>
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 w-16">#</TableHead>
              <TableHead className="text-zinc-400">Team</TableHead>
              <TableHead className="text-zinc-400 text-center">Wins</TableHead>
              <TableHead className="text-zinc-400 text-center">
                Losses
              </TableHead>
              <TableHead className="text-zinc-400 text-center">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.slice(0, 10).map((team, index) => (
              <TableRow
                key={team._id}
                className="border-zinc-800 hover:bg-zinc-800/50"
              >
                <TableCell className="font-mono">
                  {index === 0 ? (
                    <span className="text-yellow-500 font-bold">🥇</span>
                  ) : index === 1 ? (
                    <span className="text-zinc-300">🥈</span>
                  ) : index === 2 ? (
                    <span className="text-amber-600">🥉</span>
                  ) : (
                    <span className="text-zinc-500">{index + 1}</span>
                  )}
                </TableCell>
                <TableCell className="text-white font-semibold">
                  {team.name}
                </TableCell>
                <TableCell className="text-center text-green-400 font-semibold">
                  {team.wins}
                </TableCell>
                <TableCell className="text-center text-red-400 font-semibold">
                  {team.losses}
                </TableCell>
                <TableCell className="text-center text-yellow-500 font-bold">
                  {team.score}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
