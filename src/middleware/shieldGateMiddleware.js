const { checkRequest } = require("../services/rateLimitService");
const User = require("../model/User");

const shieldGate = () => {
  return async (req, res, next) => {
    try {
      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket.remoteAddress;

      const apiKey =
        req.headers["x-api-key"] || req.query.apiKey;

      if (!apiKey) {
        return res.status(401).json({ message: "API key required" });
      }

      const user = await User.findOne({ apiKey });
      if (!user) {
        return res.status(403).json({ message: "Invalid API key" });
      }

      
      const result = await checkRequest({
        ip,
        apiKey: user.plan, 
      });

      if (!result.allowed) {
        return res.status(429).json(result);
      }

      next();
    } catch (err) {
      console.error("Middleware Error:", err);
      next();
    }
  };
};

module.exports = shieldGate;