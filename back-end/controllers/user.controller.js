const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const registerUser = async (req, res) => {
  try {
    const { name,fname, cast, plotno, galino, email, password, mobile } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or mobile already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, fname, cast, plotno, galino, email, password: hashedPassword, mobile, type: "citizen" });
    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json(userObj);
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({ message: `${field} already registered` });
    }
    res.status(500).json({ message: err.message || "Registration failed" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    if (!password || (!email && !phone)) {
      return res.status(400).json({ error: "Email or phone and password are required" });
    }

    const user = await User.findOne({ $or: [{ email }, { mobile: phone }] });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, "your_jwt_secret", { expiresIn: "1d" });
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateUser = async (req, res) => {

    console.log("REQ BODY:", req.body);
    console.log("REQ FILE:", req.file);

    const {
      name,
      fname,
      cast,
      plotno,
      galino,
      email,
      password,
      mobile,
      mediaType,
    } = req.body;

    const userId = req.params.id;
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Only update fields if they exist in request
    if (name !== undefined) existingUser.name = name;
    if (fname !== undefined) existingUser.fname = fname;
    if (cast !== undefined) existingUser.cast = cast;
    if (plotno !== undefined) existingUser.plotno = plotno;
    if (galino !== undefined) existingUser.galino = galino;
    if (email !== undefined) existingUser.email = email;
    if (mobile !== undefined) existingUser.mobile = mobile;

    if (password) {
      existingUser.password = await bcrypt.hash(password, 10);
    }

    if (req.file) {
      existingUser.mediaPath = {
        buffer: req.file.buffer.toString("base64"),
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
      };
      existingUser.mediaType = mediaType || req.file.mimetype.split("/")[0];
    }

    await existingUser.save();
    res.status(200).json(existingUser);
  }

const getAllUsers = async (req, res) => {
    const users = await User.find().sort({ plotno: 1 }); 
   return res.status(200).json(users);
  }

const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  res.json(user);
};

const isOfficial = async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json({ isOfficial: user?.type === "official" });
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUser,
  getAllUsers,
  getUserById,
  isOfficial,
  getCurrentUser,
};
