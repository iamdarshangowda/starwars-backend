const express = require("express");
const router = express.Router();
const { userSignup, userLogin } = require("../controllers/userController");
const verifyToken = require("../middlewares/verifyToken");

router.post("/signup", userSignup);

router.post("/login", userLogin);

router.get("/verify", verifyToken);

module.exports = router;
