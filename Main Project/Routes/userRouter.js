const express = require('express');

const router = express.Router();

const userControllers = require('./../Controllers/userController');

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
