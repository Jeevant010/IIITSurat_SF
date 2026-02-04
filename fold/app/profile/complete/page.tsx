import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { CompleteProfileForm } from "./complete-profile-form";

export default async function CompleteProfilePage() {
  const user = await getCurrentUser();

  // Not logged in? Go to login
  if (!user) {
    redirect("/login");
  }

  // Already complete? Go to teams
  if (user.isProfileComplete) {
    redirect("/teams");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-black via-purple-950 to-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-purple-600/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-pink-600/20 rounded-full blur-3xl" />

      <CompleteProfileForm user={user} />
    </div>
  );
}
