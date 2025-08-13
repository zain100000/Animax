const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();

// Middleware Setup
app.use(bodyParser.json({ limit: "20kb" }));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// CORS Headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

// Route Imports
const superAdminRoute = require("./routes/super-admin.route");
const animeRoute = require("./routes/anime.route");
const seasonRoute = require("./routes/season.route");
const episodeRoute = require("./routes/episode.route");
const userRoute = require("./routes/user.route");
const watchlistRoute = require("./routes/watchlist.route");
const watchProgressRoute = require("./routes/watch-progress.route");

// Route Mounting
app.use("/api/super-admin", superAdminRoute);
app.use("/api/anime", animeRoute);
app.use("/api/season", seasonRoute);
app.use("/api/episode", episodeRoute);
app.use("/api/user", userRoute);
app.use("/api/watchlist", watchlistRoute);
app.use("/api/watch-progress", watchProgressRoute);

// Database Connection and Server Startup
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully!");
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
