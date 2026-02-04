import mongoose, { Schema, model, models } from "mongoose";

export interface IMatch {
  _id?: mongoose.Types.ObjectId;
  tournamentName: string; // e.g., "Spring Fiesta 2026 - Main Event"
  round: number; // 1 = Round of 16, 2 = Quarter Finals, 3 = Semi Finals, 4 = Finals
  matchNumber: number; // Position in the bracket
  team1Id?: mongoose.Types.ObjectId | null; // Can be null for TBD
  team2Id?: mongoose.Types.ObjectId | null; // Can be null for TBD
  team1Score?: number;
  team2Score?: number;
  winnerId?: mongoose.Types.ObjectId | null;
  status: "TBD" | "SCHEDULED" | "LIVE" | "COMPLETED";
  scheduledAt?: Date | null;
  completedAt?: Date | null;
  nextMatchId?: mongoose.Types.ObjectId | null; // Winner advances to this match
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const MatchSchema = new Schema<IMatch>(
  {
    tournamentName: {
      type: String,
      required: true,
      default: "Spring Fiesta 2026",
    },
    round: {
      type: Number,
      required: true,
      min: 1,
    },
    matchNumber: {
      type: Number,
      required: true,
    },
    team1Id: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    team2Id: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    team1Score: {
      type: Number,
      default: 0,
    },
    team2Score: {
      type: Number,
      default: 0,
    },
    winnerId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    status: {
      type: String,
      enum: ["TBD", "SCHEDULED", "LIVE", "COMPLETED"],
      default: "TBD",
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    nextMatchId: {
      type: Schema.Types.ObjectId,
      ref: "Match",
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
MatchSchema.index({ tournamentName: 1, round: 1, matchNumber: 1 });
MatchSchema.index({ status: 1 });

const Match = models.Match || model<IMatch>("Match", MatchSchema);

export default Match;
