// import express
const express = require('express')
const userController = require('../controller/userController')
const folderController = require('../controller/folderController')
const jwtMiddleware = require('../middlewares/jwtMiddleware')
const fileController = require('../controller/fileController')
const upload = require('../middlewares/multerMiddleware')
const router = new express.Router()

//register
router.post('/user/register',userController.registerController) 

// login
router.post('/user/login',userController.loginController) 

// google login
router.post('/google/sign-in',userController.googleloginController) 

// create folder
router.post('/user/create-folder',jwtMiddleware,folderController.createFolderController) 

// get folders - logged user
router.get('/user/allfolders',jwtMiddleware,folderController.getFolderController)

// upload file to cloudinary
router.post('/cloudinary/upload-file',jwtMiddleware,upload.single("filename"),fileController.uploadFileController) 

// view file 
router.get('/view/:fileId',jwtMiddleware,fileController.viewFileController) 

// download file 
router.get('/download/:fileId',jwtMiddleware,fileController.downloadFileController) 

// share file
router.get('/sharing/:fileId',jwtMiddleware,fileController.shareFileController) 

// Acces file
router.get('/access-file/:token',fileController.accessFileController) 

// delete file
router.delete('/delete/:fileId',jwtMiddleware,fileController.deleteFileController) 


module.exports=router