import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.models.js";
import { Post } from "../models/post.models.js";

const createComment = asyncHandler(async (req, res) => {
  let { content } = req.body;
  const userId = req.user._id;
  const postId = req.params.post_id;

  // Ensure the content of the comment is not empty
  if (!content) {
    throw new ApiError(400, "Comment content is required");
  }

  content = content.trim();
  if (!content.length) {
    throw new ApiError(400, "Comment content cannot be empty");
  }

  // Ensure a post exists with the specified id
  const postExists = await Post.findById(postId);
  if (!postExists) {
    throw new ApiError(404, "Post not found");
  }

  // Ensure the content of the comment does not exceed a maximum length
  if (content.length > 1000) {
    throw new ApiError(400, "Comment must not exceed 1000 characters");
  }

  // Create a new comment with the provided content and the current user and post IDs
  const comment = await Comment.create({
    content,
    owner: userId,
    post: postId,
  });

  return res.status(200).json(new ApiResponse(200, comment, "Comment created"));
});

const getCommentsByPost = asyncHandler(async (req, res) => {
  const postId = req.params.post_id;

  // Ensure a post exists with the specified id
  const postExists = await Post.findById(postId);
  if (!postExists) {
    throw new ApiError(404, "Post not found");
  }

  const comments = await Comment.find({ post: postId });

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched"));
});

const getCommentById = asyncHandler(async (req, res) => {
  const commentId = req.params.id;
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(400, "Comment not found");
  }

  return res.status(200).json(new ApiResponse(200, comment, "Comment fetched"));
});

const updateComment = asyncHandler(async (req, res) => {
  const commentId = req.params.id;
  let { content } = req.body;

  // Ensure the content of the comment is not empty
  if (!content) {
    throw new ApiError(400, "Comment content is required");
  }

  content = content.trim();
  if (!content.length) {
    throw new ApiError(400, "Comment content cannot be empty");
  }

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { $set: { content } },
    { new: true }
  );

  if (!comment) {
    throw new ApiError(400, "Comment not found");
  }

  return res.status(200).json(new ApiResponse(200, comment, "Comment updated"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findByIdAndDelete(req.params.id);
  if (!comment) {
    throw new ApiError(400, "Comment not found");
  }
  return res.status(200).json(new ApiResponse(200, {}, "Comment deleted"));
});

export {
  createComment,
  getCommentsByPost,
  getCommentById,
  updateComment,
  deleteComment,
};
