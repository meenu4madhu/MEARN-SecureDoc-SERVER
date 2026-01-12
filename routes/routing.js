// import express
const express = require('express')
const userController = require('../controller/userController')
const folderController = require('../controller/folderController')
const complaintController = require('../controller/complaintController')
const jwtMiddleware = require('../middlewares/jwtMiddleware')
const adminMiddleware=require('../middlewares/adminMiddleware')
const fileController = require('../controller/fileController')
const upload = require('../middlewares/multerMiddleware')
const complaint = require('../models/complaintModel')
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

// get files from specific folder 
router.get('/user/folder/:folderId',jwtMiddleware,fileController.getFileArrayController)

// get All Files from all folder 
router.get('/user/history',jwtMiddleware,fileController.getFileArrayController)

// view file 
router.get('/user/file/view/:fileId',jwtMiddleware,fileController.viewFileController) 

// download file 
// router.get('/download/:fileId',jwtMiddleware,fileController.downloadFileController) 

// share file
router.post('/sharing/:fileId',jwtMiddleware,fileController.shareFileController) 

// Acces file
router.get('/share/:token',fileController.accessFileController) 

// delete file
router.delete('/delete/:fileId',jwtMiddleware,fileController.deleteFileController) 

// admin- get all users
router.get('/admin/all-users',adminMiddleware,userController.getAllUsersController)

// user: submit complaint
router.post('/submit-complaint',jwtMiddleware,complaintController.addComplaintController) 

// admin : get all complaints 
router.get('/admin/view-complaints',jwtMiddleware,adminMiddleware,complaintController.getAllComplaintsController)

// admin : replay to user
router.patch('/reply/:complaintId',jwtMiddleware,adminMiddleware,complaintController.replyToComplaintController)

// user: get notification
router.get('/user/notifications',jwtMiddleware,complaintController.getUserNotificationsController)


module.exports=router