const mongoose = require("mongoose");

const contactSchema = mongoose.Schema(
  {
    user_Id: {
      type: String,
      required: true,
      ref: "User"
    },
    name: {
      type: String,
      required: [true, "Please add the contact name"],
    },
    email: {
      type: String,
      required: [true, "Please enter a valid email"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Please enter a phone number"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Contact", contactSchema);
