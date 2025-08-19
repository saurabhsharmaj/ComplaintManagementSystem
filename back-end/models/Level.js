const mongoose = require("mongoose");

const levelSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

const Level = mongoose.model("Level", levelSchema);

module.exports = Level;
