"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/mongodb";
import { Match, Team } from "@/lib/models";
import { getCurrentUser } from "@/lib/auth";
import type { MatchStage } from "@/lib/models/Match";

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
    const stage = (formData.get("stage") as MatchStage) || "KNOCKOUT";
    const round = parseInt(formData.get("round") as string);
    const matchNumber = parseInt(formData.get("matchNumber") as string);
    const team1Id = formData.get("team1Id") as string;
    const team2Id = formData.get("team2Id") as string;
    const scheduledAt = formData.get("scheduledAt") as string;

    await Match.create({
      tournamentName: "Spring Fiesta 2026",
      stage,
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
    const stage = (formData.get("stage") as MatchStage) || "KNOCKOUT";
    const round = parseInt(formData.get("round") as string);
    const matchNumber = parseInt(formData.get("matchNumber") as string);
    const team1Id = formData.get("team1Id") as string;
    const team2Id = formData.get("team2Id") as string;
    const team1Score = parseInt(formData.get("team1Score") as string) || 0;
    const team2Score = parseInt(formData.get("team2Score") as string) || 0;
    const team1Stars = parseInt(formData.get("team1Stars") as string) || 0;
    const team2Stars = parseInt(formData.get("team2Stars") as string) || 0;
    const status = formData.get("status") as string;
    const winnerId = formData.get("winnerId") as string;
    const scheduledAt = formData.get("scheduledAt") as string;

    const updateData: Record<string, unknown> = {
      stage,
      round,
      matchNumber,
      team1Id: team1Id && team1Id !== "tbd" ? team1Id : null,
      team2Id: team2Id && team2Id !== "tbd" ? team2Id : null,
      team1Score,
      team2Score,
      team1Stars,
      team2Stars,
      status,
      winnerId: winnerId && winnerId !== "none" ? winnerId : null,
      loserId: null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    };

    // Set loser ID if winner is set
    if (winnerId && winnerId !== "none") {
      updateData.loserId = winnerId === team1Id ? team2Id : team1Id;
    }

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
    const format = formData.get("format") as string;
    const teamCount = parseInt(formData.get("teamCount") as string);

    // Clear existing matches
    await Match.deleteMany({ tournamentName: "Spring Fiesta 2026" });

    if (format === "ipl") {
      // IPL-style format for 6-8 teams
      return await generateIPLBracket(teamCount);
    } else {
      // Simple knockout format
      return await generateKnockoutBracket(teamCount);
    }
  } catch (error) {
    console.error("Failed to generate bracket:", error);
    return { success: false, message: "Failed to generate bracket" };
  }
}

// IPL-style bracket: Groups + Qualifiers + Eliminators + Final
async function generateIPLBracket(teamCount: number) {
  const groupASize = Math.ceil(teamCount / 2);
  const groupBSize = Math.floor(teamCount / 2);

  let matchNumber = 1;
  const createdMatches: Record<string, string> = {};

  // Create knockout stage matches first (to get IDs for linking)
  // Final
  const finalMatch = await Match.create({
    tournamentName: "Spring Fiesta 2026",
    stage: "FINAL",
    round: 1,
    matchNumber: matchNumber++,
    status: "TBD",
    notes: "🏆 Championship Final",
  });
  createdMatches["FINAL"] = finalMatch._id.toString();

  // Qualifier 2 (winner goes to Final)
  const q2Match = await Match.create({
    tournamentName: "Spring Fiesta 2026",
    stage: "QUALIFIER_2",
    round: 1,
    matchNumber: matchNumber++,
    status: "TBD",
    nextMatchId: finalMatch._id,
    notes: "Qualifier 2 - Winner to Final",
  });
  createdMatches["Q2"] = q2Match._id.toString();

  // Qualifier 1 (winner to Final, loser to Q2)
  const q1Match = await Match.create({
    tournamentName: "Spring Fiesta 2026",
    stage: "QUALIFIER_1",
    round: 1,
    matchNumber: matchNumber++,
    status: "TBD",
    nextMatchId: finalMatch._id,
    loserNextMatchId: q2Match._id,
    notes: "Qualifier 1 - Winner to Final, Loser to Qualifier 2",
  });
  createdMatches["Q1"] = q1Match._id.toString();

  // Eliminator (winner to Q2)
  const eliminatorMatch = await Match.create({
    tournamentName: "Spring Fiesta 2026",
    stage: "ELIMINATOR",
    round: 1,
    matchNumber: matchNumber++,
    status: "TBD",
    nextMatchId: q2Match._id,
    notes: "Eliminator - Winner to Qualifier 2",
  });
  createdMatches["ELIMINATOR"] = eliminatorMatch._id.toString();

  // Group A round-robin matches
  const groupAMatchCount = (groupASize * (groupASize - 1)) / 2;
  for (let i = 0; i < groupAMatchCount; i++) {
    await Match.create({
      tournamentName: "Spring Fiesta 2026",
      stage: "GROUP_A",
      round: i + 1,
      matchNumber: matchNumber++,
      status: "TBD",
      notes: `Group A - Match ${i + 1}`,
    });
  }

  // Group B round-robin matches
  const groupBMatchCount = (groupBSize * (groupBSize - 1)) / 2;
  for (let i = 0; i < groupBMatchCount; i++) {
    await Match.create({
      tournamentName: "Spring Fiesta 2026",
      stage: "GROUP_B",
      round: i + 1,
      matchNumber: matchNumber++,
      status: "TBD",
      notes: `Group B - Match ${i + 1}`,
    });
  }

  revalidatePath("/admin/brackets");
  revalidatePath("/brackets");

  const totalMatches = matchNumber - 1;
  return {
    success: true,
    message: `Generated IPL-style bracket: ${groupAMatchCount} Group A + ${groupBMatchCount} Group B + 4 Playoff matches = ${totalMatches} total matches`,
  };
}

// Simple knockout bracket
async function generateKnockoutBracket(teamCount: number) {
  const rounds = Math.ceil(Math.log2(teamCount));
  let matchNumber = 1;

  for (let round = 1; round <= rounds; round++) {
    const matchesInRound = Math.pow(2, rounds - round);

    for (let i = 0; i < matchesInRound; i++) {
      await Match.create({
        tournamentName: "Spring Fiesta 2026",
        stage: "KNOCKOUT",
        round,
        matchNumber: matchNumber++,
        team1Id: null,
        team2Id: null,
        status: "TBD",
        notes:
          round === rounds
            ? "🏆 Final"
            : round === rounds - 1
              ? "Semi Final"
              : round === rounds - 2
                ? "Quarter Final"
                : `Round ${round}`,
      });
    }
  }

  revalidatePath("/admin/brackets");
  revalidatePath("/brackets");
  return {
    success: true,
    message: `Generated ${matchNumber - 1} knockout matches for ${teamCount}-team bracket`,
  };
}

// Helper to assign teams to groups (for IPL format)
export async function assignTeamsToGroups(
  groupATeamIds: string[],
  groupBTeamIds: string[],
) {
  await requireAdmin();
  await connectDB();

  try {
    // Get group matches
    const groupAMatches = await Match.find({
      tournamentName: "Spring Fiesta 2026",
      stage: "GROUP_A",
    }).sort({ matchNumber: 1 });

    const groupBMatches = await Match.find({
      tournamentName: "Spring Fiesta 2026",
      stage: "GROUP_B",
    }).sort({ matchNumber: 1 });

    // Generate round-robin pairings for Group A
    const groupAPairings = generateRoundRobinPairings(groupATeamIds);
    for (
      let i = 0;
      i < Math.min(groupAPairings.length, groupAMatches.length);
      i++
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (groupAMatches[i] as any).team1Id = groupAPairings[i][0];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (groupAMatches[i] as any).team2Id = groupAPairings[i][1];
      groupAMatches[i].status = "SCHEDULED";
      await groupAMatches[i].save();
    }

    // Generate round-robin pairings for Group B
    const groupBPairings = generateRoundRobinPairings(groupBTeamIds);
    for (
      let i = 0;
      i < Math.min(groupBPairings.length, groupBMatches.length);
      i++
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (groupBMatches[i] as any).team1Id = groupBPairings[i][0];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (groupBMatches[i] as any).team2Id = groupBPairings[i][1];
      groupBMatches[i].status = "SCHEDULED";
      await groupBMatches[i].save();
    }

    revalidatePath("/admin/brackets");
    revalidatePath("/brackets");
    return { success: true, message: "Teams assigned to groups" };
  } catch (error) {
    console.error("Failed to assign teams to groups:", error);
    return { success: false, message: "Failed to assign teams" };
  }
}

// Generate round-robin pairings
function generateRoundRobinPairings(teamIds: string[]): [string, string][] {
  const pairings: [string, string][] = [];
  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      pairings.push([teamIds[i], teamIds[j]]);
    }
  }
  return pairings;
}

// Helper to assign teams to first round matches (for knockout format)
export async function assignTeamsToFirstRound(teamIds: string[]) {
  await requireAdmin();
  await connectDB();

  try {
    // Get first round matches
    const firstRoundMatches = await Match.find({
      tournamentName: "Spring Fiesta 2026",
      stage: "KNOCKOUT",
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

// Get group standings
export async function getGroupStandings() {
  await connectDB();

  try {
    const groupMatches = await Match.find({
      tournamentName: "Spring Fiesta 2026",
      stage: { $in: ["GROUP_A", "GROUP_B"] },
      status: "COMPLETED",
    }).populate("team1Id team2Id winnerId");

    // Calculate standings
    const standings: Record<
      string,
      {
        teamId: string;
        teamName: string;
        group: string;
        played: number;
        won: number;
        lost: number;
        stars: number;
        points: number;
      }
    > = {};

    for (const match of groupMatches) {
      const group = match.stage === "GROUP_A" ? "A" : "B";
      const team1 = match.team1Id as { _id: string; name: string };
      const team2 = match.team2Id as { _id: string; name: string };

      // Initialize teams if needed
      if (team1 && !standings[team1._id.toString()]) {
        standings[team1._id.toString()] = {
          teamId: team1._id.toString(),
          teamName: team1.name,
          group,
          played: 0,
          won: 0,
          lost: 0,
          stars: 0,
          points: 0,
        };
      }
      if (team2 && !standings[team2._id.toString()]) {
        standings[team2._id.toString()] = {
          teamId: team2._id.toString(),
          teamName: team2.name,
          group,
          played: 0,
          won: 0,
          lost: 0,
          stars: 0,
          points: 0,
        };
      }

      // Update stats
      if (team1) {
        standings[team1._id.toString()].played++;
        standings[team1._id.toString()].stars += match.team1Stars || 0;
        if (match.winnerId?.toString() === team1._id.toString()) {
          standings[team1._id.toString()].won++;
          standings[team1._id.toString()].points += 2;
        } else {
          standings[team1._id.toString()].lost++;
        }
      }
      if (team2) {
        standings[team2._id.toString()].played++;
        standings[team2._id.toString()].stars += match.team2Stars || 0;
        if (match.winnerId?.toString() === team2._id.toString()) {
          standings[team2._id.toString()].won++;
          standings[team2._id.toString()].points += 2;
        } else {
          standings[team2._id.toString()].lost++;
        }
      }
    }

    // Sort by points, then stars
    const groupA = Object.values(standings)
      .filter((s) => s.group === "A")
      .sort((a, b) => b.points - a.points || b.stars - a.stars);
    const groupB = Object.values(standings)
      .filter((s) => s.group === "B")
      .sort((a, b) => b.points - a.points || b.stars - a.stars);

    return { success: true, groupA, groupB };
  } catch (error) {
    console.error("Failed to get standings:", error);
    return { success: false, groupA: [], groupB: [] };
  }
}
