const complaint = require('../models/complaintModel')
const users = require('../models/userModel')
// USER: Submit complaint
exports.addComplaintController = async (req, res) => {
  console.log("Inside addComplaintController");

  try {
    

    const useremail = req.payload; 
    const { message } = req.body;

    if (!message) {
      return res.status(400).json("Message is required");
    }

    const existingUser = await users.findOne({ email: useremail });
    if (!existingUser) {
      return res.status(404).json("User not found");
    }

    const newComplaint = await complaint.create({
      userId: existingUser._id,
      useremail: existingUser.email,
      message,
      status: "pending"
    });

    res.status(200).json(newComplaint);

  } catch (error) {
    console.error(error);
    res.status(500).json("Server error");
  }
};


// user : get their complaints
exports.getUserComplaintsController = async (req, res) => {
    console.log("Inside getUserComplaintsController");
    const useremail = req.payload; 
    
  try {
  
    const Complaint =await  complaint.find({useremail})
    res.status(200).json(Complaint);
    console.log(complaint);
    
  } catch (error) {
    res.status(500).json(error);
    console.log("failed to fetch complaints...",error);
    
  }
};


// admin : get all complaints
exports.getAllComplaintsController = async (req, res) => {
    console.log("Inside getAllComplaintsController");
    
  try {
  
    const allComplaints =await  complaint.find({ status: "pending" }).sort({ createdAt: -1 }).populate("userId", "username email");
    res.status(200).json(allComplaints);
  } catch (error) {
    res.status(500).json(error);
    console.log("failed to fetch complaints...",error);
    
  }
};

// admin : replay to complaint
exports.replyToComplaintController = async (req, res) => {
  console.log("Inside replyToComplaintController");
  
  try {
    const { complaintId } = req.params;   // ID of complaint
    const { replyMessage } = req.body;    // message typed by admin
    
    if (!replyMessage) {
      return res.status(400).json("Reply message is required");
    }

    // Update complaint: add admin reply + change status
    const updatedComplaint = await complaint.findByIdAndUpdate(
      complaintId,
      {  
        adminReply: replyMessage,
        status: "replied",
        isRead: false
      },
      { new: true }
    );

    if (!updatedComplaint) {
      return res.status(404).json("Complaint not found");
    }

    res.status(200).json(updatedComplaint);
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
};

// USER : get notification
exports.getUserNotificationsController = async (req, res) => {
  console.log("Inside getUserNotificationsController");
  
  try {
    const useremail = req.payload; 
    const notifications = await complaint.find({
      useremail,
      status: "replied"
    }).sort({ createdAt: -1 });
    console.log(notifications);
    
    res.status(200).json(notifications);
  } catch (error) {
    console.log(error);
    res.status(500).json("Failed to fetch notifications");
  }
};


