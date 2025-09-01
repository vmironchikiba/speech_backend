const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("answers.db");

// create table if not exists
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      qIndex INTEGER,
      question TEXT,
      answer TEXT
    )
  `);
});


const app = express();
app.use(cors());
app.use(bodyParser.json());

const questionsPath = path.join(__dirname, "questions.json");
let questions = JSON.parse(fs.readFileSync(questionsPath, "utf8"));

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
// app.post("/answer", (req, res) => {
//   const { answer } = req.body;
//   answers[currentIndex] = answer;

//   currentIndex++;
//   if (currentIndex >= questions.length) {
//     return res.json({ question: "" }); // nothing left
//   }
//   res.json({ question: questions[currentIndex] });
// });

app.post("/answer", (req, res) => {
  const { answer } = req.body;
  const question = questions[currentIndex];

  db.run(
    `INSERT INTO answers (qIndex, question, answer) VALUES (?, ?, ?)`,
    [currentIndex, question, answer],
    function (err) {
      if (err) {
        console.error("DB insert error:", err);
        return res.status(500).json({ error: "DB error" });
      }

      currentIndex++;
      if (currentIndex >= questions.length) {
        return res.json({ question: "" });
      }
      res.json({ question: questions[currentIndex] });
    }
  );
});

app.get("/answers", (req, res) => {
  db.all("SELECT * FROM answers", [], (err, rows) => {
    if (err) {
      console.error("DB read error:", err);
      return res.status(500).json({ error: "DB error" });
    }
    res.json(rows);
  });
});


// app.get("/reset", (req, res) => {
//   currentIndex = 0;
//   db.run("DELETE FROM answers", (err) => {
//     if (err) {
//       console.error("DB reset error:", err);
//       return res.status(500).json({ error: "DB error" });
//     }
//     res.json({ message: "✅ Answers and index reset" });
//   });
// });

app.delete("/answers", (req, res) => {
  currentIndex = 0;
  db.run("DELETE FROM answers", (err) => {
    if (err) {
      console.error("DB reset error:", err);
      return res.status(500).json({ error: "DB error" });
    }
    res.json({ message: "✅ All answers deleted and index reset" });
  });
});


const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
//TEST CHANGE