const Complaint = require("../models/complaint.model");


const createComplaint = async (req, res) => {
  try {
    const { reason, additionalInfo, status, reportedBy, location, mediaType } = req.body;

    const complaintData = {
      reason,
      additionalInfo,
      status,
      reportedBy,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
        name: location.name,
      },
      mediaType,
    };

    if (req.file) {
      complaintData.mediaPath = req.file.path;
    }

    const complaint = new Complaint(complaintData);
    await complaint.save();

    res.status(201).json({ message: 'Complaint reported successfully', complaint });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ message: 'Failed to create complaint', error });
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
