const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const userRoutes = require("./routes/user.route");
const complaintRoutes = require("./routes/complaint.route");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Trust proxy (required for Nginx HTTPS headers)
app.set("trust proxy", 1);

// ✅ CORS: Allow only your frontend domain (recommended)
app.use(cors({
  origin: ['http://localhost:5173', 'https://cms.8bit.co.in'], // allow both dev and prod
  credentials: true // if you're using cookies or Authorization headers
}));

app.use(express.json());

// API Routes
app.use("/api", userRoutes);
app.use("/api", complaintRoutes);

// DB Connect and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
