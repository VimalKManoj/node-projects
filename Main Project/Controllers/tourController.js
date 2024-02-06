const fs = require('fs')

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
  );
  
  // TOUR ROUTE HANDLERS
  
exports.getAllTours = (req, res) => {
    res.status(200).json({
      status: 'sucess',
      result: tours.length,
      data: {
        tours,
      },
    }); 
  };
  
  exports.getTour = (req, res) => {
    const id = req.params.id * 1;
  
    const tour = tours.find((tour) => tour.id === id);
  
    if (!tour) {
      return res.status(404).json({
        status: 'fail',
      });
    }
    console.log(id);
    res.status(201).json({
      status: 'success',
      data: {
        tour,
      },
    });
  };
  
  exports.createTour = (req, res) => {
    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body);
  
    tours.push(newTour);
  
    fs.writeFile(
      `${__dirname}/dev-data/data/tours-simple.json`,
      JSON.stringify(tours),
      (err) => {
        res.status(201).send({
          status: 'success',
          data: { tour: newTour },
        });
      }
    );
  };
  
  exports.updateTour = (req, res) => {
    if (req.params.id * 1 > tours.length) {
      return res.status(404).json({
        status: 'fail',
      });
    }
    res.status(201).send({
      status: 'success',
      data: 'updated',
    });
  };
  
  exports.deleteTour = (req, res) => {
    console.log(req.params);
    if (req.params.id * 1 > tours.length) {
      return res.status(404).json({
        status: 'fail',
      });
    }
    res.status(204).send({
      status: 'deleted',
      data: null,
    });
  };