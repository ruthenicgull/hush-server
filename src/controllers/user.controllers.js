import dotenv from "dotenv";
dotenv.config();
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { generateUsername } from "unique-username-generator";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../utils/emailer.js";

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

const verifyEmail = asyncHandler(async (req, res) => {
  const { code } = req.query;

  if (!code) {
    throw new ApiError(400, "Verification code is required");
  }

  const user = await User.findOne({
    verificationToken: code,
    // verificationTokenExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification code");
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiresAt = undefined;
  await user.save();

  return res.status(200).json(new ApiResponse(200, {}, "User verified"));
});

const registerUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const college = req.college;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  // Check if user already exists
  const userExists = await User.findOne({ email: email });

  if (userExists) {
    // If user exists but is not verified
    if (!userExists.isVerified) {
      // Create a new verification code
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      // Send verification email
      await sendVerificationEmail(userExists.email, verificationCode);

      // Update user with new verification code
      userExists.verificationToken = verificationCode;
      await userExists.save();

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            null,
            "User already registered but not verified. A new verification email has been sent."
          )
        );
    }

    // If user exists and is verified
    throw new ApiError(
      400,
      "User with this email already exists and is verified."
    );
  }

  // Create unique username
  const username = await generateUsername();

  // Create verification code
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  // Send verification email
  await sendVerificationEmail(email, verificationCode);

  // Create user
  const user = await User.create({
    email,
    password,
    username,
    college: college._id,
    verificationToken: verificationCode,
  });

  // Check for user creation and remove password and refresh token fields from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }

  // Return response
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdUser,
        "User registered successfully! Please check your email to verify your account."
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  // get user data from frontend
  const { email, username, password } = req.body;

  // check for email and username fields
  if (!email && !username) {
    throw new ApiError(400, "Either email or username are required");
  }

  // find user in db
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  if (!user.isVerified) {
    throw new ApiError(401, "User is not verified. Please verify your email.");
  }

  // check if password is correct
  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  // generate and refresh and access token
  const { accessToken, refreshToken: refreshToken } =
    await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findOne(user._id).select(
    "-password -refreshToken"
  );

  // set cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };

  // return response
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // get user id from the user in the request object (attached by the auth middleware)
  const user_id = req.user._id;

  // remove refresh token from db (i.e. make it undefined)
  await User.findByIdAndUpdate(
    user_id,
    {
      $unset: {
        refreshToken: 1, // passing the 1 flag unsets the refresh token
      },
    },
    {
      new: true,
    }
  );

  // set cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "production",
  };

  // return response
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // get refresh token from cookies
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedToken?._id).select("-password");

  if (!user) {
    throw new ApiError(401, "Invalid Refresh Token");
  }

  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "Refresh Token is expired or used");
  }

  const cookieOptions = {
    httpOnly: true,
    // secure: true,
  };

  const tokens = await generateAccessAndRefreshTokens(user._id);

  return res
    .status(200)
    .cookie("accessToken", tokens.accessToken, cookieOptions)
    .cookie("refreshToken", tokens.refreshToken, cookieOptions)
    .json(new ApiResponse(200, { user, ...tokens }, "Access Token Refreshed"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  // get the new password & old password
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isOldPasswordCorrect) {
    throw new ApiError(400, "Invalid Old Password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  return res
    .status(200)
    .json(
      new ApiResponse(200, currentUser, "Current User Fetched Successfully")
    );
});

const getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId)
    .select("-password -refreshToken")
    .populate("college", "name");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Fetched Successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  verifyEmail,
  getUserById,
};
