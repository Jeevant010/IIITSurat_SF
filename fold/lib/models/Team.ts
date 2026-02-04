import mongoose, { Schema, model, models } from "mongoose";

export interface ITeam {
  _id?: mongoose.Types.ObjectId;
  name: string;
  teamCode: string;
  leaderId: mongoose.Types.ObjectId;
  description?: string;
  avatarUrl?: string | null;
  score: number;
  wins: number;
  losses: number;
  status: "ACTIVE" | "INACTIVE" | "DISQUALIFIED";
  maxMembers: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    name: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
      minlength: [2, "Team name must be at least 2 characters"],
      maxlength: [50, "Team name cannot exceed 50 characters"],
    },
    teamCode: {
      type: String,
      required: [true, "Team code is required"],
      uppercase: true,
      trim: true,
    },
    leaderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Team must have a leader"],
      index: true,
    },
    description: {
      type: String,
      default: "",
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    score: {
      type: Number,
      default: 0,
      min: [0, "Score cannot be negative"],
    },
    wins: {
      type: Number,
      default: 0,
      min: [0, "Wins cannot be negative"],
    },
    losses: {
      type: Number,
      default: 0,
      min: [0, "Losses cannot be negative"],
    },
    status: {
      type: String,
      enum: {
        values: ["ACTIVE", "INACTIVE", "DISQUALIFIED"],
        message: "{VALUE} is not a valid status",
      },
      default: "ACTIVE",
    },
    maxMembers: {
      type: Number,
      default: 5,
      min: [1, "Team must allow at least 1 member"],
      max: [10, "Team cannot have more than 10 members"],
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
TeamSchema.index({ name: 1 }, { unique: true });
TeamSchema.index({ teamCode: 1 }, { unique: true });
TeamSchema.index({ status: 1 });
TeamSchema.index({ score: -1 }); // For leaderboard sorting

const Team = models.Team || model<ITeam>("Team", TeamSchema);

export default Team;
