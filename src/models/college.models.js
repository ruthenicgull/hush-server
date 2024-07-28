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

collegeSchema.index({ name: "text", description: "text" });

export const College = mongoose.model("College", collegeSchema);
