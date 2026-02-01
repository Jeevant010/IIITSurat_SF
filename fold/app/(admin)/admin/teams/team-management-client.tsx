"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Crown,
  UserMinus,
  Edit,
  Trash2,
  UserPlus,
  CheckCircle,
  Shield,
} from "lucide-react";
import {
  forceAddUserToTeam,
  forceRemoveUserFromTeam,
  forceChangeTeamLeader,
  forceEditTeam,
  forceDeleteTeam,
  forceApproveJoinRequest,
} from "@/app/actions/admin-actions";

type Team = {
  _id: string;
  name: string;
  teamCode: string;
  description: string;
  leader: { _id: string; name: string; email: string };
  members: Array<{
    _id: string;
    name: string;
    email: string;
    teamRole: string | null;
  }>;
  memberCount: number;
  pendingRequests: number;
};

type FreeAgent = {
  _id: string;
  name: string;
  email: string;
};

type PendingRequest = {
  _id: string;
  userId: { _id: string; name: string; email: string };
  teamId: { _id: string; name: string };
  status: string;
  createdAt: string;
};

export function TeamManagementClient({
  teams,
  freeAgents,
  pendingRequests,
}: {
  teams: Team[];
  freeAgents: FreeAgent[];
  pendingRequests: PendingRequest[];
}) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [editingTeam, setEditingTeam] = useState<{
    name: string;
    description: string;
  } | null>(null);

  const handleAddUser = async (userId: string, teamId: string) => {
    const result = await forceAddUserToTeam(userId, teamId);
    alert(result.message);
    window.location.reload();
  };

  const handleRemoveUser = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this user from their team?"))
      return;
    const result = await forceRemoveUserFromTeam(userId);
    alert(result.message);
    window.location.reload();
  };

  const handleChangeLeader = async (teamId: string, newLeaderId: string) => {
    if (!confirm("Are you sure you want to change the team leader?")) return;
    const result = await forceChangeTeamLeader(teamId, newLeaderId);
    alert(result.message);
    window.location.reload();
  };

  const handleEditTeam = async (teamId: string) => {
    if (!editingTeam) return;
    const result = await forceEditTeam(teamId, editingTeam);
    alert(result.message);
    setEditingTeam(null);
    window.location.reload();
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`DANGER: Delete team "${teamName}" and remove all members?`))
      return;
    const result = await forceDeleteTeam(teamId);
    alert(result.message);
    window.location.reload();
  };

  const handleApproveRequest = async (requestId: string) => {
    const result = await forceApproveJoinRequest(requestId);
    alert(result.message);
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <Card className="bg-zinc-900 border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-500" />
              Pending Join Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingRequests.map((request) => (
                <div
                  key={request._id}
                  className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">
                      {request.userId.name}
                    </p>
                    <p className="text-xs text-zinc-400">
                      wants to join{" "}
                      <span className="text-yellow-500">
                        {request.teamId.name}
                      </span>
                    </p>
                  </div>
                  <Button
                    onClick={() => handleApproveRequest(request._id)}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Force Approve
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teams Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <Card key={team._id} className="bg-zinc-900 border-zinc-800 group">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-lg text-white">
                  {team.name}
                </CardTitle>
                <p className="text-xs text-zinc-500 font-mono mt-1">
                  {team.teamCode}
                </p>
              </div>
              <Badge variant="outline" className="text-zinc-400">
                {team.memberCount}/5
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold mb-2">
                  Leader
                </p>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-zinc-300">
                    {team.leader.name}
                  </span>
                </div>
              </div>

              {team.pendingRequests > 0 && (
                <Badge className="bg-yellow-500/20 text-yellow-500">
                  {team.pendingRequests} pending request
                  {team.pendingRequests > 1 ? "s" : ""}
                </Badge>
              )}

              <div className="flex gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      onClick={() => setSelectedTeam(team)}
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-zinc-800 border-zinc-700 text-zinc-300"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="bg-zinc-950 border-zinc-800 text-white overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle className="text-white">
                        {team.name}
                      </SheetTitle>
                      <SheetDescription>God Mode Controls</SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 space-y-6">
                      {/* Edit Team Info */}
                      <div className="space-y-3">
                        <h3 className="font-bold text-white">
                          Edit Team Details
                        </h3>
                        <div className="space-y-2">
                          <Label>Team Name</Label>
                          <Input
                            defaultValue={team.name}
                            onChange={(e) =>
                              setEditingTeam({
                                ...editingTeam,
                                name: e.target.value,
                              } as any)
                            }
                            className="bg-black border-zinc-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            defaultValue={team.description}
                            onChange={(e) =>
                              setEditingTeam({
                                ...editingTeam,
                                description: e.target.value,
                              } as any)
                            }
                            className="bg-black border-zinc-700"
                          />
                        </div>
                        <Button
                          onClick={() => handleEditTeam(team._id)}
                          className="w-full bg-blue-500 hover:bg-blue-600"
                        >
                          Save Changes
                        </Button>
                      </div>

                      {/* Members List */}
                      <div>
                        <h3 className="font-bold text-white mb-3">
                          Team Members
                        </h3>
                        <div className="space-y-2">
                          {team.members.map((member) => (
                            <div
                              key={member._id}
                              className="flex items-center justify-between p-2 bg-zinc-900 rounded"
                            >
                              <div>
                                <p className="text-sm font-medium">
                                  {member.name}
                                </p>
                                <p className="text-xs text-zinc-500">
                                  {member.email}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                {member.teamRole !== "LEADER" && (
                                  <Button
                                    onClick={() =>
                                      handleChangeLeader(team._id, member._id)
                                    }
                                    size="sm"
                                    variant="ghost"
                                    className="text-yellow-500 hover:bg-yellow-500/10"
                                  >
                                    <Crown className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  onClick={() => handleRemoveUser(member._id)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-500 hover:bg-red-500/10"
                                >
                                  <UserMinus className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Add User from Free Agents */}
                      <div>
                        <h3 className="font-bold text-white mb-3">
                          Add Free Agent
                        </h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {freeAgents.slice(0, 10).map((agent) => (
                            <div
                              key={agent._id}
                              className="flex items-center justify-between p-2 bg-zinc-900 rounded"
                            >
                              <div>
                                <p className="text-sm">{agent.name}</p>
                                <p className="text-xs text-zinc-500">
                                  {agent.email}
                                </p>
                              </div>
                              <Button
                                onClick={() =>
                                  handleAddUser(agent._id, team._id)
                                }
                                size="sm"
                                variant="ghost"
                                className="text-green-500 hover:bg-green-500/10"
                              >
                                <UserPlus className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Danger Zone */}
                      <div className="border-t border-red-500/20 pt-4">
                        <h3 className="font-bold text-red-500 mb-3">
                          Danger Zone
                        </h3>
                        <Button
                          onClick={() => handleDeleteTeam(team._id, team.name)}
                          variant="outline"
                          className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Team
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
