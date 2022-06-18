const express = require('express');
const reviewController = require('./../Controller/reviewController');
const authController = require('./../Controller/authController');
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

router
  .route('/:id')
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'user'),
    reviewController.deleteReview
  )
  .get(authController.protect, reviewController.getReview)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'user'),
    reviewController.updateReview
  );
module.exports = router;
