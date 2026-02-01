"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Team from "@/lib/models/Team";
import JoinRequest from "@/lib/models/JoinRequest";
import mongoose from "mongoose";

// GOD MODE: Force add user to team (bypasses approval)
export async function forceAddUserToTeam(userId: string, teamId: string) {
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
    await JoinRequest.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });

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
