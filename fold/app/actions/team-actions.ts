"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Team from "@/lib/models/Team";

// This type matches the form data we expect
export async function createTeam(formData: FormData): Promise<void> {
  await connectDB();

  // 1. Get raw data from the form
  const teamName = formData.get("teamName") as string;
  const teamTag = formData.get("teamTag") as string; // e.g. "DRAGON"
  const description = formData.get("description") as string;

  // TODO: In a real app, get the current user ID from Auth (Clerk)
  // For now, we will HARDCODE a dummy user ID to make it work immediately for testing
  // You MUST replace this later with `auth().userId`
  const dummyUserId = "user_123_test";

  if (!teamName || teamName.length < 3) {
    throw new Error("Team name must be at least 3 characters.");
  }

  try {
    // 2. First, ensure the User exists (Mocking a login)
    // We upsert (update or insert) to make sure our dummy user is in the DB
    let user = await User.findOne({ email: "test@iiitsurat.ac.in" });

    if (!user) {
      user = await User.create({
        _id: dummyUserId,
        email: "test@iiitsurat.ac.in",
        name: "Test Captain",
        role: "USER",
      });
    }

    // 3. Create the Team in the Database
    const newTeam = await Team.create({
      name: teamName,
      teamCode:
        teamTag.toUpperCase() + "-" + Math.floor(1000 + Math.random() * 9000), // e.g. DRAGON-4821
      leaderId: user._id,
      description: description || "",
    });

    // 4. Update the User to link them to this team
    await User.findByIdAndUpdate(user._id, {
      teamId: newTeam._id,
      teamRole: "LEADER", // Creator is always the leader
    });
  } catch (error) {
    console.error("Failed to create team:", error);
    throw new Error("Team name already taken or database error.");
  }

  // 5. Redirect to the new team dashboard
  revalidatePath("/teams");
  redirect("/teams/my-team");
}
