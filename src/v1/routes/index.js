const express = require("express");
const router = express.Router();
const cors = require('cors');

// Enable CORS for all routes
router.use(cors());

const generateLogData = (req, res) => {
  return `
    IP: ${req.headers["x-forwarded-for"] || req.connection.remoteAddress},
    lat: ${req.headers["x-vercel-ip-latitude"]},
    lon: ${req.headers["x-vercel-ip-longitude"]},
    city: ${req.headers["x-vercel-ip-city"]},
    region: ${req.headers["x-vercel-ip-country-region"]},
    country: ${req.headers["x-vercel-ip-country"]},
    UA: ${req.headers["user-agent"]},
    date_time: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })}`;
};

// Improved route handler with error handling
router.route("/")
  .get((req, res) => {
    try {
      const logData = generateLogData(req, res);
      // Set the Content-Type header to application/json
      res.setHeader('Content-Type', 'application/json');
      res.json(logData);
    } catch (error) {
      console.error("Error generating log data:", error);
      res.status(500).send("Internal Server Error");
    }
  });

module.exports = router;
