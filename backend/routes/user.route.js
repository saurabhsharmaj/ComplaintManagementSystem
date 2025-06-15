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

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/user/:id", verifyToken, upload.single("media"), updateUser);
router.get("/users", verifyToken, getAllUsers);
router.get("/user/:id", verifyToken, getUserById);
router.get("/users/verifyToken/:id", verifyToken, getUserById);
router.get("/user/isOfficial/:id", verifyToken, isOfficial);
router.get("/user/currentUser", verifyToken, getCurrentUser);

module.exports = router;
