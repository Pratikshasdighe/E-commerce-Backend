const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeature = require("../utils/apiFeature");
const sendToken = require("../utils/jwtToken");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
//register a user

exports.registerUser = catchAsyncError(async (req, res, next) => {
  const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar.url, {
    folder: "avatars",
    width: 150,
    crop: "scale",
  });
  const { name, email, password } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });
  sendToken(user, 201, res);
});

//Login User

exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("please enter email & password", 400));
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isPasswordMatch = await user.comaprePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("please enter email & password", 401));
  }
  sendToken(user, 200, res);
});

//logout user

exports.logout = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

//get user profile

exports.getUserDetails = catchAsyncError(async (req, res, next) => {
  let user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorHandler("user not found", 404));
  }

  res.status(200).json({ success: true, user });
});

// forgot password
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Get ResetPassword Token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  console.log(req.get("host"));

  const message = `Your password reset token is temp :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then, please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

//reset password

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "ReSet Passsword Token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not matched", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  sendToken(user, 200, res);
});

//update user password

exports.updatePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  const isPasswordMatch = await user.comaprePassword(req.body.oldPassword);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }
  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not password", 400));
  }
  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, 200, res);
});

exports.updateProfile = catchAsyncError(async (req, res, next) => {
  const newuserData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.body.avatar !== "") {
    const user = await User.findById(req.user.id);
    const imageId = user.avatar.public_id;
    await cloudinary.v2.uploader.destroy(imageId);
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });
    newuserData.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newuserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

exports.getAllUser = catchAsyncError(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});

//get single user (admin)

exports.getSingleUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id:${req.params.id}`)
    );
  }
  res.status(200).json({
    success: true,
    user,
  });
});

//update role

exports.updateUserRole = catchAsyncError(async (req, res, next) => {
  const newuserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  //we will add cloudinary later
  await User.findByIdAndUpdate(req.params.id, newuserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

//delete user --admin

exports.deleteUser = catchAsyncError(async (req, res, next) => {
  //we will add cloudinary later
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id:${req.params.id}`)
    );
  }
  const imageId = user.avatar.public_id;
  await cloudinary.v2.uploader.destroy(imageId);

  await user.remove();
  res.status(200).json({
    success: true,
  });
});
