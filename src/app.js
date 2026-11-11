require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const { dbConfig } = require("./config/db");
dbConfig();
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://your-frontend-domain.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

const router = require("./router");
const apiResponse = require("./utils/apiResponse");
app.use(router);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  apiResponse(res, statusCode, err.message || "Internal Server Error");
});

module.exports = app;
