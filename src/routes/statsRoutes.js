const express= require("express");
const statsRouter=express.Router();

const RequestLog=require("../model/RequestLog");

statsRouter.get("/overview",async(req,res)=>{
    try{
        const total= await RequestLog.countDocuments();
        const allowed=await RequestLog.countDocuments({allowed:true});
        const blocked=await RequestLog.countDocuments({allowed:false});

        res.json({
            totalRequests:total,
            allowed,
            blocked,
        });
    }catch(error)
    {
        res.status(500).json({error:"Server Error"});
    }
});

statsRouter.get("/user",async (req,res)=>{
    try{
        const {apiKey}=req.query;

        const total=await RequestLog.countDocuments({apiKey});
        const allowed = await RequestLog.countDocuments({
      apiKey,
      allowed: true,
    });
    const blocked = await RequestLog.countDocuments({
      apiKey,
      allowed: false,
    });

    res.json({
      apiKey,
      total,
      allowed,
      blocked,
    });
    }
     catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
})
module.exports=statsRouter;