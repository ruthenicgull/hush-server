import { ApiError } from "../utils/ApiError.js";
import { College } from "../models/college.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Middleware to verify if the email domain matches a college in the database
export const verifyCollegeEmail = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // Ensure email is provided
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  // Extract the domain from the email
  const domain = email.split("@")[1];

  // Check if there is a college with the given domain
  const college = await College.findOne({ domains: { $in: [domain] } });

  if (!college) {
    throw new ApiError(400, "Email domain does not match any known college");
  }

  // Attach the college to the request object for use in the controller
  req.college = college;

  next(); // Proceed to the next middleware or route handler
});
