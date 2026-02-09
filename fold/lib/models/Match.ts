import mongoose, { Schema, model, models } from "mongoose";

// Tournament stages for IPL-style format
// Extended format for 8 teams (4 per group):
// Round 1: Q1 (GA1 vs GB2), Q2 (GA2 vs GB1), E1 (GA3 vs GB4), E2 (GA4 vs GB3)
// Round 2: Q3 (Loser Q1 vs Winner E1), Q4 (Loser Q2 vs Winner E2)
// Semi-Finals: SF1 (Winner Q1 vs Winner Q4), SF2 (Winner Q2 vs Winner Q3)
// Final: Winner SF1 vs Winner SF2
export type MatchStage =
  | "GROUP_A" // Group A league matches
  | "GROUP_B" // Group B league matches
  | "QUALIFIER_1" // GA1 vs GB2 - Winner to SF1, Loser to Q3
  | "QUALIFIER_2" // GA2 vs GB1 - Winner to SF2, Loser to Q4
  | "ELIMINATOR_1" // GA3 vs GB4 - Winner to Q3, Loser eliminated
  | "ELIMINATOR_2" // GA4 vs GB3 - Winner to Q4, Loser eliminated
  | "QUALIFIER_3" // Loser Q1 vs Winner E1 - Winner to SF2
  | "QUALIFIER_4" // Loser Q2 vs Winner E2 - Winner to SF1
  | "SEMI_FINAL_1" // Winner Q1 vs Winner Q4
  | "SEMI_FINAL_2" // Winner Q2 vs Winner Q3
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
        "QUALIFIER_2",
        "ELIMINATOR_1",
        "ELIMINATOR_2",
        "QUALIFIER_3",
        "QUALIFIER_4",
        "SEMI_FINAL_1",
        "SEMI_FINAL_2",
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
