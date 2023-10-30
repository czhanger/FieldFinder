//if we are in development mode, require the .env package
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const ExpressError = require("./utils/ExpressError");

// prevent mongo injections by sanitizing user inputs
const mongoSanitize = require("express-mongo-sanitize");

const helmet = require("helmet");

//Routes
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

// Session cookies for flash and auth
const session = require("express-session");
// quickly flash a message one time (successful log-in, errors, etc)
const flash = require("connect-flash");

//ejsMate for layout/boilerplate in ejs
const ejsMate = require("ejs-mate");

//mongoose db
mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

// use ejsMate instead of the default
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Use static
app.use(express.static(path.join(__dirname, "public")));
// Middleware, on every request these functions are called
// parses query from the url
app.use(express.urlencoded({ extended: true }));
// allows use of other methods
app.use(methodOverride("_method"));

app.use(mongoSanitize());

//create session cookie config
const sessionConfig = {
  //change name from default
  name: "session",
  secret: "thisshouldbeabettersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    //disable cross-site scripts
    httpOnly: true,
    //date.now is in milliseconds, convert to a week from now
    //when deloying, set secure to be true, cookies can only be configured over HTTPS, cant be done over localhost
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

//approved third-party sites
//restricting locations we can fetch scripts from
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com",
  "https://api.tiles.mapbox.com",
  "https://api.mapbox.com",
  "https://kit.fontawesome.com",
  "https://cdnjs.cloudflare.com",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com",
  "https://stackpath.bootstrapcdn.com",
  "https://api.mapbox.com",
  "https://api.tiles.mapbox.com",
  "https://fonts.googleapis.com",
  "https://use.fontawesome.com",
];
const connectSrcUrls = [
  "https://api.mapbox.com",
  "https://*.tiles.mapbox.com",
  "https://events.mapbox.com",
];

const fontSrcUrls = [];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/djgv7corh/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

//passport authentication middleware for persistant login sessions
//app.use session must come before passport.session
app.use(passport.initialize());
app.use(passport.session());
//use LocalStrategy and authentication method is on User, through passport-local-mongoose
passport.use(new LocalStrategy(User.authenticate()));
//How do we store a user in a session
passport.serializeUser(User.serializeUser());
//How do we unstore a user in a session
passport.deserializeUser(User.deserializeUser());

//flash middleware
//runs before every call, if something is saved in success or error, that will be stored in res.local
app.use((req, res, next) => {
  // store current user in locals on every call
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// ---------- Routes ---------- //
//routers
//app.use(url name, router)
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

// ---------- Error Handling---------- //

//If no previous route matched, respond with a 404
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  //default values given
  const { statusCode = 500, message = "Something went wrong" } = err;
  if (!err.message) err.message = "Something went wrong";
  res.status(statusCode).render("error", { err });
});

// ---------- PORT---------- //
app.listen(3000, () => {
  console.log("Serving on port 3000");
});
