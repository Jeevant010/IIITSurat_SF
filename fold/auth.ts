/**
 * NextAuth.js Configuration
 *
 * This provides Google OAuth login for the platform.
 * Users can login with one click using their Google account.
 */

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import connectDB from "@/lib/mongodb";
import { User } from "@/lib/models";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Allow any Google account (not just verified domains)
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  callbacks: {
    // Called when user signs in
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      try {
        await connectDB();

        // Check if user exists
        let dbUser = await User.findOne({ email: user.email });

        if (!dbUser) {
          // Create new user on first login
          dbUser = await User.create({
            email: user.email,
            name: user.name || "New Player",
            googleId: account?.providerAccountId,
            avatarUrl: user.image,
            role: "USER",
            isProfileComplete: false, // They need to fill details
          });
          console.log("✅ New user created:", user.email);
        } else {
          // Update existing user's Google info
          await User.findByIdAndUpdate(dbUser._id, {
            googleId: account?.providerAccountId,
            avatarUrl: user.image || dbUser.avatarUrl,
            lastLogin: new Date(),
          });
        }

        return true;
      } catch (error) {
        console.error("Sign in error:", error);
        return false;
      }
    },

    // Add user data to session
    async session({ session, token }) {
      if (session.user && token.sub) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: session.user.email });

          if (dbUser) {
            session.user.id = dbUser._id.toString();
            session.user.role = dbUser.role;
            session.user.teamId = dbUser.teamId?.toString() || null;
            session.user.teamRole = dbUser.teamRole;
            session.user.isProfileComplete = dbUser.isProfileComplete;
            session.user.ign = dbUser.ign;
            session.user.rollNumber = dbUser.rollNumber;
          }
        } catch (error) {
          console.error("Session error:", error);
        }
      }
      return session;
    },

    // Store user info in JWT
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }

      // Handle session updates (when user completes profile)
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      return token;
    },
  },

  pages: {
    signIn: "/login", // Custom login page
    error: "/login", // Redirect errors to login
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Enable debug in development
  debug: process.env.NODE_ENV === "development",
});
