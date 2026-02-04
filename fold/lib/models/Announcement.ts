import mongoose, { Schema, model, models } from "mongoose";

export interface IAnnouncement {
  _id?: mongoose.Types.ObjectId;
  title: string;
  content: string;
  type: "INFO" | "WARNING" | "SUCCESS" | "URGENT";
  priority: number; // Higher number = higher priority
  isActive: boolean;
  isPinned: boolean; // Pinned announcements stay at top
  showOnBanner: boolean; // Show in hero section banner
  targetAudience: "ALL" | "TEAMS" | "FREE_AGENTS" | "ADMINS";
  expiresAt?: Date | null;
  createdBy?: mongoose.Types.ObjectId; // Admin who created it
  createdAt?: Date;
  updatedAt?: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: [true, "Announcement title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Announcement content is required"],
      trim: true,
      maxlength: [2000, "Content cannot exceed 2000 characters"],
    },
    type: {
      type: String,
      enum: {
        values: ["INFO", "WARNING", "SUCCESS", "URGENT"],
        message: "{VALUE} is not a valid announcement type",
      },
      default: "INFO",
    },
    priority: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    showOnBanner: {
      type: Boolean,
      default: false,
    },
    targetAudience: {
      type: String,
      enum: {
        values: ["ALL", "TEAMS", "FREE_AGENTS", "ADMINS"],
        message: "{VALUE} is not a valid audience",
      },
      default: "ALL",
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient queries
AnnouncementSchema.index({ isActive: 1, expiresAt: 1 });
AnnouncementSchema.index({ isPinned: -1, priority: -1, createdAt: -1 });
AnnouncementSchema.index({ showOnBanner: 1 });

const Announcement =
  models.Announcement ||
  model<IAnnouncement>("Announcement", AnnouncementSchema);

export default Announcement;
