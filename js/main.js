document.addEventListener("DOMContentLoaded", () => {
  const demoButton = document.getElementById("demoButton");
  const demoOutput = document.getElementById("demoOutput");

  if (demoButton && demoOutput) {
    demoButton.addEventListener("click", () => {
      demoOutput.textContent = "Great! This demo area is working and ready for your final interactive example.";
    });
  }
});