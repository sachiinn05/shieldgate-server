const express=require("express")
const connectDB=require("./config/database")
const app=express();

app.use(express.json());

connectDB()
.then(()=>{
    console.log("Database connection established......");
    app.listen(8001,()=>{
        console.log("Server listening on port 8001");
    });
})
.catch((err)=>{
   console.log("Database cannot be connected..", err);
})