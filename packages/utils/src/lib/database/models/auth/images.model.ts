import { Schema, model, Types } from "mongoose";

const imageSchema = new Schema(
  {
    file_id: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
    },
    // userId (optional reference to User)
    userId: {
      type: Types.ObjectId,
      ref: "User",
      unique: true, // @unique from Prisma
      sparse: true, // allows null + unique
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "images",
  }
);

export const ImageModel = model("Image", imageSchema);
