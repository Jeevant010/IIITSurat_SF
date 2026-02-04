import connectDB from "@/lib/mongodb";
import { Announcement } from "@/lib/models";
import AnnouncementsClient from "./announcements-client";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  await connectDB();

  const announcements = await Announcement.find()
    .sort({ isPinned: -1, priority: -1, createdAt: -1 })
    .lean();

  const serializedAnnouncements = announcements.map((a) => ({
    _id: a._id.toString(),
    title: a.title,
    content: a.content,
    type: a.type,
    priority: a.priority,
    isActive: a.isActive,
    isPinned: a.isPinned,
    showOnBanner: a.showOnBanner,
    targetAudience: a.targetAudience,
    expiresAt: a.expiresAt?.toISOString() || null,
    createdAt: a.createdAt?.toISOString() || null,
    updatedAt: a.updatedAt?.toISOString() || null,
  }));

  return <AnnouncementsClient announcements={serializedAnnouncements} />;
}
