"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Search,
  Edit,
  Trash2,
  Shield,
  Crown,
  UserMinus,
  Download,
} from "lucide-react";
import {
  importPlayers,
  forceEditPlayer,
  forceDeletePlayer,
  forceAddUserToTeam,
  forceRemoveUserFromTeam,
  forceCreatePlayer,
} from "@/app/actions/admin-actions";
import type { ParseResult } from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Player {
  _id: string;
  email: string;
  name: string;
  rollNumber?: string | null;
  ign?: string | null;
  playerTag?: string | null;
  townHall?: number | null;
  phone?: string | null;
  role?: "USER" | "ADMIN";
  teamRole?: "LEADER" | "MEMBER" | null;
  team?: {
    _id: string;
    name: string;
    teamCode: string;
  } | null;
  createdAt?: string;
}

interface Team {
  _id: string;
  name: string;
  teamCode: string;
}

interface Props {
  initialPlayers: Player[];
  teams: Team[];
  stats: {
    totalPlayers: number;
    playersInTeams: number;
    freeAgents: number;
    teamLeaders: number;
  };
}

export function PlayerManagementClient({
  initialPlayers,
  teams,
  stats,
}: Props) {
  const [players, setPlayers] = useState(initialPlayers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "free" | "inTeam">(
    "all",
  );
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [importing, setImporting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    email: "",
    name: "",
    rollNumber: "",
    ign: "",
    playerTag: "",
    townHall: "",
    phone: "",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    rollNumber: "",
    ign: "",
    playerTag: "",
    townHall: "",
    phone: "",
    role: "USER" as "USER" | "ADMIN",
  });

  // Filter players
  const filteredPlayers = players.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.rollNumber &&
        p.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "free" && !p.team) ||
      (filterStatus === "inTeam" && p.team);

    return matchesSearch && matchesFilter;
  });

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    toast.loading("Importing players...", { id: "import-players" });

    try {
      const Papa = (await import("papaparse")).default;
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results: ParseResult<Record<string, string>>) => {
          const playerData = results.data.map((row) => ({
            email: row.email || row.Email,
            name: row.name || row.Name,
            rollNumber: row.rollNumber || row["Roll Number"] || row.roll,
            ign: row.ign || row.IGN || row["In-Game Name"],
          }));

          const res = await importPlayers(playerData);
          setImporting(false);
          if (res.success) {
            toast.success("Import Successful! 📥", {
              id: "import-players",
              description: res.message,
            });
            window.location.reload();
          } else {
            toast.error("Import Failed", {
              id: "import-players",
              description: res.message,
            });
          }
        },
        error: () => {
          toast.error("Failed to parse CSV file", { id: "import-players" });
          setImporting(false);
        },
      });
    } catch (error) {
      toast.error("Failed to load CSV parser", { id: "import-players" });
      setImporting(false);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm("Are you sure you want to delete this player?")) return;

    toast.loading("Deleting player...", { id: "delete-player" });
    const res = await forceDeletePlayer(playerId);
    if (res.success) {
      toast.success("Player Deleted", {
        id: "delete-player",
        description: res.message,
      });
      setPlayers(players.filter((p) => p._id !== playerId));
    } else {
      toast.error("Failed to delete player", {
        id: "delete-player",
        description: res.message,
      });
    }
  };

  const handleRemoveFromTeam = async (playerId: string) => {
    if (!confirm("Remove this player from their team?")) return;

    toast.loading("Removing from team...", { id: "remove-team" });
    const res = await forceRemoveUserFromTeam(playerId);
    if (res.success) {
      toast.success("Removed from Team", {
        id: "remove-team",
        description: res.message,
      });
      window.location.reload();
    } else {
      toast.error("Failed to remove from team", {
        id: "remove-team",
        description: res.message,
      });
    }
  };

  const handleCreatePlayer = async () => {
    toast.loading("Creating player...", { id: "create-player" });
    const res = await forceCreatePlayer({
      ...createFormData,
      townHall: createFormData.townHall
        ? parseInt(createFormData.townHall)
        : undefined,
    });
    if (res.success) {
      toast.success("Player Created! 👤", {
        id: "create-player",
        description: res.message,
      });
      setShowCreateForm(false);
      setCreateFormData({
        email: "",
        name: "",
        rollNumber: "",
        ign: "",
        playerTag: "",
        townHall: "",
        phone: "",
      });
      window.location.reload();
    } else {
      toast.error("Failed to create player", {
        id: "create-player",
        description: res.message,
      });
    }
  };

  const openEditDialog = (player: Player) => {
    setEditingPlayer(player);
    setEditFormData({
      name: player.name || "",
      email: player.email || "",
      rollNumber: player.rollNumber || "",
      ign: player.ign || "",
      playerTag: player.playerTag || "",
      townHall: player.townHall?.toString() || "",
      phone: player.phone || "",
      role: player.role || "USER",
    });
  };

  const handleEditPlayer = async () => {
    if (!editingPlayer) return;
    toast.loading("Updating player...", { id: "edit-player" });
    const res = await forceEditPlayer(editingPlayer._id, {
      ...editFormData,
      townHall: editFormData.townHall ? parseInt(editFormData.townHall) : null,
    });
    if (res.success) {
      toast.success("Player Updated! ✅", {
        id: "edit-player",
        description: res.message,
      });
      setEditingPlayer(null);
      window.location.reload();
    } else {
      toast.error("Failed to update player", {
        id: "edit-player",
        description: res.message,
      });
    }
  };

  const exportToCSV = async () => {
    toast.info("Preparing export...", { id: "export" });
    const Papa = (await import("papaparse")).default;
    const csv = Papa.unparse(
      players.map((p) => ({
        name: p.name,
        email: p.email,
        rollNumber: p.rollNumber || "",
        ign: p.ign || "",
        team: p.team?.name || "Free Agent",
        teamCode: p.team?.teamCode || "",
        role: p.teamRole || "None",
      })),
    );

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sf2026-players-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Export Complete! 📁", {
      id: "export",
      description: "Player data downloaded to CSV.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400">
              Total Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.totalPlayers}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400">In Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {stats.playersInTeams}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400">Free Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {stats.freeAgents}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400">
              Team Leaders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {stats.teamLeaders}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Player
              </Button>
              <Button variant="outline" className="relative">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Import CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImport}
                  disabled={importing}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  aria-label="Import CSV file"
                  title="Select CSV file to import"
                />
              </Button>
              <Button
                onClick={exportToCSV}
                variant="outline"
                className="border-zinc-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterStatus === "free" ? "default" : "outline"}
                onClick={() => setFilterStatus("free")}
                size="sm"
              >
                Free Agents
              </Button>
              <Button
                variant={filterStatus === "inTeam" ? "default" : "outline"}
                onClick={() => setFilterStatus("inTeam")}
                size="sm"
              >
                In Teams
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search players by name, email, or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black border-zinc-700 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Create New Player</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-zinc-300">Name *</Label>
                <Input
                  value={createFormData.name}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      name: e.target.value,
                    })
                  }
                  className="bg-black border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Email *</Label>
                <Input
                  type="email"
                  value={createFormData.email}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      email: e.target.value,
                    })
                  }
                  className="bg-black border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Roll Number</Label>
                <Input
                  value={createFormData.rollNumber}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      rollNumber: e.target.value,
                    })
                  }
                  className="bg-black border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label className="text-zinc-300">In-Game Name (IGN)</Label>
                <Input
                  value={createFormData.ign}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      ign: e.target.value,
                    })
                  }
                  className="bg-black border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Town Hall Level</Label>
                <select
                  value={createFormData.townHall}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      townHall: e.target.value,
                    })
                  }
                  className="w-full h-10 px-3 bg-black border border-zinc-700 text-white rounded-md"
                >
                  <option value="">Select TH</option>
                  {[...Array(18)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      TH {i + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-zinc-300">Player Tag</Label>
                <Input
                  placeholder="#ABC123XYZ"
                  value={createFormData.playerTag}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      playerTag: e.target.value,
                    })
                  }
                  className="bg-black border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Phone</Label>
                <Input
                  value={createFormData.phone}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      phone: e.target.value,
                    })
                  }
                  className="bg-black border-zinc-700 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreatePlayer}
                className="bg-green-600 hover:bg-green-700"
              >
                Create Player
              </Button>
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="outline"
                className="border-zinc-700"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Players Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            All Players ({filteredPlayers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-400">Name</TableHead>
                  <TableHead className="text-zinc-400">Email</TableHead>
                  <TableHead className="text-zinc-400">Roll No</TableHead>
                  <TableHead className="text-zinc-400">IGN</TableHead>
                  <TableHead className="text-zinc-400">TH</TableHead>
                  <TableHead className="text-zinc-400">Team</TableHead>
                  <TableHead className="text-zinc-400">Role</TableHead>
                  <TableHead className="text-zinc-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.map((player) => (
                  <TableRow key={player._id} className="border-zinc-800">
                    <TableCell className="text-white font-medium">
                      {player.name}
                    </TableCell>
                    <TableCell className="text-zinc-400">
                      {player.email}
                    </TableCell>
                    <TableCell className="text-zinc-400">
                      {player.rollNumber || "-"}
                    </TableCell>
                    <TableCell className="text-zinc-400">
                      {player.ign || "-"}
                    </TableCell>
                    <TableCell className="text-yellow-500 font-medium">
                      {player.townHall ? `TH${player.townHall}` : "-"}
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
                        <Badge variant="outline" className="border-yellow-600">
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
                        <Badge variant="secondary">Member</Badge>
                      )}
                      {!player.teamRole && (
                        <span className="text-zinc-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(player)}
                          className="border-zinc-700"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        {player.team && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveFromTeam(player._id)}
                            className="border-zinc-700"
                          >
                            <UserMinus className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeletePlayer(player._id)}
                          className="border-red-900 text-red-500 hover:bg-red-950"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Player Dialog */}
      <Dialog
        open={!!editingPlayer}
        onOpenChange={() => setEditingPlayer(null)}
      >
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Player</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Update player details. All fields are editable.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid gap-4 grid-cols-2">
              <div>
                <Label className="text-zinc-300">Name</Label>
                <Input
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="bg-black border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Email</Label>
                <Input
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  className="bg-black border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label className="text-zinc-300">In-Game Name</Label>
                <Input
                  value={editFormData.ign}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, ign: e.target.value })
                  }
                  className="bg-black border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Town Hall</Label>
                <select
                  value={editFormData.townHall}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      townHall: e.target.value,
                    })
                  }
                  className="w-full h-10 px-3 bg-black border border-zinc-700 text-white rounded-md"
                >
                  <option value="">None</option>
                  {[...Array(18)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      TH {i + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-zinc-300">Player Tag</Label>
                <Input
                  placeholder="#ABC123XYZ"
                  value={editFormData.playerTag}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      playerTag: e.target.value,
                    })
                  }
                  className="bg-black border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Roll Number</Label>
                <Input
                  value={editFormData.rollNumber}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      rollNumber: e.target.value,
                    })
                  }
                  className="bg-black border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Phone</Label>
                <Input
                  value={editFormData.phone}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                  className="bg-black border-zinc-700 text-white"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-zinc-300">User Role</Label>
                <select
                  value={editFormData.role}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      role: e.target.value as "USER" | "ADMIN",
                    })
                  }
                  className="w-full h-10 px-3 bg-black border border-zinc-700 text-white rounded-md"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleEditPlayer}
                className="bg-green-600 hover:bg-green-700"
              >
                Save Changes
              </Button>
              <Button
                onClick={() => setEditingPlayer(null)}
                variant="outline"
                className="border-zinc-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
