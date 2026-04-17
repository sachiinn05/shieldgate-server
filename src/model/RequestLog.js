const mongoose = require("mongoose");

const requestLogSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
  },
  apiKey: {
    type: String,
    required: true,
  },
  allowed: {
    type: Boolean,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("RequestLog", requestLogSchema);