"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  Castle,
  Tag,
  Check,
} from "lucide-react";
import { completeProfile } from "@/app/actions/profile-actions";
import { AuthUser } from "@/lib/auth";

// Predefined avatar options (using DiceBear API with different seeds)
const AVATAR_OPTIONS = [
  { id: 1, seed: "warrior1", style: "adventurer" },
  { id: 2, seed: "mage2", style: "adventurer" },
  { id: 3, seed: "archer3", style: "adventurer" },
  { id: 4, seed: "knight4", style: "adventurer" },
  { id: 5, seed: "wizard5", style: "adventurer" },
  { id: 6, seed: "barbarian6", style: "adventurer" },
  { id: 7, seed: "ninja7", style: "adventurer" },
  { id: 8, seed: "dragon8", style: "adventurer" },
  { id: 9, seed: "golem9", style: "bottts" },
  { id: 10, seed: "pekka10", style: "bottts" },
  { id: 11, seed: "hog11", style: "avataaars" },
  { id: 12, seed: "witch12", style: "avataaars" },
  { id: 13, seed: "giant13", style: "avataaars" },
  { id: 14, seed: "healer14", style: "avataaars" },
  { id: 15, seed: "lava15", style: "fun-emoji" },
  { id: 16, seed: "electro16", style: "fun-emoji" },
  { id: 17, seed: "ice17", style: "lorelei" },
  { id: 18, seed: "inferno18", style: "lorelei" },
  { id: 19, seed: "royal19", style: "micah" },
  { id: 20, seed: "legend20", style: "micah" },
];

function getAvatarUrl(avatarId: number): string {
  const avatar = AVATAR_OPTIONS.find((a) => a.id === avatarId);
  if (!avatar) return `https://api.dicebear.com/7.x/adventurer/svg?seed=default`;
  return `https://api.dicebear.com/7.x/${avatar.style}/svg?seed=${avatar.seed}`;
}

interface Props {
  user: AuthUser;
}

export function CompleteProfileForm({ user }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<number>(user.avatarId || 1);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    toast.loading("Saving your profile...", { id: "profile-save" });

    // Add selected avatar to form data
    formData.set("avatarId", selectedAvatar.toString());

    const result = await completeProfile(formData);

    if (result.success) {
      toast.success("Profile Complete! 🎮", {
        id: "profile-save",
        description: "Welcome to Spring Fiesta 2026! Let's find you a team.",
      });
      router.push("/teams");
    } else {
      setError(result.message);
      toast.error("Failed to save profile", {
        id: "profile-save",
        description: result.message,
      });
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
          {/* Avatar Selection */}
          <div className="mx-auto mb-4">
            <Avatar className="w-24 h-24 border-4 border-purple-500/50">
              <AvatarImage src={getAvatarUrl(selectedAvatar)} />
              <AvatarFallback className="bg-purple-600 text-white text-xl">
                {user.name?.charAt(0)?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-xl text-white">{user.name}</CardTitle>
          <CardDescription className="text-zinc-400">
            {user.email}
          </CardDescription>
          
          {/* Avatar Grid */}
          <div className="mt-4">
            <p className="text-xs text-zinc-500 mb-2">Choose your avatar:</p>
            <div className="grid grid-cols-10 gap-1.5 max-h-24 overflow-y-auto p-1">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`relative w-8 h-8 rounded-full overflow-hidden border-2 transition-all ${
                    selectedAvatar === avatar.id
                      ? "border-purple-500 ring-2 ring-purple-500/50 scale-110"
                      : "border-zinc-700 hover:border-zinc-500"
                  }`}
                >
                  <img
                    src={getAvatarUrl(avatar.id)}
                    alt={`Avatar ${avatar.id}`}
                    className="w-full h-full"
                  />
                  {selectedAvatar === avatar.id && (
                    <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form action={handleSubmit} className="space-y-5">
            {/* Hidden avatar field */}
            <input type="hidden" name="avatarId" value={selectedAvatar} />
            
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

            {/* Player Tag (Optional) */}
            <div className="space-y-2">
              <Label
                htmlFor="playerTag"
                className="text-zinc-300 flex items-center gap-2"
              >
                <Tag className="w-4 h-4" />
                Player Tag (Optional)
              </Label>
              <Input
                id="playerTag"
                name="playerTag"
                maxLength={15}
                placeholder="e.g., #ABC123XYZ"
                className="bg-zinc-900 border-zinc-700 text-white focus:border-purple-500"
              />
              <p className="text-xs text-zinc-500">
                Your Clash of Clans player tag (found in profile)
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

            {/* Town Hall Level */}
            <div className="space-y-2">
              <Label
                htmlFor="townHall"
                className="text-zinc-300 flex items-center gap-2"
              >
                <Castle className="w-4 h-4" />
                Town Hall Level *
              </Label>
              <select
                id="townHall"
                name="townHall"
                required
                className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 text-white rounded-md focus:border-purple-500 focus:outline-none"
              >
                <option value="">Select your TH level</option>
                {[...Array(18)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    TH {i + 1}
                  </option>
                ))}
              </select>
              <p className="text-xs text-zinc-500">
                Your current Town Hall level in Clash of Clans
              </p>
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
