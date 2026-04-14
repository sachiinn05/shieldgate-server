const redis = require("../config/redis");

const WINDOW_SIZE = 60; 
const MAX_REQUESTS = 10;

const checkRequest = async (data) => {
  try {
    const { ip } = data;

    if (!ip) {
      return {
        allowed: false,
        message: "IP is required",
      };
    }

    const key = `rate_limit:${ip}`;
    const currentTime = Date.now();

    const uniqueValue=`${currentTime}-${Math.random()}`;
    await redis.zadd(key, currentTime, uniqueValue);

    
    const windowStart = currentTime - WINDOW_SIZE * 1000;
    await redis.zremrangebyscore(key, 0, windowStart);

    
    const requestCount = await redis.zcount(
      key,
      windowStart,
      currentTime
    )
    await redis.expire(key, WINDOW_SIZE);

    
    if (requestCount > MAX_REQUESTS) {
      return {
        allowed: false,
        totalRequest: requestCount,
        message: "Too many requests. Try again later.",
      };
    }

    return {
      allowed: true,
      totalRequest: requestCount,
      message: `Requests in last ${WINDOW_SIZE} sec: ${requestCount}`,
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