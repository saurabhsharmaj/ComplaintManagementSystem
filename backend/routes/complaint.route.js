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

router.post("/complaint", verifyToken, upload.single("media"), createComplaint);
router.get("/complaints/user/:id", verifyToken, getComplaintsByUser);
router.get("/complaints", verifyToken, getAllComplaints);
router.post("/complaint/:id/comment", verifyToken, addComment);
router.post("/complaint/:id/solved", verifyToken, markSolved);
router.post("/complaint/:id/rejected", verifyToken, markRejected);
router.get("/complaints/status-summary", verifyToken, getStatusSummary);

module.exports = router;
