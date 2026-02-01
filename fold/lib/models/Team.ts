import mongoose, { Schema, model, models } from "mongoose";

export interface ITeam {
  _id?: string;
  name: string;
  teamCode: string;
  leaderId: mongoose.Types.ObjectId;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    teamCode: {
      type: String,
      required: true,
      unique: true,
    },
    leaderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const Team = models.Team || model<ITeam>("Team", TeamSchema);

export default Team;
