const redis = require("../config/redis");
const RequestLog = require("../model/RequestLog");
const { getIO } = require("../socket");

const WINDOW_SIZE = 60;

const LIMITS = {
  free_user: 10,
  premium_user: 50,
};

const checkRequest = async ({ ip, apiKey = "free_user" }) => {
  try {
    if (!ip) return { 
      allowed: false,
       message: "IP required"
       };

    const io = getIO();
    const MAX = LIMITS[apiKey] || 10;

    const key = `rate_limit:${apiKey}:${ip}`;
    const now = Date.now();
    const start = now - WINDOW_SIZE * 1000;

    const unique = `${now}-${Math.random()}`;

    await redis.zadd(key, now, unique);
    await redis.zremrangebyscore(key, 0, start);

    const count = await redis.zcount(key, start, now);
    await redis.expire(key, WINDOW_SIZE);

    const payload = {
      ip,
      apiKey,
      totalRequests: count,
      timestamp: new Date(),
    };

    if (count > MAX) {
      await RequestLog.create({ ...payload, allowed: false });

      io.emit("request_update", { ...payload, allowed: false });

      return {
        allowed: false,
        totalRequests: count,
        message: "Rate limit exceeded",
      };
    }

    await RequestLog.create({ ...payload, allowed: true });

    io.emit("request_update", { ...payload, allowed: true });

    return {
      allowed: true,
      totalRequests: count,
    };
  } catch (e) {
    console.error(e);
    return { allowed: false, message: "Server error" };
  }
};

module.exports = { checkRequest };