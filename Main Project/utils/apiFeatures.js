class APIfeatures {
  // CONSTRUCTOR METHOD IS CALLED FIRST WHEN CLASS IS CALLED
  constructor(query, queryString) {
    // find()
    this.query = query;
    // req.query
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['sort', 'limit', 'page', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // ADVANCED FILTERING

    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(
    //   /\b(lt | lte | gt |gte)\b/g,
    //   (match) => `$${match}`,
    // );

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    console.log(JSON.parse(queryStr));

    // this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const SortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(SortBy);
      // query = query.sort(req.query.sort) //simple sorting
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  fieldLimit() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page || 1;
    const limit = this.queryString.limit || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIfeatures;
