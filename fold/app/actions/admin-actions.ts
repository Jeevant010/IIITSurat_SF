"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/mongodb";
import {
  User,
  Team,
  JoinRequest,
  SiteSettings,
  Announcement,
} from "@/lib/models";
import mongoose from "mongoose";
import { getCurrentUser } from "@/lib/auth";

// ============================================
// ADMIN AUTH CHECK - All admin actions MUST call this first
// ============================================
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Not logged in");
  }
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required");
  }
  return user;
}

// GOD MODE: Force add user to team (bypasses approval)
export async function forceAddUserToTeam(userId: string, teamId: string) {
  await requireAdmin(); // Security check
  await connectDB();

  try {
    const team = await Team.findById(teamId);
    if (!team) {
      return { success: false, message: "Team not found" };
    }

    // Check team size
    const memberCount = await User.countDocuments({
      teamId: new mongoose.Types.ObjectId(teamId),
    });
    if (memberCount >= 5) {
      return { success: false, message: "Team is full (max 5 members)" };
    }

    // Update user
    await User.findByIdAndUpdate(userId, {
      teamId: new mongoose.Types.ObjectId(teamId),
      teamRole: "MEMBER",
    });

    // Cancel any pending requests from this user
    await JoinRequest.deleteMany({
      userId: new mongoose.Types.ObjectId(userId),
    });

    revalidatePath("/admin/teams");
    revalidatePath("/admin/players");
    return { success: true, message: "User force-added to team" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to add user" };
  }
}

// GOD MODE: Force remove user from team
export async function forceRemoveUserFromTeam(userId: string) {
  await requireAdmin();
  await connectDB();

  try {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Check if they're a leader
    if (user.teamRole === "LEADER") {
      const team = await Team.findById(user.teamId);
      if (team) {
        // Promote another member to leader or delete team
        const newLeader = await User.findOne({
          teamId: user.teamId,
          _id: { $ne: userId },
        });

        if (newLeader) {
          // Promote first member
          await User.findByIdAndUpdate(newLeader._id, { teamRole: "LEADER" });
          await Team.findByIdAndUpdate(team._id, { leaderId: newLeader._id });
        } else {
          // No other members, delete team
          await Team.findByIdAndDelete(team._id);
          await JoinRequest.deleteMany({ teamId: team._id });
        }
      }
    }

    // Remove user from team
    await User.findByIdAndUpdate(userId, {
      teamId: null,
      teamRole: null,
    });

    revalidatePath("/admin/teams");
    revalidatePath("/admin/players");
    return { success: true, message: "User removed from team" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to remove user" };
  }
}

// GOD MODE: Change team leader
export async function forceChangeTeamLeader(
  teamId: string,
  newLeaderId: string,
) {
  await requireAdmin();
  await connectDB();

  try {
    const team = await Team.findById(teamId);
    const newLeader = await User.findById(newLeaderId);

    if (!team || !newLeader) {
      return { success: false, message: "Team or user not found" };
    }

    if (newLeader.teamId?.toString() !== teamId) {
      return { success: false, message: "User is not in this team" };
    }

    // Demote old leader
    await User.findByIdAndUpdate(team.leaderId, { teamRole: "MEMBER" });

    // Promote new leader
    await User.findByIdAndUpdate(newLeaderId, { teamRole: "LEADER" });
    await Team.findByIdAndUpdate(teamId, { leaderId: newLeaderId });

    revalidatePath("/admin/teams");
    return { success: true, message: "Team leader changed" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to change leader" };
  }
}

// GOD MODE: Edit team details
export async function forceEditTeam(
  teamId: string,
  data: { name?: string; description?: string },
) {
  await requireAdmin();
  await connectDB();

  try {
    await Team.findByIdAndUpdate(teamId, data);

    revalidatePath("/admin/teams");
    revalidatePath("/teams");
    return { success: true, message: "Team updated" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to update team" };
  }
}

// GOD MODE: Delete team entirely
export async function forceDeleteTeam(teamId: string) {
  await requireAdmin();
  await connectDB();

  try {
    // Remove all members from team
    await User.updateMany(
      { teamId: new mongoose.Types.ObjectId(teamId) },
      { teamId: null, teamRole: null },
    );

    // Delete all join requests
    await JoinRequest.deleteMany({
      teamId: new mongoose.Types.ObjectId(teamId),
    });

    // Delete team
    await Team.findByIdAndDelete(teamId);

    revalidatePath("/admin/teams");
    revalidatePath("/teams");
    return { success: true, message: "Team deleted" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to delete team" };
  }
}

// GOD MODE: Force approve join request
export async function forceApproveJoinRequest(requestId: string) {
  await requireAdmin();
  await connectDB();

  try {
    const request = await JoinRequest.findById(requestId);
    if (!request) {
      return { success: false, message: "Request not found" };
    }

    const team = await Team.findById(request.teamId);
    if (!team) {
      return { success: false, message: "Team not found" };
    }

    // Check team size
    const memberCount = await User.countDocuments({ teamId: request.teamId });
    if (memberCount >= 5) {
      return { success: false, message: "Team is full" };
    }

    // Add user to team
    await User.findByIdAndUpdate(request.userId, {
      teamId: request.teamId,
      teamRole: "MEMBER",
    });

    // Delete all requests from this user
    await JoinRequest.deleteMany({ userId: request.userId });

    revalidatePath("/admin/teams");
    return { success: true, message: "Request approved" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to approve request" };
  }
}

// Import players from CSV data
export async function importPlayers(
  players: { email: string; name: string; rollNumber?: string }[],
) {
  await requireAdmin();
  await connectDB();

  try {
    let imported = 0;
    let skipped = 0;

    for (const player of players) {
      const existing = await User.findOne({ email: player.email });
      if (existing) {
        skipped++;
        continue;
      }

      await User.create({
        email: player.email,
        name: player.name,
        rollNumber: player.rollNumber || null,
        role: "USER",
      });
      imported++;
    }

    revalidatePath("/admin/players");
    return {
      success: true,
      message: `Imported ${imported} players, skipped ${skipped} duplicates`,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to import players" };
  }
}

// GOD MODE: Get all players with full details
export async function getAllPlayers() {
  await requireAdmin();
  await connectDB();

  try {
    const players = await User.find({ role: "USER" })
      .populate("teamId", "name teamCode")
      .lean();

    return {
      success: true,
      players: players.map((p) => ({
        _id: p._id.toString(),
        email: p.email,
        name: p.name,
        rollNumber: p.rollNumber,
        ign: p.ign,
        teamRole: p.teamRole,
        team: p.teamId
          ? {
              _id: (p.teamId as any)._id.toString(),
              name: (p.teamId as any).name,
              teamCode: (p.teamId as any).teamCode,
            }
          : null,
      })),
    };
  } catch (error) {
    console.error(error);
    return { success: false, players: [] };
  }
}

// GOD MODE: Edit player details
export async function forceEditPlayer(
  userId: string,
  data: {
    name?: string;
    email?: string;
    rollNumber?: string;
    ign?: string;
    role?: "USER" | "ADMIN";
  },
) {
  await requireAdmin();
  await connectDB();

  try {
    await User.findByIdAndUpdate(userId, data);

    revalidatePath("/admin/players");
    return { success: true, message: "Player updated" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to update player" };
  }
}

// GOD MODE: Delete player
export async function forceDeletePlayer(userId: string) {
  await requireAdmin();
  await connectDB();

  try {
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: "Player not found" };
    }

    // Remove from team first if needed
    if (user.teamId) {
      await forceRemoveUserFromTeam(userId);
    }

    // Delete all join requests
    await JoinRequest.deleteMany({
      userId: new mongoose.Types.ObjectId(userId),
    });

    // Delete user
    await User.findByIdAndDelete(userId);

    revalidatePath("/admin/players");
    return { success: true, message: "Player deleted" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to delete player" };
  }
}

// GOD MODE: Create new player manually
export async function forceCreatePlayer(data: {
  email: string;
  name: string;
  rollNumber?: string;
  ign?: string;
}) {
  await requireAdmin();
  await connectDB();

  try {
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      return { success: false, message: "Email already exists" };
    }

    await User.create({
      ...data,
      role: "USER",
    });

    revalidatePath("/admin/players");
    return { success: true, message: "Player created" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to create player" };
  }
}

// ===================================================
// TEAM CREATION BY ADMIN
// ===================================================

// GOD MODE: Create team directly as admin
export async function forceCreateTeam(data: {
  name: string;
  teamCode: string;
  description?: string;
  leaderId?: string; // Optional - if not provided, creates empty team
  maxMembers?: number;
}) {
  await requireAdmin();
  await connectDB();

  try {
    // Check if team name exists
    const existingName = await Team.findOne({
      name: { $regex: new RegExp(`^${data.name}$`, "i") },
    });
    if (existingName) {
      return { success: false, message: "Team name already exists" };
    }

    // Check if team code exists
    const existingCode = await Team.findOne({
      teamCode: data.teamCode.toUpperCase(),
    });
    if (existingCode) {
      return { success: false, message: "Team code already exists" };
    }

    // If leaderId is provided, verify and setup
    let leaderId = null;
    if (data.leaderId) {
      const leader = await User.findById(data.leaderId);
      if (!leader) {
        return { success: false, message: "Selected leader not found" };
      }
      if (leader.teamId) {
        return {
          success: false,
          message: "Selected user is already in a team",
        };
      }
      leaderId = new mongoose.Types.ObjectId(data.leaderId);
    }

    // Create the team
    const team = await Team.create({
      name: data.name.trim(),
      teamCode: data.teamCode.toUpperCase().trim(),
      description: data.description || "",
      leaderId: leaderId,
      maxMembers: data.maxMembers || 5,
      status: "ACTIVE",
    });

    // If leader was set, update user
    if (leaderId) {
      await User.findByIdAndUpdate(leaderId, {
        teamId: team._id,
        teamRole: "LEADER",
      });
    }

    revalidatePath("/admin/teams");
    revalidatePath("/teams");
    return {
      success: true,
      message: "Team created successfully",
      teamId: team._id.toString(),
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to create team" };
  }
}

// ===================================================
// SITE SETTINGS
// ===================================================

// Get current site settings
export async function getSiteSettings() {
  await connectDB();

  try {
    let settings = await SiteSettings.findOne().lean();

    // Create default settings if none exist
    if (!settings) {
      settings = await SiteSettings.create({
        siteName: "Spring Fiesta 2026 - Clash of Clans",
        eventDate: new Date("2026-03-15"),
        registrationOpen: true,
        maxTeamSize: 5,
        minTeamSize: 1,
        allowTeamCreation: true,
        allowJoinRequests: true,
        heroTitle: "Clash of Clans Tournament",
        heroSubtitle: "Spring Fiesta 2026 • IIIT Surat",
        announcementBanner: "",
      });
      settings = settings.toObject();
    }

    return {
      success: true,
      settings: {
        ...settings,
        _id: settings._id?.toString(),
        eventDate: settings.eventDate?.toISOString().split("T")[0],
      },
    };
  } catch (error) {
    console.error(error);
    return { success: false, settings: null };
  }
}

// Update site settings
export async function updateSiteSettings(data: {
  siteName?: string;
  eventDate?: string;
  registrationOpen?: boolean;
  maxTeamSize?: number;
  minTeamSize?: number;
  allowTeamCreation?: boolean;
  allowJoinRequests?: boolean;
  heroTitle?: string;
  heroSubtitle?: string;
  announcementBanner?: string;
}) {
  await requireAdmin();
  await connectDB();

  try {
    const updateData: any = { ...data };

    // Convert eventDate string to Date
    if (data.eventDate) {
      updateData.eventDate = new Date(data.eventDate);
    }

    let settings = await SiteSettings.findOne();

    if (settings) {
      settings = await SiteSettings.findByIdAndUpdate(
        settings._id,
        updateData,
        { new: true },
      );
    } else {
      settings = await SiteSettings.create(updateData);
    }

    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { success: true, message: "Settings saved successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to save settings" };
  }
}

// ===================================================
// ANNOUNCEMENTS
// ===================================================

// Create announcement
export async function createAnnouncement(data: {
  title: string;
  content: string;
  type?: "INFO" | "WARNING" | "SUCCESS" | "URGENT";
  priority?: number;
  isPinned?: boolean;
  showOnBanner?: boolean;
  targetAudience?: "ALL" | "TEAMS" | "FREE_AGENTS" | "ADMINS";
  expiresAt?: string | null;
}) {
  await requireAdmin();
  await connectDB();

  try {
    const announcementData: any = {
      ...data,
      isActive: true,
    };

    if (data.expiresAt) {
      announcementData.expiresAt = new Date(data.expiresAt);
    }

    await Announcement.create(announcementData);

    revalidatePath("/admin/announcements");
    revalidatePath("/");
    return { success: true, message: "Announcement created" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to create announcement" };
  }
}

// Update announcement
export async function updateAnnouncement(
  announcementId: string,
  data: {
    title?: string;
    content?: string;
    type?: "INFO" | "WARNING" | "SUCCESS" | "URGENT";
    priority?: number;
    isActive?: boolean;
    isPinned?: boolean;
    showOnBanner?: boolean;
    targetAudience?: "ALL" | "TEAMS" | "FREE_AGENTS" | "ADMINS";
    expiresAt?: string | null;
  },
) {
  await requireAdmin();
  await connectDB();

  try {
    const updateData: any = { ...data };

    if (data.expiresAt) {
      updateData.expiresAt = new Date(data.expiresAt);
    } else if (data.expiresAt === null) {
      updateData.expiresAt = null;
    }

    await Announcement.findByIdAndUpdate(announcementId, updateData);

    revalidatePath("/admin/announcements");
    revalidatePath("/");
    return { success: true, message: "Announcement updated" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to update announcement" };
  }
}

// Delete announcement
export async function deleteAnnouncement(announcementId: string) {
  await requireAdmin();
  await connectDB();

  try {
    await Announcement.findByIdAndDelete(announcementId);

    revalidatePath("/admin/announcements");
    revalidatePath("/");
    return { success: true, message: "Announcement deleted" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to delete announcement" };
  }
}

// Get all announcements (for admin)
export async function getAllAnnouncements() {
  await requireAdmin();
  await connectDB();

  try {
    const announcements = await Announcement.find()
      .sort({ isPinned: -1, priority: -1, createdAt: -1 })
      .lean();

    return {
      success: true,
      announcements: announcements.map((a) => ({
        ...a,
        _id: a._id.toString(),
        createdAt: a.createdAt?.toISOString(),
        updatedAt: a.updatedAt?.toISOString(),
        expiresAt: a.expiresAt?.toISOString() || null,
      })),
    };
  } catch (error) {
    console.error(error);
    return { success: false, announcements: [] };
  }
}

// Get active announcements (for public display)
export async function getActiveAnnouncements(
  audience: "ALL" | "TEAMS" | "FREE_AGENTS" = "ALL",
) {
  await connectDB();

  try {
    const now = new Date();
    const query: any = {
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
      targetAudience: { $in: ["ALL", audience] },
    };

    const announcements = await Announcement.find(query)
      .sort({ isPinned: -1, priority: -1, createdAt: -1 })
      .lean();

    return {
      success: true,
      announcements: announcements.map((a) => ({
        ...a,
        _id: a._id.toString(),
        createdAt: a.createdAt?.toISOString(),
      })),
    };
  } catch (error) {
    console.error(error);
    return { success: false, announcements: [] };
  }
}

// Get banner announcement
export async function getBannerAnnouncement() {
  await connectDB();

  try {
    const now = new Date();
    const banner = await Announcement.findOne({
      isActive: true,
      showOnBanner: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    })
      .sort({ priority: -1, createdAt: -1 })
      .lean();

    if (!banner) {
      return { success: true, banner: null };
    }

    return {
      success: true,
      banner: {
        ...banner,
        _id: banner._id.toString(),
      },
    };
  } catch (error) {
    console.error(error);
    return { success: false, banner: null };
  }
}

// ===================================================
// ADMIN STATISTICS
// ===================================================

export async function getAdminStats() {
  await requireAdmin();
  await connectDB();

  try {
    const [
      totalUsers,
      totalTeams,
      activeTeams,
      pendingRequests,
      totalMatches,
      completedMatches,
      activeAnnouncements,
    ] = await Promise.all([
      User.countDocuments({ role: "USER" }),
      Team.countDocuments(),
      Team.countDocuments({ status: "ACTIVE" }),
      JoinRequest.countDocuments({ status: "PENDING" }),
      (await import("@/lib/models")).Match.countDocuments(),
      (await import("@/lib/models")).Match.countDocuments({
        status: "COMPLETED",
      }),
      Announcement.countDocuments({ isActive: true }),
    ]);

    const freeAgents = await User.countDocuments({
      role: "USER",
      teamId: null,
    });

    return {
      success: true,
      stats: {
        totalUsers,
        totalTeams,
        activeTeams,
        freeAgents,
        pendingRequests,
        totalMatches,
        completedMatches,
        activeAnnouncements,
      },
    };
  } catch (error) {
    console.error(error);
    return { success: false, stats: null };
  }
}
