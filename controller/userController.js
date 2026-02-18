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

// google login
exports.googleLoginController = async(req,res)=>{
    console.log("Inside Register controller");
    const {username,email,password,role}=req.body
    console.log(username,email,password,role);
    try{
        // check mail in model
        const existingUser = await users.findOne({email})
        if(existingUser){
            // login
            // generate token
            const token = jwt.sign({userMail:existingUser.email,role:existingUser.role},process.env.JWTSECRET)
            res.status(200).json({user:existingUser,token})
        }
        else{
        //    register
        const newUser = await users.create({
            username,email,password,role
        })
        const token = jwt.sign({userMail:newUser.email,role:newUser.role},process.env.JWTSECRET)
            res.status(200).json({user:newUser,token})
        }
    }catch(error){
        console.log(error);
        res.status(500).json(error)
        
    }
    
    // res.status(200).json("Request Recieved")
    
}

// get user profile
exports.getProfileController = async (req, res) => {
  try {
    console.log("Inside fetchProfile");
    const useremail = req.payload; // from JWT middleware

    const user = await users.findOne(
      { email: useremail },
      { password: 0 } // exclude password
    );

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json("Failed to load profile");
  }
};


// update pwd :user
exports.updatePasswordController = async (req, res) => {
  try {
    console.log("Inside pwd update");
    
    const useremail = req.payload; // from JWT
    const { currentPassword, newPassword } = req.body;

    //  Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json("All fields are required");
    }

    // Find user
    const user = await users.findOne({ email: useremail });
    if (!user) {
      return res.status(404).json("User not found");
    }

    //  Verify current password
    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json("Current password is incorrect");
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json("Password updated successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json("Failed to update password");
  }
};


// ............................................ADMIN-PAGE-CONTROLLERS............................................
 exports.getAllUsersController = async (req,res)=>{
    console.log("Inside getAllUsersController");
    
   try{
        // get all users from db 
        
        
        const allUsers = await users.find({ role: { $ne: "admin" } })
      res.status(200).json({
      totalUsers: allUsers.length,
      users: allUsers
    });
       
    }catch(error){
        console.log(error);
        res.status(500).json(error)
        
    }
    
    
   
  
}