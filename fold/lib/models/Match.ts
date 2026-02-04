import mongoose, { Schema, model, models } from "mongoose";

// Tournament stages for IPL-style format
export type MatchStage =
  | "GROUP_A" // Group A league matches
  | "GROUP_B" // Group B league matches
  | "QUALIFIER_1" // Top teams from each group
  | "ELIMINATOR" // 2nd place teams
  | "QUALIFIER_2" // Loser of Q1 vs Winner of Eliminator
  | "FINAL" // Championship match
  | "KNOCKOUT"; // Generic knockout for simple brackets

export interface IMatch {
  _id?: mongoose.Types.ObjectId;
  tournamentName: string; // e.g., "Spring Fiesta 2026 - Main Event"
  stage: MatchStage; // Tournament stage type
  round: number; // Round within the stage (for group matches)
  matchNumber: number; // Position in the bracket
  team1Id?: mongoose.Types.ObjectId | null; // Can be null for TBD
  team2Id?: mongoose.Types.ObjectId | null; // Can be null for TBD
  team1Score?: number;
  team2Score?: number;
  team1Stars?: number; // For Clash of Clans - stars earned
  team2Stars?: number;
  winnerId?: mongoose.Types.ObjectId | null;
  loserId?: mongoose.Types.ObjectId | null; // For tracking elimination path
  status: "TBD" | "SCHEDULED" | "LIVE" | "COMPLETED";
  scheduledAt?: Date | null;
  completedAt?: Date | null;
  nextMatchId?: mongoose.Types.ObjectId | null; // Winner advances to this match
  loserNextMatchId?: mongoose.Types.ObjectId | null; // For lower bracket - where loser goes
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
    stage: {
      type: String,
      enum: [
        "GROUP_A",
        "GROUP_B",
        "QUALIFIER_1",
        "ELIMINATOR",
        "QUALIFIER_2",
        "FINAL",
        "KNOCKOUT",
      ],
      default: "KNOCKOUT",
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
    team1Stars: {
      type: Number,
      default: 0,
    },
    team2Stars: {
      type: Number,
      default: 0,
    },
    winnerId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    loserId: {
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
    loserNextMatchId: {
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
MatchSchema.index({ tournamentName: 1, stage: 1, round: 1, matchNumber: 1 });
MatchSchema.index({ status: 1 });

const Match = models.Match || model<IMatch>("Match", MatchSchema);

export default Match;
