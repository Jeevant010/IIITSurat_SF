import mongoose, { Schema, model, models } from "mongoose";

export interface IJoinRequest {
  _id?: string;
  userId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt?: Date;
  updatedAt?: Date;
}

const JoinRequestSchema = new Schema<IJoinRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  },
);

const JoinRequest =
  models.JoinRequest || model<IJoinRequest>("JoinRequest", JoinRequestSchema);

export default JoinRequest;
