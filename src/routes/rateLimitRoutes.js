const express = require("express");
const routerLimit = express.Router();

const rateLimitService = require("../services/rateLimitService");

routerLimit.post("/check-request", async (req, res) => {
  try {
    const result = await rateLimitService.checkRequest(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = routerLimit;