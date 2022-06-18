class APIFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludeQuery = ['sort', 'limit', 'page', 'field'];

    excludeQuery.forEach((el) => delete queryObj[el]);
    // const tours = await Tour.find({
    //   duration: 5,
    //   difficulty: 'easy',
    // });

    //const tours = await Tour.find().where('duration').equals(5).where()
    // Advance filter
    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    queryStr = JSON.parse(queryStr);
    this.query = this.query.find(queryStr);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    }
    return this;
  }

  fields() {
    if (this.queryString.field) {
      const field = this.queryString.field.split(',').join(' ');
      this.query = this.query.select(field);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  pagination() {
    const page = this.queryString.page * 1;
    const limit = this.queryString.limit * 1;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeature;
