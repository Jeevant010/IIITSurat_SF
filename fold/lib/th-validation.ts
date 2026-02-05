/**
 * Town Hall Restriction Validation
 * 
 * Rules:
 * - TH 18: Max 1 player per team
 * - TH 17: Max 1 player (can be 2 if no TH 18 in team)
 * - TH 16: Max 1 player (cascading slots from TH 17, 18)
 * - TH 15: Max 1 player (cascading slots from TH 16, 17, 18)
 * - TH 14 and below: Unlimited
 * 
 * The pattern: Each high TH level (15-18) has 1 "slot".
 * If a higher TH slot is unused, it cascades down to the next level.
 */

interface THCounts {
  th18: number;
  th17: number;
  th16: number;
  th15: number;
}

/**
 * Calculate how many slots are available for each restricted TH level
 */
function calculateAvailableSlots(currentCounts: THCounts): THCounts {
  // Base slots: 1 for each level 15-18
  let th18Slots = 1;
  let th17Slots = 1;
  let th16Slots = 1;
  let th15Slots = 1;

  // Unused TH18 slots cascade to TH17
  const unusedTH18 = Math.max(0, th18Slots - currentCounts.th18);
  th17Slots += unusedTH18;

  // Unused TH17 slots (after TH17 players) cascade to TH16
  const unusedTH17 = Math.max(0, th17Slots - currentCounts.th17);
  th16Slots += unusedTH17;

  // Unused TH16 slots (after TH16 players) cascade to TH15
  const unusedTH16 = Math.max(0, th16Slots - currentCounts.th16);
  th15Slots += unusedTH16;

  return {
    th18: th18Slots,
    th17: th17Slots,
    th16: th16Slots,
    th15: th15Slots,
  };
}

/**
 * Check if a player with a given TH level can join a team
 * @param playerTH - The Town Hall level of the player wanting to join
 * @param currentCounts - Current count of TH 15-18 players in the team
 * @returns { allowed: boolean, reason?: string }
 */
export function canPlayerJoinTeam(
  playerTH: number | null | undefined,
  currentCounts: THCounts
): { allowed: boolean; reason?: string } {
  // If player has no TH set, they can't join (they need to complete profile)
  if (!playerTH) {
    return {
      allowed: false,
      reason: "Player must set their Town Hall level before joining a team.",
    };
  }

  // TH 14 and below: No restrictions
  if (playerTH <= 14) {
    return { allowed: true };
  }

  const availableSlots = calculateAvailableSlots(currentCounts);

  // Check based on player's TH level
  switch (playerTH) {
    case 18:
      if (currentCounts.th18 >= availableSlots.th18) {
        return {
          allowed: false,
          reason: `Team already has the maximum allowed TH 18 players (${availableSlots.th18}). Only 1 TH 18 player is allowed per team.`,
        };
      }
      break;

    case 17:
      if (currentCounts.th17 >= availableSlots.th17) {
        const extra = availableSlots.th17 > 1 ? ` (${availableSlots.th17 - 1} extra slot from unused TH 18)` : "";
        return {
          allowed: false,
          reason: `Team already has the maximum allowed TH 17 players (${availableSlots.th17})${extra}.`,
        };
      }
      break;

    case 16:
      if (currentCounts.th16 >= availableSlots.th16) {
        const extra = availableSlots.th16 > 1 ? ` (includes ${availableSlots.th16 - 1} cascaded slots from unused TH 17/18)` : "";
        return {
          allowed: false,
          reason: `Team already has the maximum allowed TH 16 players (${availableSlots.th16})${extra}.`,
        };
      }
      break;

    case 15:
      if (currentCounts.th15 >= availableSlots.th15) {
        const extra = availableSlots.th15 > 1 ? ` (includes ${availableSlots.th15 - 1} cascaded slots from unused TH 16/17/18)` : "";
        return {
          allowed: false,
          reason: `Team already has the maximum allowed TH 15 players (${availableSlots.th15})${extra}.`,
        };
      }
      break;
  }

  return { allowed: true };
}

/**
 * Get the current TH counts for a team from an array of members
 * @param members - Array of team members with townHall property
 */
export function getTHCounts(members: Array<{ townHall?: number | null }>): THCounts {
  return {
    th18: members.filter((m) => m.townHall === 18).length,
    th17: members.filter((m) => m.townHall === 17).length,
    th16: members.filter((m) => m.townHall === 16).length,
    th15: members.filter((m) => m.townHall === 15).length,
  };
}

/**
 * Get a human-readable summary of TH restrictions for a team
 */
export function getTHRestrictionSummary(currentCounts: THCounts): string {
  const available = calculateAvailableSlots(currentCounts);
  
  const lines: string[] = [];
  
  if (currentCounts.th18 < available.th18) {
    lines.push(`TH 18: ${currentCounts.th18}/${available.th18} slots used`);
  } else {
    lines.push(`TH 18: FULL (${available.th18}/${available.th18})`);
  }
  
  if (currentCounts.th17 < available.th17) {
    lines.push(`TH 17: ${currentCounts.th17}/${available.th17} slots used`);
  } else {
    lines.push(`TH 17: FULL (${available.th17}/${available.th17})`);
  }
  
  if (currentCounts.th16 < available.th16) {
    lines.push(`TH 16: ${currentCounts.th16}/${available.th16} slots used`);
  } else {
    lines.push(`TH 16: FULL (${available.th16}/${available.th16})`);
  }
  
  if (currentCounts.th15 < available.th15) {
    lines.push(`TH 15: ${currentCounts.th15}/${available.th15} slots used`);
  } else {
    lines.push(`TH 15: FULL (${available.th15}/${available.th15})`);
  }
  
  lines.push(`TH 14 and below: Unlimited`);
  
  return lines.join("\n");
}
