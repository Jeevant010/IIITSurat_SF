// Avatar utility functions
// Shared avatar options matching the profile selection

export const AVATAR_OPTIONS = [
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

/**
 * Get avatar URL from avatarId or fallback to name-based avatar
 * @param avatarId - User's selected avatar ID (1-20)
 * @param name - Fallback: user's name for generating avatar
 * @returns URL string for the avatar image
 */
export function getAvatarUrl(avatarId: number | null | undefined, name?: string): string {
  // If user has selected an avatar, use it
  if (avatarId && avatarId >= 1 && avatarId <= 20) {
    const avatar = AVATAR_OPTIONS.find((a) => a.id === avatarId);
    if (avatar) {
      return `https://api.dicebear.com/7.x/${avatar.style}/svg?seed=${avatar.seed}`;
    }
  }
  
  // Fallback to name-based avatar or default
  const seed = name || "default";
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
}

/**
 * Get avatar URL by ID only
 */
export function getAvatarUrlById(avatarId: number): string {
  const avatar = AVATAR_OPTIONS.find((a) => a.id === avatarId);
  if (!avatar) {
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=default`;
  }
  return `https://api.dicebear.com/7.x/${avatar.style}/svg?seed=${avatar.seed}`;
}
