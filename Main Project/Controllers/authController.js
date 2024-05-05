const AppError = require('../utils/appErrors');
// const sendEmail = require('../utils/email');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const Email = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '90d',
  });
};

// -------------------------------------------------------------------------

const createSendToken = (user, status, res) => {
  const token = signToken(user._id);

  // SET OPTIONS FOR COOKIE TO SEND
  const cookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  // SET SECURE FOR TOKEN IN PRODUCTION
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // SENDING THE COOKIE IN RESPONSE
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(status).json({
    status: 'success',
    token,
    data: {
      user,
    },
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
    });

    // SEND A WELCOME MESSAGE TO EMAIL OF USER
    // SETTING THE URL TO CHANGE DP OF THE USER
    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser, url).sendWelcome();

    createSendToken(newUser, 201, res);
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

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------------------------------

exports.logout = (req, res, next) => {
  // WHEN LOGGING OUT SEND A NEW COOKIE WITH NO JWT TOKEN SO THAT IT FAILS THE VERIFY
  res.cookie('jwt', 'logged out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};
// PROTECT ROUTES

exports.protect = async (req, res, next) => {
  // CHECK IF THERE IS A TOKEN AND STARTS WITH BEARER(convention)
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    // IF NO TOKEN IS PRESENT
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
    return next(new AppError('User changed password  ', 401));
  }

  req.user = freshUser;
  res.locals.user = freshUser;
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
    // IN createPasswordResetToken() WE ARE JUST MODIFYING THE DATA BUT NOT SAVING TO DATABASE SO CALL SAVE HERE
    await user.save({ validateBeforeSave: false });
    // { validateBeforeSave : false } ::: OTHERWISE CHECKS VALIDATIONS AND ASKS FOR PASSWORD AND ALL THE VALIDATORS

    // THE MESSAGE WE SEND TO THE EMAIL TO CHANGE THE PASSWORD
    try {
      // SENDING THE EMAIL
      // THE URL WE SEND TO THE EMAIL TO CHANGE THE PASSWORD
      const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
      await new Email(user, resetURL).resetPassword();

      // await sendEmail({
      //   email: user.email,
      //   subject: 'Your password reset token (valid for 10 mins)',
      //   message,
      // });
      return res.status(200).json({
        status: 'success',
        message: 'token send to email',
      });
    } catch (error) {
      // INCASE OF ERROR IN SENDING THE EMAIL RESET THE PASSWORD RESET AND EXPIRE FIELD TO NOT CHANGE THE DATABASE
      user.passwordResetToken = undefined;
      user.passwordResetExpiresIn = undefined;
      await user.save({ validateBeforeSave: false });
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

// ---------------------------------------------------------------------------------------------------

exports.resetPassword = async (req, res, next) => {
  try {
    // HASH THE TOKEN COMING FROM THE PARAM WHICH IS SEND TO THE EMAIL
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // CHECK IF THE TOKEN IS VALID OR EXPIRED
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiresIn: { $gt: Date.now() },
    });
    // IF NOT
    if (!user) {
      return next(new AppError('Token invalid or expired', 400));
    }
    // CHANGE THE PASSWORD AND REMOVE TOKEN AND EXPIRY FROM DB
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpiresIn = undefined;
    await user.save();
    // SEND NEW JWT TOKEN
    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------------------------------

exports.updatePassword = async (req, res, next) => {
  // GET USER FROM DB
  try {
    const user = await User.findById(req.user.id).select('+password');

    // CHECK IF THE CURRENTPASSWORD AND PASSWORD IN DB IS SAME
    if (!(await user.correctPassword(req.body.currentPassword, user.password)))
      return next(new AppError(`current Password does not match`, 401));
    // IF YES CHANGE IT TO NEW PASSWORD
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------------------------------

exports.isLoggedIn = async (req, res, next) => {
  // CHECK IF THERE IS A TOKEN AND STARTS WITH BEARER(convention)
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      const freshUser = await User.findById(decoded.id);
      if (!freshUser) {
        return next();
      }

      // CHECK IF THE USER STILL EXIST

      // IF THE USER CHANGED THE PASSWORD AFTER TOKEN ISSUING , CHECKED FROM USERSCHEMA INSTANSE
      if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      res.locals.user = freshUser;
      return next();
    } catch (error) {
      return next();
    }
    // VERIFY THE TOKEN
  }
  next();
};
