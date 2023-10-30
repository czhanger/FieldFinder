const Campground = require("./models/campground");
const Review = require("./models/reviews");
const ExpressError = require("./utils/ExpressError");
const { campgroundSchema, reviewSchema } = require("./schemas.js");

module.exports.isLoggedIn = (req, res, next) => {
  //passport built in session authentication
  if (!req.isAuthenticated()) {
    // store the originalURL (where user was before logging in)
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in");
    return res.redirect("/login");
  }
  next();
};

// save returnTo value from session to res.locals
module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

//check if current user is allowed to edit the campground
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    res.redirect(`/campgrounds/${campground.id}`);
  }
  next();
};

module.exports.validateCampground = (req, res, next) => {
  // catch invalid data and throw it to catchAsync
  // destructure error from exported Joi object
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    //map all error messages to msg and throw it
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (campground && !campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    res.redirect(`/campgrounds/${campground.id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};
