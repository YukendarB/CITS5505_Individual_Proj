document.addEventListener("DOMContentLoaded", () => {
  const quizStatus = document.getElementById("quizStatus");
  const quizContainer = document.getElementById("quizContainer");

  if (!quizStatus || !quizContainer) {
    return;
  }

  quizStatus.textContent = "Quiz script loaded. Questions will be added next.";
});