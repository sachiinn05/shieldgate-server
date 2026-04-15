const axios=require("axios");
const cache={};
const CACHE_TTL=5000;
const shieldGate=()=>{
    return async (req,res,next)=>
    {
      try{
         if (req.path === "/api/check-request") {
        return next();
      }

        const ip=req.ip|| req.connection.remoteAddress || req.header["x-forwarded-for"];

        const now=Date.now();

        if(cache[ip] && cache[ip].expiry>now)
        {
            console.log("CACHE HIT");
            
        
        if(!cache[ip].allowed)
        {
            return res.status(429).json({
                allowed:false,
                message:"Two many requests (cached)",
            });
        }
        return next();
    }
    console.log("CACHE MISS");
    

        const response=await axios.post(
            "http://localhost:8001/api/check-request",
            {ip},
            {timeout:500}
        );

        const data=response.data;
        cache[ip]={
            allowed:data.allowed,
            expiry:now+CACHE_TTL
        };
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