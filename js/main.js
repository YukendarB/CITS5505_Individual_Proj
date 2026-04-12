document.addEventListener("DOMContentLoaded", () => {
  const demoButton = document.getElementById("demoButton");
  const demoOutput = document.getElementById("demoOutput");

  if (demoButton && demoOutput) {
    demoButton.addEventListener("click", () => {
      demoOutput.textContent = "Mission update: your interactive demo is working and ready to be expanded.";
    });
  }

  const toggleProjectDetails = document.getElementById("toggleProjectDetails");
  const projectDetails = document.getElementById("projectDetails");

  if (toggleProjectDetails && projectDetails) {
    toggleProjectDetails.addEventListener("click", () => {
      const isHidden = projectDetails.classList.contains("hidden");
      projectDetails.classList.toggle("hidden");

      toggleProjectDetails.textContent = isHidden
        ? "Hide Project Highlights"
        : "Explore Project Highlights";
    });
  }

  const revealSections = document.querySelectorAll(".reveal-section");
  const skillFills = document.querySelectorAll(".skill-fill");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");

        entry.target.querySelectorAll(".skill-fill").forEach((bar) => {
          const width = bar.dataset.width || "0%";
          bar.style.width = width;
        });

        obs.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    revealSections.forEach((section) => observer.observe(section));
  } else {
    revealSections.forEach((section) => section.classList.add("is-visible"));
    skillFills.forEach((bar) => {
      const width = bar.dataset.width || "0%";
      bar.style.width = width;
    });
  }
});
