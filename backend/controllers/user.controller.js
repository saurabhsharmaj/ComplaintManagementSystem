const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or mobile already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, mobile, type: "citizen" });
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
  try {
    const { mediaType, name, email, password, mobile } = req.body;
    const existingUser = await User.findById(req.params.id);
    if (!existingUser) return res.status(404).json({ error: "User not found" });

    existingUser.name = name;
    existingUser.email = email;
    existingUser.mobile = mobile;

    if (password) existingUser.password = await bcrypt.hash(password, 10);
    if (req.file) {
      existingUser.mediaPath = req.file;
      existingUser.mediaType = mediaType || req.file.mimetype.split("/")[0];
    }

    await existingUser.save();
    res.json(existingUser);
  } catch (err) {
    res.status(500).json({ error: "Failed to update user profile" });
  }
};

const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

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
