import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { generateUsername } from "unique-username-generator";
import jwt from "jsonwebtoken";

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
  const { email, password } = req.body;
  const college = req.college;

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
  const username = await generateUniqueUsername();

  // generate
  const user = await User.create({
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

const loginUser = asyncHandler(async (req, res) => {
  // get user data from frontend
  const { email, username, password } = req.body;

  // check for email and username fields
  if (!email && !username) {
    throw new ApiError(400, "Either email or username are required");
  }

  // find user in db
  const user = await User.findOne({
    $or: [{ username, email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // check if password is correct
  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  // generate and refresh and access token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findOne(user._id).select(
    "-password -refreshToken"
  );

  // set cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: true,
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
  user_id = req.user._id;

  // remove refresh token from db (i.e. make it undefined)
  await User.findByIdAndUpdate(
    user_id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  // set cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: true,
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
    process.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedToken?._id);

  if (!user) {
    throw new ApiError(401, "Invalid Refresh Token");
  }

  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "Refresh Token is expired or used");
  }

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken: newRefreshToken },
        "Access Token Refreshed"
      )
    );
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
  await user.save((validateBeforeSave = false));

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  return res
    .status(200)
    .ApiResponse(200, currentUser, "Current User Fetched Successfully");
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
};
