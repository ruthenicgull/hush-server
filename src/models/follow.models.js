import mongoose, { Schema } from "mongoose";

// Define the Follow schema
const followSchema = new Schema(
  {
    follower: {
      type: Schema.Types.ObjectId, // Reference to the User model
      ref: "User", // Model name for reference
      required: true, // Field is required
    },
    college: {
      type: Schema.Types.ObjectId, // Reference to the College model
      ref: "College", // Model name for reference
      required: true, // Field is required
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
  }
);

// Create the Follow model using the schema
export const Follow = mongoose.model("Follow", followSchema);
