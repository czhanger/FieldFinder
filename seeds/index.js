const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "64d21de4947dcfd3edb759da",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url: "https://res.cloudinary.com/djgv7corh/image/upload/v1692014500/YelpCamp/bhcpfpm0hxxyltpa6nz9.jpg",
          filename: "YelpCamp/bhcpfpm0hxxyltpa6nz9",
        },
      ],
      description:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Doloremque alias provident deleniti ad? Iusto rem in quidem corrupti harum dolorum accusamus, quasi nesciunt non ullam repellat nostrum, numquam earum est.",
      price,
    });
    await camp.save();
  }
};

// exit out of db once seed data is generated
seedDB().then(() => {
  mongoose.connection.close();
});
