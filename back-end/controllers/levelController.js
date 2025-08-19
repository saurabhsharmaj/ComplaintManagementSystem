const Level = require("../models/Level.js");
const Node = require("../models/Node.js");

const getLevels = async (req, res) => {
  try {
    const levels = await Level.find({}).sort({ number: 1 });
    res.json(levels);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const addLevel = async (req, res) => {
  try {
    const { name, number } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Level name is required" });
    }

    let levelNumber = number;
    if (levelNumber == null) {
      const last = await Level.findOne({}).sort({ number: -1 });
      levelNumber = last ? last.number + 1 : 1;
    } else {
      const exists = await Level.findOne({ number: levelNumber });
      if (exists) {
        return res.status(409).json({ message: "Level number already exists" });
      }
    }

    const level = new Level({ name: name.trim(), number: levelNumber });
    await level.save();
    res.status(201).json(level);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const updateLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, number } = req.body;
    const level = await Level.findById(id);
    if (!level) return res.status(404).json({ message: "Level not found" });

    if (name != null) level.name = name;
    if (number != null) {
      const exists = await Level.findOne({ number, _id: { $ne: id } });
      if (exists) return res.status(409).json({ message: "Level number already exists" });
      const previousNumber = level.number;
      level.number = number;

      // Keep nodes in sync
      await Node.updateMany({ level: previousNumber }, { $set: { level: number } });
    }

    await level.save();
    res.json(level);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const deleteLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const level = await Level.findById(id);
    if (!level) return res.status(404).json({ message: "Level not found" });

    const used = await Node.countDocuments({ $or: [{ levelId: id }, { level: level.number }] });
    if (used > 0) {
      return res.status(400).json({ message: "Cannot delete a level that has nodes assigned" });
    }

    await level.deleteOne();
    res.json({ message: "Level deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  getLevels,
  addLevel,
  updateLevel,
  deleteLevel,
};
