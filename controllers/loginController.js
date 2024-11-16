// external imports
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const createError = require("http-errors");

// internal imports
const User = require("../models/People");

// get login page
function getLogin(req, res, next) {
  res.render("index", {
    errors: {
      common: {
        msg: "",
      },
    },
  });
}

// do login
async function login(req, res, next) {
  try {
    // find a user who has this email/username
    const user = await User.findOne({
      $or: [{ email: req.body.username }, { mobile: req.body.username }],
    });

    if (user && user._id) {
      const isValidPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );

      if (isValidPassword) {
        // prepare the user object to generate token
        const userObject = {
          userid: user._id,
          username: user.name,
          email: user.email,
          avatar: user.avatar || null,
          role: user.role || "user",
        };

        // generate token
        const token = jwt.sign(userObject, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRY,
        });

        // set cookie
        res.cookie(process.env.COOKIE_NAME, token, {
          maxAge: process.env.JWT_EXPIRY,
          httpOnly: true,
          signed: true,
        });

        // set logged in user local identifier
        res.locals.loggedInUser = userObject;

        res.redirect("inbox");
      } else {
        throw createError("Login failed! Please try again.");
      }
    } else {
      throw createError("Login failed! Please try again.");
    }
  } catch (err) {
    res.render("index", {
      data: {
        username: req.body.username,
      },
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
}

async function getSignup(req, res) {
  res.render("signup", {
    errors: {
      common: {
        msg: "",
      },
    },
  });
}

async function signup(req, res) {
  try {
    // get user input
    const { name, email, mobile, password } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }],
    });

    if (existingUser) {
      throw createError("User already exists with this email or mobile!");
    }

    if (!name || !email || !mobile || !password) {
      throw createError("All fields are required!");
    }

    if (password.length < 6) {
      console.log("password length is less than 6", password.length);
      throw createError({
        errors: {
          email: {
            msg: "Password must be at least 6 characters long!",
          },
        },
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new user
    const newUser = new User({
      name,
      email,
      mobile,
      password: hashedPassword,
    });

    // save user
    await newUser.save();

    // prepare user object for token
    const userObject = {
      name: newUser.name,
      mobile: newUser.mobile,
      email: newUser.email,
      role: "user",
    };

    // generate token
    const token = jwt.sign(userObject, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
    });

    // set cookie
    res.cookie(process.env.COOKIE_NAME, token, {
      maxAge: process.env.JWT_EXPIRY,
      httpOnly: true,
      signed: true,
    });

    // set logged in user local identifier
    res.locals.loggedInUser = userObject;

    res.redirect("inbox");
  } catch (err) {
    res.render("signup", {
      data: {
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
      },
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
}

// do logout
function logout(req, res) {
  res.clearCookie(process.env.COOKIE_NAME);
  res.send("logged out");
}

module.exports = {
  getLogin,
  login,
  logout,
  getSignup,
  signup,
};
