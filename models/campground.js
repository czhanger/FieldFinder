const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviews");

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

//We make image its own schema, because we cannot created virtuals for nested properties
//not stored in database, but every time we call thumbnail, mongo runs this function
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true } };

const campgroundSchema = new Schema(
  {
    title: String,
    //images is an array of ImageSchema mongoose objects
    images: [ImageSchema],
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    price: Number,
    description: String,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);

//passed into cluster map to be displayed in popup
campgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `
  <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
  `;
});

//delete all reviews associated with campground with post middleware
campgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      // delete all reviews from Review where their id is in our campground object
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Campground", campgroundSchema);
