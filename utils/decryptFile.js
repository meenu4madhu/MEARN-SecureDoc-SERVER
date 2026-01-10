const axios = require('axios')
const crypto = require('crypto')

const algorithm = 'aes-256-cbc'
const secretKey = crypto
  .createHash('sha256')
  .update(process.env.AES_SECRET)
  .digest()



 async function decryptFile(fileDoc)
 {
    const encryptedResponse = await axios.get(fileDoc.cloudinaryUrl,{
    responseType: 'arraybuffer'})
const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(fileDoc.iv, 'hex')
  )

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedResponse.data)),
    decipher.final()
  ])

  return decrypted
  
}
module.exports=decryptFile