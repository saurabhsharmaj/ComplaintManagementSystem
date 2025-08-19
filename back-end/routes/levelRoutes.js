const express = require("express");
const {
  getLevels,
  addLevel,
  updateLevel,
  deleteLevel,
} = require("../controllers/levelController.js");

const router = express.Router();

router.get("/", getLevels);
router.post("/", addLevel);
router.put("/:id", updateLevel);
router.delete("/:id", deleteLevel);

module.exports = router;
