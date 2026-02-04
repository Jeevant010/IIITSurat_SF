"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Gamepad2,
  User,
  Hash,
  Phone,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { completeProfile } from "@/app/actions/profile-actions";
import { AuthUser } from "@/lib/auth";

interface Props {
  user: AuthUser;
}

export function CompleteProfileForm({ user }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    const result = await completeProfile(formData);

    if (result.success) {
      router.push("/teams");
    } else {
      setError(result.message);
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-lg relative z-10 space-y-6">
      {/* Welcome Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-purple-400">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-medium">
            Welcome to Spring Fiesta 2026!
          </span>
          <Sparkles className="w-5 h-5" />
        </div>
        <h1 className="text-3xl font-bold text-white">Complete Your Profile</h1>
        <p className="text-zinc-400">
          Just a few more details to get you battle-ready
        </p>
      </div>

      {/* Profile Card */}
      <Card className="border-purple-500/20 bg-zinc-950/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4">
            <Avatar className="w-20 h-20 border-4 border-purple-500/50">
              <AvatarImage src={user.avatarUrl || ""} />
              <AvatarFallback className="bg-purple-600 text-white text-xl">
                {user.name?.charAt(0)?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-xl text-white">{user.name}</CardTitle>
          <CardDescription className="text-zinc-400">
            {user.email}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form action={handleSubmit} className="space-y-5">
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
                defaultValue={user.name}
                placeholder="Your display name"
                className="bg-zinc-900 border-zinc-700 text-white focus:border-purple-500"
              />
            </div>

            {/* In-Game Name (Required) */}
            <div className="space-y-2">
              <Label
                htmlFor="ign"
                className="text-zinc-300 flex items-center gap-2"
              >
                <Gamepad2 className="w-4 h-4" />
                In-Game Name (IGN) *
              </Label>
              <Input
                id="ign"
                name="ign"
                required
                minLength={2}
                maxLength={50}
                placeholder="e.g., ShadowHunter, ProGamer123"
                className="bg-zinc-900 border-zinc-700 text-white focus:border-purple-500"
              />
              <p className="text-xs text-zinc-500">
                This is the name others will see in competitions
              </p>
            </div>

            {/* Roll Number */}
            <div className="space-y-2">
              <Label
                htmlFor="rollNumber"
                className="text-zinc-300 flex items-center gap-2"
              >
                <Hash className="w-4 h-4" />
                Roll Number (Optional)
              </Label>
              <Input
                id="rollNumber"
                name="rollNumber"
                placeholder="e.g., 2023001"
                className="bg-zinc-900 border-zinc-700 text-white focus:border-purple-500"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-zinc-300 flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Phone Number (Optional)
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="e.g., 9876543210"
                className="bg-zinc-900 border-zinc-700 text-white focus:border-purple-500"
              />
              <p className="text-xs text-zinc-500">For event notifications</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-lg rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  Continue to Teams
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
