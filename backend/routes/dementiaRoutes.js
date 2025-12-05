const express = require("express");
const router = express.Router();
const { getQuestions, submitAnswers, submitGameResults } = require("../controllers/dementiaController");
const { requireLogin } = require("../middleware/authMiddleware");

router.get("/questions", requireLogin, getQuestions);
router.post("/submit", requireLogin, submitAnswers);
router.post("/game-results", requireLogin, submitGameResults);

module.exports = router;