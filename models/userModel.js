const mongoose = require("mongoose");
const validator = require("validator");
const bcyrpt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please enter your name"],
    maxlength: [30, "name cannot exceed 30 character"],
    minlength: [4, "Name should have more than 4 charater"],
  },
  email: {
    type: String,
    required: [true, "please enter your email"],
    unique: true,
    validate: [validator.isEmail, "please enter valid email"],
  },
  password: {
    type: String,
    required: [true, "please enter your password"],

    minlength: [8, "password should be greater than 8 charater"],
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
      // required: true,
    },
    url: {
      type: String,
      // required: true,
    },
  },
  role: {
    type: String,
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcyrpt.hash(this.password, 10);
});

//JWT TOKEN
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

//compare password

userSchema.methods.comaprePassword = async function (enteredPassword) {
  return await bcyrpt.compare(enteredPassword, this.password);
};

//Generating Password reset token

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  //hashing & adding resetpassword to userScema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  console.log(resetToken);

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
