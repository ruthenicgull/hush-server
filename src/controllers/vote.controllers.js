import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Post } from "../models/post.models.js";
import { Vote } from "../models/vote.models.js";
import { Comment } from "../models/comment.models.js";

const castVoteOnPost = asyncHandler(async (req, res) => {
  const { type } = req.body; // Extract the vote type from the request body
  const userId = req.user._id; // Get the user ID from the request object (assumes user is authenticated)
  const { post_id } = req.params; // Extract post_id from request parameters

  // Validate vote type
  if (!["upvote", "downvote"].includes(type)) {
    throw new ApiError(400, "Invalid vote type");
  }

  // Check if a vote already exists for this user on the post
  const existingVote = await Vote.findOne({ owner: userId, post: post_id });

  if (existingVote) {
    // If the vote type is the same, return OK response
    if (existingVote.type === type) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            existingVote,
            "You have already cast this vote on this post"
          )
        );
    }
    // Update the vote type and adjust the post's vote count
    const updatedVote = await Vote.findByIdAndUpdate(
      existingVote._id,
      { type },
      { new: true }
    );
    await Post.findByIdAndUpdate(post_id, {
      $inc: { votes: type === "upvote" ? 2 : -2 },
    });
    // Send a response indicating the vote was updated
    return res
      .status(200)
      .json(new ApiResponse(200, updatedVote, "Vote updated successfully"));
  }

  // If no existing vote is found, create a new vote
  const newVote = await Vote.create({
    type,
    owner: userId,
    post: post_id,
  });

  // Adjust the vote count on the post
  await Post.findByIdAndUpdate(post_id, {
    $inc: { votes: type === "upvote" ? 1 : -1 },
  });

  // Send a response indicating the vote was created successfully
  res
    .status(201)
    .json(new ApiResponse(201, newVote, "Vote created successfully"));
});

const castVoteOnComment = asyncHandler(async (req, res) => {
  const { type } = req.body; // Extract the vote type from the request body
  const userId = req.user._id; // Get the user ID from the request object (assumes user is authenticated)
  const { comment_id } = req.params; // Extract comment_id from request parameters

  // Validate vote type
  if (!["upvote", "downvote"].includes(type)) {
    throw new ApiError(400, "Invalid vote type");
  }

  // Check if a vote already exists for this user on the comment
  const existingVote = await Vote.findOne({
    owner: userId,
    comment: comment_id,
  });

  if (existingVote) {
    // If the vote type is the same, return OK response
    if (existingVote.type === type) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            existingVote,
            "You have already cast this vote on this comment"
          )
        );
    }
    // Update the vote type and adjust the comment's vote count
    const updatedVote = await Vote.findByIdAndUpdate(
      existingVote._id,
      { type },
      { new: true }
    );
    await Comment.findByIdAndUpdate(comment_id, {
      $inc: { votes: type === "upvote" ? 2 : -2 },
    });
    // Send a response indicating the vote was updated
    return res
      .status(200)
      .json(new ApiResponse(200, updatedVote, "Vote updated successfully"));
  }

  // If no existing vote is found, create a new vote
  const newVote = await Vote.create({
    type,
    owner: userId,
    comment: comment_id,
  });

  // Adjust the vote count on the comment
  await Comment.findByIdAndUpdate(comment_id, {
    $inc: { votes: type === "upvote" ? 1 : -1 },
  });

  // Send a response indicating the vote was created successfully
  res
    .status(201)
    .json(new ApiResponse(201, newVote, "Vote created successfully"));
});

const getVotesForPost = asyncHandler(async (req, res) => {
  const postId = req.params.post_id;

  const votes = await Vote.find({ post: postId })
    .populate("owner", "username") // Adjust to include relevant user fields
    .populate("post", "title"); // Adjust to include relevant post fields

  if (!votes) {
    throw new ApiError(404, "No votes found for this post");
  }

  res
    .status(200)
    .json(new ApiResponse(200, votes, "Votes fetched successfully"));
});

const getVotesForComment = asyncHandler(async (req, res) => {
  const commentId = req.params.comment_id;

  const votes = await Vote.find({ comment: commentId })
    .populate("owner", "username") // Adjust to include relevant user fields
    .populate("comment", "content"); // Adjust to include relevant comment fields

  if (!votes.length) {
    throw new ApiError(404, "No votes found for this comment");
  }

  res
    .status(200)
    .json(new ApiResponse(200, votes, "Votes fetched successfully"));
});

const deleteVote = asyncHandler(async (req, res) => {
  const voteId = req.params.vote_id;

  const vote = await Vote.findByIdAndDelete(voteId);
  if (!vote) {
    throw new ApiError(404, "Vote not found");
  }

  if (vote.post) {
    await Post.findByIdAndUpdate(vote.post, {
      $inc: { votes: vote.type === "upvote" ? -1 : 1 },
    });
  }

  if (vote.comment) {
    await Comment.findByIdAndUpdate(vote.comment, {
      $inc: { votes: vote.type === "upvote" ? -1 : 1 },
    });
  }

  res.status(200).json(new ApiResponse(200, null, "Vote deleted successfully"));
});

export {
  castVoteOnPost,
  castVoteOnComment,
  getVotesForPost,
  getVotesForComment,
  deleteVote,
};
