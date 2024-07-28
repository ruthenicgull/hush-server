import asyncHandler from "../utils/asyncHandler.js";
import { Follow } from "../models/follow.models.js";
import { College } from "../models/college.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse";

// Follow a college
export const followCollege = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { collegeId } = req.body;

  // Check if the college exists
  const college = await College.findById(collegeId);
  if (!college) {
    throw new ApiError(404, "College not found");
  }

  // Check if the user is already following the college
  const existingFollow = await Follow.findOne({
    follower: userId,
    college: collegeId,
  });
  if (existingFollow) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, existingFollow, "Already following this college")
      );
  }

  // Create a new follow document
  const follow = await Follow.create({ follower: userId, college: collegeId });
  res
    .status(201)
    .json(new ApiResponse(201, follow, "Followed the college successfully"));
});

// Unfollow a college
export const unfollowCollege = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { collegeId } = req.body;

  // Check if the follow relationship exists
  const follow = await Follow.findOneAndDelete({
    follower: userId,
    college: collegeId,
  });
  if (!follow) {
    throw new ApiError(404, "Follow relationship not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, follow, "Unfollowed the college successfully"));
});

// Get a list of colleges a user is following
export const getUserFollows = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const follows = await Follow.find({ follower: userId }).populate("college");
  res
    .status(200)
    .json(
      new ApiResponse(200, follows, "Fetched followed colleges successfully")
    );
});

// Get a list of followers for a college
export const getCollegeFollowers = asyncHandler(async (req, res) => {
  const { collegeId } = req.params;

  const followers = await Follow.find({ college: collegeId }).populate(
    "follower"
  );
  res
    .status(200)
    .json(
      new ApiResponse(200, followers, "Fetched college followers successfully")
    );
});
