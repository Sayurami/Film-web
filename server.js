const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer Storage (Cloudinary)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "films",
    allowed_formats: ["jpg", "jpeg", "png"]
  }
});
const upload = multer({ storage });

// Film Schema
const filmSchema = new mongoose.Schema({
  name: String,
  link: String,
  image: String
});
const Film = mongoose.model("Film", filmSchema);

// Middlewares
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get("/", async (req, res) => {
  const films = await Film.find();
  res.render("films", { films });
});

app.get("/upload", (req, res) => res.render("upload"));

app.post("/upload", upload.single("filmPhoto"), async (req, res) => {
  const ownerEmail = req.body.email;
  if (ownerEmail !== process.env.OWNER_EMAIL) {
    return res.send("❌ Unauthorized! Only owner can upload.");
  }

  const newFilm = new Film({
    name: req.body.filmName,
    link: req.body.filmLink,
    image: req.file.path // Cloudinary hosted URL
  });

  await newFilm.save();
  res.redirect("/");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
