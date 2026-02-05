"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/mongodb";
import { User } from "@/lib/models";
import { getCurrentUser } from "@/lib/auth";
import { canPlayerJoinTeam, getTHCounts } from "@/lib/th-validation";

export async function completeProfile(formData: FormData) {
  await connectDB();

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, message: "Not authenticated" };
  }

  const ign = formData.get("ign") as string;
  const playerTag = formData.get("playerTag") as string;
  const rollNumber = formData.get("rollNumber") as string;
  const phone = formData.get("phone") as string;
  const name = formData.get("name") as string;
  const townHallStr = formData.get("townHall") as string;
  const townHall = townHallStr ? parseInt(townHallStr) : null;
  const avatarIdStr = formData.get("avatarId") as string;
  const avatarId = avatarIdStr ? parseInt(avatarIdStr) : null;

  // Validation
  if (!ign || ign.trim().length < 2) {
    return {
      success: false,
      message: "In-Game Name must be at least 2 characters",
    };
  }

  if (townHall !== null && (townHall < 1 || townHall > 18)) {
    return {
      success: false,
      message: "Town Hall must be between 1 and 18",
    };
  }

  try {
    await User.findByIdAndUpdate(currentUser._id, {
      ign: ign.trim(),
      playerTag: playerTag?.trim() || null,
      rollNumber: rollNumber?.trim() || null,
      phone: phone?.trim() || null,
      name: name?.trim() || currentUser.name,
      townHall: townHall,
      avatarId: avatarId,
      isProfileComplete: true,
    });

    revalidatePath("/");
    revalidatePath("/profile");
    return { success: true, message: "Profile completed!" };
  } catch (error) {
    console.error("Profile update error:", error);
    return { success: false, message: "Failed to update profile" };
  }
}

export async function updateProfile(formData: FormData) {
  await connectDB();

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, message: "Not authenticated" };
  }

  const ign = formData.get("ign") as string;
  const playerTag = formData.get("playerTag") as string;
  const rollNumber = formData.get("rollNumber") as string;
  const phone = formData.get("phone") as string;
  const name = formData.get("name") as string;
  const townHallStr = formData.get("townHall") as string;
  const townHall = townHallStr ? parseInt(townHallStr) : null;
  const avatarIdStr = formData.get("avatarId") as string;
  const avatarId = avatarIdStr ? parseInt(avatarIdStr) : null;

  try {
    // If user is in a team and trying to change TH to a higher level, validate it
    if (townHall !== null && currentUser.teamId && townHall >= 15) {
      const user = await User.findById(currentUser._id);
      const currentTH = user?.townHall || 0;
      
      // Only validate if changing to a HIGHER TH level (upgrading)
      if (townHall > currentTH) {
        // Get other team members (excluding self)
        const teamMembers = await User.find({ 
          teamId: currentUser.teamId,
          _id: { $ne: currentUser._id }
        }).select("townHall").lean();
        
        const thCounts = getTHCounts(teamMembers);
        const validation = canPlayerJoinTeam(townHall, thCounts);
        
        if (!validation.allowed) {
          return {
            success: false,
            message: `Cannot upgrade to TH ${townHall} while in this team. ${validation.reason}`,
          };
        }
      }
    }

    await User.findByIdAndUpdate(currentUser._id, {
      ...(ign && { ign: ign.trim() }),
      ...(playerTag !== undefined && { playerTag: playerTag.trim() || null }),
      ...(rollNumber !== undefined && {
        rollNumber: rollNumber.trim() || null,
      }),
      ...(phone !== undefined && { phone: phone.trim() || null }),
      ...(name && { name: name.trim() }),
      ...(townHall !== null && { townHall }),
      ...(avatarId !== null && { avatarId }),
    });

    // Revalidate all paths where user data appears
    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    revalidatePath("/teams");
    revalidatePath("/teams/my-team");
    revalidatePath("/leaderboard");
    
    return { success: true, message: "Profile updated!" };
  } catch (error) {
    console.error("Profile update error:", error);
    return { success: false, message: "Failed to update profile" };
  }
}
