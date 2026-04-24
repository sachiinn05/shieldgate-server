const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { 
        type: String,
         unique: true, 
         required: true 
        },
    password: { 
        type: String, 
        required: true 
    },
    apiKey: { type: String, 
        unique: true, 
        index: true 
    },
    plan: {
      type: String,
      enum: ["free_user", "premium_user"],
      default: "free_user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);