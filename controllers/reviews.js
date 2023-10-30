const Campground = require("../models/campground");
const Review = require("../models/reviews");
const User = require("../models/user");

module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  const user = await User.findById(req.user._id);
  //add review to campground array
  campground.reviews.push(review);
  user.reviews.push(review);

  await user.save();
  await review.save();
  await campground.save();
  req.flash("success", "Created a new review");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.destroyReview = async (req, res) => {
  const { id, reviewId } = req.params;
  // delete review from list of reviews on campground
  await Campground.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });
  // delete review from list of reviews on user
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { reviews: reviewId },
  });
  // delete review in Reviews
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted review");
  res.redirect(`/campgrounds/${id}`);
};
