const express = require("express");
const router = express.Router();
const { submitGameResults } = require("../controllers/dementiaController");
const { requireLogin } = require("../middleware/authMiddleware");

router.post("/game-results", requireLogin, submitGameResults);

module.exports = router;