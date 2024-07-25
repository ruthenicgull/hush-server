import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/user.models";
import { generateUsername } from "unique-username-generator";

const generateUniqueUsername = async () => {
  const username = generateUsername();

  const existingUsername = await User.findOne({ username: username });

  if (existingUsername) {
    return generateUniqueUsername();
  }

  return username;
};

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access tokens"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, password, college } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  // check if user already exists
  const userExists = await User.findOne({ email: email });

  if (userExists) {
    throw new ApiError(400, "User with this email already exists");
  }

  // create unique username
  const username = generateUniqueUsername();

  // generate
  const user = User.create({
    email,
    password,
    username,
    college: college._id,
  });

  // check for user creation &
  // remove password and refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }

  // return response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully!"));
});
