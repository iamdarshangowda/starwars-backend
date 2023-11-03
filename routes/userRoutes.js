const express = require("express");
const router = express.Router();
const {
  userSignup,
  userLogin,
  refreshToken,
} = require("../controllers/userController");
const verifyToken = require("../middlewares/verifyToken");

router.post("/signup", userSignup);

router.post("/login", userLogin);

router.get("/verify", verifyToken);

router.get("/refresh", refreshToken);

module.exports = router;
