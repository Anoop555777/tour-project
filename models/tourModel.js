const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name must be required for tour '],
      unique: true,
      trim: true,
      maxlength: [40, 'Name should not be longer than 40 characters'],
      minlength: [10, 'Name should not be less than 40 characters'],
      // validate:[validator.isAlpha,'name must have only characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Duration must be required for tour '],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'group size must be required for tour '],
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty must be required for tour '],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        messages: 'Difficulity must be either easy, medium or difficult',
      },
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must be greater than 1'],
      max: [5, 'rating must be greater than 5'],
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: [true, 'price must be required for tour'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          //only work when new data is created not for update this keyword allows point to the current document
          return value <= this.price / 2;
        },
        message: 'Discount price must be atmost 50%',
      },
    },
    summary: {
      type: String,
      required: [true, 'Summary must be required for tour'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },

    imageCover: {
      type: String,
      required: [true, 'Image must be required for tour'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
//Document middleware used only for save() and create() before save in database
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//for embedded
// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save', function (next) {
//   console.log('saving the data');

//   next();
// });

// tourSchema.post('create', function (doc, next) {
//   console.log(doc);
//   next();
// });

//Query middleWare
// for all start with find
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select:
      '-__v -passwordChangedAt -role -passwordResetToken -passwordResetExpires',
  });

  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);

  // console.log(docs);
  next();
});

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { selectTour: { $ne: true } } });
  next();
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
