const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSignup = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email, username and password");
  }

  const userAlreadyAvailable = await User.findOne({ email });

  if (userAlreadyAvailable) {
    res.status(400).json({ error: "User already registered" });
  }

  // Hash Password
  const hashPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    password: hashPassword,
  });

  if (user) {
    // Create Token
    const accessToekn = jwt.sign(
      {
        user: {
          email: user.email,
          id: user.id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "5m" }
    );

    res.status(201).json({
      user: { _id: user.id, email: user.email },
      accessToekn,
    });
  } else {
    res.status(400).json({ error: "User data not valid" });
  }
});

const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Please provide email and password" });
  }

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToekn = jwt.sign(
      {
        user: {
          email: user.email,
          id: user.id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "5m" }
    );

    res.status(200).json({
      accessToekn,
      user: { _id: user.id, email: user.email },
      message: "Logged in successfully",
    });
  } else {
    res.status(404).json({ error: "Email or Password is not valid" });
  }
});

module.exports = { userSignup, userLogin };
