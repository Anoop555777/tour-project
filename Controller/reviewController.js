const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const Factory = require('./../Controller/handleFactory');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const reviews = await Review.find(filter);
  res.status(200).json({
    status: 'success',
    result: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id; //comes from protect route
  const review = await Review.create(req.body);
  res.status(201).json({
    status: 'success',

    data: {
      review,
    },
  });
});

exports.updateReview = Factory.updateOne(Review);

exports.deleteReview = Factory.deleteOne(Review);

exports.getReview = Factory.getOne(Review);
