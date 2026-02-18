const files = require('../models/fileModel')
// const sharefile = require('../models/shareModel')
const cloudinary = require('../config/cloudinary')
const decryptFile = require('../utils/decryptFile')
const crypto = require('crypto')
const fs = require('fs')
const cron = require("node-cron")


  const algorithm = 'aes-256-cbc'
  const secretKey = crypto
    .createHash('sha256')
    .update(process.env.AES_SECRET)
    .digest()
  

  // delete file after 30 days............................................................................
   cron.schedule("0 0 * * *", async () => {
  console.log("Running auto delete for trash files...")

  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const expiredFiles = await files.find({
      isTrashed: true,
      trashedAt: { $lte: thirtyDaysAgo }
    })

    for (let file of expiredFiles) {

      if (file.cloudinaryPublicId) {
        await cloudinary.uploader.destroy(
          file.cloudinaryPublicId,
          { resource_type: "raw" }
        )
      }

      await files.findByIdAndDelete(file._id)
    }

    console.log("Old trash files deleted successfully")
  } catch (error) {
    console.log("Auto delete error:", error)
  }
})

// .........................................................................................................................

// upload file
exports.uploadFileController=async(req,res)=>{
    console.log("Inside uploadFileController");

    try{
    const { folderId } = req.body
    const userMail= req.payload

    if (!req.file) {
      return res.status(400).json("No file uploaded")
    }
    else{
// uploaded file is now present in req.file.path -eg: upload/mydata.pdf
// read file
const fileBuffer = fs.readFileSync(req.file.path)
console.log(req.file);
const iv = crypto.randomBytes(16) 


// ENCRYPT that file using  AES 
const cipher = crypto.createCipheriv(
      algorithm,
      Buffer.from(secretKey),
      iv
    )

    let encrypted = Buffer.concat([
      cipher.update(fileBuffer),
      cipher.final()
    ])

    // upload encrypted file to cloudinary
     const uploadResult = await cloudinary.uploader.upload(
      `data:application/octet-stream;base64,${encrypted.toString('base64')}`,
      {
        resource_type: 'raw'
      }
    )

    // store file meta data in mongodb atlas
    const newFile = await files.create({
      filename: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      cloudinaryUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      folderId,
      useremail:userMail,
      iv: iv.toString('hex')
    })
    // delete temporary data
    fs.unlinkSync(req.file.path);
    res.status(200).json(newFile)
    }
    }
    catch(error){
    console.log(error)
    res.status(500).json("File upload failed !!!")
    }
    
}

// get allfiles from one folder// get all files from all folders
exports.getFileArrayController=async(req,res)=>{
    console.log("Inside getFileArrayController");
    try{
        const { folderId } = req.params;
        const userMail =req.payload
        if(folderId){
         const folderFiles =await files.find({folderId: folderId,useremail: userMail,isTrashed: false})
        res.status(200).json(folderFiles)
        }
        else{
        const allFiles =await files.find({useremail:userMail,isTrashed: false})
        res.status(200).json(allFiles)
        }
        
    }catch(error){
     console.log(error);
     res.status(500).json("Failed to fetch Files!")
    }
    
    
}

// view file 
exports.viewFileController=async(req,res)=>{
  console.log("Inside viewFileController");
  
  try{


  const {fileId} = req.params
    const useremail = req.payload   // from JWT middleware
    console.log("fileId:", fileId)
    console.log("useremail:", useremail)

    if (!fileId) {
      return res.status(404).json("File not found or access denied")
    }
    else{
const file = await files.findOne({
      _id: fileId,
      useremail: useremail
       
    })
   
   
    
      if (!file) {
      return res.status(404).json("File not found")
    }
    // 2️⃣ DECRYPT FILE
    const decryptedBuffer = await decryptFile(file)

    // 3️⃣ SEND FILE
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `inline; filename="${file.filename}"`
    })

    res.send(decryptedBuffer)

  }}
  catch(error){
    console.log(error);
    res.status(500).json("File Retrieval Failed !")
    
  }
}

// download file 
exports.downloadFileController=async(req,res)=>{
  console.log("Inside downloadFileController");
  
  try{

  const {fileId} = req.params
    const useremail = req.payload   // from JWT middleware
    console.log("fileId:", fileId)
    console.log("useremail:", useremail)

  const file = await files.findOne({
      _id: fileId,
      useremail: useremail
       
    })
  const decryptedBuffer = await decryptFile(file)

  res.set({
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': `attachment; filename="${file.filename}"`
  })

  res.send(decryptedBuffer)

}
catch(error){
   console.log(error);
   res.status(500).json("File download Failed !")
    
  }
}



// access file
exports.accessFileController=async(req,res)=>{
  console.log("Inside accessFileController");
  
  try{
 const { token } = req.params

  const share = await sharefile.findOne({ token })
  console.log(share);
  
   if (!share || share.expiresAt < Date.now()) {
      return res.status(404).json("Link expired or invalid")
    }
       const file = await files.findById(share.fileId)
  if (!file) {
      return res.status(404).json("File not found")
    }

    const decryptedBuffer = await decryptFile(file)

    res.set({
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `inline; filename="${file.filename}"`
    })

    res.send(decryptedBuffer)

}
catch(error){
   console.log(error);
  res.status(500).json("File access failed")
    
  }
}

// delete file
exports.deleteFileController=async(req,res)=>{
  console.log("Inside deleteFileController");
  
  try{
 const { fileId } = req.params
 const useremail = req.payload
 console.log(fileId);
 console.log(useremail);
 
 

const file =await files.findOne({_id:fileId,useremail})
if(file){
  // delete from cloud
file.isTrashed = true
file.trashedAt = new Date()
file.originalFolderId = file.folderId
file.folderId = null   // removed from folder

await file.save()

res.status(200).json("File moved to trash")
}else{
  res.status(404).json("File not Found !")
}

}
catch(error){
   console.log(error);
   res.status(500).json("Something went Wrong .... File can not  Delete!!")
    
  }
}

// trash
exports.getTrashFilesController = async (req, res) => {
  console.log("Inside getTrashFilesController");
  
  try {
    const useremail = req.payload
    const trashedFiles = await files.find({
      useremail,
      isTrashed: true
    }).populate("originalFolderId", "foldername")

    res.status(200).json(trashedFiles)
  } catch (err) {
    console.error("Trash Error:", err.message);
    res.status(500).json("Failed to load trash")
  }
}
// restore
// restore file from trash
exports.restoreFileController = async (req, res) => {
  console.log("Inside restoreFileController")

  try {
    const { fileId } = req.params
    const useremail = req.payload

    const file = await files.findOne({
      _id: fileId,
      useremail,
      isTrashed: true
    })

    if (!file) {
      return res.status(404).json("File not found in trash")
    }

    // restore values
    file.isTrashed = false
    file.trashedAt = null
    file.folderId = file.originalFolderId
    file.originalFolderId = null

    await file.save()

    res.status(200).json("File restored successfully")
  } catch (error) {
    console.log(error)
    res.status(500).json("File restore failed")
  }
}

