const Complaint = require("../models/complaint.model");

const generateComplaintCode = async () => {
  try {
    // Find the most recent complaint by timestamp or creation order
    const lastComplaint = await Complaint.findOne().sort({ createdAt: -1 }); // use createdAt if available

    if (!lastComplaint || !lastComplaint.code) {
      return "SVVS#001";
    }

    // Extract the numeric part safely
    const parts = lastComplaint.code.split("#");
    const lastNumber = parseInt(parts[1], 10); // base 10

    // Increment and format
    const newNumber = (lastNumber + 1).toString().padStart(3, "0");
    return `SVVS#${newNumber}`;
  } catch (error) {
    console.error("Error generating complaint code:", error);
    // Fallback code if DB fails
    return "SVVS#001";
  }
};


const createComplaint = async (req, res) => {
  try {
    const { reason, additionalInfo, status, mediaType, location } = req.body;
    const parsedLocation = JSON.parse(location);
    const code = await generateComplaintCode();
    const complaint = new Complaint({
      code,
      location: parsedLocation,
      mediaType,
      reason,
      additionalInfo,
      status,
      reportedBy: req.body.reportedBy || req.userId,
      timestamp: Date.now(),
      mediaPath: req.file,
      comments: [],
    });

    await complaint.save();
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

const getComplaintsByUser = async (req, res) => {
  const complaints = await Complaint.find({ reportedBy: req.params.id });
  res.json(complaints);
};

const getAllComplaints = async (req, res) => {
  const complaints = await Complaint.find();
  res.json(complaints);
};

const addComment = async (req, res) => {
  const newComment = {
    author: req.userId,
    text: req.body.comment,
    timestamp: Date.now(),
  };
  await Complaint.findByIdAndUpdate(req.params.id, { $push: { comments: newComment } });
  res.json({ success: true });
};

const markSolved = async (req, res) => {
  await Complaint.findByIdAndUpdate(req.params.id, { status: "SOLVED" });
  res.json({ success: true });
};

const markRejected = async (req, res) => {
  await Complaint.findByIdAndUpdate(req.params.id, { status: "REJECTED" });
  res.json({ success: true });
};

const getStatusSummary = async (req, res) => {
  try {
    const summary = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const response = { inProgress: 0, solved: 0, rejected: 0 };
    summary.forEach((item) => {
      if (item._id === "In-Progress") response.inProgress = item.count;
      else if (item._id === "SOLVED") response.solved = item.count;
      else if (item._id === "REJECTED") response.rejected = item.count;
    });

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createComplaint,
  getComplaintsByUser,
  getAllComplaints,
  addComment,
  markSolved,
  markRejected,
  getStatusSummary,
};
