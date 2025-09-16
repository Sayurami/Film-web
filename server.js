const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = 3000;

// MongoDB Connect
mongoose.connect("mongodb://localhost:27017/filmsDB")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Film Schema
const filmSchema = new mongoose.Schema({
  name: String,
  link: String,
  image: String
});
const Film = mongoose.model("Film", filmSchema);

// File Upload Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("uploads"));

// ✅ Public Page (View All Films)
app.get("/", async (req, res) => {
  const films = await Film.find();
  res.render("films", { films });
});

// ✅ Upload Page (Owner Only)
app.get("/upload", (req, res) => {
  res.render("upload");
});

// ✅ Handle Upload
app.post("/upload", upload.single("filmPhoto"), async (req, res) => {
  const ownerEmail = req.body.email;
  if (ownerEmail !== "sayuramihiranga4gmail.com") {
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

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
