import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
  _id?: mongoose.Types.ObjectId;
  email: string;
  name: string;
  googleId?: string | null; // Google OAuth ID
  role: "USER" | "ADMIN";
  teamId?: mongoose.Types.ObjectId | null;
  teamRole?: "LEADER" | "MEMBER" | null;
  rollNumber?: string | null;
  ign?: string | null; // In-Game Name
  playerTag?: string | null; // Clash of Clans Player Tag (e.g., #ABC123)
  townHall?: number | null; // Clash of Clans Town Hall level (1-18)
  phone?: string | null;
  avatarUrl?: string | null;
  avatarId?: number | null; // Selected avatar ID (1-20)
  isActive: boolean;
  isProfileComplete: boolean; // Has user filled required details?
  lastLogin?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    googleId: {
      type: String,
      default: null,
      sparse: true,
    },
    role: {
      type: String,
      enum: {
        values: ["USER", "ADMIN"],
        message: "{VALUE} is not a valid role",
      },
      default: "USER",
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      default: null,
      index: true,
    },
    teamRole: {
      type: String,
      enum: {
        values: ["LEADER", "MEMBER", null],
        message: "{VALUE} is not a valid team role",
      },
      default: null,
    },
    rollNumber: {
      type: String,
      default: null,
      trim: true,
      sparse: true,
    },
    ign: {
      type: String,
      default: null,
      trim: true,
      maxlength: [50, "IGN cannot exceed 50 characters"],
    },
    playerTag: {
      type: String,
      default: null,
      trim: true,
      maxlength: [20, "Player tag cannot exceed 20 characters"],
    },
    townHall: {
      type: Number,
      default: null,
      min: [1, "Town Hall must be at least 1"],
      max: [18, "Town Hall cannot exceed 18"],
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    avatarId: {
      type: Number,
      default: null,
      min: 1,
      max: 20,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance (email already has unique:true index)
UserSchema.index({ teamId: 1, teamRole: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ name: "text" });

const User = models.User || model<IUser>("User", UserSchema);

export default User;
