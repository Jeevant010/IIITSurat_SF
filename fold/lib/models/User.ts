import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
  _id?: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  teamId?: mongoose.Types.ObjectId | null;
  teamRole?: "LEADER" | "MEMBER" | null; // Role within their team
  rollNumber?: string | null;
  ign?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    teamRole: {
      type: String,
      enum: ["LEADER", "MEMBER", null],
      default: null,
    },
    rollNumber: {
      type: String,
      default: null,
    },
    ign: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const User = models.User || model<IUser>("User", UserSchema);

export default User;
