const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    displayPic: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

const userModel = mongoose.model('users', userSchema)

module.exports = userModel