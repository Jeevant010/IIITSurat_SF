"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/mongodb";
import { User, Team, JoinRequest } from "@/lib/models";
import { getCurrentUser } from "@/lib/auth";
import { canPlayerJoinTeam, getTHCounts } from "@/lib/th-validation";

// ============================================
// JOIN TEAM BY INVITE CODE
// ============================================
export async function joinTeamByCode(
  teamCode: string,
  message?: string,
): Promise<{ success: boolean; message: string; teamName?: string }> {
  await connectDB();

  try {
    // Get currently logged in user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: "You must be logged in." };
    }

    // Clean up the team code (remove # if present, uppercase, trim)
    const cleanCode = teamCode.replace(/^#/, "").toUpperCase().trim();

    if (!cleanCode || cleanCode.length < 3) {
      return { success: false, message: "Please enter a valid team code." };
    }

    // Refresh user data from DB
    const user = await User.findById(currentUser._id);
    if (!user) {
      return { success: false, message: "User not found." };
    }

    // Check if user is already in a team
    if (user.teamId) {
      return {
        success: false,
        message:
          "You are already in another clan! Leave your current clan first.",
      };
    }

    // Find team by code
    const team = await Team.findOne({ teamCode: cleanCode });
    if (!team) {
      return {
        success: false,
        message:
          "No team found with that invite code. Please check and try again.",
      };
    }

    // Check if team is accepting requests
    if (team.status !== "ACTIVE") {
      return { success: false, message: "This team is not accepting members." };
    }

    // Check team size
    const memberCount = await User.countDocuments({ teamId: team._id });
    if (memberCount >= team.maxMembers) {
      return {
        success: false,
        message: `Team "${team.name}" is full (${team.maxMembers}/${team.maxMembers} members).`,
      };
    }

    // Check for existing pending request
    const existingRequest = await JoinRequest.findOne({
      userId: user._id,
      teamId: team._id,
      status: "PENDING",
    });

    if (existingRequest) {
      return {
        success: false,
        message: `You already have a pending request for "${team.name}". Wait for the leader's response.`,
      };
    }

    // Create the request
    await JoinRequest.create({
      userId: user._id,
      teamId: team._id,
      status: "PENDING",
      message: message?.trim() || `Joined using invite code: ${cleanCode}`,
    });

    revalidatePath("/teams");
    return {
      success: true,
      message: `Request sent to "${team.name}"! Waiting for Captain approval.`,
      teamName: team.name,
    };
  } catch (error: any) {
    console.error("Join by Code Error:", error);

    // Handle duplicate request error
    if (error.code === 11000) {
      return {
        success: false,
        message: "You already have a request for this team.",
      };
    }

    return { success: false, message: "Failed to send request." };
  }
}

// ============================================
// REQUEST TO JOIN TEAM
// ============================================
export async function requestToJoinTeam(
  teamId: string,
  message?: string,
): Promise<{ success: boolean; message: string }> {
  await connectDB();

  try {
    // Get currently logged in user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: "You must be logged in." };
    }

    // Refresh user data from DB
    const user = await User.findById(currentUser._id);
    if (!user) {
      return { success: false, message: "User not found." };
    }

    // Check if user is already in a team
    if (user.teamId) {
      return {
        success: false,
        message:
          "You are already in another clan! Leave your current clan first.",
      };
    }

    // Check if team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return { success: false, message: "Team not found." };
    }

    // Check if team is accepting requests
    if (team.status !== "ACTIVE") {
      return { success: false, message: "This team is not accepting members." };
    }

    // Check team size
    const memberCount = await User.countDocuments({ teamId: teamId });
    if (memberCount >= team.maxMembers) {
      return {
        success: false,
        message: `Team is full (${team.maxMembers}/${team.maxMembers} members).`,
      };
    }

    // Check for existing pending request
    const existingRequest = await JoinRequest.findOne({
      userId: user._id,
      teamId: teamId,
      status: "PENDING",
    });

    if (existingRequest) {
      return {
        success: false,
        message: "Request already sent. Wait for the leader's response.",
      };
    }

    // Create the request
    await JoinRequest.create({
      userId: user._id,
      teamId: teamId,
      status: "PENDING",
      message: message?.trim() || "",
    });

    revalidatePath("/teams");
    return {
      success: true,
      message: "Request sent! Waiting for Captain approval.",
    };
  } catch (error: any) {
    console.error("Join Error:", error);

    // Handle duplicate request error
    if (error.code === 11000) {
      return {
        success: false,
        message: "You already have a request for this team.",
      };
    }

    return { success: false, message: "Failed to send request." };
  }
}

// ============================================
// APPROVE JOIN REQUEST (Leader only)
// ============================================
export async function approveJoinRequest(
  requestId: string,
): Promise<{ success: boolean; message: string }> {
  await connectDB();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: "You must be logged in." };
    }

    const request = await JoinRequest.findById(requestId);
    if (!request) {
      return { success: false, message: "Request not found." };
    }

    if (request.status !== "PENDING") {
      return {
        success: false,
        message: "This request has already been processed.",
      };
    }

    const team = await Team.findById(request.teamId);
    if (!team) {
      return { success: false, message: "Team not found." };
    }

    // Verify current user is the team leader
    if (team.leaderId.toString() !== currentUser._id) {
      return {
        success: false,
        message: "Only the team leader can approve requests.",
      };
    }

    // Check team size
    const memberCount = await User.countDocuments({ teamId: request.teamId });
    if (memberCount >= team.maxMembers) {
      return {
        success: false,
        message: `Team is full (${team.maxMembers}/${team.maxMembers} members).`,
      };
    }

    // Get the requesting player's details
    const requestingPlayer = await User.findById(request.userId);
    if (!requestingPlayer) {
      return { success: false, message: "Player not found." };
    }

    // Check if player has set their Town Hall level
    if (!requestingPlayer.townHall) {
      return {
        success: false,
        message: "Player must set their Town Hall level before joining a team.",
      };
    }

    // Get current team members for TH validation
    const teamMembers = await User.find({ teamId: request.teamId })
      .select("townHall")
      .lean();
    const thCounts = getTHCounts(teamMembers);

    // Validate TH restrictions
    const thValidation = canPlayerJoinTeam(requestingPlayer.townHall, thCounts);
    if (!thValidation.allowed) {
      return {
        success: false,
        message:
          thValidation.reason ||
          "Player cannot join due to Town Hall restrictions.",
      };
    }

    // Add user to team
    await User.findByIdAndUpdate(request.userId, {
      teamId: request.teamId,
      teamRole: "MEMBER",
    });

    // Update request status
    await JoinRequest.findByIdAndUpdate(requestId, {
      status: "ACCEPTED",
      processedBy: currentUser._id,
      processedAt: new Date(),
    });

    // Delete other pending requests from this user
    await JoinRequest.deleteMany({
      userId: request.userId,
      _id: { $ne: requestId },
      status: "PENDING",
    });

    revalidatePath("/teams/my-team");
    revalidatePath("/teams");
    return { success: true, message: "Player added to team!" };
  } catch (error) {
    console.error("Approve error:", error);
    return { success: false, message: "Failed to approve request." };
  }
}

// ============================================
// REJECT JOIN REQUEST (Leader only)
// ============================================
export async function rejectJoinRequest(
  requestId: string,
  reason?: string,
): Promise<{ success: boolean; message: string }> {
  await connectDB();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: "You must be logged in." };
    }

    const request = await JoinRequest.findById(requestId);
    if (!request) {
      return { success: false, message: "Request not found." };
    }

    if (request.status !== "PENDING") {
      return {
        success: false,
        message: "This request has already been processed.",
      };
    }

    const team = await Team.findById(request.teamId);
    if (!team) {
      return { success: false, message: "Team not found." };
    }

    // Verify current user is the team leader
    if (team.leaderId.toString() !== currentUser._id) {
      return {
        success: false,
        message: "Only the team leader can reject requests.",
      };
    }

    // Update request status
    await JoinRequest.findByIdAndUpdate(requestId, {
      status: "REJECTED",
      rejectionReason: reason?.trim() || "",
      processedBy: currentUser._id,
      processedAt: new Date(),
    });

    revalidatePath("/teams/my-team");
    return { success: true, message: "Request rejected." };
  } catch (error) {
    console.error("Reject error:", error);
    return { success: false, message: "Failed to reject request." };
  }
}

// ============================================
// CANCEL JOIN REQUEST (Requester only)
// ============================================
export async function cancelJoinRequest(
  requestId: string,
): Promise<{ success: boolean; message: string }> {
  await connectDB();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: "You must be logged in." };
    }

    const request = await JoinRequest.findById(requestId);
    if (!request) {
      return { success: false, message: "Request not found." };
    }

    // Verify current user is the requester
    if (request.userId.toString() !== currentUser._id) {
      return {
        success: false,
        message: "You can only cancel your own requests.",
      };
    }

    if (request.status !== "PENDING") {
      return {
        success: false,
        message: "This request has already been processed.",
      };
    }

    await JoinRequest.findByIdAndDelete(requestId);

    revalidatePath("/teams");
    return { success: true, message: "Request cancelled." };
  } catch (error) {
    console.error("Cancel error:", error);
    return { success: false, message: "Failed to cancel request." };
  }
}

// ============================================
// GET MY PENDING REQUESTS
// ============================================
export async function getMyPendingRequests() {
  await connectDB();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, requests: [] };
    }

    const requests = await JoinRequest.find({
      userId: currentUser._id,
      status: "PENDING",
    })
      .populate("teamId", "name teamCode")
      .lean();

    return {
      success: true,
      requests: requests.map((r) => ({
        _id: r._id.toString(),
        teamId: r.teamId,
        status: r.status,
        message: r.message,
        createdAt: r.createdAt,
      })),
    };
  } catch (error) {
    console.error("Failed to get requests:", error);
    return { success: false, requests: [] };
  }
}
