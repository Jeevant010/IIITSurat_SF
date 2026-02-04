export const dynamic = "force-dynamic";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Swords } from "lucide-react";
import connectDB from "@/lib/mongodb";
import { User, Team, JoinRequest, Announcement } from "@/lib/models";
import { getCurrentUser } from "@/lib/auth";
import { Suspense } from "react";
import LoadingScreen from "@/components/loading-screen";
import { TeamsClient } from "./teams-client";

async function getTeamsData() {
  await connectDB();
  const currentUser = await getCurrentUser();

  // Fetch all teams with member info
  const teamsData = await Team.find().populate("leaderId", "name").lean();

  // Get user's pending requests to know which teams they've already requested
  let userRequests: string[] = [];
  if (currentUser) {
    const requests = await JoinRequest.find({
      userId: currentUser._id,
      status: "PENDING",
    }).lean();
    userRequests = requests.map((r) => r.teamId.toString());
  }

  const teams = await Promise.all(
    teamsData.map(async (team) => {
      const members = await User.find({ teamId: team._id })
        .select("name email ign townHall")
        .lean();
      return {
        id: team._id.toString(),
        name: team.name,
        teamCode: team.teamCode,
        description: team.description || "",
        memberCount: members.length,
        maxMembers: team.maxMembers || 5,
        leader: { name: (team.leaderId as any)?.name || "Unknown" },
        members: members.map((m) => ({
          name: m.name,
          email: m.email,
          ign: m.ign || undefined,
          townHall: m.townHall || undefined,
        })),
        hasUserRequested: userRequests.includes(team._id.toString()),
      };
    }),
  );

  // Fetch active announcements for sidebar
  const now = new Date();
  const announcements = await Announcement.find({
    isActive: true,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
  })
    .sort({ isPinned: -1, priority: -1, createdAt: -1 })
    .limit(10)
    .lean();

  return {
    teams,
    announcements: announcements.map((a) => ({
      _id: a._id.toString(),
      title: a.title,
      content: a.content,
      type: a.type as "INFO" | "WARNING" | "SUCCESS" | "URGENT",
      isPinned: a.isPinned,
    })),
    currentUserId: currentUser?._id || null,
    userTeamId: currentUser?.teamId || null,
  };
}

async function TeamsContent() {
  const { teams, announcements, currentUserId, userTeamId } =
    await getTeamsData();

  return (
    <TeamsClient
      teams={teams}
      announcements={announcements}
      currentUserId={currentUserId}
      userTeamId={userTeamId}
    />
  );
}

export default function TeamsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-yellow-950/10 to-black">
      <div className="container mx-auto px-4 py-6 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 mb-3 md:mb-4">
            <Swords className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
            <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Browse Clans
            </h1>
          </div>
          <p className="text-base md:text-xl text-zinc-300 mb-4 md:mb-6">
            Find your squad for Clash of Clans @ Spring Fiesta 2026
          </p>
          <div className="flex gap-3 md:gap-4 justify-center flex-wrap">
            <Link href="/teams/create">
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold text-sm md:text-lg px-4 md:px-8 py-4 md:py-6">
                <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" /> Create
                Clan
              </Button>
            </Link>
            <Link href="/teams/my-team">
              <Button
                variant="outline"
                className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-950 text-sm md:text-lg px-4 md:px-8 py-4 md:py-6"
              >
                My Clan
              </Button>
            </Link>
          </div>
        </div>

        {/* Teams List with Announcements Sidebar */}
        <Suspense fallback={<LoadingScreen />}>
          <TeamsContent />
        </Suspense>
      </div>
    </div>
  );
}
