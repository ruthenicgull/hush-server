import mongoose, { Schema } from "mongoose";

const voteSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    type: {
      type: String,
      enum: ["upvote", "downvote"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add a compound index to ensure a user can vote only once per comment or post
voteSchema.index({ owner: 1, comment: 1 }, { unique: true, sparse: true });
voteSchema.index({ owner: 1, post: 1 }, { unique: true, sparse: true });

export const Vote = mongoose.model("Vote", voteSchema);
