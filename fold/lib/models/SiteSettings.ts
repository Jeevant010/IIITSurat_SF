import mongoose, { Schema, model, models } from "mongoose";

export interface ISiteSettings {
  _id?: string;
  siteName: string;
  tournamentName: string; // e.g., "Clash of Clans Tournament"
  eventName: string; // e.g., "Spring Fiesta 2026"
  eventDate: Date;
  registrationOpen: boolean;
  maxTeamSize: number;
  minTeamSize: number;
  allowTeamCreation: boolean;
  allowJoinRequests: boolean;
  heroTitle: string;
  heroSubtitle: string;
  announcementBanner?: string;
  // Game-specific settings
  gameType: string; // e.g., "Clash of Clans"
  rulesUrl?: string;
  discordUrl?: string;
  contactEmail?: string;
  updatedAt?: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    siteName: {
      type: String,
      default: "Spring Fiesta 2026 - Clash of Clans",
    },
    tournamentName: {
      type: String,
      default: "Clash of Clans Tournament",
    },
    eventName: {
      type: String,
      default: "Spring Fiesta 2026",
    },
    eventDate: {
      type: Date,
      default: new Date("2026-03-15"),
    },
    registrationOpen: {
      type: Boolean,
      default: true,
    },
    maxTeamSize: {
      type: Number,
      default: 5,
      min: 1,
      max: 50,
    },
    minTeamSize: {
      type: Number,
      default: 1,
      min: 1,
    },
    allowTeamCreation: {
      type: Boolean,
      default: true,
    },
    allowJoinRequests: {
      type: Boolean,
      default: true,
    },
    heroTitle: {
      type: String,
      default: "Clash of Clans Tournament",
    },
    heroSubtitle: {
      type: String,
      default: "Spring Fiesta 2026 • IIIT Surat",
    },
    announcementBanner: {
      type: String,
      default: "",
    },
    gameType: {
      type: String,
      default: "Clash of Clans",
    },
    rulesUrl: {
      type: String,
      default: "",
    },
    discordUrl: {
      type: String,
      default: "",
    },
    contactEmail: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const SiteSettings =
  models.SiteSettings ||
  model<ISiteSettings>("SiteSettings", SiteSettingsSchema);

export default SiteSettings;
