const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

let questions = [
  "Как вас зовут?",
  "Сколько вам лет?",
  "Где вы живёте?",
  "Чем вы занимаетесь?"
];

let answers = {};
let currentIndex = 0;

// Get next question
app.get("/next-question", (req, res) => {
  if (currentIndex >= questions.length) {
    return res.json({ question: "" }); // nothing left
  }
  res.json({ question: questions[currentIndex] });
});

// Post answer + return next question
app.post("/answer", (req, res) => {
  const { answer } = req.body;
  answers[currentIndex] = answer;

  currentIndex++;
  if (currentIndex >= questions.length) {
    return res.json({ question: "" }); // nothing left
  }
  res.json({ question: questions[currentIndex] });
});

// Just to check stored answers
app.get("/answers", (req, res) => {
  res.json(answers);
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
//TEST CHANGE