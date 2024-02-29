const AppError = require('../utils/appErrors');
const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../models/tourModel');
// const APIfeatures = require('./../utils/apiFeatures');
const factory = require('./handlerFactory');


// MULTER LIBRARY FOR IMAGE OR FILE UPLOADING
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('please upload only image ', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadTourPhoto = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  {
    name: 'images',
    maxCount: 3,
  },
]);
// IMAGE RESIZING FUNCTION USING MULTER AND SHARP
exports.resizeTourPhoto = async (req, res, next) => {
  try {
    if (!req.files.imageCover || !req.files.images) return next();

    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/users/${req.body.imageCover}`);

    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/users/${filename}`);
        req.body.images.push(filename);
      }),
    );
    next();
  } catch (error) {
    next(error);
  }
};

// ALAISING
exports.aliasTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// ----------------- All functions from handler Factory -------------------

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews' });
// exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

// STATS ROUTE-------------------------------------------------------------

exports.getTourStats = async (req, res, next) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          tourNum: { $sum: 1 },
          avgRatings: { $avg: '$ratingsAverage' },
          numQuantity: { $sum: '$ratingsQuantity' },
          avgPrice: { $avg: '$price' },
          maxPrice: { $max: '$price' },
          minPrice: { $min: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
    ]);
    res.status(201).send({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMonthlyPlans = async (req, res, next) => {
  try {
    const year = req.params.year;

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
          _id: { $month: '$startDates' },
          numTourStart: { $sum: 1 },
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
          numTourStart: -1,
        },
      },
    ]);

    res.status(201).send({
      status: 'success',
      data: {
        plans,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getToursWithIn = async (req, res, next) => {
  const { distance, latlong, unit } = req.params;
  const [lat, long] = latlong.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !long) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,long',
        400,
      ),
    );
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[long, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.getDistances = async (req, res, next) => {
  const { latlong, unit } = req.params;
  const [lat, long] = latlong.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !long) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,long',
        400,
      ),
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [long * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: { name: 1, distance: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      distances,
    },
  });
};

// ----------------------------------------------------------------------------------------

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkID = (req, res, next, val) => {
//   console.log(`The ID is :${val}`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'missing name or price',
//     });
//   }
//   next();
// };

// exports.createTour = (req, res) => {
// const newId = tours[tours.length - 1].id + 1;
// const newTour = Object.assign({ id: newId }, req.body);
// tours.push(newTour);
// fs.writeFile(
//   `${__dirname}/dev-data/data/tours-simple.json`,
//   JSON.stringify(tours),
//   (err) => {
//     res.status(201).send({
//       status: 'success',
//       data: { tour: newTour },
//     });
//   },
// );
// };

//------------------------------------------------------------------------------------------------------------------------------------------

// FILTERING
// const queryObj = { ...req.query };
// const excludedFields = ['sort', 'limit', 'page', 'fields'];
// excludedFields.forEach((el) => delete queryObj[el]);

// // ADVANCED FILTERING

// let queryStr = JSON.stringify(queryObj);
// queryStr = queryStr.replace(
//   /\b(lt | lte | gt |gte)\b/g,
//   (match) => `$${match}`,
// );
// console.log(JSON.parse(queryStr));

// let query = Tour.find(JSON.parse(queryStr));

// SORTING
// if (req.query.sort) {
//   const SortBy = req.query.sort.split(',').join(' ');
//   query = query.sort(SortBy);
//   // query = query.sort(req.query.sort) //simple sorting
// } else {
//   query = query.sort('-createdAt');
// }

// FIELD LIMITING

// if (req.query.fields) {
//   const fields = req.query.fields.split(',').join(' ');
//   query = query.select(fields);
// } else {
//   query.select('-__v');
// }

// PAGINATION

// const page = req.query.page || 1;
// const limit = req.query.limit || 100;
// const skip = (page - 1) * limit;

// query = query.skip(skip).limit(limit);

// ---------------------------------------------------------------------------------------------------------------

// exports.deleteTour = async (req, res, next) => {
//   try {
//     const tour = await Tour.findByIdAndDelete(req.params.id);

//     if (!tour) {
//       return next(new AppError(`Tour with ID not found`));
//     }

//     res.status(204).send({
//       status: 'deleted',
//       data: null,
//     });
//   } catch (error) {
//     // res.status(400).json({
//     //   status: 'fail',
//     //   message: 'Invalid data. Please check your request payload.',
//     // });
//     next(error);
//   }
// };
