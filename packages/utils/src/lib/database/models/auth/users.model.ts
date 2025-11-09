import { model, Schema, Types } from "mongoose";

const userSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      default: null,
    },
    following: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    avatar: {
      type: Types.ObjectId,
      ref: "Image",
      default: null,
    },
    imageId: {
      type: Types.ObjectId,
      ref: "Image",
      required: true,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

export const UserModel = model("User", userSchema);
