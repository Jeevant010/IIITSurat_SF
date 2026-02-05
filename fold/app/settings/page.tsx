import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Settings,
  User,
  Shield,
  LogOut,
  Mail,
  Gamepad2,
  Hash,
  Save,
} from "lucide-react";
import { signOut } from "@/auth";
import { revalidatePath } from "next/cache";
import connectDB from "@/lib/mongodb";
import { User as UserModel } from "@/lib/models";
import { getAvatarUrl } from "@/lib/avatar";

export const dynamic = "force-dynamic";

async function updateSettings(formData: FormData) {
  "use server";

  const { getCurrentUser } = await import("@/lib/auth");
  const user = await getCurrentUser();
  if (!user) return;

  await connectDB();

  const name = formData.get("name") as string;
  const ign = formData.get("ign") as string;
  const phone = formData.get("phone") as string;

  await UserModel.findByIdAndUpdate(user._id, {
    name: name || user.name,
    ign: ign || null,
    phone: phone || null,
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/profile");
}

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-purple-400" />
            Settings
          </h1>
          <p className="text-zinc-400 mt-1">Manage your account preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card className="border-purple-500/20 bg-zinc-950/80">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" />
                Profile Settings
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateSettings} className="space-y-6">
                {/* Current Profile */}
                <div className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-lg">
                  <Avatar className="w-16 h-16 border-2 border-purple-500/50">
                    <AvatarImage
                      src={getAvatarUrl(currentUser.avatarId, currentUser.name)}
                    />
                    <AvatarFallback className="bg-purple-600 text-white text-xl">
                      {currentUser.name?.charAt(0)?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-white">
                      {currentUser.name}
                    </p>
                    <p className="text-zinc-400 text-sm">{currentUser.email}</p>
                    <div className="flex gap-2 mt-1">
                      {currentUser.role === "ADMIN" && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                          Admin
                        </Badge>
                      )}
                      {currentUser.teamRole === "LEADER" && (
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                          Team Leader
                        </Badge>
                      )}
                    </div>
                  </div>
                  <a
                    href="/profile"
                    className="text-purple-400 hover:text-purple-300 text-sm underline"
                  >
                    Change Avatar
                  </a>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Display Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-zinc-300 flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Display Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={currentUser.name}
                      className="bg-zinc-900 border-zinc-700 text-white"
                      placeholder="Your display name"
                    />
                  </div>

                  {/* Email (Read-only) */}
                  <div className="space-y-2">
                    <Label className="text-zinc-300 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input
                      value={currentUser.email}
                      disabled
                      className="bg-zinc-900/50 border-zinc-800 text-zinc-500"
                    />
                    <p className="text-xs text-zinc-600">
                      Email cannot be changed
                    </p>
                  </div>

                  {/* In-Game Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="ign"
                      className="text-zinc-300 flex items-center gap-2"
                    >
                      <Gamepad2 className="w-4 h-4" />
                      In-Game Name (IGN)
                    </Label>
                    <Input
                      id="ign"
                      name="ign"
                      defaultValue={currentUser.ign || ""}
                      className="bg-zinc-900 border-zinc-700 text-white"
                      placeholder="Your gaming name"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-zinc-300 flex items-center gap-2"
                    >
                      <Hash className="w-4 h-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue={currentUser.phone || ""}
                      className="bg-zinc-900 border-zinc-700 text-white"
                      placeholder="Your phone number"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="border-purple-500/20 bg-zinc-950/80">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 bg-zinc-900/50 rounded-lg">
                  <p className="text-zinc-500 text-sm">Roll Number</p>
                  <p className="text-white font-mono">
                    {currentUser.rollNumber || "Not set"}
                  </p>
                </div>
                <div className="p-4 bg-zinc-900/50 rounded-lg">
                  <p className="text-zinc-500 text-sm">Account Type</p>
                  <p className="text-white">Google Account</p>
                </div>
                <div className="p-4 bg-zinc-900/50 rounded-lg">
                  <p className="text-zinc-500 text-sm">Team Status</p>
                  <p className="text-white">
                    {currentUser.teamId ? "In a Team" : "No Team"}
                  </p>
                </div>
                <div className="p-4 bg-zinc-900/50 rounded-lg">
                  <p className="text-zinc-500 text-sm">Account Status</p>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-500/20 bg-zinc-950/80">
            <CardHeader>
              <CardTitle className="text-xl text-red-400 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-zinc-500">
                Irreversible actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button
                  type="submit"
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
