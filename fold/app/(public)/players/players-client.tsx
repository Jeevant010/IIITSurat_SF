"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Users, Crown, Star } from "lucide-react";
import { motion } from "framer-motion";

interface Player {
  _id: string;
  name: string;
  ign?: string | null;
  teamRole?: "LEADER" | "MEMBER" | null;
  team?: {
    _id: string;
    name: string;
    teamCode: string;
  } | null;
}

interface Props {
  players: Player[];
  stats: {
    totalPlayers: number;
    playersInTeams: number;
    freeAgents: number;
  };
}

export function PublicPlayersClient({ players, stats }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "free" | "inTeam">(
    "all",
  );

  const filteredPlayers = players.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.ign && p.ign.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.team && p.team.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "free" && !p.team) ||
      (filterStatus === "inTeam" && p.team);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-zinc-900/50 border-purple-500/20 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">
                {stats.totalPlayers}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-zinc-900/50 border-green-500/20 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
                <Star className="w-4 h-4" />
                In Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">
                {stats.playersInTeams}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-zinc-900/50 border-yellow-500/20 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Free Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">
                {stats.freeAgents}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
        <CardContent className="pt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <Input
              placeholder="Search by player name, IGN, or team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/50 border-zinc-700 text-white text-lg py-6"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-md transition-colors ${
                filterStatus === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              All Players
            </button>
            <button
              onClick={() => setFilterStatus("inTeam")}
              className={`px-4 py-2 rounded-md transition-colors ${
                filterStatus === "inTeam"
                  ? "bg-green-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              In Teams
            </button>
            <button
              onClick={() => setFilterStatus("free")}
              className={`px-4 py-2 rounded-md transition-colors ${
                filterStatus === "free"
                  ? "bg-yellow-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              Free Agents
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Players List */}
      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white text-2xl">
            Players ({filteredPlayers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-400">Player Name</TableHead>
                  <TableHead className="text-zinc-400">IGN</TableHead>
                  <TableHead className="text-zinc-400">Team</TableHead>
                  <TableHead className="text-zinc-400">Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.map((player, index) => (
                  <motion.tr
                    key={player._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                  >
                    <TableCell className="text-white font-medium">
                      {player.name}
                    </TableCell>
                    <TableCell className="text-zinc-400">
                      {player.ign || <span className="text-zinc-600">N/A</span>}
                    </TableCell>
                    <TableCell>
                      {player.team ? (
                        <div>
                          <div className="text-white font-medium">
                            {player.team.name}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {player.team.teamCode}
                          </div>
                        </div>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-yellow-600 text-yellow-500"
                        >
                          Free Agent
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {player.teamRole === "LEADER" && (
                        <Badge className="bg-purple-600">
                          <Crown className="w-3 h-3 mr-1" />
                          Leader
                        </Badge>
                      )}
                      {player.teamRole === "MEMBER" && (
                        <Badge className="bg-blue-600">Member</Badge>
                      )}
                      {!player.teamRole && (
                        <span className="text-zinc-600">-</span>
                      )}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
