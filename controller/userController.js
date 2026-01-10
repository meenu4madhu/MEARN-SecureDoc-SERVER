const users=require('../models/userModel')
const jwt=require('jsonwebtoken')
const bcrypt=require('bcryptjs')

// register controller
exports.registerController=async(req,res)=>{
    console.log("Inside registerController");

   const {username,email,password}=req.body
   console.log(username,email,password);
   try{

    const existingUser = await users.findOne({email})
    const hashedPassword = await bcrypt.hash(password, 10)
    if(existingUser){
        res.status(409).json("User Already Exist! Please Login...")
    }

    else{
        const newUser=new users({username,email,password:hashedPassword})
        await newUser.save()
        res.status(200).json(newUser)
    }

   }catch(err)
   {
    console.log(err);
    res.status(500).json(err)
    
   }
   
    
}



// login controller
exports.loginController=async(req,res)=>{
    console.log("Inside loginController");

   const {email,password}=req.body
   console.log(email,password);
   try{
    const existingUser = await users.findOne({email})
    
    if(!existingUser){
         res.status(401).json("Account doesn't Exist !")
    }

    else{
        const pwdMatch=await bcrypt.compare(password,existingUser.password)
        if(!pwdMatch){
            res.status(401).json("Incorrect Password !")
        }
        else{
            const token = jwt.sign({userMail:existingUser.email,role:existingUser.role},process.env.JWTSECRET)
            res.status(200).json({user:existingUser,token})
         }
        }

   }catch(err)
   {
    console.log(err);
    res.status(500).json(err)
    
   }
   
    
}

// googlelogin
exports.googleloginController=async(req,res)=>{
    console.log("Inside googleloginController");

   const {username,email}=req.body
//    console.log(email,password);
   try{
    const existingUser = await users.findOne({email})


    if(!existingUser){
        // register
         const newUser=await users.create({username,email,password:"google-password"})
        // generate token
         const token = jwt.sign({userMail:newUser.email,role:newUser.role},process.env.JWTSECRET)
            res.status(200).json({newUser,token})
            
         
    }
    // login
    else{
        const token = jwt.sign({userMail:existingUser.email,role:existingUser.role},process.env.JWTSECRET)
            res.status(200).json({user:existingUser,token})
        }

   }catch(err)
   {
    console.log(err);
    console.log("Google login failed!");
    
    res.status(500).json(err)
    
   }
   
    
}
