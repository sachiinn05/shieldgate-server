const axios=require("axios");
const redis=require("../config/redis")
const CACHE_TTL=5;
const shieldGate=()=>{
    return async (req,res,next)=>
    {
      try{
         if (req.path === "/api/check-request") {
        return next();
      }

        const ip=req.ip|| req.connection.remoteAddress || req.header["x-forwarded-for"];

         const apiKey=req.headers["x-api-key"] || "free_user";
         const cacheKey=`cache:&{apiKey}:${ip}`;
         
         const cacheData=await redis.get(cacheKey);

         if(cacheData)
         {
            console.log("REDIS CACHE HIT");

            const parsed=JSON.parse(cacheData);

            if(!parsed.allowed)
            {
              return res.status(429).json(parsed);
            }
            return next();
            
         }
         console.log("REDIS CACHE MISS");

        const response=await axios.post(
            "http://localhost:8001/api/check-request",
            {ip,apiKey},
            {timeout:500}
        );

        const data=response.data;
       await redis.set(
        cacheKey,
        JSON.stringify(data),
        "EX",
        CACHE_TTL,
       );
       
        if(!data.allowed)
        {
            return res.status(429).json(data);

        }
        next();
      }catch(error)
      {
        if (error.response && error.response.status === 429) {
        return res.status(429).json(error.response.data);
        }

        console.error("Middleware Error:", error.message);

        next();
      }
    };
};
module.exports=shieldGate;