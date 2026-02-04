"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import { User, Team, JoinRequest, Match } from "@/lib/models";
import { getCurrentUser } from "@/lib/auth";
import mongoose from "mongoose";

// Helper function to check if team has war history
async function teamHasWarHistory(teamId: mongoose.Types.ObjectId): Promise<boolean> {
  const matchCount = await Match.countDocuments({
    $or: [
      { team1Id: teamId },
      { team2Id: teamId },
    ],
  });
  return matchCount > 0;
}

// Helper function to delete team if no members and no war history
async function deleteTeamIfEmpty(teamId: mongoose.Types.ObjectId): Promise<void> {
  const memberCount = await User.countDocuments({ teamId: teamId });
  
  if (memberCount === 0) {
    // Check if team has played any matches
    const hasWarHistory = await teamHasWarHistory(teamId);
    
    if (!hasWarHistory) {
      // No members and no war history - delete the team
      await Team.findByIdAndDelete(teamId);
      await JoinRequest.deleteMany({ teamId: teamId });
    }
    // If team has war history, keep it for records (admin can delete manually)
  }
}

// ============================================
// CREATE TEAM
// ============================================
export async function createTeam(formData: FormData): Promise<void> {
  await connectDB();

  const teamName = formData.get("teamName") as string;
  const teamTag = formData.get("teamTag") as string;
  const description = formData.get("description") as string;

  // Validation
  if (!teamName || teamName.trim().length < 2) {
    throw new Error("Team name must be at least 2 characters.");
  }

  if (!teamTag || teamTag.trim().length < 2 || teamTag.trim().length > 4) {
    throw new Error("Team tag must be 2-4 characters.");
  }

  try {
    // Get current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("You must be logged in to create a team.");
    }

    // Refresh user data from DB
    const user = await User.findById(currentUser._id);
    if (!user) {
      throw new Error("User not found.");
    }

    // Check if user is already in a team
    if (user.teamId) {
      throw new Error(
        "You are already in a team! Leave your current team first.",
      );
    }

    // Check if team name already exists (case-insensitive)
    const existingTeam = await Team.findOne({
      name: { $regex: new RegExp(`^${teamName.trim()}$`, "i") },
    });
    if (existingTeam) {
      throw new Error(
        `Team name "${teamName}" is already taken. Please choose a different name.`,
      );
    }

    // Generate unique team code
    const teamCode =
      teamTag.toUpperCase().trim() +
      "-" +
      Math.floor(1000 + Math.random() * 9000);

    // Create the team
    const newTeam = await Team.create({
      name: teamName.trim(),
      teamCode,
      leaderId: user._id,
      description: description?.trim() || "",
    });

    // Update user to link them to this team
    await User.findByIdAndUpdate(user._id, {
      teamId: newTeam._id,
      teamRole: "LEADER",
    });
  } catch (error: any) {
    console.error("Failed to create team:", error);

    // Re-throw user-friendly errors
    if (error.message && !error.message.includes("E11000")) {
      throw error;
    }

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      throw new Error("Team name or code is already taken. Please try again.");
    }

    throw new Error("Failed to create team. Please try again.");
  }

  revalidatePath("/teams");
  redirect("/teams/my-team");
}

// ============================================
// LEAVE TEAM
// ============================================
export async function leaveTeam(): Promise<{
  success: boolean;
  message: string;
}> {
  await connectDB();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: "You must be logged in." };
    }

    const user = await User.findById(currentUser._id);
    if (!user || !user.teamId) {
      return { success: false, message: "You are not in a team." };
    }

    const team = await Team.findById(user.teamId);
    if (!team) {
      // Team doesn't exist, just clear user's team data
      await User.findByIdAndUpdate(user._id, { teamId: null, teamRole: null });
      revalidatePath("/teams");
      return { success: true, message: "Left team successfully." };
    }

    // If user is the leader
    if (user.teamRole === "LEADER") {
      // Find another member to promote
      const newLeader = await User.findOne({
        teamId: user.teamId,
        _id: { $ne: user._id },
      });

      if (newLeader) {
        // Promote new leader
        await User.findByIdAndUpdate(newLeader._id, { teamRole: "LEADER" });
        await Team.findByIdAndUpdate(team._id, { leaderId: newLeader._id });
      }
      // Note: Team deletion handled after user is removed
    }

    // Remove user from team
    await User.findByIdAndUpdate(user._id, {
      teamId: null,
      teamRole: null,
    });

    // Check if team should be deleted (no members + no war history)
    await deleteTeamIfEmpty(team._id);

    revalidatePath("/teams");
    revalidatePath("/teams/my-team");
    return { success: true, message: "You have left the team." };
  } catch (error) {
    console.error("Failed to leave team:", error);
    return { success: false, message: "Failed to leave team." };
  }
}

// ============================================
// KICK MEMBER (Leader only)
// ============================================
export async function kickMember(
  memberId: string,
): Promise<{ success: boolean; message: string }> {
  await connectDB();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: "You must be logged in." };
    }

    // Verify current user is a team leader
    const leader = await User.findById(currentUser._id);
    if (!leader || leader.teamRole !== "LEADER") {
      return { success: false, message: "Only team leaders can kick members." };
    }

    // Get member to kick
    const member = await User.findById(memberId);
    if (!member) {
      return { success: false, message: "Member not found." };
    }

    // Verify member is in the same team
    if (
      !member.teamId ||
      member.teamId.toString() !== leader.teamId?.toString()
    ) {
      return { success: false, message: "This user is not in your team." };
    }

    // Cannot kick yourself
    if (member._id.toString() === leader._id.toString()) {
      return {
        success: false,
        message: "You cannot kick yourself. Use 'Leave Team' instead.",
      };
    }

    // Remove member from team
    await User.findByIdAndUpdate(memberId, {
      teamId: null,
      teamRole: null,
    });

    revalidatePath("/teams/my-team");
    return {
      success: true,
      message: `${member.name} has been removed from the team.`,
    };
  } catch (error) {
    console.error("Failed to kick member:", error);
    return { success: false, message: "Failed to remove member." };
  }
}

// ============================================
// TRANSFER LEADERSHIP (Leader only)
// ============================================
export async function transferLeadership(
  newLeaderId: string,
): Promise<{ success: boolean; message: string }> {
  await connectDB();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: "You must be logged in." };
    }

    // Verify current user is a team leader
    const currentLeader = await User.findById(currentUser._id);
    if (!currentLeader || currentLeader.teamRole !== "LEADER") {
      return {
        success: false,
        message: "Only team leaders can transfer leadership.",
      };
    }

    // Get new leader
    const newLeader = await User.findById(newLeaderId);
    if (!newLeader) {
      return { success: false, message: "User not found." };
    }

    // Verify new leader is in the same team
    if (
      !newLeader.teamId ||
      newLeader.teamId.toString() !== currentLeader.teamId?.toString()
    ) {
      return { success: false, message: "This user is not in your team." };
    }

    // Cannot transfer to yourself
    if (newLeader._id.toString() === currentLeader._id.toString()) {
      return { success: false, message: "You are already the leader." };
    }

    // Update roles
    await User.findByIdAndUpdate(currentLeader._id, { teamRole: "MEMBER" });
    await User.findByIdAndUpdate(newLeaderId, { teamRole: "LEADER" });
    await Team.findByIdAndUpdate(currentLeader.teamId, {
      leaderId: newLeaderId,
    });

    revalidatePath("/teams/my-team");
    return {
      success: true,
      message: `Leadership transferred to ${newLeader.name}.`,
    };
  } catch (error) {
    console.error("Failed to transfer leadership:", error);
    return { success: false, message: "Failed to transfer leadership." };
  }
}

// ============================================
// UPDATE TEAM (Leader only)
// ============================================
export async function updateTeam(data: {
  name?: string;
  description?: string;
}): Promise<{ success: boolean; message: string }> {
  await connectDB();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: "You must be logged in." };
    }

    const user = await User.findById(currentUser._id);
    if (!user || user.teamRole !== "LEADER") {
      return {
        success: false,
        message: "Only team leaders can update team details.",
      };
    }

    if (!user.teamId) {
      return { success: false, message: "You are not in a team." };
    }

    // If updating name, check for duplicates
    if (data.name) {
      const existingTeam = await Team.findOne({
        name: { $regex: new RegExp(`^${data.name.trim()}$`, "i") },
        _id: { $ne: user.teamId },
      });
      if (existingTeam) {
        return { success: false, message: "Team name is already taken." };
      }
    }

    await Team.findByIdAndUpdate(user.teamId, {
      ...(data.name && { name: data.name.trim() }),
      ...(data.description !== undefined && {
        description: data.description.trim(),
      }),
    });

    revalidatePath("/teams");
    revalidatePath("/teams/my-team");
    return { success: true, message: "Team updated successfully." };
  } catch (error) {
    console.error("Failed to update team:", error);
    return { success: false, message: "Failed to update team." };
  }
}

// ============================================
// GET USER'S TEAM
// ============================================
export async function getMyTeam() {
  await connectDB();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, team: null, message: "Not logged in" };
    }

    const user = await User.findById(currentUser._id);
    if (!user || !user.teamId) {
      return { success: false, team: null, message: "Not in a team" };
    }

    const team = await Team.findById(user.teamId).lean();
    const members = await User.find({ teamId: user.teamId }).lean();

    return {
      success: true,
      team: {
        ...team,
        _id: team?._id.toString(),
        leaderId: team?.leaderId.toString(),
        members: members.map((m) => ({
          _id: m._id.toString(),
          name: m.name,
          email: m.email,
          teamRole: m.teamRole,
          ign: m.ign,
        })),
      },
    };
  } catch (error) {
    console.error("Failed to get team:", error);
    return { success: false, team: null, message: "Failed to get team" };
  }
}
