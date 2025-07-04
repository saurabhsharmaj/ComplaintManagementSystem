
const mongoose = require("mongoose");


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    if (err.EREFUSED) {
      console.log("❌ Check your internet connection!");
    } else {
      console.error("❌ Unable to connect to MongoDB:", err.message);
    }
  }
};

module.exports = connectDB;
