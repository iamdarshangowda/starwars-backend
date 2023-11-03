const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader !== undefined) {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];

    jwt.verify(
      bearerToken,
      process.env.ACCESS_TOKEN_SECRET,
      (error, authData) => {
        if (error) {
          res.status(401).json({
            tokenValid: false,
            message: "jwt expired",
          });
        } else {
          res.status(200).json({
            tokenValid: true,
          });
        }
      }
    );
  } else {
    res.status(403);
    throw new Error("User not authorised");
  }
}

module.exports = verifyToken;
