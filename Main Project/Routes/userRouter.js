const express = require('express');

const router = express.Router();

const userControllers = require('./../Controllers/userController');
const authControllers = require('./../Controllers/authController');

router.post('/signup', authControllers.signup);
router.post('/login', authControllers.login);

router.post('/forgotPassword', authControllers.forgotPassword);
router.patch('/resetPassword/:token', authControllers.resetPassword);

router.patch(
  '/updatePassword',
  authControllers.protect,
  authControllers.updatePassword,
);
router.patch(
  '/updateMyData',
  authControllers.protect,
  userControllers.updateMe,
);
router.delete('/deleteMe', authControllers.protect, userControllers.deleteMe);

router
  .route('/')
  .get(userControllers.getAllUsers)
  .post(userControllers.createUser);

router
  .route('/:id')
  .patch(userControllers.updateUser)
  .get(userControllers.getUser)
  .delete(userControllers.deleteUser);

module.exports = router;
