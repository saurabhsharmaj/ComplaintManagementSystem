const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const s3 = require("./routes/s3.route");
const userRoutes = require("./routes/user.route");
const complaintRoutes = require("./routes/complaint.route");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Trust proxy (required for Nginx HTTPS headers)
app.set("trust proxy", 1);

// ✅ CORS: Allow only your frontend domain (recommended)
app.use(cors({
  origin: ['http://192.168.1.40:5173', 'http://localhost:5173', 'https://cms.8bit.co.in', 'http://103.154.233.215'],
  credentials: true // if you're using cookies or Authorization headers 
}));

app.use(express.json());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API Routes
app.use("/api", userRoutes);
app.use("/api", complaintRoutes);
app.use("/api", s3);

// DB Connect and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});

// keyID:192d0e4ae46a
// keyName:Master Application Key
// applicationKey:005be12bbc30e90c2055d8c87ccf6b71510eedd776