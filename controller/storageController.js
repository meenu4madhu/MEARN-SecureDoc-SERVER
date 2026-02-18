const fileModel = require('../models/fileModel');
const cloudinary = require("cloudinary").v2;


exports.getUserStorage = async (req, res) => {
    console.log("Inside Storage Controller");
    
  try {
    const useremail = req.payload
    console.log(useremail);
    

    const storage = await fileModel.aggregate([
      {
        $match: {
          useremail: useremail,
          isTrashed: false
        }
      },
      {
        $group: {
          _id: null,
          totalUsed: { $sum: "$fileSize" }
        }
      }
    ]);

    const totalUsedBytes = storage[0]?.totalUsed || 0;

    res.status(200).json({
      usedBytes: totalUsedBytes,
      usedMB: (totalUsedBytes / (1024 * 1024)).toFixed(2)
    });
  } catch (error) {
    res.status(500).json(error);
  }
};


// admin storage info
exports.getAdminStorage = async (req, res) => {
  try {
    // 1 Group files by user and calculate per-user usage
    const perUserStorage = await fileModel.aggregate([
      {
        $match: { isTrashed: false }
      },
      {
        $group: {
          _id: "$useremail",
          userUsedBytes: { $sum: "$fileSize" }
        }
      }
    ]);

    // Add all users' storage
    const totalUsedBytes = perUserStorage.reduce(
      (sum, user) => sum + user.userUsedBytes,
      0
    );

    //  Cloud plan (fixed)
    const totalGB = Number(process.env.CLOUD_TOTAL_GB);
    const usedGB = totalUsedBytes / 1024 / 1024 / 1024;
    const availableGB = totalGB - usedGB;

  res.status(200).json({
  plan: "Cloudinary Free",
  cloudTotalGB: totalGB,
  cloudUsedGB: usedGB.toFixed(4)
,        
  cloudUsedMB: (totalUsedBytes / (1024 * 1024)).toFixed(2),
  cloudAvailableGB: availableGB.toFixed(2),
 
});


  } catch (error) {
    console.error("Admin storage error:", error);
    res.status(500).json({ message: "Failed to fetch admin storage" });
  }
};

// admin - get each user's storage
exports.getUsersStorageForAdmin = async (req, res) => {
  try {
    const usersStorage = await fileModel.aggregate([
      {
        $match: { isTrashed: false }
      },
      {
        $group: {
          _id: "$useremail",
          totalUsedBytes: { $sum: "$fileSize" }
        }
      },
      {
        $project: {
          _id: 0,
          useremail: "$_id",
          usedMB: {
            $round: [{ $divide: ["$totalUsedBytes", 1024 * 1024] }, 2]
          }
        }
      }
    ]);

    res.status(200).json(usersStorage);
  } catch (error) {
    console.error(error);
    res.status(500).json("Failed to fetch users storage");
  }
};




