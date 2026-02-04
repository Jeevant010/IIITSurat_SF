"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/mongodb";
import { Match, Team } from "@/lib/models";
import { getCurrentUser } from "@/lib/auth";

// ============================================
// ADMIN AUTH CHECK - All bracket actions MUST call this first
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

export async function createMatch(formData: FormData) {
  await requireAdmin();
  await connectDB();

  try {
    const round = parseInt(formData.get("round") as string);
    const matchNumber = parseInt(formData.get("matchNumber") as string);
    const team1Id = formData.get("team1Id") as string;
    const team2Id = formData.get("team2Id") as string;
    const scheduledAt = formData.get("scheduledAt") as string;

    await Match.create({
      tournamentName: "Spring Fiesta 2026",
      round,
      matchNumber,
      team1Id: team1Id && team1Id !== "tbd" ? team1Id : null,
      team2Id: team2Id && team2Id !== "tbd" ? team2Id : null,
      status: "TBD",
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    });

    revalidatePath("/admin/brackets");
    revalidatePath("/brackets");
    return { success: true, message: "Match created successfully" };
  } catch (error) {
    console.error("Failed to create match:", error);
    return { success: false, message: "Failed to create match" };
  }
}

export async function updateMatch(matchId: string, formData: FormData) {
  await requireAdmin();
  await connectDB();

  try {
    const round = parseInt(formData.get("round") as string);
    const matchNumber = parseInt(formData.get("matchNumber") as string);
    const team1Id = formData.get("team1Id") as string;
    const team2Id = formData.get("team2Id") as string;
    const team1Score = parseInt(formData.get("team1Score") as string) || 0;
    const team2Score = parseInt(formData.get("team2Score") as string) || 0;
    const status = formData.get("status") as string;
    const winnerId = formData.get("winnerId") as string;
    const scheduledAt = formData.get("scheduledAt") as string;

    const updateData: Record<string, unknown> = {
      round,
      matchNumber,
      team1Id: team1Id && team1Id !== "tbd" ? team1Id : null,
      team2Id: team2Id && team2Id !== "tbd" ? team2Id : null,
      team1Score,
      team2Score,
      status,
      winnerId: winnerId && winnerId !== "none" ? winnerId : null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    };

    // If match is completed, set completedAt
    if (status === "COMPLETED") {
      updateData.completedAt = new Date();

      // Update team stats if there's a winner
      if (winnerId && winnerId !== "none") {
        const loserId = winnerId === team1Id ? team2Id : team1Id;

        // Increment winner's wins
        await Team.findByIdAndUpdate(winnerId, {
          $inc: { wins: 1, score: 10 },
        });

        // Increment loser's losses
        if (loserId && loserId !== "tbd") {
          await Team.findByIdAndUpdate(loserId, { $inc: { losses: 1 } });
        }
      }
    }

    await Match.findByIdAndUpdate(matchId, updateData);

    revalidatePath("/admin/brackets");
    revalidatePath("/brackets");
    revalidatePath("/leaderboard");
    return { success: true, message: "Match updated successfully" };
  } catch (error) {
    console.error("Failed to update match:", error);
    return { success: false, message: "Failed to update match" };
  }
}

export async function deleteMatch(matchId: string) {
  await requireAdmin();
  await connectDB();

  try {
    await Match.findByIdAndDelete(matchId);

    revalidatePath("/admin/brackets");
    revalidatePath("/brackets");
    return { success: true, message: "Match deleted successfully" };
  } catch (error) {
    console.error("Failed to delete match:", error);
    return { success: false, message: "Failed to delete match" };
  }
}

export async function generateBracket(formData: FormData) {
  await requireAdmin();
  await connectDB();

  try {
    const teamCount = parseInt(formData.get("teamCount") as string);

    // Clear existing matches
    await Match.deleteMany({ tournamentName: "Spring Fiesta 2026" });

    // Calculate number of rounds
    const rounds = Math.log2(teamCount);

    let matchNumber = 1;

    for (let round = 1; round <= rounds; round++) {
      const matchesInRound = teamCount / Math.pow(2, round);

      for (let i = 0; i < matchesInRound; i++) {
        await Match.create({
          tournamentName: "Spring Fiesta 2026",
          round,
          matchNumber: matchNumber++,
          team1Id: null,
          team2Id: null,
          status: "TBD",
        });
      }
    }

    revalidatePath("/admin/brackets");
    revalidatePath("/brackets");
    return {
      success: true,
      message: `Generated ${matchNumber - 1} matches for ${teamCount}-team bracket`,
    };
  } catch (error) {
    console.error("Failed to generate bracket:", error);
    return { success: false, message: "Failed to generate bracket" };
  }
}

// Helper to assign teams to first round matches
export async function assignTeamsToFirstRound(teamIds: string[]) {
  await requireAdmin();
  await connectDB();

  try {
    // Get first round matches
    const firstRoundMatches = await Match.find({
      tournamentName: "Spring Fiesta 2026",
      round: 1,
    }).sort({ matchNumber: 1 });

    // Shuffle teams for random seeding
    const shuffledTeams = [...teamIds].sort(() => Math.random() - 0.5);

    // Assign teams to matches
    let teamIndex = 0;
    for (const match of firstRoundMatches) {
      if (teamIndex < shuffledTeams.length) {
        match.team1Id = shuffledTeams[
          teamIndex++
        ] as unknown as typeof match.team1Id;
      }
      if (teamIndex < shuffledTeams.length) {
        match.team2Id = shuffledTeams[
          teamIndex++
        ] as unknown as typeof match.team2Id;
      }

      // Update status if both teams assigned
      if (match.team1Id && match.team2Id) {
        match.status = "SCHEDULED";
      }

      await match.save();
    }

    revalidatePath("/admin/brackets");
    revalidatePath("/brackets");
    return { success: true, message: "Teams assigned to bracket" };
  } catch (error) {
    console.error("Failed to assign teams:", error);
    return { success: false, message: "Failed to assign teams" };
  }
}
