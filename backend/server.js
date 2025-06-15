const express = require("express");
const cors = require("cors");
const connectDB = require("./db"); // MongoDB connection
const userRoutes = require("./routes/user.route"); // User-related routes
const complaintRoutes = require("./routes/complaint.route"); // Complaint-related routes
require("dotenv").config(); // Load environment variables from .env

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use("/api", userRoutes);
app.use("/api", complaintRoutes);

// Connect to MongoDB, then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
