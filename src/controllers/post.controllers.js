import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { Post } from "../models/post.models.js";

const createPost = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(401, "Unauthorized request");
  }

  const { title, content } = req.body;

  const newPost = await Post.create({
    title,
    content,
    owner: user._id,
    college: user.college,
  });

  if (!newPost) {
    throw new ApiError(500, "Failed to create post");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newPost, "Post created successfully"));
});

const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, post, "Post fetched successfully"));
});

const updatePost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  const post = await Post.findByIdAndUpdate(
    req.params.id,
    {
      title,
      content,
    },
    { new: true, runValidators: true }
  );

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  return res.status(200).json(new ApiResponse());
});

const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Post deleted successfully"));
});

export { createPost, getPost, updatePost, deletePost };
