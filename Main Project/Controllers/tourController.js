const Tour = require('./../models/tourModel');

// TOUR ROUTE HANDLERS

exports.getAllTours = async (req, res) => {
  try {
    // FILTERING
    const queryObj = { ...req.query };
    const excludedFields = ['sort', 'limit', 'page', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // ADVANCED FILTERING

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(lt | lte | gt |gte)\b/g,
      (match) => `$${match}`,
    );
    console.log(JSON.parse(queryStr));

    let query = Tour.find(JSON.parse(queryStr));

    // SORTING
    if (req.query.sort) {
      const SortBy = req.query.sort.split(',').join(' ');
      query = query.sort(SortBy);
      // query = query.sort(req.query.sort) //simple sorting
    } else {
      query = query.sort('-createdAt');
    }

    // FIELD LIMITING

    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query.select('-__v');
    }

    // PAGINATION

    const page = req.query.page || 1;
    const limit = req.query.limit || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page is not found');
    }
    const tours = await query;

    res.status(200).json({
      status: 'Success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: 'something went wrong!',
      error,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'Success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: 'something went wrong!',
      error,
    });
  }
};

exports.createTour = async (req, res) => {
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
    console.error(error);
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data. Please check your request payload.',
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(201).send({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data. Please check your request payload.',
    });
  }
};

exports.deleteTour = (req, res) => {
  try {
    Tour.findByIdAndDelete(req.params.id);
    res.status(204).send({
      status: 'deleted',
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data. Please check your request payload.',
    });
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
