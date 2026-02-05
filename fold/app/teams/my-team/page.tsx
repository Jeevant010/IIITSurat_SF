export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Crown,
  UserMinus,
  CheckCircle,
  XCircle,
  LogOut,
  ArrowRightLeft,
} from "lucide-react";
import connectDB from "@/lib/mongodb";
import { User, Team, JoinRequest } from "@/lib/models";
import { getAvatarUrl } from "@/lib/avatar";
import { getTHCounts, canPlayerJoinTeam } from "@/lib/th-validation";
import {
  approveJoinRequest,
  rejectJoinRequest,
} from "@/app/actions/join-actions";
import {
  leaveTeam,
  kickMember,
  transferLeadership,
} from "@/app/actions/team-actions";
import { getCurrentUser } from "@/lib/auth";
import { CopyCodeButton } from "./copy-code-button";

// Helper to get initials for Avatars
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

export default async function MyTeamPage() {
  await connectDB();

  // Get authenticated user
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/teams");
  }

  // Fetch user with fresh data from DB
  const user = await User.findById(currentUser._id).lean();

  // Safety Check: If user has no team, send them to create/join
  if (!user || !user.teamId) {
    redirect("/teams");
  }

  const team = await Team.findById(user.teamId).lean();
  const members = await User.find({ teamId: user.teamId }).lean();

  // Fetch pending join requests (only if leader)
  const pendingRequests = await JoinRequest.find({
    teamId: user.teamId,
    status: "PENDING",
  })
    .populate("userId", "name email townHall ign")
    .lean();

  if (!team) {
    redirect("/teams");
  }

  const isLeader = team.leaderId.toString() === user._id.toString();

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            {team.name}
            {isLeader && (
              <Badge variant="secondary" className="bg-yellow-500 text-black">
                Leader View
              </Badge>
            )}
          </h1>
          <p className="text-zinc-400 mt-2">
            Clan Status: <span className="text-green-500">Active</span> •
            Members: {members.length}/5
          </p>
        </div>

        {/* INVITE CODE CARD */}
        <Card className="bg-zinc-900 border-dashed border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold">
                Invite Code
              </div>
              <div className="text-xl font-mono text-yellow-400 font-bold tracking-wider">
                {team.teamCode}
              </div>
              <CopyCodeButton code={team.teamCode} />
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Share this code with players. They can use it on the{" "}
              <span className="text-yellow-400">Teams</span> page to request to
              join.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* TH RESTRICTIONS INFO */}
      {(() => {
        const thCounts = getTHCounts(
          members.map((m) => ({ townHall: m.townHall })),
        );
        // Calculate available slots
        const th18Slots = 1;
        const th17Slots = 1 + Math.max(0, th18Slots - thCounts.th18);
        const th16Slots = 1 + Math.max(0, th17Slots - thCounts.th17);
        const th15Slots = 1 + Math.max(0, th16Slots - thCounts.th16);

        return (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-400">
                Town Hall Slot Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div
                  className={`p-3 rounded-lg text-center ${thCounts.th18 >= th18Slots ? "bg-red-500/20 border border-red-500/30" : "bg-green-500/10 border border-green-500/20"}`}
                >
                  <div className="text-lg font-bold text-white">TH 18</div>
                  <div
                    className={`text-sm ${thCounts.th18 >= th18Slots ? "text-red-400" : "text-green-400"}`}
                  >
                    {thCounts.th18}/{th18Slots}{" "}
                    {thCounts.th18 >= th18Slots ? "(FULL)" : ""}
                  </div>
                </div>
                <div
                  className={`p-3 rounded-lg text-center ${thCounts.th17 >= th17Slots ? "bg-red-500/20 border border-red-500/30" : "bg-green-500/10 border border-green-500/20"}`}
                >
                  <div className="text-lg font-bold text-white">TH 17</div>
                  <div
                    className={`text-sm ${thCounts.th17 >= th17Slots ? "text-red-400" : "text-green-400"}`}
                  >
                    {thCounts.th17}/{th17Slots}{" "}
                    {thCounts.th17 >= th17Slots ? "(FULL)" : ""}
                  </div>
                </div>
                <div
                  className={`p-3 rounded-lg text-center ${thCounts.th16 >= th16Slots ? "bg-red-500/20 border border-red-500/30" : "bg-green-500/10 border border-green-500/20"}`}
                >
                  <div className="text-lg font-bold text-white">TH 16</div>
                  <div
                    className={`text-sm ${thCounts.th16 >= th16Slots ? "text-red-400" : "text-green-400"}`}
                  >
                    {thCounts.th16}/{th16Slots}{" "}
                    {thCounts.th16 >= th16Slots ? "(FULL)" : ""}
                  </div>
                </div>
                <div
                  className={`p-3 rounded-lg text-center ${thCounts.th15 >= th15Slots ? "bg-red-500/20 border border-red-500/30" : "bg-green-500/10 border border-green-500/20"}`}
                >
                  <div className="text-lg font-bold text-white">TH 15</div>
                  <div
                    className={`text-sm ${thCounts.th15 >= th15Slots ? "text-red-400" : "text-green-400"}`}
                  >
                    {thCounts.th15}/{th15Slots}{" "}
                    {thCounts.th15 >= th15Slots ? "(FULL)" : ""}
                  </div>
                </div>
                <div className="p-3 rounded-lg text-center bg-blue-500/10 border border-blue-500/20">
                  <div className="text-lg font-bold text-white">TH ≤14</div>
                  <div className="text-sm text-blue-400">Unlimited</div>
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-3">
                💡 Unused high TH slots cascade down. E.g., if no TH 18, then TH
                17 can have 2 players.
              </p>
            </CardContent>
          </Card>
        );
      })()}

      {/* PENDING JOIN REQUESTS - Leader Only */}
      {isLeader && pendingRequests.length > 0 && (
        <Card className="bg-zinc-900 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Badge className="bg-yellow-500 text-black">
                {pendingRequests.length}
              </Badge>
              Pending Join Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((request: any) => {
                const thCounts = getTHCounts(
                  members.map((m) => ({ townHall: m.townHall })),
                );
                const canJoin = canPlayerJoinTeam(
                  request.userId.townHall,
                  thCounts,
                );

                return (
                  <div
                    key={request._id.toString()}
                    className={`p-3 rounded-lg ${canJoin.allowed ? "bg-zinc-800" : "bg-red-900/20 border border-red-500/30"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-zinc-700">
                          <AvatarFallback>
                            {getInitials(request.userId.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-medium flex items-center gap-2">
                            {request.userId.name}
                            {request.userId.townHall && (
                              <Badge
                                variant="outline"
                                className="text-xs border-purple-500/50 text-purple-400"
                              >
                                TH {request.userId.townHall}
                              </Badge>
                            )}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {request.userId.email}
                            {request.userId.ign &&
                              ` • IGN: ${request.userId.ign}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {canJoin.allowed ? (
                          <form
                            action={async () => {
                              "use server";
                              await approveJoinRequest(request._id.toString());
                            }}
                          >
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Accept
                            </Button>
                          </form>
                        ) : (
                          <Button
                            size="sm"
                            disabled
                            className="bg-zinc-700 text-zinc-400 cursor-not-allowed"
                          >
                            Cannot Accept
                          </Button>
                        )}
                        <form
                          action={async () => {
                            "use server";
                            await rejectJoinRequest(request._id.toString());
                          }}
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </form>
                      </div>
                    </div>
                    {!canJoin.allowed && (
                      <p className="text-xs text-red-400 mt-2">
                        ⚠️ {canJoin.reason}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ROSTER TABLE */}
      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-xl text-white">Active Roster</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-zinc-900/50">
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Member</TableHead>
                <TableHead className="text-zinc-400">Role</TableHead>
                <TableHead className="text-zinc-400">IGN</TableHead>
                <TableHead className="text-right text-zinc-400">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow
                  key={member._id.toString()}
                  className="border-zinc-800"
                >
                  <TableCell className="font-medium text-zinc-200">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-zinc-700">
                        <AvatarImage
                          src={getAvatarUrl(member.avatarId, member.name)}
                        />
                        <AvatarFallback>
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm text-white font-bold">
                          {member.name}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {member._id.toString() === team.leaderId.toString() ? (
                      <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border-none">
                        <Crown className="w-3 h-3 mr-1" /> Captain
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-zinc-400 border-zinc-700"
                      >
                        Member
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-zinc-400">
                    {member.ign || "Not Linked"}
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Leader can transfer leadership to other members */}
                    {isLeader &&
                      member._id.toString() !== user._id.toString() && (
                        <div className="flex justify-end gap-2">
                          <form
                            action={async () => {
                              "use server";
                              await transferLeadership(member._id.toString());
                            }}
                          >
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className="text-yellow-500 hover:bg-yellow-950 hover:text-yellow-400"
                            >
                              <ArrowRightLeft className="h-4 w-4 mr-1" /> Make
                              Leader
                            </Button>
                          </form>
                          <form
                            action={async () => {
                              "use server";
                              await kickMember(member._id.toString());
                            }}
                          >
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:bg-red-950 hover:text-red-400"
                            >
                              <UserMinus className="h-4 w-4 mr-1" /> Kick
                            </Button>
                          </form>
                        </div>
                      )}
                    {/* Members (non-leaders) can leave */}
                    {!isLeader &&
                      member._id.toString() === user._id.toString() && (
                        <form
                          action={async () => {
                            "use server";
                            await leaveTeam();
                            redirect("/teams");
                          }}
                        >
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="text-orange-500 hover:bg-orange-950 hover:text-orange-400"
                          >
                            <LogOut className="h-4 w-4 mr-1" /> Leave
                          </Button>
                        </form>
                      )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Leave Team Button for Leaders */}
          {isLeader && members.length === 1 && (
            <div className="mt-6 pt-6 border-t border-zinc-800">
              <form
                action={async () => {
                  "use server";
                  await leaveTeam();
                  redirect("/teams");
                }}
              >
                <Button
                  type="submit"
                  variant="outline"
                  className="border-red-500/50 text-red-500 hover:bg-red-950 hover:text-red-400"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Disband Team
                </Button>
              </form>
              <p className="text-zinc-500 text-sm mt-2">
                You&apos;re the only member. Leaving will disband the team.
              </p>
            </div>
          )}
          {isLeader && members.length > 1 && (
            <div className="mt-6 pt-6 border-t border-zinc-800">
              <form
                action={async () => {
                  "use server";
                  await leaveTeam();
                  redirect("/teams");
                }}
              >
                <Button
                  type="submit"
                  variant="outline"
                  className="border-orange-500/50 text-orange-500 hover:bg-orange-950 hover:text-orange-400"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Leave Team
                </Button>
              </form>
              <p className="text-zinc-500 text-sm mt-2">
                Leadership will be transferred to another member.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
