const multer = require('multer')

const storage = multer.diskStorage({})

// allowed file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'text/plain',
    'image/tiff',
    'image/webp',
    'video/mp4',
    'video/mkv'
  ]
  

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('File type not allowed'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 1024 
  }
})

module.exports = upload
