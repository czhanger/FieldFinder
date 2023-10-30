const User = require("../models/user");

module.exports.renderUser = (req, res) => {
  res.render("users/register");
};

module.exports.registerUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    //takes user and password, hashes+salts password, stores it on user
    const registeredUser = await User.register(user, password);
    //passport login function used primarly to login users after registering
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Yelp Camp!");
      res.redirect("/campgrounds");
    });
  } catch (e) {
    //passport will auto check for duplicate usernames
    req.flash("error", e.message);
    res.redirect("register");
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome Back!");
  // if returnTo url exists OR use /campgrounds
  const redirectUrl = res.locals.returnTo || "/campgrounds";
  // delete it from session after use
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  //passport builtin function
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });
};

module.exports.renderAccount = async (req, res) => {
  const id = req.user._id;
  const user = await User.findById(id).populate("reviews");
  res.render("users/accountPage", { user });
};
