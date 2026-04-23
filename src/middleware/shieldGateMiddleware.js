const { checkRequest } = require("../services/rateLimitService");
const redis = require("../config/redis");

const CACHE_TTL = 3;

const shieldGate = () => {
  return async (req, res, next) => {
    try {
      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket.remoteAddress;

      const apiKey =
        req.headers["x-api-key"] ||
        req.query.apiKey ||
        "free_user";

      const cacheKey = `cache:${apiKey}:${ip}`;

    
      const result = await checkRequest({ ip, apiKey });


      await redis.set(cacheKey, JSON.stringify(result), "EX", CACHE_TTL);

      if (!result.allowed) {
        return res.status(429).json(result);
      }

      next();
    } catch (error) {
      console.error("Middleware Error:", error);
      next();
    }
  };
};

module.exports = shieldGate;