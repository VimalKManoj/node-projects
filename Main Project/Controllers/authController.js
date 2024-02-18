const AppError = require('../utils/appErrors');
const sendEmail = require('../utils/email');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '90d',
  });
};

// ---------------------------------------------------------------------------------------------------

// SIGN IN

exports.signup = async (req, res, next) => {
  // CREATE NEW USER WITH INPUT AND PASS THE TOKEN TO THE USER
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      changedPasswordAt: req.body.changedPasswordAt,
    });

    const token = signToken(newUser._id);
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------------------------------

// LOGIN

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // CHECK IF THERE IS EMAIL AND PASSWORD

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }
    // FIND THE USER WITH THE EMAIL

    const user = await User.findOne({ email }).select('+password');

    // CHECK IF THE PASSWORD IS CORRECT IF THE USER EXISTS

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // IF EVERYTHING IS GOOD GENERATE THE JWT TOKEN AND PASS IT TO THE USER

    token = signToken(user._id);
    res.json({
      status: 'success',
      data: {
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------------------------------

// PROTECT ROUTES

exports.protect = async (req, res, next) => {
  // CHECK IF THERE IS A TOKEN AND STARTS WITH BEARER(convention)
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // IF NO TOKEN IS PRESENT
  if (!token) {
    return next(
      new AppError('You are not logged in , Please log in to get access', 401),
    );
  }

  // VERIFY THE TOKEN
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (error) {
    next(error);
  }
  // CHECK IF THE USER STILL EXIST

  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('User belonging to the token no longer exist', 401),
    );
  }
  // IF THE USER CHANGED THE PASSWORD AFTER TOKEN ISSUING , CHECKED FROM USERSCHEMA INSTANSE
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User changed password ', 401));
  }

  req.user = freshUser;
  next();
};

// ---------------------------------------------------------------------------------------------------

// RESTRICT ROUTES BASED ON ROLES

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // IF THE ROLES PASSED FROM MIDDLEWARE IS NOT IN THE ROLE OF THE USER FROM ABOVE MIDDLEWARE , NO ACCESS
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('you dont have permission to perform this action', 403),
      );
    }
    // ELSE ACCESS
    next();
  };
};

// ---------------------------------------------------------------------------------------------------

// SEND RESET PASSWORD MAIL ALONG WITH TOKEN

exports.forgotPassword = async (req, res, next) => {
  try {
    // 1) CHECK IF THE USER EXIST
    const user = await User.findOne({ email: req.body.email });

    // IF NOT ERROR
    if (!user) return next(new AppError('No user found with this email', 404));
    // IF EXISTS , GENERATE THE TOKEN FROM SCHEMA INSTANCE
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    // { validateBeforeSave : false } ::: OTHERWISE CHECKS VALIDATIONS AND ASKS FOR PASSWORD AND ALL THE VALIDATORS

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a patch request with your new password and confirm password to ${resetURL}.
    \nIf you didn't forgot your password ,please ignore this message`;
    try {
       const email = await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 mins)',
         message,
      });
      console.log(email)
      return res.status(200).json({
        status: 'success',
        message: 'token send to email',
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpiresIn = undefined;
      await user.save({ validateBeforeSave: false });
      console.log(error);
      return next(
        new AppError(
          'there was an error sending the email , please try again later',
          500,
        ),
      );
    }
  } catch (error) {
    next(error);
  }

  next();
};

exports.resetPassword = (req, res, next) => {};
