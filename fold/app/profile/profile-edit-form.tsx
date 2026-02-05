"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Check, Loader2 } from "lucide-react";
import { updateProfile } from "@/app/actions/profile-actions";
import { AVATAR_OPTIONS, getAvatarUrlById } from "@/lib/avatar";

interface ProfileEditFormProps {
  user: {
    _id: string;
    name: string;
    email: string;
    ign: string | null;
    townHall: number | null;
    rollNumber: string | null;
    playerTag: string | null;
    phone: string | null;
    avatarId: number | null;
  };
}

export function ProfileEditForm({ user }: ProfileEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<number>(
    user.avatarId || 1,
  );
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    toast.loading("Saving changes...", { id: "profile-update" });

    // Add selected avatar to form data
    formData.set("avatarId", selectedAvatar.toString());

    const result = await updateProfile(formData);

    if (result.success) {
      toast.success("Profile Updated! ✓", {
        id: "profile-update",
        description: "Your changes have been saved.",
      });
      router.refresh();
    } else {
      toast.error("Failed to update profile", {
        id: "profile-update",
        description: result.message,
      });
    }
    setLoading(false);
  }

  return (
    <Card className="border-purple-500/20 bg-zinc-950/80 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <Edit className="w-5 h-5" />
          Edit Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          {/* Avatar Selection */}
          <div className="space-y-3">
            <Label className="text-zinc-300">Profile Avatar</Label>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-4 border-purple-500/50">
                <AvatarImage src={getAvatarUrlById(selectedAvatar)} />
                <AvatarFallback className="bg-purple-600 text-white text-xl">
                  {user.name?.charAt(0)?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
              >
                {showAvatarPicker ? "Hide Avatars" : "Change Avatar"}
              </Button>
            </div>

            {/* Avatar Grid */}
            {showAvatarPicker && (
              <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <p className="text-xs text-zinc-500 mb-3">
                  Choose your avatar (click to select):
                </p>
                <div className="grid grid-cols-10 gap-2">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar.id)}
                      className={`relative w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${
                        selectedAvatar === avatar.id
                          ? "border-purple-500 ring-2 ring-purple-500/50 scale-110"
                          : "border-zinc-700 hover:border-zinc-500"
                      }`}
                    >
                      <img
                        src={getAvatarUrlById(avatar.id)}
                        alt={`Avatar ${avatar.id}`}
                        className="w-full h-full"
                      />
                      {selectedAvatar === avatar.id && (
                        <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Hidden avatar field */}
            <input type="hidden" name="avatarId" value={selectedAvatar} />
          </div>

          {/* Form Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-300">
                Display Name
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={user.name}
                className="bg-zinc-900 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ign" className="text-zinc-300">
                In-Game Name
              </Label>
              <Input
                id="ign"
                name="ign"
                defaultValue={user.ign || ""}
                className="bg-zinc-900 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="townHall" className="text-zinc-300">
                Town Hall Level
              </Label>
              <select
                id="townHall"
                name="townHall"
                title="Select your Town Hall level"
                defaultValue={user.townHall || ""}
                className="w-full h-10 px-3 bg-zinc-900 border border-zinc-700 text-white rounded-md"
              >
                <option value="">Select TH</option>
                {[...Array(18)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    TH {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rollNumber" className="text-zinc-300">
                Roll Number
              </Label>
              <Input
                id="rollNumber"
                name="rollNumber"
                defaultValue={user.rollNumber || ""}
                className="bg-zinc-900 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="playerTag" className="text-zinc-300">
                Player Tag
              </Label>
              <Input
                id="playerTag"
                name="playerTag"
                placeholder="#ABC123XYZ"
                defaultValue={user.playerTag || ""}
                className="bg-zinc-900 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-zinc-300">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={user.phone || ""}
                className="bg-zinc-900 border-zinc-700 text-white"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
