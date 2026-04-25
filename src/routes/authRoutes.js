const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const User = require("../model/User");

const JWT_SECRET = process.env.JWT_SECRET;


authRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      apiKey: uuidv4(),
    });

    res.json({
      message: "User registered",
      apiKey: user.apiKey,
      plan: user.plan,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      apiKey: user.apiKey,
      plan: user.plan,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = authRouter;