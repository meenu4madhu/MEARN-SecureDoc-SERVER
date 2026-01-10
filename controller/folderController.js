const folders = require('../models/folderModel')

// create folder 
exports.createFolderController=async(req,res)=>{
    console.log("Inside createFolderController");

    const {foldername} = req.body
    const useremail = req.payload; 
    console.log(foldername,useremail);

    try{
        const existingFolder =await folders.findOne({foldername,useremail})
        if(existingFolder){
            res.status(400).json("Folder Already Exists !!!")
        }
        else{
            const newFolder=await folders.create({foldername,useremail})
            res.status(200).json(newFolder)
        }

    }catch(error){
     console.log(error);
     res.status(500).json(error)
    }
    
    
}

// get folders
exports.getFolderController=async(req,res)=>{
    console.log("Inside getFolderController");
    try{
        const userMail =req.payload
        const userFolders =await folders.find({useremail:userMail})
        res.status(200).json(userFolders)
    }catch(error){
     console.log(error);
     res.status(500).json("Failed to fetch folders!")
    }
    
    
}