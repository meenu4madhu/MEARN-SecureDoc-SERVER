const mongoose = require('mongoose')
const folderSchema =new mongoose.Schema({
          foldername:{
            type: String,
            required: true
          },
          useremail:{
            type: String,
            required: true
          }
},{ timestamps: true })

const folderModel = mongoose.model("folderModel",folderSchema)
module.exports=folderModel