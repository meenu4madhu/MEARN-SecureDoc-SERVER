const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
   userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },useremail:{type:String, required: true},
  
  message: {
    type: String,
    required: true
  },
  adminReply: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["pending", "replied"],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const complaint=mongoose.model("complaint",complaintSchema)
module.exports=complaint