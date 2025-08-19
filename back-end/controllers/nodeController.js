const Node = require("../models/Node.js");
const Level = require("../models/Level.js");

// Get all nodes
const getNodes = async (req, res) => {
  try {
    const nodes = await Node.find({});
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Add new node
const addNode = async (req, res) => {
  try {
    let { name, role, email, phone, department, image, level, levelId } = req.body;

    // Ensure a Level exists and link it
    let levelDoc = null;
    if (levelId) {
      levelDoc = await Level.findById(levelId);
    }
    if (!levelDoc && level != null) {
      levelDoc = await Level.findOne({ number: level });
      if (!levelDoc) {
        // Create a placeholder Level name if not provided elsewhere
        const placeholderName = `Level ${level}`;
        levelDoc = new Level({ number: level, name: placeholderName });
        await levelDoc.save();
      }
    }

    if (levelDoc) {
      level = levelDoc.number;
      levelId = levelDoc._id;
    }

    const newNode = new Node({ name, role, email, phone, department, image, level, levelId });
    await newNode.save();
    res.status(201).json(newNode);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update node
const updateNode = async (req, res) => {
  try {
    const node = await Node.findById(req.params.id);
    if (!node) return res.status(404).json({ message: "Node not found" });

    let { name, role, email, phone, department, image, level, levelId } = req.body;

    // If level or levelId provided, sync to a valid Level doc
    let levelDoc = null;
    if (levelId) {
      levelDoc = await Level.findById(levelId);
    }
    if (!levelDoc && level != null) {
      levelDoc = await Level.findOne({ number: level });
      if (!levelDoc) {
        const placeholderName = `Level ${level}`;
        levelDoc = new Level({ number: level, name: placeholderName });
        await levelDoc.save();
      }
    }

    // Assign fields if provided
    if (name != null) node.name = name;
    if (role != null) node.role = role;
    if (email != null) node.email = email;
    if (phone != null) node.phone = phone;
    if (department != null) node.department = department;
    if (image != null) node.image = image;

    if (levelDoc) {
      node.level = levelDoc.number;
      node.levelId = levelDoc._id;
    } else {
      if (level != null) node.level = level;
      if (levelId != null) node.levelId = levelId;
    }

    await node.save();
    res.json(node);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete node
const deleteNode = async (req, res) => {
  try {
    const node = await Node.findByIdAndDelete(req.params.id);
    if (!node) return res.status(404).json({ message: "Node not found" });

    res.json({ message: "Node deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  getNodes,
  addNode,
  updateNode,
  deleteNode,
};
