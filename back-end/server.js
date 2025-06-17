const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const userRoutes = require("./routes/user.route");
const complaintRoutes = require("./routes/complaint.route");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1); // Trust first proxy (Nginx)

// Middleware
const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || '*',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/users", userRoutes);        // ✅ main user route
app.use("/complaints", complaintRoutes); // if needed

// Health check
app.get("/health", (req, res) => res.status(200).send("OK"));

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});
