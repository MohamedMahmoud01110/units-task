import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

postSchema.index({ createdAt: -1 });

export const PostModel =
  mongoose.models.Post || mongoose.model("Post", postSchema);
