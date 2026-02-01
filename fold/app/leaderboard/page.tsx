export const dynamic = "force-dynamic";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Team from "@/lib/models/Team";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  await connectDB();

  const query = searchParams.q || "";

  // Fetch players (filtering by name if searched)
  const players = await User.find(
    query ? { name: { $regex: query, $options: "i" } } : {},
  )
    .populate("teamId", "name")
    .sort({ name: 1 })
    .lean();

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-white">Global Player Roster</h1>

        {/* Simple Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
          <form>
            <Input
              name="q"
              placeholder="Search player..."
              className="pl-8 bg-zinc-900 border-zinc-700 text-white"
              defaultValue={query}
            />
          </form>
        </div>
      </div>

      <div className="rounded-md border border-zinc-800 bg-zinc-900/50">
        <Table>
          <TableHeader className="bg-zinc-900">
            <TableRow className="border-zinc-800">
              <TableHead className="text-zinc-400">Player Name</TableHead>
              <TableHead className="text-zinc-400">Roll No</TableHead>
              <TableHead className="text-zinc-400">Clan Status</TableHead>
              <TableHead className="text-right text-zinc-400">IGN</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player: any) => (
              <TableRow
                key={player._id.toString()}
                className="border-zinc-800 hover:bg-zinc-900"
              >
                <TableCell className="font-medium text-white">
                  {player.name}
                </TableCell>
                <TableCell className="text-zinc-500 font-mono text-xs">
                  {player.rollNumber || "N/A"}
                </TableCell>
                <TableCell>
                  {player.teamId ? (
                    <Badge
                      variant="outline"
                      className="text-yellow-500 border-yellow-500/20 bg-yellow-500/10"
                    >
                      {player.teamId.name}
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-zinc-800 text-zinc-500"
                    >
                      Free Agent
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right text-zinc-400 font-mono text-xs">
                  {player.ign || "-"}
                </TableCell>
              </TableRow>
            ))}
            {players.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-zinc-500"
                >
                  No players found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
