const jwt=require('jsonwebtoken')
const jwtMiddleware = (req,res,next)=>{
    console.log("Inside jwtMiddleware");

    // get token
    const token = req.headers['authorization'].split(" ")[1]
    console.log(token);
    
    // verify token
    if(token){
        try{
            const jwtResponse = jwt.verify(token,process.env.JWTSECRET)
            console.log(jwtResponse);
            req.payload=jwtResponse.userMail
            next()
            

        }catch(error){
            console.log(error);
            res.status(401).json("Authorisation Failed! Invalid Token!!")
            
        }
    }
    else{
        res.status(401).json("Authorisation Failed!  Token Missing !!")
    }

    
}

module.exports=jwtMiddleware