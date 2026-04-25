const express = require("express");
const userRouter = express.Router();
const User = require("../model/User");
const { v4: uuidv4 } = require("uuid");

userRouter.get("/me", async (req, res) => {
  const apiKey = req.headers["x-api-key"];

  const user = await User.findOne({ apiKey }).select("-password");

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json(user);
});

userRouter.post("/upgrade", async (req, res) => {
  const apiKey = req.headers["x-api-key"];

  const user = await User.findOne({ apiKey });

  if (!user) return res.status(404).json({ message: "User not found" });

  user.plan = "premium_user";
  await user.save();

  res.json({ message: "Upgraded 🚀", plan: user.plan });
});


userRouter.post("/regenerate-key", async (req, res) => {
  const apiKey = req.headers["x-api-key"];

  const user = await User.findOne({ apiKey });

  if (!user) return res.status(404).json({ message: "User not found" });

  user.apiKey = uuidv4();
  await user.save();

  res.json({ apiKey: user.apiKey });
});

module.exports = userRouter;