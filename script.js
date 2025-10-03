/* 20 True/False flashcards */
const flashcards = [
  { question: "JavaScript is the same as Java.", answer: "False" },
  { question: "The DOM stands for Document Object Model.", answer: "True" },
  { question: "In JavaScript, '===' checks both value and type.", answer: "True" },
  { question: "NaN means 'Not a Number'.", answer: "True" },
  { question: "JavaScript can only run inside a web browser.", answer: "False" },
  { question: "const variables can be reassigned.", answer: "False" },
  { question: "JSON stands for JavaScript Object Notation.", answer: "True" },
  { question: "LocalStorage data clears automatically when you close the browser.", answer: "False" },
  { question: "Functions in JavaScript can be assigned to variables.", answer: "True" },
  { question: "Arrow functions use the 'function' keyword.", answer: "False" },
  { question: "JavaScript is single-threaded.", answer: "True" },
  { question: "setTimeout( ) runs code after a delay.", answer: "True" },
  { question: "null === undefined is true in JavaScript.", answer: "False" },
  { question: "Objects in JavaScript are written as key-value pairs.", answer: "True" },
  { question: "let and var have the same scope behavior.", answer: "False" },
  { question: "Promises are used for asynchronous programming.", answer: "True" },
  { question: "JavaScript arrays can contain mixed data types.", answer: "True" },
  { question: "typeof NaN returns 'number'.", answer: "True" },
  { question: "push() removes the last element from an array.", answer: "False" },
  { question: "ES6 introduced classes in JavaScript.", answer: "True" }
];

let currentIndex = 0;
let correctCount = 0;
let incorrectCount = 0;
let answered = 0;

/* Track which indexes have been answered so we can skip them */
const answeredFlags = new Array(flashcards.length).fill(false);

/* Track how many times user chose True / False */
const selectionCounts = { True: 0, False: 0 };

/* Elements */
const flashcard = document.getElementById("flashcard");
const questionEl = document.getElementById("question");
const answerEl = document.getElementById("answer");
const progressBar = document.getElementById("progress-bar");
const progressPercent = document.getElementById("progress-percent");
const progressCounter = document.getElementById("progress-counter");
const summaryEl = document.getElementById("summary");
const trueCountEl = document.getElementById("trueCount");
const falseCountEl = document.getElementById("falseCount");

const btnTrue = document.getElementById("trueBtn");
const btnFalse = document.getElementById("falseBtn");
const btnNext = document.getElementById("next");
const btnPrev = document.getElementById("prev");
const controlsDiv = document.querySelector(".controls");
const knowledgeDiv = document.querySelector(".knowledge-controls");

/* Helper: disable/enable action buttons while feedback visible */
function disableAnswerButtons(disabled) {
  btnTrue.disabled = disabled;
  btnFalse.disabled = disabled;
  btnNext.disabled = disabled;
  btnPrev.disabled = disabled;
  if (disabled) {
    btnTrue.style.opacity = "0.6";
    btnFalse.style.opacity = "0.6";
    btnNext.style.opacity = "0.6";
    btnPrev.style.opacity = "0.6";
    btnTrue.style.cursor = "not-allowed";
    btnFalse.style.cursor = "not-allowed";
    btnNext.style.cursor = "not-allowed";
    btnPrev.style.cursor = "not-allowed";
  } else {
    btnTrue.style.opacity = "";
    btnFalse.style.opacity = "";
    btnNext.style.opacity = "";
    btnPrev.style.opacity = "";
    btnTrue.style.cursor = "";
    btnFalse.style.cursor = "";
    btnNext.style.cursor = "";
    btnPrev.style.cursor = "";
  }
}

/* Render current card (if all answered -> show game over) */
function updateFlashcard() {
  if (answered >= flashcards.length) {
    showGameOver();
    return;
  }

  // If currentIndex points to an already answered card, try to find next unanswered
  if (answeredFlags[currentIndex]) {
    const nextUnanswered = findNextUnanswered(currentIndex);
    if (nextUnanswered === -1) {
      showGameOver();
      return;
    }
    currentIndex = nextUnanswered;
  }

  const card = flashcards[currentIndex];
  questionEl.textContent = card.question;
  answerEl.textContent = card.answer;
  flashcard.classList.remove("flipped", "correct", "incorrect");
  updateProgress();
}

/* Find next unanswered card after startIndex; returns -1 if none */
function findNextUnanswered(startIndex) {
  // search forward
  for (let i = startIndex + 1; i < flashcards.length; i++) {
    if (!answeredFlags[i]) return i;
  }
  // then search from 0 up to startIndex
  for (let i = 0; i <= startIndex; i++) {
    if (!answeredFlags[i]) return i;
  }
  return -1;
}

/* Show answer, record selection, give feedback, then auto-advance to next unanswered */
function checkAnswer(choice) {
  if (answered >= flashcards.length) return;

  // disable buttons while showing feedback
  disableAnswerButtons(true);

  const card = flashcards[currentIndex];

  // flip and show answer
  flashcard.classList.add("flipped");

  if (choice === card.answer) {
    correctCount++;
    flashcard.classList.add("correct");

    // ✅ count only correct True/False selections
    if (choice === "True") selectionCounts.True++;
    if (choice === "False") selectionCounts.False++;

  } else {
    incorrectCount++;
    flashcard.classList.add("incorrect");
  }

  if (!answeredFlags[currentIndex]) {
    answeredFlags[currentIndex] = true;
    answered++;
  }

  updateSummary();
  updateProgress();
  updateSelectionCounters();

  // after feedback, go to next unanswered
  setTimeout(() => {
    flashcard.classList.remove("correct", "incorrect");
    disableAnswerButtons(false);

    const nextIdx = findNextUnanswered(currentIndex);
    if (nextIdx === -1) {
      showGameOver();
    } else {
      currentIndex = nextIdx;
      updateFlashcard();
    }
  }, 1200);
}

/* Next / Previous (manual navigation). Only allow if quiz not finished.
   For "Next": move to next index that is not necessarily unanswered (user manual),
   but to avoid confusing behaviour we allow navigation to any index (including answered).
   If you prefer Next/Prev to skip answered items too, we can change it. */
btnNext.addEventListener("click", () => {
  if (answered >= flashcards.length) return;
  // move forward; do NOT wrap to 0 if that would be already answered unless user wants that
  let next = currentIndex + 1;
  if (next >= flashcards.length) next = flashcards.length - 1; // stay at last
  currentIndex = next;
  updateFlashcard();
});
btnPrev.addEventListener("click", () => {
  if (answered >= flashcards.length) return;
  let prev = currentIndex - 1;
  if (prev < 0) prev = 0;
  currentIndex = prev;
  updateFlashcard();
});

/* True/False button events */
btnTrue.addEventListener("click", () => checkAnswer("True"));
btnFalse.addEventListener("click", () => checkAnswer("False"));

/* Go to next unanswered helper (used after feedback) */
function goToNextCard() {
  const nextIdx = findNextUnanswered(currentIndex);
  if (nextIdx === -1) {
    showGameOver();
    return;
  }
  currentIndex = nextIdx;
  updateFlashcard();
}

/* Update summary text */
function updateSummary() {
  summaryEl.textContent = `Correct: ${correctCount} | Incorrect: ${incorrectCount}`;
}

/* Update selection counters (how many times True / False were chosen) */
function updateSelectionCounters() {
  trueCountEl.textContent = `True chosen: ${selectionCounts.True}`;
  falseCountEl.textContent = `False chosen: ${selectionCounts.False}`;
}

/* Update progress bar, percent and answered/left counter */
function updateProgress() {
  const percent = Math.round((answered / flashcards.length) * 100);
  progressBar.style.width = percent + "%";

  // color gradient based on percent
  if (percent < 40) {
    progressBar.style.background = "linear-gradient(to right, #f44336, #ff9800)";
  } else if (percent < 70) {
    progressBar.style.background = "linear-gradient(to right, #ff9800, #ffeb3b)";
  } else {
    progressBar.style.background = "linear-gradient(to right, #4caf50, #8bc34a)";
  }

  const left = flashcards.length - answered;
  progressPercent.textContent = `${percent}%`;
  progressCounter.textContent = `${answered}/${left}`;
}

/* Show game-over screen and restart button */
function showGameOver() {
  // hide card and controls
  flashcard.style.display = "none";
  controlsDiv.style.display = "none";
  knowledgeDiv.style.display = "none";

  // freeze progress at 100%
  progressBar.style.width = "100%";
  progressBar.style.background = "linear-gradient(to right, #4caf50, #8bc34a)";
  progressPercent.textContent = "100%";
  progressCounter.textContent = `${answered}/0`;

  // show final message + restart
  summaryEl.innerHTML = `
    🎉 <strong>Game Over!</strong><br>
    Correct: ${correctCount} | Incorrect: ${incorrectCount}
    <br><br>
    True chosen: ${selectionCounts.True} | False chosen: ${selectionCounts.False}
    <br><br>
    <button id="restartBtn">🔄 Restart</button>
  `;

  // hook restart button
  const restartBtn = document.getElementById("restartBtn");
  if (restartBtn) {
    restartBtn.addEventListener("click", restartGame);
  }
}

/* Restart everything */
function restartGame() {
  currentIndex = 0;
  correctCount = 0;
  incorrectCount = 0;
  answered = 0;
  for (let i = 0; i < answeredFlags.length; i++) answeredFlags[i] = false;
  selectionCounts.True = 0;
  selectionCounts.False = 0;

  // restore UI
  flashcard.style.display = "block";
  controlsDiv.style.display = "block";
  knowledgeDiv.style.display = "block";
  summaryEl.textContent = `Correct: 0 | Incorrect: 0`;
  updateSelectionCounters();
  updateFlashcard();
  updateSummary();
  updateProgress();
}

/* Init */
updateSelectionCounters();
updateFlashcard();
updateProgress();

fetch("correct.yaml")
  .then(res => res.text())
  .then(yamlText => {
    const data = jsyaml.load(yamlText);
    flashcards.push(...data);
    updateFlashcard();
  });

