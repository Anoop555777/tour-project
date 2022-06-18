const APIFeature = require('./../utils/apiFeatures');
const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Factory = require('./../Controller/handleFactory');

// exports.checkId = (req, res, next, val) => {
//   console.log('tour id is ', val);

//   if (+req.params.id > tours.length) {
//     return res.status(404).json({ status: 'failed', message: 'Invalid ID' });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res
//       .status(400)
//       .json({ status: 'failed', message: 'Missing name or price or both ' });
//   }
//   next();
// };

exports.alaisTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price';
  req.query.field = 'name,price,duration,difficulty';

  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  //filter
  // const queryObj = { ...req.query };
  // const excludeQuery = ['sort', 'limit', 'page', 'field'];

  // excludeQuery.forEach((el) => delete queryObj[el]);
  // // const tours = await Tour.find({
  // //   duration: 5,
  // //   difficulty: 'easy',
  // // });

  // //const tours = await Tour.find().where('duration').equals(5).where()
  // // Advance filter
  // let queryStr = JSON.stringify(queryObj);

  // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  // queryStr = JSON.parse(queryStr);
  // let query = Tour.find(queryStr);

  //sort
  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(',').join(' ');
  //   query = query.sort(sortBy);

  //   //sort {price ratingA}
  // }
  //because of pagination
  //else {
  //   query = query.sort('-createdAt');
  // }

  // //field
  // if (req.query.field) {
  //   const field = req.query.field.split(',').join(' ');
  //   query = query.select(field);
  // } else {
  //   query = query.select('-__v');
  // }

  // //paganation

  // const page = req.query.page * 1;
  // const limit = req.query.limit * 1;
  // const skip = (page - 1) * limit;
  // console.log(skip);

  // if (req.query.page) {
  //   const numTours = await Tour.countDocuments();
  //   if (numTours <= skip) throw new Error('This page does not exist');
  // }

  // query = query.skip(skip).limit(limit);

  const features = new APIFeature(Tour.find(), req.query)
    .filter()
    .sort()
    .fields()
    .pagination();
  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTours = catchAsync(async (req, res, next) => {
  //console.log(req.params); to find if id parameter
  // const id = +req.params.id;
  // const tour = tours.find((el) => el.id === id);
  // // if (!tour) {
  // //   //check is the tours is undefined in the id
  // //   return res.status(404).json({ status: 'failed', message: 'Invalid ID' });
  // // }

  const tour = await Tour.findById(req.params.id).populate('reviews');
  //if little change in id the it return status 200 with data null so use
  if (!tour) {
    return next(new AppError('no tour found of this ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = Factory.createOne(Tour);

// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);

//   //console.log(req.body);

//   // const newId = tours[tours.length - 1].id + 1;
//   // const newTour = Object.assign({ id: newId }, req.body);
//   // tours.push(newTour);
//   // fs.writeFile(
//   //   `${__dirname}/dev-data/data/tours-simple.json`,
//   //   JSON.stringify(tours),
//   //   (err) => {
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tours: newTour,
//     },
//   });
//   //   }
//   // );
// });

exports.deleteTour = Factory.deleteOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   // try {
//   //   await Tour.findByIdAndDelete(req.params.id);
//   //   res
//   //     .status(204) //used for null
//   //     .json({ status: 'success', data: null });
//   // } catch (err) {
//   //   res.status(400).json({ status: 'failed', message: err });
//   // }

//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppError('no tour found of this ID', 404));
//   }
//   res
//     .status(204) //used for null
//     .json({ status: 'success', data: null });
// });

exports.updateTour = Factory.updateOne(Tour);

exports.getAllStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingAverage' },
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);



  res.status(200).json({ status: 'success', data: { stats } });
});

exports.getMontlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;


  const plans = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },

    {
      $group: {
        _id: {
          $month: '$startDates',
        },
        numOfTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },

    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        noOfTours: -1,
      },
    },

    {
      $limit: 12,
    },
  ]);
  res.status(200).json({ status: 'success', data: { plans } });
});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

// upload.single('image') req.file
// upload.array('images', 5) req.files

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);
  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});
