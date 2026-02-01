import mongoose, { Schema, model, models } from "mongoose";

export interface ISiteSettings {
  _id?: string;
  siteName: string;
  eventDate: Date;
  registrationOpen: boolean;
  maxTeamSize: number;
  minTeamSize: number;
  allowTeamCreation: boolean;
  allowJoinRequests: boolean;
  heroTitle: string;
  heroSubtitle: string;
  announcementBanner?: string;
  updatedAt?: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    siteName: {
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
    },
    minTeamSize: {
      type: Number,
      default: 1,
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
      default: "Welcome to Spring Fiesta 2026",
    },
    heroSubtitle: {
      type: String,
      default: "IIIT Surat's Premier Cultural Event",
    },
    announcementBanner: {
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
