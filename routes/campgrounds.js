const express = require("express");
const router = express.Router();
//handles files in form
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

//abstract the code within router by storing them in functions in a controller page
const campgrounds = require("../controllers/campgrounds");
//error handling utils
const catchAsync = require("../utils/catchAsync");
//middleware for session authentication
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const { validate } = require("../models/reviews");

//group routes with the same address using router.route and then chaining all requests
router
  .route("/")
  .get(catchAsync(campgrounds.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.createCampground)
  );

// new must go before .get :id or else new will be treated as an id
// ---------- New Campground ---------- //
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(campgrounds.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.destroyCampground));

// ---------- Edit Campground ---------- //
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);
router;
// ---------- Add Images to Existing Campground ---------- //
router
  .route("/:id/addImages")
  .get(isLoggedIn, isAuthor, catchAsync(campgrounds.renderAddImageForm))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    catchAsync(campgrounds.addImage)
  );
  
module.exports = router;
