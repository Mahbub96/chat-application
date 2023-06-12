const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");

const app = express();
dotenv.config();

// database connection
mongoose
  .connect(process.env.MONGO_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("database connection successfull"))
  .catch((err) => console.log(err));

// request process
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// set view engnine
app.set("view engine", "ejs");

// set static folder
app.use(express.static(path.join(__dirname, "public")));

// parser cookie
app.use(cookieParser(process.env.COOKIE_SECRET));

// routing setup

// error handleding

app.listen(process.env.PORT, () => {
  console.log(`app listening to port ${process.env.PORT}`);
});
