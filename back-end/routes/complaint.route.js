const router = require("express").Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const verifyToken = require("../middleware/auth.middleware");

const {
  createComplaint,
  getComplaintsByUser,
  getAllComplaints,
  addComment,
  markSolved,
  markRejected,
  getStatusSummary,
} = require("../controllers/complaint.controller");

// POST /complaints              → create new
router.post("/", verifyToken, upload.single("media"), createComplaint);

// GET /complaints/user/:id      → get user's complaints
router.get("/user/:id", verifyToken, getComplaintsByUser);

// GET /complaints               → get all
router.get("/", verifyToken, getAllComplaints);

// POST /complaints/:id/comment  → add comment
router.post("/:id/comment", verifyToken, addComment);

// POST /complaints/:id/solved   → mark as solved
router.post("/:id/solved", verifyToken, markSolved);

// POST /complaints/:id/rejected → mark as rejected
router.post("/:id/rejected", verifyToken, markRejected);

// GET /complaints/status-summary → status breakdown
router.get("/status-summary", verifyToken, getStatusSummary);

module.exports = router;
