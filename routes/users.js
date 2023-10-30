const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const users = require("../controllers/users");

const { storeReturnTo } = require("../middleware");
const { isLoggedIn, isAuthor } = require("../middleware");

router
  .route("/register")
  .get(users.renderUser)
  .post(catchAsync(users.registerUser));

router
  .route("/login")
  .get(users.renderLogin)
  .post(
    storeReturnTo,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.login
  );

router.get("/logout", users.logout);

router.route("/:id").get(isLoggedIn, catchAsync(users.renderAccount));

module.exports = router;
