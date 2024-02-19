const AppError = require('../utils/appErrors');
const User = require('./../models/userModel');

// USER ROUTE HANDLERS

// FILTERING ONLY ALLOWED FIELDS TO BE UPDATED , EG : ROLE CANT BE UPDATED

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const user = await User.find();

    res.status(200).json({
      status: 'Success',
      results: user.length,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(`Can't Update password here ,Check Update Password`, 400),
      );
    }
    const filterBody = filterObj(req.body, 'name', 'email');
    const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        user: updateUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteMe = async (req, res, next) => {
 try {
   await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status : 'success',
    data:null
  })
 } catch (error) {
  next(error)
 }
 
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'not defined',
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'not defined',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'not defined',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'not defined',
  });
};
