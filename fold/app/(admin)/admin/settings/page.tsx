import connectDB from "@/lib/mongodb";
import { SiteSettings } from "@/lib/models";
import SettingsClient from "./settings-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await connectDB();

  // Get or create default settings
  let settings = await SiteSettings.findOne().lean();

  if (!settings) {
    const created = await SiteSettings.create({
      siteName: "Spring Fiesta 2026 - Clash of Clans",
      eventDate: new Date("2026-03-15"),
      registrationOpen: true,
      maxTeamSize: 5,
      minTeamSize: 1,
      allowTeamCreation: true,
      allowJoinRequests: true,
      heroTitle: "Clash of Clans Tournament",
      heroSubtitle: "Spring Fiesta 2026 • IIIT Surat",
      announcementBanner: "",
    });
    settings = created.toObject();
  }

  const serializedSettings = {
    _id: settings._id?.toString(),
    siteName: settings.siteName || "Spring Fiesta 2026 - Clash of Clans",
    eventDate: settings.eventDate?.toISOString().split("T")[0] || "2026-03-15",
    registrationOpen: settings.registrationOpen ?? true,
    maxTeamSize: settings.maxTeamSize || 5,
    minTeamSize: settings.minTeamSize || 1,
    allowTeamCreation: settings.allowTeamCreation ?? true,
    allowJoinRequests: settings.allowJoinRequests ?? true,
    heroTitle: settings.heroTitle || "Clash of Clans Tournament",
    heroSubtitle: settings.heroSubtitle || "Spring Fiesta 2026 • IIIT Surat",
    announcementBanner: settings.announcementBanner || "",
  };

  return <SettingsClient initialSettings={serializedSettings} />;
}
