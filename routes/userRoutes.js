const express = require('express');

const userController = require('./../Controller/usersController');
const authController = require('./../Controller/authController');
const route = express.Router();
route.post('/signup', authController.signup);
route.post('/login', authController.login);
route.get('/logout', authController.logout);
route.post('/forgotpassword', authController.forgetPassword);
route.patch('/resetpassword/:token', authController.resetPassword);
route.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updateMyPassword
);
route.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUser
);

route.patch(
  '/updateMe',
  authController.protect,
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
route.patch(
  '/deleteme',
  authController.protect,
  userController.deleteCurrentUser
);

route.use(authController.restrictTo('admin')); //only admin use to do below functions

route
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
route
  .route('/:id')
  .patch(authController.protect, userController.updateUser)
  .get(authController.protect, userController.getUser)
  .delete(authController.protect, userController.deleteUser);

module.exports = route;
