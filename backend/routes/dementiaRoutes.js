const express = require("express");
const router = express.Router();
const { getQuestions, submitAnswers, submitGameResults } = require("../controllers/dementiaController");

router.get("/questions", getQuestions);
router.post("/submit", submitAnswers);
router.post("/game-results", submitGameResults);

module.exports = router;