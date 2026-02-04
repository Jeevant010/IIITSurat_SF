import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
      teamId: string | null;
      teamRole: "LEADER" | "MEMBER" | null;
      isProfileComplete: boolean;
      ign: string | null;
      rollNumber: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: "USER" | "ADMIN";
    teamId?: string | null;
    teamRole?: "LEADER" | "MEMBER" | null;
    isProfileComplete?: boolean;
    ign?: string | null;
    rollNumber?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "USER" | "ADMIN";
    teamId?: string | null;
    teamRole?: "LEADER" | "MEMBER" | null;
    isProfileComplete?: boolean;
  }
}
