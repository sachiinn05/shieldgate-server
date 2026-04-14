const axios=require("axios");

const shieldGate=()=>{
    return async (req,res,next)=>
    {
      try{
         if (req.path === "/api/check-request") {
        return next();
      }

        const ip=req.ip|| req.connection.remoteAddress || req.header["x-forwarded-for"];

        const response=await axios.post(
            "http://localhost:8001/api/check-request",
            {ip},
            {timeout:500}
        );
        if(!response.data.allowed)
        {
            return res.status(429).json(response.data);

        }
        next();
      }catch(error)
      {
        console.error("Middleware Error:", error.message);
        next();
      }
    };
};
module.exports=shieldGate;