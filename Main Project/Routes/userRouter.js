const express = require('express');

const router = express.Router();

const userControllers = require('./../Controllers/userController');
const authControllers = require('./../Controllers/authController');

router.post('/signup', authControllers.signup);
router.post('/login', authControllers.login);

router.post('/forgotPassword',authControllers.forgotPassword)
router.patch('/resetPassword/:id',authControllers.resetPassword)


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
