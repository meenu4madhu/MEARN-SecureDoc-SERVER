const files = require('../models/fileModel')
const sharefile = require('../models/shareModel')
const cloudinary = require('../config/cloudinary')
const decryptFile = require('../utils/decryptFile')
const crypto = require('crypto')
const fs = require('fs')


  const algorithm = 'aes-256-cbc'
  const secretKey = crypto
    .createHash('sha256')
    .update(process.env.AES_SECRET)
    .digest()
  

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
         const folderFiles =await files.find({folderId: folderId,useremail: userMail})
        res.status(200).json(folderFiles)
        }
        else{
        const allFiles =await files.find({useremail:userMail})
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

// share file
exports.shareFileController=async(req,res)=>{
  console.log("Inside shareFileController");
  
  try{
 const { fileId } = req.params
console.log(fileId)
  const shareToken = crypto.randomBytes(20).toString('hex')

  await sharefile.create({
    fileId,
    token: shareToken,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hrs
  })

  const shareUrl = `${process.env.CLIENT_URL}/share/${shareToken}`

  res.status(200).json({ shareUrl })

}
catch(error){
   console.log(error);
   res.status(500).json("File Not Shared !!")
    
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
await cloudinary.uploader.destroy(file.cloudinaryPublicId, {
    resource_type: 'raw'
  })
  // delete data from db
  const deletedfile = await files.findByIdAndDelete(fileId)
     res.status(200).json(deletedfile)

}else{
  res.status(404).json("File not Found !")
}

}
catch(error){
   console.log(error);
   res.status(500).json("Something went Wrong .... File can not  Delete!!")
    
  }
}