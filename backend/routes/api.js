const express = require("express");
const router = require('express').Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Complaint = require("../models/complaint.model");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to verify JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });
  const token = authHeader.split(" ")[1];
  jwt.verify(token, "your_jwt_secret", (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.userId = decoded.userId;
    next();
  });
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    // Check if user already exists by email or mobile
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "Email or mobile already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      mobile,
      type: "citizen",
    });

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json(userObj);
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({ message: `${field} already registered` });
    }

    console.error("Registration error:", err);
    res.status(500).json({ message: err.message || "Registration failed" });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "password is required" });
    }

    if (!email && !phone) {
      return res.status(400).json({ error: "email or phone is required" });
    }

    const user = await User.findOne({
      $or: [
        { email: email },
        { mobile: phone }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: "Email or Phone is Wrong!" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    const token = jwt.sign({ userId: user._id }, "your_jwt_secret", {
      expiresIn: "1d",
    });

    res.json({ user, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



router.post("/user/:id", verifyToken, upload.single("media"), async (req, res) => {
  try {
    const { mediaType, name, email, password, mobile } = req.body;

    const existingUser = await User.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update fields from request
    existingUser.name = name;
    existingUser.email = email;
    existingUser.mobile = mobile;

    // Optional: update password only if provided
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      existingUser.password = hashedPassword;
    }

    // Optional: update profile photo
    console.log(req.file);
    if (req.file) {
      existingUser.mediaPath = req.file; // Or just `req.file.filename` if you store name
      console.log(existingUser.mediaPath);
      existingUser.mediaType = mediaType || req.file.mimetype.split("/")[0];
    }
    console.log("Updating user:", existingUser);
    await existingUser.save();
    res.json(existingUser);

  } catch (error) {
    console.error("Error in /user/:id update:", error);
    res.status(500).json({ error: "Failed to update user profile" });
  }
});


// Update User Profile
router.post("/userold/:id", verifyToken, upload.single("media"), async (req, res) => {
  try {
    const { mediaType, name, email, password, mobile } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      mobile,
      mediaPath: req.file,
      mediaType
    });


    const existingUser = await User.findById(req.params.id);
    if (!existingUser) {
      console.log("User not found for id:", req.params.id);
      return res.status(404).json({ error: "User not found" });
    }
    console.log("User found:", existingUser);
    console.log("Password from DB:", user.password);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password valid?", isPasswordValid);
    if (!isPasswordValid) return res.status(400).json({ error: "Incorrect password" });

    existingUser.name = user.name;
    existingUser.email = user.email;
    existingUser.mobile = user.mobile;
    existingUser.mediaType = user.mediaType;
    existingUser.password = user.password;


    if (req.file) {
      existingUser.mediaPath = user.mediaPath; // Or just `req.file` if you're storing full object
    }

    await existingUser.save();

    res.json(existingUser);
  } catch (error) {
    console.error("Error in /user:", error);
    res.status(500).json({ error: "Something went wrong while update user Profile." });
  }
});

router.get("/users", verifyToken, async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});
// Get user by ID
router.get("/user/:id", verifyToken, async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  res.json(user);
});

// Get user by ID
router.get("/users/verifyToken/:id", verifyToken, async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  res.json(user);
});

// Check if user is official
router.get("/user/isOfficial/:id", verifyToken, async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json({ isOfficial: user?.type === "official" });
});

router.get("/user/currentUser", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Create complaint
router.post("/complaint", verifyToken, upload.single("media"), async (req, res) => {
  try {
    const { reason, additionalInfo, status, mediaType, location } = req.body;

    const parsedLocation = JSON.parse(location); // If sent as JSON string in FormData

    const complaint = new Complaint({
      location: parsedLocation,
      mediaType,
      reason,
      additionalInfo,
      status,
      reportedBy: req.body.reportedBy || req.userId,
      timestamp: Date.now(),
      mediaPath: req.file, // This will have buffer, mimetype, originalname, etc.
      comments: [],
    });

    await complaint.save();
    res.json(complaint);
  } catch (error) {
    console.error("Error in /complaint:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Fetch complaints by user
router.get("/complaints/user/:id", verifyToken, async (req, res) => {
  const complaints = await Complaint.find({ reportedBy: req.params.id });
  res.json(complaints);
});

// Fetch all complaints
router.get("/complaints", verifyToken, async (req, res) => {
  const complaints = await Complaint.find();
  //.populate("reportedBy", "name")
  // .populate("comments.author", "name");
  res.json(complaints);
});

// Add comment
router.post("/complaint/:id/comment", verifyToken, async (req, res) => {
  const { comment } = req.body;
  const newComment = {
    author: req.userId,
    text: req.body.comment,
    timestamp: Date.now(),
  };
  console.log("Adding comment:", newComment);
  await Complaint.findByIdAndUpdate(req.params.id, { $push: { comments: newComment } });
  res.json({ success: true });
});

// fetch comment by Id
router.post("/complaint/:id", verifyToken, async (req, res) => {
  await Complaint.findByIdAndUpdate(req.params.id);
  res.json({ success: true });
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark as solved
router.post("/complaint/:id/solved", verifyToken, async (req, res) => {
  await Complaint.findByIdAndUpdate(req.params.id, { status: "SOLVED" });
  res.json({ success: true });
});

// Mark as rejected
router.post("/complaint/:id/rejected", verifyToken, async (req, res) => {
  await Complaint.findByIdAndUpdate(req.params.id, { status: "REJECTED" });
  res.json({ success: true });
});


// GET /complaints/status-summary
router.get("/complaints/status-summary", verifyToken, async (req, res) => {
  try {
    const summary = await Complaint.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Transform result to a map with default 0
    const response = {
      inProgress: 0,
      solved: 0,
      rejected: 0
    };

    summary.forEach((item) => {
      if (item._id === "In-Progress") response.inProgress = item.count;
      else if (item._id === "SOLVED") response.solved = item.count;
      else if (item._id === "REJECTED") response.rejected = item.count;
    });

    res.json(response);
  } catch (err) {
    console.error("Error fetching status summary:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;