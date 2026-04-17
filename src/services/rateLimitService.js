const redis = require("../config/redis");
const RequestLog = require("../model/RequestLog");

const WINDOW_SIZE = 60;

const LIMITS = {
  free_user: 10,
  premium_user: 50,
};

const checkRequest = async (data) => {
  try {
    const { ip, apiKey = "free_user" } = data;

    if (!ip) {
      return {
        allowed: false,
        message: "IP is required",
      };
    }

    const MAX_REQUESTS = LIMITS[apiKey] || 10;

    const key = `rate_limit:${apiKey}:${ip}`;
    const currentTime = Date.now();
    const windowStart = currentTime - WINDOW_SIZE * 1000;

    const uniqueValue = `${currentTime}-${Math.random()}`;


    await redis.zadd(key, currentTime, uniqueValue);

  
    await redis.zremrangebyscore(key, 0, windowStart);

  
    const requestCount = await redis.zcount(
      key,
      windowStart,
      currentTime
    );

    await redis.expire(key, WINDOW_SIZE);

  
    if (requestCount > MAX_REQUESTS) {
      await RequestLog.create({
        ip,
        apiKey,
        allowed: false,
      });

      return {
        allowed: false,
        totalRequests: requestCount,
        message: `Rate limit exceeded for ${apiKey}`,
      };
    }


    await RequestLog.create({
      ip,
      apiKey,
      allowed: true,
    });

    return {
      allowed: true,
      totalRequests: requestCount,
      message: `Requests: ${requestCount}`,
    };

  } catch (error) {
    console.error("Rate Limit Error", error);

    return {
      allowed: false,
      message: "Internal server error",
    };
  }
};

module.exports = {
  checkRequest,
};