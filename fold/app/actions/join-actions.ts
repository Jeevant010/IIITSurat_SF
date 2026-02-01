"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Team from "@/lib/models/Team";
import JoinRequest from "@/lib/models/JoinRequest";

export async function requestToJoinTeam(teamId: string) {
  await connectDB();

  // 1. MOCK AUTH (Replace with Clerk auth().userId later)
  // We use a different ID here to simulate "Player 2" requesting to join "Player 1's" team
  // For testing, change this ID if you want to be a different user
  const currentUserId = "user_456_player2";

  try {
    // 2. Mock User Creation (Ensure Player 2 exists in DB for testing)
    let user = await User.findOne({ _id: currentUserId });

    if (!user) {
      user = await User.create({
        _id: currentUserId,
        email: "player2@iiitsurat.ac.in",
        name: "Player Two",
        role: "USER",
      });
    }

    // 3. Validation Checks
    // Check if user is already in a team
    if (user.teamId) {
      return { success: false, message: "You are already in a team!" };
    }

    // Check if they already sent a request to THIS team
    const existingRequest = await JoinRequest.findOne({
      userId: currentUserId,
      teamId: teamId,
      status: "PENDING",
    });

    if (existingRequest) {
      return {
        success: false,
        message: "Request already sent. Wait for leader.",
      };
    }

    // 4. Create the Request
    await JoinRequest.create({
      userId: currentUserId,
      teamId: teamId,
      status: "PENDING",
    });

    revalidatePath("/teams");
    return {
      success: true,
      message: "Request sent! Waiting for Captain approval.",
    };
  } catch (error) {
    console.error("Join Error:", error);
    return { success: false, message: "Failed to send request." };
  }
}

// Leader approves join request
export async function approveJoinRequest(requestId: string) {
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
      return { success: false, message: "Team is full (max 5 members)" };
    }

    // Add user to team
    await User.findByIdAndUpdate(request.userId, {
      teamId: request.teamId,
      teamRole: "MEMBER",
    });

    // Delete this request
    await JoinRequest.findByIdAndDelete(requestId);

    // Delete other pending requests from this user
    await JoinRequest.deleteMany({ userId: request.userId });

    revalidatePath("/teams/my-team");
    return { success: true, message: "Player added to team!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to approve request" };
  }
}

// Leader rejects join request
export async function rejectJoinRequest(requestId: string) {
  await connectDB();

  try {
    await JoinRequest.findByIdAndDelete(requestId);

    revalidatePath("/teams/my-team");
    return { success: true, message: "Request rejected" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to reject request" };
  }
}
