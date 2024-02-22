const AppError = require('../utils/appErrors');
const APIfeatures = require('./../utils/apiFeatures');

// CREATES A FACTORY HANDLER FOR ALL FUNCTIONS AND PASS IT TO ALL

exports.deleteOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError(`document with ID not found`));
    }

    res.status(204).send({
      status: 'deleted',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError(`document with ID not found`));
    }

    res.status(201).send({
      status: 'success',
      data: {
        data: doc,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getOne = (Model, popOptions) => async (req, res, next) => {
  try {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      return next(new AppError(`document with ID not found`, 404));
    }

    res.status(200).json({
      status: 'Success',
      data: {
        data: doc,
      },
    });
  } catch (error) {
    next(error);
  }
};
   

exports.getAll = (Model) => async (req, res, next) => {
  try {
    // TO ALLOW FOR NESTED GET REVIEWS ON TOUR
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // BEFORE GETTING ALL , CHECKS IF ANY OF THE FILTER IS THERE AND ADD IT TO THE QUERY
    const features = new APIfeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .fieldLimit()
      .paginate();

    // CHECKS THE FINAL QUERY AND GETS OUTPUT BASED ON THAT
    const doc = await features.query;

    res.status(200).json({
      status: 'Success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  } catch (error) {
    next(error);
  }
};
