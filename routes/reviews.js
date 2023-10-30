const express = require("express");
//merge params from reviews.js and app.js
const router = express.Router({ mergeParams: true });
//error handling utils
const catchAsync = require("../utils/catchAsync");
//controller
const reviews = require("../controllers/reviews");

// //joi for easier data validation
// const Joi = require("joi");
// const { reviewSchema } = require("../schemas.js");

//middleware for session authentication
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

// ---------- Campground Reviews ---------- //
router.post(
  "/",
  //validation middleware
  validateReview,
  isLoggedIn,
  catchAsync(reviews.createReview)
);

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.destroyReview)
);

module.exports = router;
