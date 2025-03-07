const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const client = require("../config/redis");

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  return {
    accessToken,
    refreshToken,
    refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({ email, password: hashedPassword, role });

  res.status(201).json({
    message: "User registered successfully",
    user: {
      _id: newUser._id,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    },
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const { accessToken, refreshToken, refreshTokenExpiresAt } =
    generateTokens(user);

  user.refreshToken = refreshToken;
  user.refreshTokenExpiresAt = refreshTokenExpiresAt;
  await user.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    // sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  res.status(200).json({
    message: "Login successful",
    token: accessToken,
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
    },
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const oldRefreshToken = req.cookies?.refreshToken;

  if (!oldRefreshToken) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  const isBlacklisted = await client.get(oldRefreshToken);
  if (isBlacklisted) {
    return res.status(403).json({ error: "Token is blacklisted" });
  }

  const user = await User.findOne({ refreshToken: oldRefreshToken });
  if (!user) return res.sendStatus(403);

  if (user.refreshTokenExpiresAt < new Date()) {
    return res
      .status(403)
      .json({ message: "Refresh token expired. Please log in again." });
  }

  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET,
    async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid refresh token" });
      }

      const { newAccessToken, newRefreshToken } = generateTokens(user);

      await client.set(oldRefreshToken, "blacklisted", "EX", 7 * 24 * 60 * 60);

      user.refreshToken = newRefreshToken;
      await user.save();

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "None",
        // sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      res.json({ accessToken: newAccessToken });
    }
  );
});

const logoutUser = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return res.sendStatus(204);

  const user = await User.findOne({ refreshToken });
  if (!user) return res.sendStatus(204);

  try {
    await client.set(refreshToken, "blacklisted", "EX", 7 * 24 * 60 * 60);
  } catch (error) {
        console.error("Redis error:", error.message);
  }

  user.refreshToken = null;
  await user.save();

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
  });
  res.status(200).json({ message: "Logged out successfully" });
});

const currentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "_id email createdAt updatedAt"
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ message: "Welcome user", user });
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  currentUser,
  refreshToken,
};
