/**
 * Authentication Helper
 *
 * This module provides helper functions for authentication.
 * Uses NextAuth.js with Google OAuth for real authentication.
 */

import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import { User } from "@/lib/models";
import type { IUser } from "@/lib/models";

// ============================================
// AUTH USER INTERFACE
// ============================================
export interface AuthUser {
  _id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  teamId: string | null;
  teamRole: "LEADER" | "MEMBER" | null;
  isProfileComplete: boolean;
  avatarUrl: string | null;
  avatarId: number | null;
  ign: string | null;
  playerTag: string | null;
  townHall: number | null;
  rollNumber: string | null;
  phone: string | null;
}

// ============================================
// GET CURRENT USER (From Session)
// ============================================
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return null;
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email }).lean();

    if (!user) {
      return null;
    }

    return {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      teamId: user.teamId?.toString() || null,
      teamRole: user.teamRole || null,
      isProfileComplete: user.isProfileComplete || false,
      avatarUrl: user.avatarUrl || null,
      avatarId: user.avatarId || null,
      ign: user.ign || null,
      playerTag: user.playerTag || null,
      townHall: user.townHall || null,
      rollNumber: user.rollNumber || null,
      phone: user.phone || null,
    };
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
}

// ============================================
// GET SESSION (For client components)
// ============================================
export async function getSession() {
  return await auth();
}

// ============================================
// AUTH CHECK FUNCTIONS
// ============================================

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}

/**
 * Check if current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "ADMIN";
}

/**
 * Check if current user is a team leader
 */
export async function isTeamLeader(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.teamRole === "LEADER";
}

/**
 * Check if current user is in a team
 */
export async function isInTeam(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.teamId !== null;
}

/**
 * Check if user has completed their profile
 */
export async function hasCompletedProfile(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.isProfileComplete === true;
}

// ============================================
// REQUIRE AUTH FUNCTIONS (Throw if not met)
// ============================================

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required. Please sign in.");
  }
  return user;
}

/**
 * Require admin role - throws if not admin
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("Admin access required.");
  }
  return user;
}

/**
 * Require completed profile - throws if profile not complete
 */
export async function requireCompleteProfile(): Promise<AuthUser> {
  const user = await requireAuth();
  if (!user.isProfileComplete) {
    throw new Error("Please complete your profile first.");
  }
  return user;
}
