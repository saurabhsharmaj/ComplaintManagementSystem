const mongoose = require("mongoose");

const nodeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    department: { type: String },
    image: { type: String },
    level: { type: Number, required: true },
    levelId: { type: mongoose.Schema.Types.ObjectId, ref: "Level" },
  },
  { timestamps: true }
);

const Node = mongoose.model("Node", nodeSchema);

module.exports = Node;
