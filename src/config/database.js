const mongoose =require("mongoose");

const connectDB=async()=>{
    await mongoose.connect("mongodb+srv://sachin_db_user:kc4VhN6Vgq08FtAT@bytebuddydb.hutsfnv.mongodb.net/servergate")
}
module.exports=connectDB;