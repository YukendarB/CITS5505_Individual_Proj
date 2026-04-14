document.addEventListener("DOMContentLoaded", () => {
  // Main quiz settings used throughout the page.
  const PASS_THRESHOLD = 70;
  const STORAGE_KEY = "devquestQuizAttempts";

  // Each mode controls the topic filter and number of questions rendered.
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
  const quizProgressCard = document.getElementById("quizProgressCard");
  const progressLabel = document.getElementById("progressLabel");
  const answeredCount = document.getElementById("answeredCount");
  const totalQuestions = document.getElementById("totalQuestions");
  const progressFill = document.getElementById("progressFill");

  if (!quizForm || !quizContainer) return;

  let allQuestions = [];
  let currentQuestions = [];
  let activeMode = "html";
  let hasStarted = false;
  let hasSubmitted = false;

  // Fisher-Yates shuffle so each quiz attempt gets a fresh question order.
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

  // Attempt history is stored locally so the user can leave and return later.
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

  // Mixed mode pulls from all tutorial topics; single modes filter by topic.
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

  function setResultRewardPlaceholders() {
    result.innerHTML = `
      <div class="quiz-placeholder">
        <strong>Result waiting</strong>
        <p class="mb-0">Launch a quiz attempt to see your score path.</p>
      </div>
    `;

    reward.innerHTML = `
      <div class="quiz-placeholder">
        <strong>Reward locked</strong>
        <p class="mb-0">Submit a successful mission to unlock your reward.</p>
      </div>
    `;
  }

  function clearFeedback() {
    setResultRewardPlaceholders();
    quizContainer.querySelectorAll(".quiz-question").forEach((questionCard) => {
      questionCard.classList.remove("question-unanswered");
    });
    quizContainer.querySelectorAll(".quiz-option-correct, .quiz-option-wrong").forEach((option) => {
      option.classList.remove("quiz-option-correct", "quiz-option-wrong");
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

  // Updates the sticky progress card as users answer each radio group.
  function updateProgress() {
    const radioGroups = new Set();
    quizContainer.querySelectorAll("input.quiz-input[type=\"radio\"][name]").forEach((input) => {
      radioGroups.add(input.name);
    });

    const total = radioGroups.size;
    const answered = [...radioGroups].filter((groupName) => {
      const safeGroupName = window.CSS && CSS.escape ? CSS.escape(groupName) : groupName;
      return Boolean(quizForm.querySelector(`input.quiz-input[name="${safeGroupName}"]:checked`));
    }).length;
    const percentage = total > 0 ? (answered / total) * 100 : 0;

    if (answeredCount) answeredCount.textContent = answered;
    if (totalQuestions) totalQuestions.textContent = total;
    if (progressFill) progressFill.style.width = `${percentage}%`;

    if (progressLabel) {
      if (answered === 0) {
        progressLabel.textContent = "Ready for launch...";
      } else if (answered === total) {
        progressLabel.textContent = "Mission Ready";
      } else {
        progressLabel.textContent = "Mission Progress";
      }
    }

    if (quizProgressCard) {
      quizProgressCard.classList.toggle("progress-idle", answered === 0);
    }
  }

  // Builds question markup dynamically from the JSON question data.
  function renderQuestions() {
    if (currentQuestions.length === 0) {
      quizContainer.innerHTML = "";
      updateProgress();
      setStatus(`No questions are available for ${quizModes[activeMode].label}. Check the topic values in data/questions.json.`, "error");
      return;
    }

    quizContainer.innerHTML = currentQuestions.map((question, questionIndex) => {
      const options = question.options.map((option, optionIndex) => `
        <label class="quiz-option" data-option-index="${optionIndex}">
          <input class="quiz-input" type="radio" name="question-${questionIndex}" value="${optionIndex}">
          <span class="quiz-code-badge" aria-hidden="true">&lt;/&gt;</span>
          <span class="quiz-option-text">${escapeHTML(option)}</span>
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

    updateProgress();
  }

  // Resets the UI and loads the question set for the selected quiz mode.
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

  // Checks every rendered question before allowing the quiz to submit.
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

  // Highlights selected answers after submission so the user gets feedback.
  function updateQuestionFeedback(questionIndex) {
    const question = currentQuestions[questionIndex];
    const checkedAnswer = quizForm.querySelector(`input[name="question-${questionIndex}"]:checked`);
    const questionCard = quizContainer.querySelector(`[data-question-index="${questionIndex}"]`);

    if (!question || !checkedAnswer || !questionCard) return;

    clearQuestionFeedback(questionCard);

    const selectedOption = checkedAnswer.closest(".quiz-option");
    if (!selectedOption) return;

    if (Number(checkedAnswer.value) === question.answer) {
      selectedOption.classList.add("quiz-option-correct");
    } else {
      selectedOption.classList.add("quiz-option-wrong");
    }
  }

  function clearQuestionFeedback(questionCard) {
    questionCard.querySelectorAll(".quiz-option-correct, .quiz-option-wrong").forEach((option) => {
      option.classList.remove("quiz-option-correct", "quiz-option-wrong");
    });
  }

  function showAnswerFeedback() {
    currentQuestions.forEach((question, index) => {
      updateQuestionFeedback(index);
    });
  }

  function getRewardTier(percentage) {
    if (percentage >= 90) return "DevQuest Master \u{1F680}";
    if (percentage >= 70) return "Skilled Builder";
    if (percentage >= 50) return "Rising Developer";
    return "Beginner Explorer";
  }

  function renderRewardCard(tier, message, type = "success") {
    reward.innerHTML = `
      <div class="reward-card reward-card-${type}">
        <div class="reward-tier-label">Achievement Tier</div>
        <h3>${escapeHTML(tier)}</h3>
        <p class="reward-quote mb-0">${escapeHTML(message)}</p>
      </div>
    `;
  }

  // Reward quotes come from an API; fallback text keeps the page useful if it fails.
  async function fetchReward(percentage) {
    const tier = getRewardTier(percentage);
    const rewardApiUrl = "https://dummyjson.com/quotes/random";
    renderRewardCard(tier, "Fetching your reward quote...", "loading");
    console.log("Reward API URL:", rewardApiUrl);

    try {
      const response = await fetch(rewardApiUrl, { cache: "no-store" });
      console.log("Reward API response status:", response.status);

      if (!response.ok) throw new Error("Reward API failed");

      const data = await response.json();
      console.log("Reward API parsed response:", data);

      const quote = data && data.quote ? data.quote : "";
      const author = data && data.author ? ` - ${data.author}` : "";

      if (!quote) throw new Error("Reward quote was empty");

      renderRewardCard(tier, `${quote}${author}`, "success");
    } catch (error) {
      console.error("Reward API request failed:", error);
      renderRewardCard(tier, "Reward quote could not be retrieved right now, but your achievement still counts.", "fallback");
    }
  }

  // Renders the final score, saves the attempt and decides whether to unlock a reward.
  function showResult(score) {
    const total = currentQuestions.length;
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= PASS_THRESHOLD;
    const statusClass = passed ? "status-pass" : "status-fail";
    const modeLabel = quizModes[activeMode].label;

    result.innerHTML = `
      <div class="result-score-card">
        <div class="result-score-copy">
          <p class="mb-1"><strong>Score:</strong> ${score}/${total}</p>
          <p class="mb-1"><strong>Percentage:</strong> ${percentage}%</p>
          <p class="mb-0"><strong>Outcome:</strong> <span class="${statusClass}">${passed ? "Successful" : "Unsuccessful"}</span></p>
        </div>
        <div
          class="result-progress-track"
          role="progressbar"
          aria-label="Quiz score percentage"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="${percentage}"
          style="--score-percent: ${percentage}%;"
        >
          <div class="result-progress-fill"></div>
          <span class="result-rocket" aria-hidden="true">&#128640;</span>
        </div>
      </div>
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
      fetchReward(percentage);
    } else {
      const tier = getRewardTier(percentage);
      renderRewardCard(tier, "Reach 70% to unlock a reward quote.", "locked");
    }
  }

  // Fetch is the preferred loader; XMLHttpRequest is a fallback for stricter local file cases.
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

  // Any answer change updates progress and clears old validation warnings.
  quizContainer.addEventListener("change", (event) => {
    hasStarted = true;
    updateProgress();
    if (allQuestionsAnswered()) {
      setValidationMessage(false);
      quizContainer.querySelectorAll(".quiz-question").forEach((questionCard) => {
        questionCard.classList.remove("question-unanswered");
      });
    }

    if (hasSubmitted && event.target.classList.contains("quiz-input")) {
      const questionCard = event.target.closest(".quiz-question");
      if (!questionCard) return;

      clearQuestionFeedback(questionCard);
    }
  });

  // Main submit handler: validate, score, show answer feedback and save the attempt.
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
    showAnswerFeedback();
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

  // Mode buttons reload the quiz with a different topic filter.
  modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const modeKey = String(button.dataset.mode || "").trim().toLowerCase();
      loadMode(modeKey);
    });
  });

  // Warn users before leaving if they started but did not submit an attempt.
  window.addEventListener("beforeunload", (event) => {
    if (!hasStarted || hasSubmitted) return;

    event.preventDefault();
    event.returnValue = "";
  });

  renderHistory();
  setResultRewardPlaceholders();
  loadQuestions();
});
