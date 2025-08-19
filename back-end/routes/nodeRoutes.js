const express = require("express");
const {
  getNodes,
  addNode,
  updateNode,
  deleteNode,
} = require("../controllers/nodeController.js");

const router = express.Router();

router.get("/", getNodes);
router.post("/", addNode);
router.put("/:id", updateNode);
router.delete("/:id", deleteNode);

module.exports = router;
