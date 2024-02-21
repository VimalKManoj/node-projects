const AppError = require('../utils/appErrors');
const Tour = require('./../models/tourModel');
const APIfeatures = require('./../utils/apiFeatures');

// ALAISING

exports.aliasTours = (req, res, next) => {
  req.query.sort = '-ratingsAverage , price';
  req.query.limit = '5';
  req.query.fields = 'name,price,difficulty,summary,ratingsAverage';
  next();
};

exports.getAllTours = async (req, res, next) => {
  try {
    // BEFORE GETTING ALL TOURS , CHECKS IF ANY OF THE FILTER IS THERE AND ADD IT TO THE QUERY
    const features = new APIfeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .fieldLimit()
      .paginate();

      // CHECKS THE FINAL QUERY AND GETS OUTPUT BASED ON THAT
    const tours = await features.query;

    res.status(200).json({
      status: 'Success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    next(error);
    // res.status(404).json({
    //   status: 'fail',
    //   message: 'something went wrong!',
    //   error,
    // });
  }
};

exports.getTour = async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.id).populate('reviews');

    if (!tour) {
      return next(new AppError(`Tour with ID not found`, 404));
    }

    res.status(200).json({
      status: 'Success',
      data: {
        tour,
      },
    });
  } catch (error) {
    next(error);
    // res.status(404).json({
    //   status: 'fail',
    //   message: 'something went wrong!',
    //   error,
    // });
  }
};

exports.createTour = async (req, res, next) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      results: newTour.length,
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    next(error);
    // console.error(error);
    // res.status(400).json({
    //   status: 'fail',
    //   message: 'Invalid data. Please check your request payload.',
    // });
  }
};

exports.updateTour = async (req, res, next) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!tour) {
      return next(new AppError(`Tour with ID not found`));
    }

    res.status(201).send({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    // res.status(400).json({
    //   status: 'fail',
    //   message: 'Invalid data. Please check your request payload.',
    // });
    next(error);
  }
};

exports.deleteTour = async (req, res, next) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
      return next(new AppError(`Tour with ID not found`));
    }

    res.status(204).send({
      status: 'deleted',
      data: null,
    });
  } catch (error) {
    // res.status(400).json({
    //   status: 'fail',
    //   message: 'Invalid data. Please check your request payload.',
    // });
    next(error);
  }
};

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
