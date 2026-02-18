require('dotenv').config()
const express = require('express')
const cors = require('cors')
const router = require('./routes/routing.js')

require('./config/db')
// database connection

// create server using express
const sddlockerServer = express()

// enable core in sddlockerServer[express server]
sddlockerServer.use(cors())

// add json parse to server 
sddlockerServer.use(express.json())

// use router in server
sddlockerServer.use(router)


// create a port where server should listen in web
const PORT=3000

// server listen in localhost:3000
sddlockerServer.listen(PORT,()=>{console.log("Secure Digital Document Locker Server Started....And Waiting For Client Request !!!");
})

// resolve http get request to localhost:3000 using server
sddlockerServer.get('/',(req,res)=>{res.status(200).send(`<h1>Secure Digital Document Locker Server Started....And Waiting For Client Request !!!</h1>`)})
