"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/mongodb";
import { User } from "@/lib/models";
import { getCurrentUser } from "@/lib/auth";

export async function completeProfile(formData: FormData) {
  await connectDB();

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, message: "Not authenticated" };
  }

  const ign = formData.get("ign") as string;
  const rollNumber = formData.get("rollNumber") as string;
  const phone = formData.get("phone") as string;
  const name = formData.get("name") as string;

  // Validation
  if (!ign || ign.trim().length < 2) {
    return {
      success: false,
      message: "In-Game Name must be at least 2 characters",
    };
  }

  try {
    await User.findByIdAndUpdate(currentUser._id, {
      ign: ign.trim(),
      rollNumber: rollNumber?.trim() || null,
      phone: phone?.trim() || null,
      name: name?.trim() || currentUser.name,
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
  const rollNumber = formData.get("rollNumber") as string;
  const phone = formData.get("phone") as string;
  const name = formData.get("name") as string;

  try {
    await User.findByIdAndUpdate(currentUser._id, {
      ...(ign && { ign: ign.trim() }),
      ...(rollNumber !== undefined && {
        rollNumber: rollNumber.trim() || null,
      }),
      ...(phone !== undefined && { phone: phone.trim() || null }),
      ...(name && { name: name.trim() }),
    });

    revalidatePath("/profile");
    return { success: true, message: "Profile updated!" };
  } catch (error) {
    console.error("Profile update error:", error);
    return { success: false, message: "Failed to update profile" };
  }
}
