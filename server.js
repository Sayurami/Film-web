const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Film Schema
const filmSchema = new mongoose.Schema({
  name: String,
  link: String,
  image: String
});
const Film = mongoose.model("Film", filmSchema);

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("uploads"));

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
    image: req.file.filename
  });

  await newFilm.save();
  res.redirect("/");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
