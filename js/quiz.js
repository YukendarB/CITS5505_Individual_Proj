document.addEventListener("DOMContentLoaded", () => {
  const PASS_THRESHOLD = 70;
  const STORAGE_KEY = "devquestQuizAttempts";

  const quizModes = {
    html: { label: "HTML Quiz", topic: "html", count: 5 },
    css: { label: "CSS Quiz", topic: "css", count: 5 },
    javascript: { label: "JavaScript Quiz", topic: "javascript", count: 5 },
    mixed: { label: "Mixed Challenge", topic: "mixed", count: 10 }
  };

  const modeButtons = document.querySelectorAll(".quiz-mode-btn");
  const currentMode = document.getElementById("currentMode");
  const quizTitle = document.getElementById("quizTitle");
  const quizInstructions = document.getElementById("quizInstructions");
  const quizStatus = document.getElementById("quizStatus");
  const quizForm = document.getElementById("quizForm");
  const quizContainer = document.getElementById("quizContainer");
  const result = document.getElementById("result");
  const reward = document.getElementById("reward");
  const history = document.getElementById("history");
  const resetQuiz = document.getElementById("resetQuiz");
  const clearHistory = document.getElementById("clearHistory");
  const quizValidationMessage = document.getElementById("quizValidationMessage");

  if (!quizForm || !quizContainer) return;

  let allQuestions = [];
  let currentQuestions = [];
  let activeMode = "html";
  let hasStarted = false;
  let hasSubmitted = false;

  function shuffle(items) {
    const shuffled = [...items];

    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setStatus(message, type = "info") {
    quizStatus.textContent = message;
    quizStatus.className = `quiz-status quiz-status-${type}`;
  }

  function getAttempts() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (error) {
      return [];
    }
  }

  function saveAttempt(attempt) {
    try {
      const attempts = getAttempts();
      attempts.unshift(attempt);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
    } catch (error) {
      setStatus("Your score was calculated, but attempt history could not be saved.", "warning");
    }
  }

  function renderHistory() {
    const attempts = getAttempts();

    if (!history) return;

    if (attempts.length === 0) {
      history.innerHTML = "<p class=\"card-muted mb-0\">No previous attempts yet.</p>";
      return;
    }

    const listItems = attempts.map((attempt) => {
      const statusClass = attempt.passed ? "status-pass" : "status-fail";

      return `
        <li>
          <strong>${escapeHTML(attempt.mode)}</strong> - ${attempt.score}/${attempt.total} - ${attempt.percentage}% -
          <span class="${statusClass}">${attempt.passed ? "Pass" : "Try Again"}</span>
        </li>
      `;
    }).join("");

    history.innerHTML = `<ul class="attempt-list mb-0">${listItems}</ul>`;
  }

  function getQuestionsForMode(modeKey) {
    const mode = quizModes[modeKey];

    const pool = mode.topic === "mixed"
      ? allQuestions.filter((question) => {
          const qTopic = String(question.topic || "").trim().toLowerCase();
          return ["html", "css", "javascript"].includes(qTopic);
        })
      : allQuestions.filter((question) => {
          const qTopic = String(question.topic || "").trim().toLowerCase();
          const mTopic = String(mode.topic || "").trim().toLowerCase();
          return qTopic === mTopic;
        });

    console.log("Mode:", modeKey);
    console.log("Total questions loaded:", allQuestions.length);
    console.log("Filtered question count:", pool.length);

    return shuffle(pool).slice(0, mode.count);
  }

  function clearFeedback() {
    result.innerHTML = "";
    reward.innerHTML = "";
    quizContainer.querySelectorAll(".quiz-question").forEach((questionCard) => {
      questionCard.classList.remove("question-unanswered");
    });
  }

  function setValidationMessage(isVisible) {
    if (!quizValidationMessage) return;
    quizValidationMessage.classList.toggle("hidden", !isVisible);
  }

  function allQuestionsAnswered() {
    return currentQuestions.every((question, index) => {
      return Boolean(quizForm.querySelector(`input[name="question-${index}"]:checked`));
    });
  }

  function renderQuestions() {
    if (currentQuestions.length === 0) {
      quizContainer.innerHTML = "";
      setStatus(`No questions are available for ${quizModes[activeMode].label}. Check the topic values in data/questions.json.`, "error");
      return;
    }

    quizContainer.innerHTML = currentQuestions.map((question, questionIndex) => {
      const options = question.options.map((option, optionIndex) => `
        <label class="quiz-option">
          <input type="radio" name="question-${questionIndex}" value="${optionIndex}">
          <span>${escapeHTML(option)}</span>
        </label>
      `).join("");

      return `
        <fieldset class="quiz-question" data-question-index="${questionIndex}">
          <legend>
            <span class="question-topic">${escapeHTML(question.topic.toUpperCase())}</span>
            ${questionIndex + 1}. ${escapeHTML(question.question)}
          </legend>
          <div class="quiz-options">${options}</div>
          <p class="question-warning">Please select an answer for this question.</p>
        </fieldset>
      `;
    }).join("");
  }

  function loadMode(modeKey) {
    activeMode = quizModes[String(modeKey || "").trim().toLowerCase()]
      ? String(modeKey || "").trim().toLowerCase()
      : "html";
    const mode = quizModes[activeMode];

    modeButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.mode === activeMode);
    });

    currentMode.textContent = `Current mode: ${mode.label}`;
    quizTitle.textContent = mode.label;
    quizInstructions.textContent = `Answer ${mode.count} randomized ${mode.topic === "mixed" ? "mixed-topic" : mode.label.replace(" Quiz", "")} questions. The pass threshold is ${PASS_THRESHOLD}%.`;

    currentQuestions = getQuestionsForMode(activeMode);
    hasStarted = false;
    hasSubmitted = false;
    clearFeedback();
    setValidationMessage(false);
    renderQuestions();
    setStatus(`${mode.label} loaded. Choose one answer for each question.`, "info");
  }

  function validateAnswers() {
    let isValid = true;

    currentQuestions.forEach((question, index) => {
      const questionCard = quizContainer.querySelector(`[data-question-index="${index}"]`);
      const checkedAnswer = quizForm.querySelector(`input[name="question-${index}"]:checked`);
      const isAnswered = Boolean(checkedAnswer);

      if (questionCard) {
        questionCard.classList.toggle("question-unanswered", !isAnswered);
      }

      if (!isAnswered) isValid = false;
    });

    return isValid;
  }

  function calculateScore() {
    return currentQuestions.reduce((score, question, index) => {
      const checkedAnswer = quizForm.querySelector(`input[name="question-${index}"]:checked`);

      if (!checkedAnswer) return score;

      return Number(checkedAnswer.value) === question.answer ? score + 1 : score;
    }, 0);
  }

  async function fetchReward() {
    reward.innerHTML = "<p class=\"card-muted mb-0\">Fetching your reward...</p>";

    try {
      const response = await fetch("https://api.adviceslip.com/advice", { cache: "no-store" });
      if (!response.ok) throw new Error("Reward API failed");

      const data = await response.json();
      const advice = data && data.slip && data.slip.advice
        ? data.slip.advice
        : "Keep building. Your next version will be even stronger.";

      reward.innerHTML = `<p class="mb-0"><strong>Reward unlocked:</strong> ${escapeHTML(advice)}</p>`;
    } catch (error) {
      reward.innerHTML = "<p class=\"card-muted mb-0\">Reward could not be fetched right now, but your pass still counts.</p>";
    }
  }

  function showResult(score) {
    const total = currentQuestions.length;
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= PASS_THRESHOLD;
    const statusClass = passed ? "status-pass" : "status-fail";
    const modeLabel = quizModes[activeMode].label;

    result.innerHTML = `
      <p class="mb-1"><strong>Score:</strong> ${score}/${total}</p>
      <p class="mb-1"><strong>Percentage:</strong> ${percentage}%</p>
      <p class="mb-0"><strong>Status:</strong> <span class="${statusClass}">${passed ? "Pass" : "Try Again"}</span></p>
    `;

    saveAttempt({
      mode: modeLabel,
      score,
      total,
      percentage,
      passed,
      date: new Date().toISOString()
    });

    renderHistory();

    if (passed) {
      fetchReward();
    } else {
      reward.innerHTML = "<p class=\"card-muted mb-0\">Reach 70% to unlock a reward.</p>";
    }
  }

  function loadQuestionData() {
    return fetch("data/questions.json", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Question data could not be loaded");
        return response.json();
      })
      .catch(() => new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open("GET", "data/questions.json", true);
        request.overrideMimeType("application/json");

        request.addEventListener("load", () => {
          if (request.status !== 200 && request.status !== 0) {
            reject(new Error("Question data could not be loaded"));
            return;
          }

          try {
            resolve(JSON.parse(request.responseText));
          } catch (error) {
            reject(error);
          }
        });

        request.addEventListener("error", () => {
          reject(new Error("Question data could not be loaded"));
        });

        request.send();
      }));
  }

  async function loadQuestions() {
    setStatus("Loading questions...", "info");

    try {
      allQuestions = await loadQuestionData();
      loadMode(activeMode);
    } catch (error) {
      quizContainer.innerHTML = "";
      setStatus("Questions could not be loaded from data/questions.json. Check that the file exists and can be accessed by the browser.", "error");
    }
  }

  quizContainer.addEventListener("change", () => {
    hasStarted = true;
    if (allQuestionsAnswered()) {
      setValidationMessage(false);
      quizContainer.querySelectorAll(".quiz-question").forEach((questionCard) => {
        questionCard.classList.remove("question-unanswered");
      });
    }
  });

  quizForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearFeedback();

    if (!validateAnswers()) {
      setStatus("Please answer every question before submitting.", "error");
      setValidationMessage(true);
      return;
    }

    setValidationMessage(false);
    const score = calculateScore();
    hasSubmitted = true;
    showResult(score);
    setStatus("Quiz submitted. Review your result below.", "success");
  });

  resetQuiz.addEventListener("click", () => {
    loadMode(activeMode);
  });

  clearHistory.addEventListener("click", () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      renderHistory();
      setStatus("Attempt history cleared.", "success");
    } catch (error) {
      setStatus("Attempt history could not be cleared.", "error");
    }
  });

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const modeKey = String(button.dataset.mode || "").trim().toLowerCase();
      loadMode(modeKey);
    });
  });

  window.addEventListener("beforeunload", (event) => {
    if (!hasStarted || hasSubmitted) return;

    event.preventDefault();
    event.returnValue = "";
  });

  renderHistory();
  loadQuestions();
});
