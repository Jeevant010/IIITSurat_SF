import mongoose, { Schema, model, models } from "mongoose";

export interface IJoinRequest {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  message?: string; // Optional message from requester
  rejectionReason?: string; // Optional reason for rejection
  processedBy?: mongoose.Types.ObjectId | null; // Who processed this request
  processedAt?: Date | null;
  expiresAt?: Date; // Auto-expire old requests
  createdAt?: Date;
  updatedAt?: Date;
}

const JoinRequestSchema = new Schema<IJoinRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: [true, "Team ID is required"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["PENDING", "ACCEPTED", "REJECTED"],
        message: "{VALUE} is not a valid status",
      },
      default: "PENDING",
      index: true,
    },
    message: {
      type: String,
      default: "",
      maxlength: [200, "Message cannot exceed 200 characters"],
    },
    rejectionReason: {
      type: String,
      default: "",
      maxlength: [200, "Rejection reason cannot exceed 200 characters"],
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for common queries
JoinRequestSchema.index({ teamId: 1, status: 1 });
JoinRequestSchema.index({ userId: 1, status: 1 });
JoinRequestSchema.index({ userId: 1, teamId: 1 }, { unique: true }); // One request per user per team

const JoinRequest =
  models.JoinRequest || model<IJoinRequest>("JoinRequest", JoinRequestSchema);

export default JoinRequest;
