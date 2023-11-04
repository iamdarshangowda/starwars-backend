const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// SIGN UP
const userSignup = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide email, username and password");
  }

  const userAlreadyAvailable = await User.findOne({ email });

  if (userAlreadyAvailable) {
    res.status(400).json({ error: "User already registered" });
    return;
  }

  // Hash Password
  const hashPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    password: hashPassword,
  });

  if (user) {
    // Create Token
    const accessToken = jwt.sign(
      {
        user: {
          email: user.email,
          id: user.id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "5m" }
    );

    // Create Refresh Token
    const refreshToken = jwt.sign(
      {
        user: {
          email: user.email,
          id: user.id,
        },
      },
      process.env.REFRESH_TOKEN_SECRET
    );

    res.status(201).json({
      user: { _id: user.id, email: user.email },
      accessToken,
      refreshToken,
    });
  } else {
    res.status(400).json({ error: "User data not valid" });
    return;
  }
});

// LOGIN
const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Please provide email and password" });
    return;
  }

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    // Create Token
    const accessToken = jwt.sign(
      {
        user: {
          email: user.email,
          id: user.id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "5m" }
    );

    // Create Refresh Token
    const refreshToken = jwt.sign(
      {
        user: {
          email: user.email,
          id: user.id,
        },
      },
      process.env.REFRESH_TOKEN_SECRET
    );

    res.status(200).json({
      accessToken,
      refreshToken,
      user: { _id: user.id, email: user.email },
      message: "Logged in successfully",
    });
  } else {
    res.status(404).json({ error: "Email or Password is not valid" });
    return;
  }
});

const refreshToken = asyncHandler(async (req, res) => {
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader !== undefined) {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];

    jwt.verify(
      bearerToken,
      process.env.REFRESH_TOKEN_SECRET,
      (error, authData) => {
        if (error) {
          res.status(401).json({
            tokenValid: false,
            message: "refresh token invalid",
          });
        } else {
          console.log(authData);
          const accessToken = jwt.sign(
            {
              user: {
                email: authData.user.email,
                id: authData.user.id,
              },
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "5m" }
          );

          res.status(200).json({
            tokenValid: true,
            accessToken,
            message: "Token Updated",
          });
        }
      }
    );
  } else {
    res.status(403).json({ error: "User not authorised" });
  }
});

module.exports = { userSignup, userLogin, refreshToken };
