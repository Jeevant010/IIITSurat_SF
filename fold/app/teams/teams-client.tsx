"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  Plus,
  Crown,
  CheckCircle,
  Clock,
  XCircle,
  Send,
  Megaphone,
  Castle,
} from "lucide-react";
import { requestToJoinTeam } from "@/app/actions/join-actions";

interface Team {
  id: string;
  name: string;
  teamCode: string;
  description: string;
  memberCount: number;
  maxMembers: number;
  leader: { name: string };
  members: Array<{
    name: string;
    email: string;
    ign?: string;
    townHall?: number;
  }>;
  hasUserRequested: boolean;
}

interface Announcement {
  _id: string;
  title: string;
  content: string;
  type: "INFO" | "WARNING" | "SUCCESS" | "URGENT";
  isPinned: boolean;
}

interface Props {
  teams: Team[];
  announcements: Announcement[];
  currentUserId: string | null;
  userTeamId: string | null;
}

export function TeamsClient({
  teams,
  announcements,
  currentUserId,
  userTeamId,
}: Props) {
  const [teamRequests, setTeamRequests] = useState<
    Record<string, "idle" | "loading" | "sent" | "error">
  >({});
  const [requestMessages, setRequestMessages] = useState<
    Record<string, string>
  >({});
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");

  const handleJoinRequest = async (teamId: string, message?: string) => {
    if (!currentUserId) {
      toast.error("Login Required", {
        description: "Please login to join a team",
      });
      return;
    }

    if (userTeamId) {
      toast.warning("Already in a Team", {
        description: "You need to leave your current team first!",
      });
      return;
    }

    setTeamRequests((prev) => ({ ...prev, [teamId]: "loading" }));
    toast.loading("Sending request...", { id: `join-${teamId}` });

    const result = await requestToJoinTeam(teamId, message);

    if (result.success) {
      setTeamRequests((prev) => ({ ...prev, [teamId]: "sent" }));
      setRequestMessages((prev) => ({ ...prev, [teamId]: result.message }));
      setJoinDialogOpen(false);
      setJoinMessage("");
      toast.success("Request Sent! 🎉", {
        id: `join-${teamId}`,
        description: "The team leader will review your request soon.",
      });
    } else {
      setTeamRequests((prev) => ({ ...prev, [teamId]: "error" }));
      setRequestMessages((prev) => ({ ...prev, [teamId]: result.message }));
      toast.error("Request Failed", {
        id: `join-${teamId}`,
        description: result.message,
      });
    }
  };

  const openJoinDialog = (team: Team) => {
    setSelectedTeam(team);
    setJoinDialogOpen(true);
  };

  const getButtonState = (team: Team) => {
    const requestState = teamRequests[team.id];

    if (team.hasUserRequested || requestState === "sent") {
      return {
        text: "Request Sent ✓",
        disabled: true,
        variant: "secondary" as const,
      };
    }
    if (requestState === "loading") {
      return {
        text: "Sending...",
        disabled: true,
        variant: "default" as const,
      };
    }
    if (team.memberCount >= team.maxMembers) {
      return {
        text: "Team Full",
        disabled: true,
        variant: "secondary" as const,
      };
    }
    if (userTeamId) {
      return {
        text: "Already in Team",
        disabled: true,
        variant: "secondary" as const,
      };
    }
    if (!currentUserId) {
      return {
        text: "Login to Join",
        disabled: true,
        variant: "secondary" as const,
      };
    }
    return {
      text: "Request to Join",
      disabled: false,
      variant: "default" as const,
    };
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Teams Grid */}
      <div className="flex-1 order-2 lg:order-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {teams.map((team) => {
            const buttonState = getButtonState(team);
            const errorMessage =
              teamRequests[team.id] === "error"
                ? requestMessages[team.id]
                : null;

            return (
              <Card
                key={team.id}
                className="bg-zinc-900/50 border-yellow-500/20 hover:border-yellow-500/40 transition-all backdrop-blur group"
              >
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg md:text-xl font-bold text-white group-hover:text-yellow-400 transition-colors truncate">
                        {team.name}
                      </CardTitle>
                      <CardDescription className="text-zinc-500 mt-1 font-mono text-sm">
                        #{team.teamCode}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={`font-mono ${
                        team.memberCount >= team.maxMembers
                          ? "border-red-500 text-red-500"
                          : "border-green-500 text-green-500"
                      }`}
                    >
                      {team.memberCount}/{team.maxMembers}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {team.description && (
                    <p className="text-sm text-zinc-400 line-clamp-2">
                      {team.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Crown className="w-4 h-4 text-yellow-400" />
                      <span className="text-zinc-400">Leader:</span>
                      <span className="text-white font-medium">
                        {team.leader.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-zinc-400">Members:</span>
                      <span className="text-white">{team.memberCount}</span>
                    </div>
                  </div>

                  {/* Member list preview with TH levels */}
                  {team.members.length > 0 && (
                    <div className="pt-2 border-t border-zinc-800">
                      <div className="flex flex-wrap gap-2">
                        {team.members.slice(0, 5).map((member, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <Avatar className="w-7 h-7 border-2 border-zinc-900">
                              <AvatarFallback className="text-xs bg-yellow-600 text-black font-bold">
                                {member.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            {member.townHall && (
                              <span className="text-xs text-yellow-500 font-medium">
                                TH{member.townHall}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error/Success Message */}
                  {errorMessage && (
                    <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400 flex items-center gap-2">
                      <XCircle className="w-4 h-4 flex-shrink-0" />
                      {errorMessage}
                    </div>
                  )}

                  {(team.hasUserRequested ||
                    teamRequests[team.id] === "sent") && (
                    <div className="p-2 bg-green-500/10 border border-green-500/20 rounded text-sm text-green-400 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      Request sent! Waiting for approval.
                    </div>
                  )}
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() =>
                      !buttonState.disabled && openJoinDialog(team)
                    }
                    disabled={buttonState.disabled}
                    className={`w-full ${
                      buttonState.disabled
                        ? "bg-zinc-800 text-zinc-500"
                        : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold"
                    }`}
                  >
                    {teamRequests[team.id] === "sent" ||
                    team.hasUserRequested ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {buttonState.text}
                      </>
                    ) : teamRequests[team.id] === "loading" ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        {buttonState.text}
                      </>
                    ) : (
                      buttonState.text
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}

          {teams.length === 0 && (
            <div className="col-span-full text-center py-20 bg-zinc-900/50 rounded-lg border border-dashed border-yellow-500/20">
              <Users className="w-16 h-16 text-yellow-500/50 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                No Clans Yet
              </h3>
              <p className="text-zinc-400 mb-6">
                Be the first to create a clan for Spring Fiesta 2026!
              </p>
              <Link href="/teams/create">
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold">
                  <Plus className="w-4 h-4 mr-2" /> Create First Clan
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Announcements */}
      {announcements.length > 0 && (
        <div className="order-1 lg:order-2 w-full lg:w-80 flex-shrink-0">
          <div className="lg:sticky lg:top-20">
            <div className="bg-zinc-900/80 border border-yellow-500/20 rounded-lg p-4">
              <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2 mb-3 md:mb-4">
                <Megaphone className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                Announcements
              </h3>
              <div className="space-y-3 max-h-[40vh] lg:max-h-[60vh] overflow-y-auto">
                {announcements.map((announcement) => (
                  <div
                    key={announcement._id}
                    className={`p-3 rounded-lg border ${
                      announcement.type === "URGENT"
                        ? "bg-red-500/10 border-red-500/30"
                        : announcement.type === "WARNING"
                          ? "bg-yellow-500/10 border-yellow-500/30"
                          : announcement.type === "SUCCESS"
                            ? "bg-green-500/10 border-green-500/30"
                            : "bg-blue-500/10 border-blue-500/30"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {announcement.isPinned && (
                        <span className="text-yellow-500">📌</span>
                      )}
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            announcement.type === "URGENT"
                              ? "text-red-300"
                              : announcement.type === "WARNING"
                                ? "text-yellow-300"
                                : announcement.type === "SUCCESS"
                                  ? "text-green-300"
                                  : "text-blue-300"
                          }`}
                        >
                          {announcement.title}
                        </p>
                        <p className="text-xs text-zinc-400 mt-1">
                          {announcement.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Request Dialog */}
      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-yellow-500" />
              Join {selectedTeam?.name}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Send a request to join this clan. The leader will review your
              request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-zinc-300">Message (Optional)</Label>
              <Input
                placeholder="Introduce yourself to the team leader..."
                value={joinMessage}
                onChange={(e) => setJoinMessage(e.target.value)}
                className="bg-black border-zinc-700 text-white mt-2"
              />
              <p className="text-xs text-zinc-500 mt-1">
                A good message increases your chances of getting accepted!
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  selectedTeam &&
                  handleJoinRequest(selectedTeam.id, joinMessage)
                }
                disabled={
                  !selectedTeam || teamRequests[selectedTeam.id] === "loading"
                }
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold"
              >
                {teamRequests[selectedTeam?.id || ""] === "loading" ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Request
                  </>
                )}
              </Button>
              <Button
                onClick={() => setJoinDialogOpen(false)}
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
