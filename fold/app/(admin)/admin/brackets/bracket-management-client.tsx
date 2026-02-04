"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  Trophy,
  Swords,
  Play,
  CheckCircle,
} from "lucide-react";
import {
  createMatch,
  updateMatch,
  deleteMatch,
  generateBracket,
} from "@/app/actions/bracket-actions";

type TeamInfo = {
  _id: string;
  name: string;
  teamCode: string;
};

type MatchStage =
  | "GROUP_A"
  | "GROUP_B"
  | "QUALIFIER_1"
  | "ELIMINATOR"
  | "QUALIFIER_2"
  | "FINAL"
  | "KNOCKOUT";

type MatchInfo = {
  _id: string;
  tournamentName: string;
  stage: MatchStage;
  round: number;
  matchNumber: number;
  team1: TeamInfo | null;
  team2: TeamInfo | null;
  team1Score: number;
  team2Score: number;
  team1Stars: number;
  team2Stars: number;
  winnerId: string | null;
  status: "TBD" | "SCHEDULED" | "LIVE" | "COMPLETED";
  scheduledAt: string | null;
  notes: string;
};

export function BracketManagementClient({
  matches,
  teams,
}: {
  matches: MatchInfo[];
  teams: TeamInfo[];
}) {
  const [editingMatch, setEditingMatch] = useState<MatchInfo | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  const handleCreateMatch = async (formData: FormData) => {
    toast.loading("Creating match...", { id: "create-match" });
    const result = await createMatch(formData);
    if (result.success) {
      toast.success("Match Created! ⚔️", {
        id: "create-match",
        description: "The match has been added to the bracket.",
      });
      setIsCreateOpen(false);
      window.location.reload();
    } else {
      toast.error("Failed to create match", {
        id: "create-match",
        description: result.message,
      });
    }
  };

  const handleUpdateMatch = async (formData: FormData) => {
    if (!editingMatch) return;
    toast.loading("Updating match...", { id: "update-match" });
    const result = await updateMatch(editingMatch._id, formData);
    if (result.success) {
      toast.success("Match Updated! ✅", {
        id: "update-match",
        description: "Match details have been saved.",
      });
      setEditingMatch(null);
      window.location.reload();
    } else {
      toast.error("Failed to update match", {
        id: "update-match",
        description: result.message,
      });
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm("Are you sure you want to delete this match?")) return;
    toast.loading("Deleting match...", { id: "delete-match" });
    const result = await deleteMatch(matchId);
    if (result.success) {
      toast.success("Match Deleted", {
        id: "delete-match",
        description: "The match has been removed from the bracket.",
      });
      window.location.reload();
    } else {
      toast.error("Failed to delete match", {
        id: "delete-match",
        description: result.message,
      });
    }
  };

  const handleGenerateBracket = async (formData: FormData) => {
    toast.loading("Generating bracket...", { id: "generate-bracket" });
    const result = await generateBracket(formData);
    if (result.success) {
      toast.success("Bracket Generated! 🏆", {
        id: "generate-bracket",
        description: result.message,
      });
      setIsGenerateOpen(false);
      window.location.reload();
    } else {
      toast.error("Failed to generate bracket", {
        id: "generate-bracket",
        description: result.message,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "TBD":
        return (
          <Badge variant="outline" className="border-zinc-600">
            TBD
          </Badge>
        );
      case "SCHEDULED":
        return (
          <Badge className="bg-blue-500/20 text-blue-400">Scheduled</Badge>
        );
      case "LIVE":
        return (
          <Badge className="bg-red-500 text-white animate-pulse">🔴 LIVE</Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-green-500/20 text-green-400">Completed</Badge>
        );
      default:
        return null;
    }
  };

  const getStageName = (stage: MatchStage): string => {
    const stageNames: Record<MatchStage, string> = {
      GROUP_A: "🏟️ Group A",
      GROUP_B: "🏟️ Group B",
      QUALIFIER_1: "⚡ Qualifier 1",
      ELIMINATOR: "💥 Eliminator",
      QUALIFIER_2: "⚡ Qualifier 2",
      FINAL: "🏆 Grand Final",
      KNOCKOUT: "⚔️ Knockout",
    };
    return stageNames[stage] || stage;
  };

  const getStageColor = (stage: MatchStage): string => {
    const colors: Record<MatchStage, string> = {
      GROUP_A: "text-blue-400",
      GROUP_B: "text-purple-400",
      QUALIFIER_1: "text-yellow-400",
      ELIMINATOR: "text-red-400",
      QUALIFIER_2: "text-orange-400",
      FINAL: "text-yellow-500",
      KNOCKOUT: "text-zinc-400",
    };
    return colors[stage] || "text-zinc-400";
  };

  // Group matches by stage for display
  const stages = [...new Set(matches.map((m) => m.stage))] as MatchStage[];
  // Sort stages in logical order
  const stageOrder: MatchStage[] = [
    "GROUP_A",
    "GROUP_B",
    "QUALIFIER_1",
    "ELIMINATOR",
    "QUALIFIER_2",
    "FINAL",
    "KNOCKOUT",
  ];
  stages.sort((a, b) => stageOrder.indexOf(a) - stageOrder.indexOf(b));

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-4">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" /> Add Match
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-700">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Match</DialogTitle>
              <DialogDescription>
                Add a match to the tournament bracket
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreateMatch} className="space-y-4">
              <div>
                <Label className="text-zinc-300">Stage</Label>
                <Select name="stage" defaultValue="KNOCKOUT">
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="GROUP_A">Group A</SelectItem>
                    <SelectItem value="GROUP_B">Group B</SelectItem>
                    <SelectItem value="QUALIFIER_1">Qualifier 1</SelectItem>
                    <SelectItem value="ELIMINATOR">Eliminator</SelectItem>
                    <SelectItem value="QUALIFIER_2">Qualifier 2</SelectItem>
                    <SelectItem value="FINAL">Final</SelectItem>
                    <SelectItem value="KNOCKOUT">Knockout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Round</Label>
                  <Input
                    name="round"
                    type="number"
                    min="1"
                    defaultValue="1"
                    className="bg-zinc-800 border-zinc-700 text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Match #</Label>
                  <Input
                    name="matchNumber"
                    type="number"
                    min="1"
                    defaultValue="1"
                    className="bg-zinc-800 border-zinc-700 text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <Label className="text-zinc-300">
                  Team 1 (or leave empty for TBD)
                </Label>
                <Select name="team1Id">
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Select team or TBD" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="tbd">TBD</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team._id} value={team._id}>
                        {team.name} ({team.teamCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-zinc-300">
                  Team 2 (or leave empty for TBD)
                </Label>
                <Select name="team2Id">
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Select team or TBD" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="tbd">TBD</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team._id} value={team._id}>
                        {team.name} ({team.teamCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-zinc-300">Scheduled Date/Time</Label>
                <Input
                  name="scheduledAt"
                  type="datetime-local"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Create Match
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-zinc-700">
              <Trophy className="w-4 h-4 mr-2" /> Auto-Generate Bracket
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">
                Generate Tournament Bracket
              </DialogTitle>
              <DialogDescription>
                Choose a format and number of teams
              </DialogDescription>
            </DialogHeader>
            <form action={handleGenerateBracket} className="space-y-4">
              <div>
                <Label className="text-zinc-300">Tournament Format</Label>
                <Select name="format" defaultValue="ipl">
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="ipl">
                      🏏 IPL Format (Groups + Playoffs)
                    </SelectItem>
                    <SelectItem value="knockout">
                      ⚔️ Single Elimination (Knockout)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-zinc-500 mt-1">
                  IPL: Groups → Qualifier 1 → Eliminator → Qualifier 2 → Final
                </p>
              </div>
              <div>
                <Label className="text-zinc-300">Number of Teams</Label>
                <Select name="teamCount" defaultValue="8">
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="6">6 Teams (3+3 groups)</SelectItem>
                    <SelectItem value="7">7 Teams (4+3 groups)</SelectItem>
                    <SelectItem value="8">8 Teams (4+4 groups)</SelectItem>
                    <SelectItem value="4">4 Teams (2+2 groups)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 space-y-2">
                <p className="text-yellow-300 text-sm font-medium">
                  🏆 IPL Format Explained:
                </p>
                <ul className="text-yellow-300/80 text-xs space-y-1 ml-2">
                  <li>• Teams split into Group A & Group B</li>
                  <li>
                    • Group winners play <strong>Qualifier 1</strong> (Q1 winner
                    → Final)
                  </li>
                  <li>
                    • 2nd place teams play <strong>Eliminator</strong>
                  </li>
                  <li>
                    • Q1 loser vs Eliminator winner ={" "}
                    <strong>Qualifier 2</strong>
                  </li>
                  <li>
                    • Q2 winner meets Q1 winner in <strong>Final</strong>
                  </li>
                </ul>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                <p className="text-red-300 text-sm">
                  ⚠️ This will DELETE all existing matches!
                </p>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold"
              >
                Generate Bracket
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400">
              Total Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {matches.length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {matches.filter((m) => m.status === "COMPLETED").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400">Live Now</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {matches.filter((m) => m.status === "LIVE").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-400">TBD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-400">
              {matches.filter((m) => m.status === "TBD").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matches by Stage */}
      {stages.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-12 text-center">
            <Trophy className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Matches Yet
            </h3>
            <p className="text-zinc-400">
              Create matches manually or use Auto-Generate to create a bracket.
            </p>
          </CardContent>
        </Card>
      ) : (
        stages.map((stage) => (
          <Card key={stage} className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-2 ${getStageColor(stage)}`}
              >
                <Swords className="w-5 h-5" />
                {getStageName(stage)}
                <Badge variant="outline" className="ml-2 text-xs">
                  {matches.filter((m) => m.stage === stage).length} matches
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800">
                    <TableHead className="text-zinc-400">Match #</TableHead>
                    <TableHead className="text-zinc-400">Team 1</TableHead>
                    <TableHead className="text-zinc-400">Score/Stars</TableHead>
                    <TableHead className="text-zinc-400">Team 2</TableHead>
                    <TableHead className="text-zinc-400">Status</TableHead>
                    <TableHead className="text-zinc-400 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches
                    .filter((m) => m.stage === stage)
                    .map((match) => (
                      <TableRow key={match._id} className="border-zinc-800">
                        <TableCell className="text-white font-mono">
                          #{match.matchNumber}
                          {match.notes && (
                            <span className="text-zinc-500 text-xs ml-2">
                              {match.notes}
                            </span>
                          )}
                        </TableCell>
                        <TableCell
                          className={
                            match.winnerId === match.team1?._id
                              ? "text-green-400 font-bold"
                              : "text-white"
                          }
                        >
                          {match.team1?.name || (
                            <span className="text-zinc-500 italic">TBD</span>
                          )}
                        </TableCell>
                        <TableCell className="text-white font-mono">
                          {match.team1 && match.team2 ? (
                            <div className="flex flex-col">
                              <span>
                                {match.team1Score} - {match.team2Score}
                              </span>
                              {(match.team1Stars > 0 ||
                                match.team2Stars > 0) && (
                                <span className="text-yellow-500 text-xs">
                                  ⭐ {match.team1Stars} - {match.team2Stars} ⭐
                                </span>
                              )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell
                          className={
                            match.winnerId === match.team2?._id
                              ? "text-green-400 font-bold"
                              : "text-white"
                          }
                        >
                          {match.team2?.name || (
                            <span className="text-zinc-500 italic">TBD</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(match.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-400 hover:text-blue-300"
                              onClick={() => setEditingMatch(match)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300"
                              onClick={() => handleDeleteMatch(match._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}

      {/* Edit Match Dialog */}
      <Dialog open={!!editingMatch} onOpenChange={() => setEditingMatch(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Match</DialogTitle>
            <DialogDescription>
              Update match details, scores, and status
            </DialogDescription>
          </DialogHeader>
          {editingMatch && (
            <form action={handleUpdateMatch} className="space-y-4">
              <div>
                <Label className="text-zinc-300">Stage</Label>
                <Select name="stage" defaultValue={editingMatch.stage}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="GROUP_A">Group A</SelectItem>
                    <SelectItem value="GROUP_B">Group B</SelectItem>
                    <SelectItem value="QUALIFIER_1">Qualifier 1</SelectItem>
                    <SelectItem value="ELIMINATOR">Eliminator</SelectItem>
                    <SelectItem value="QUALIFIER_2">Qualifier 2</SelectItem>
                    <SelectItem value="FINAL">Final</SelectItem>
                    <SelectItem value="KNOCKOUT">Knockout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Round</Label>
                  <Input
                    name="round"
                    type="number"
                    defaultValue={editingMatch.round}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Match #</Label>
                  <Input
                    name="matchNumber"
                    type="number"
                    defaultValue={editingMatch.matchNumber}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
              <div>
                <Label className="text-zinc-300">Team 1</Label>
                <Select
                  name="team1Id"
                  defaultValue={editingMatch.team1?._id || "tbd"}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="tbd">TBD</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team._id} value={team._id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-zinc-300">Team 2</Label>
                <Select
                  name="team2Id"
                  defaultValue={editingMatch.team2?._id || "tbd"}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="tbd">TBD</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team._id} value={team._id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Team 1 Score</Label>
                  <Input
                    name="team1Score"
                    type="number"
                    min="0"
                    defaultValue={editingMatch.team1Score}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Team 2 Score</Label>
                  <Input
                    name="team2Score"
                    type="number"
                    min="0"
                    defaultValue={editingMatch.team2Score}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Team 1 Stars ⭐</Label>
                  <Input
                    name="team1Stars"
                    type="number"
                    min="0"
                    max="90"
                    defaultValue={editingMatch.team1Stars}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Team 2 Stars ⭐</Label>
                  <Input
                    name="team2Stars"
                    type="number"
                    min="0"
                    max="90"
                    defaultValue={editingMatch.team2Stars}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
              <div>
                <Label className="text-zinc-300">Status</Label>
                <Select name="status" defaultValue={editingMatch.status}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="TBD">TBD</SelectItem>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="LIVE">🔴 Live</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-zinc-300">Winner (if completed)</Label>
                <Select
                  name="winnerId"
                  defaultValue={editingMatch.winnerId || "none"}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="none">No winner yet</SelectItem>
                    {editingMatch.team1 && (
                      <SelectItem value={editingMatch.team1._id}>
                        {editingMatch.team1.name} (Team 1)
                      </SelectItem>
                    )}
                    {editingMatch.team2 && (
                      <SelectItem value={editingMatch.team2._id}>
                        {editingMatch.team2.name} (Team 2)
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-zinc-300">Scheduled Date/Time</Label>
                <Input
                  name="scheduledAt"
                  type="datetime-local"
                  defaultValue={
                    editingMatch.scheduledAt
                      ? new Date(editingMatch.scheduledAt)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingMatch(null)}
                  className="border-zinc-700"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
