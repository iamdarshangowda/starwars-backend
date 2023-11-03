const express = require("express");
const dotenv = require("dotenv").config();
const app = express();
const connectDB = require("./config/db");
const cors = require("cors");
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());
app.use("/user", require("./routes/userRoutes"));

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
