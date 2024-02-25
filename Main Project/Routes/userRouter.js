const express = require('express');

const router = express.Router();

const userControllers = require('./../Controllers/userController');
const authControllers = require('./../Controllers/authController');

router.post('/signup', authControllers.signup);
router.post('/login', authControllers.login);
router.post('/forgotPassword', authControllers.forgotPassword);
router.get('/logout', authControllers.logout);
router.patch('/resetPassword/:token', authControllers.resetPassword);

router.use(authControllers.protect);

router.patch('/updatePassword', authControllers.updatePassword);
router.get('/me', userControllers.getMe, userControllers.getUser);
router.patch(
  '/updateMyData',
  userControllers.uploadUserPhoto,
  userControllers.resizeUserPhoto,
  userControllers.updateMe,
);

router.delete('/deleteMe', authControllers.protect, userControllers.deleteMe);

router.use(authControllers.restrictTo('admin'));
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
