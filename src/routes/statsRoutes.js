const express = require("express");
const statsRouter = express.Router();

const RequestLog = require("../model/RequestLog");


statsRouter.get("/overview", async (req, res) => {
  try {
    const total = await RequestLog.countDocuments();
    const allowed = await RequestLog.countDocuments({ allowed: true });
    const blocked = await RequestLog.countDocuments({ allowed: false });

    res.json({
      totalRequests: total,
      allowed,
      blocked,
    });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});


statsRouter.get("/user", async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({ message: "API key required" });
    }

    const total = await RequestLog.countDocuments({ apiKey });
    const allowed = await RequestLog.countDocuments({
      apiKey,
      allowed: true,
    });
    const blocked = await RequestLog.countDocuments({
      apiKey,
      allowed: false,
    });

    res.json({
      apiKey,
      total,
      allowed,
      blocked,
    });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});


statsRouter.get("/timeline", async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({ message: "API key required" });
    }

    const now = new Date();
    const lastHour = new Date(now - 60 * 60 * 1000);

    const data = await RequestLog.aggregate([
      {
        $match: {
          apiKey,
          timestamp: { $gte: lastHour },
        },
      },
      {
        $group: {
          _id: {
            hour: { $hour: "$timestamp" },
            minute: { $minute: "$timestamp" },
          },
          requests: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.hour": 1,
          "_id.minute": 1,
        },
      },
      {
        $project: {
          _id: 0,
          time: {
            $concat: [
              { $toString: "$_id.hour" },
              ":",
              {
                $cond: [
                  { $lt: ["$_id.minute", 10] },
                  { $concat: ["0", { $toString: "$_id.minute" }] },
                  { $toString: "$_id.minute" },
                ],
              },
            ],
          },
          requests: 1,
        },
      },
    ]);

    res.json(data);
  } catch (error) {
    console.error("Timeline Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = statsRouter;