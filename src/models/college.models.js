import mongoose, { Schema } from "mongoose";

const collegeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    domains: {
      type: [String],
      required: true,
    },
    alpha_two_code: {
      type: String,
    },
    state_province: {
      type: String,
    },
    webpages: {
      type: [String],
    },
    country: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create a text index on the name field
collegeSchema.index({ name: "text" });

export const College = mongoose.model("College", collegeSchema);
