const mongoose = require('mongoose')
const fileSchema =new mongoose.Schema({
         filename:{
            type: String,
            required: true
          },
          fileType:{
          type: String,
          required: true
          },
          cloudinaryUrl: {
          type: String,
          required: true
          },
        cloudinaryPublicId: {
        type: String,
        required: true
        },

        folderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'folders',
        required: true
        },
          useremail:{
            type: String,
            required: true
          },
          iv: {
          type: String,
          required: true   
  }
},{ timestamps: true })

const fileModel = mongoose.model("fileModel",fileSchema)
module.exports = fileModel