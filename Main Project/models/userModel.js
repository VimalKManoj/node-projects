const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    reqired: [true, 'please tell us your name !'],
  },
  email: {
    type: String,
    reqired: [true, 'Please provide your email'],
    unique: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: { type: String, default: 'default.jpg' },
  changedPasswordAt: Date,
  passwordResetToken: String,
  passwordResetExpiresIn: Date,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
});

// ---------------------------------------------------------------------------------------------------
userSchema.pre(/^find/, function (next) {
  // WHEN DELETE ME IS PERFORMED USER ACTIVE IS SET TO FALSE , THEN ONLY SHOW USER ACTIVE NOT FALSE
  this.find({ active: { $ne: false } });

  next();
});

// ---------------------------------------------------------------------------------------------------
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  // CHECKING IF PASSWORD IS MODIFIED BEFORE SAVE OR IS A NEW DATA
  if (!this.isModified('password') || this.isNew) return next();
  // IF PASSWORD IS CHANGED SETTING THE TIME
  this.changedPasswordAt = Date.now() - 1000;

  next();
});

// ---------------------------------------------------------------------------------------------------

// CREATE A NEW INSTANCE ON ALL OBJECT WHICH COMPARES THE ORIGINAL PASSWORD WITH LOGIN PASSWORD
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// ---------------------------------------------------------------------------------------------------
// CHECKING WHEN THE PASSWORD WAS CHANGED : BEFORE OR AFTER TOKEN IS ISSUED
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.changedPasswordAt) {
    const changedTimeStamp = parseInt(
      this.changedPasswordAt.getTime() / 1000,
      10,
    );
    return JWTTimeStamp < changedTimeStamp;
  }
  return false;
};

// ---------------------------------------------------------------------------------------------------

// CREATE A RANDOM TOKEN AND SEND TO CLIENT TO RESET PASSWORD

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  // ENCRYPT THE TOKEN AND SAVE IT IN THE DB
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpiresIn = Date.now() + 10 * 60 * 1000;
  // SEND THE DECRYPTED TOKEN
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
