const router = require("express").Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const verifyToken = require("../middleware/auth.middleware");

const {
  registerUser,
  loginUser,
  updateUser,
  getAllUsers,
  getUserById,
  isOfficial,
  getCurrentUser,
} = require("../controllers/user.controller");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.post("/update/:id", verifyToken, upload.single("media"), updateUser);
router.get("/", verifyToken, getAllUsers);
router.get("/:id", verifyToken, getUserById);
router.get("/verifyToken/:id", verifyToken, getUserById);
router.get("/isOfficial/:id", verifyToken, isOfficial);
router.get("/currentUser", verifyToken, getCurrentUser);

module.exports = router;
