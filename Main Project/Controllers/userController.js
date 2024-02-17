
const User = require('./../models/userModel');


// USER ROUTE HANDLERS
exports.getAllUsers =async (req, res) => {
  try{
  const user = await User.find();

  res.status(200).json({
    status: 'Success',
    results: user.length,
    data: {
      user,
    },
  });
} catch (error) {
  next(error)
  
}};

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
