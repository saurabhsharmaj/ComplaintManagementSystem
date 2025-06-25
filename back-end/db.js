const mongoose = require("mongoose");

const uri = "mongodb+srv://ersaurabhsharmamca:SUXVZQUyUW5X2qI3@gatepass-db.alvtd.mongodb.net/complaint-management-db?retryWrites=true&w=majority&appName=complaint-management-db";

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
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
