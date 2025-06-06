import axios from "axios";
import mongoose from "mongoose";

// Enums
export const Statuses = {
  inProgress: "In-Progress",
  solved: "SOLVED",
  rejected: "REJECTED",
};

export const userTypes = {
  citizen: "citizen",
  official: "official",
};

const statusColors = Object.freeze({
  inProgress: "#DFC900",
  solved: "#04B900",
  rejected: "#C70000",
});


// Schemas
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  mobile: String,
  type: { type: String, enum: Object.values(userTypes) },
});

const CommentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  comment: String,
  timestamp: Number,
});

const ComplaintSchema = new mongoose.Schema({
  title: String,
  description: String,
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  timestamp: Number,
  mediaPath: String,
  status: { type: String, enum: Object.values(Statuses), default: Statuses.pending },
  comments: [CommentSchema],
});

const User = mongoose.model("User", UserSchema);
const Complaint = mongoose.model("Complaint", ComplaintSchema);

// --------- AUTHENTICATION FUNCTIONS ---------

export const handleRegistration = async (formData) => {
  try {
    const response = await axios.post("http://192.168.1.37:5000/api/register", formData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Registration failed");
  }
};


export const handleLogin = async (formData) => {
  try {
    const response = await axios.post("http://192.168.1.37:5000/api/login", formData, {
      headers: { "Content-Type": "application/json" },
    });
    console.log(formData)
    console.log(response.data);
    localStorage.setItem("userId", response.data.user._id);    
    localStorage.setItem("token", response.data.token); 
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};



// --------- COMPLAINT FUNCTIONS ---------

export const createComplaint = async (formData, mediaUrl, token) => {
  const response = await fetch("http://192.168.1.37:5000/api/complaint", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Include the auth token
    },
    body: JSON.stringify({
      ...formData,
      mediaPath: mediaUrl,
      timestamp: Date.now(), // Optional: add timestamp on client if not handled in backend
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create complaint");
  }

  const complaint = await response.json();
  return complaint;
};

export const isOfficial = async (formData, mediaUrl, token) => {
  
  const userId= localStorage.getItem("userId");
  const response = await fetch("http://192.168.1.37:5000/api/isOfficial/"+userId, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Include the auth token
    },
    body: JSON.stringify({
      ...formData,
      mediaPath: mediaUrl,
      timestamp: Date.now(), // Optional: add timestamp on client if not handled in backend
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create complaint");
  }

  const userType = response.json().getType();
  return userType === "admin";
};

export const complaint = async (formData, mediaUrl, token) => {
  
  const userId= localStorage.getItem("userId");
  const response = await fetch("http://192.168.1.37:5000/api/isOfficial/"+userId, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Include the auth token
    },
    body: JSON.stringify({
      ...formData,
      mediaPath: mediaUrl,
      timestamp: Date.now(), // Optional: add timestamp on client if not handled in backend
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create complaint");
  }

  const complaint = await response.json();
  return complaint;
};

const fetchComplaintsByUser = async (userId, token) => {
  try {
    const res = await fetch(`http://192.168.1.37:5000/api/complaints/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error("Failed to fetch complaints");
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error:", err.message);
    return [];
  }
};



export const fetchComplaints = async (token) => {
  try {
    const res = await fetch(`http://192.168.1.37:5000/api/complaints`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error("Failed to fetch complaints");
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error:", err.message);
    return [];
  }
};

export const addComment = async (complaintID, commentText, token) => {
 
  const commentData = {
    author: localStorage.getItem("userId"),
    comment: commentText,
    timestamp: Date.now(),
  };

  const response = await fetch("http://192.168.1.37:5000/api/complaint/"+complaintID+"/comment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Include the auth token
    },
    body: JSON.stringify({
      ...commentData,      
      timestamp: Date.now() // Optional: add timestamp on client if not handled in backend
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create complaint");
  }

};

export const fetchCommentById = async (complaintID,token) => {
 // await Complaint.findByIdAndUpdate(complaintID, { status: Statuses.solved });
  const response = await fetch("http://192.168.1.37:5000/api/complaint/"+complaintID, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Include the auth token
    }
  });
 
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to mark complaint as resolved");
  }

  const data = await res.json();
  return data;
};

export const markAsSolved = async (complaintID,token) => {
 // await Complaint.findByIdAndUpdate(complaintID, { status: Statuses.solved });
  const response = await fetch("http://192.168.1.37:5000/api/complaint/"+complaintID+"/solved", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Include the auth token
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to mark complaint as resolved");
  }
};

export const markAsRejected = async (complaintID,token) => {
  //await Complaint.findByIdAndUpdate(complaintID, { status: Statuses.rejected });
  const response = await fetch("http://192.168.1.37:5000/api/complaint/"+complaintID+"/rejected", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Include the auth token
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to mark complaint as Rejected");
  }
};

export const fetchUserById = async (userId,token) => {
  //return await User.findById(userId).select("-password");
  const response = await fetch("http://192.168.1.37:5000/api/user/"+userId, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Include the auth token
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to find user By Id");
  }
  const data = await response.json();
    return data;

};

// --------- SIMULATED STORAGE FUNCTION ---------

// You should replace this with actual upload logic (e.g., AWS S3, Cloudinary, etc.)
export const uploadMedia = async (file) => {
  // For simulation purposes, we assume file is already uploaded
  // and you have the URL (e.g., from frontend or S3)
  return file.url; // file.url should be provided by your uploader
};

// --------- SESSION SIMULATION (for browserLocalPersistence) ---------
// Use localStorage or cookie-based JWT storage on frontend
export const setSessionPersistence = () => {
  // No-op in backend. Session handling is done via JWT
};