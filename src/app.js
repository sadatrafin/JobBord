require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const { dbConfig } = require("./config/db");
dbConfig();
app.use(express.json());

const allowedOrigins = [
  "http://localhost:3000", 
  "https://job-board-frontend-navy.vercel.app/register",
  "https://job-board-frontend-navy.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

const router = require("./router");
const apiResponse = require("./utils/apiResponse");
app.use(router);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  apiResponse(res, statusCode, err.message || "Internal Server Error");
});

module.exports = app;
