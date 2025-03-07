const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Enter a valid email"],
      unique: [true, "Email already taken"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      default: "user",
    },
    refreshToken: {
      type: String
    },
    refreshTokenExpiresAt: Date
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
