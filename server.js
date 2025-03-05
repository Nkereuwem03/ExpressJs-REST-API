const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const connectDb = require("./config/dbConnection");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv").config();

connectDb();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use("/api/contacts", require("./routes/contactRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use(cookieParser);
app.use(
  cors({
    origin: "localhost:5000",
    credentials: true,
  })
);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
