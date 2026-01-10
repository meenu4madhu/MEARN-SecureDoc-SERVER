const mongoose = require('mongoose')
const shareSchema = new mongoose.Schema({
  fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'fileModel' },
  token: String,
  expiresAt: Date
})
const sharefile=mongoose.model("sharefile",shareSchema)
module.exports = sharefile