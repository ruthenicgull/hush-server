import { asyncHandler } from "../utils/asyncHandler.js";
import { College } from "../models/college.models.js";
import { Post } from "../models/post.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// Search colleges
const searchColleges = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    throw new ApiError(400, "Query parameter is required");
  }

  console.log(query);

  // Use regex for exact phrase search
  const colleges = await College.find({
    $or: [
      { name: { $regex: new RegExp(query, "i") } },
      { domains: { $regex: new RegExp(query, "i") } },
      { country: { $regex: new RegExp(query, "i") } },
      { state_province: { $regex: new RegExp(query, "i") } },
    ],
  });

  res
    .status(200)
    .json(new ApiResponse(200, colleges, "Colleges fetched successfully"));
});

// Search posts with pagination
const searchPosts = asyncHandler(async (req, res) => {
  const { query, page = 1, limit = 10 } = req.query;

  if (!query) {
    throw new ApiError(400, "Query parameter is required");
  }

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const aggregate = Post.aggregate([
    { $match: { $text: { $search: query } } },
    {
      $project: {
        title: 1,
        content: 1,
        owner: 1,
        college: 1,
        votes: 1,
        createdAt: 1,
        updatedAt: 1,
        score: { $meta: "textScore" }, // Include text score
      },
    },
    { $sort: { score: { $meta: "textScore" } } }, // Sort by text score
  ]);

  const posts = await Post.aggregatePaginate(aggregate, options);

  res
    .status(200)
    .json(new ApiResponse(200, posts, "Posts fetched successfully"));
});

export { searchColleges, searchPosts };
