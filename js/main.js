function initialiseDevQuestPage() {
  // These selectors are shared across pages; each feature only runs if its elements exist.
  const demoButton = document.getElementById("demoButton");
  const demoOutput = document.getElementById("demoOutput");
  const cssDemoButton = document.getElementById("cssDemoButton");
  const cssDemoTarget = document.getElementById("cssDemoTarget");
  const cssDemoCode = document.getElementById("cssDemoCode");
  const cssDemoExplanation = document.getElementById("cssDemoExplanation");
  const jsDemoState = document.getElementById("jsDemoState");
  const jsDemoExplanation = document.getElementById("jsDemoExplanation");
  const htmlPlaygroundInput = document.getElementById("htmlPlaygroundInput");
  const cssPlaygroundInput = document.getElementById("cssPlaygroundInput");
  const jsPlaygroundInput = document.getElementById("jsPlaygroundInput");
  const runPlaygroundButton = document.getElementById("runPlaygroundButton");
  const resetPlaygroundButton = document.getElementById("resetPlaygroundButton");
  const codePlaygroundFrame = document.getElementById("codePlaygroundFrame");
  const playgroundStatus = document.getElementById("playgroundStatus");

  // Tutorial CSS lab: only runs when the style switcher elements exist.
  if (cssDemoButton && cssDemoTarget && cssDemoCode && cssDemoExplanation) {
    let cssStep = -1;
    // These classes represent the visual states users cycle through in the CSS demo.
    const cssStates = ["css-demo-spacious", "css-demo-accent", "css-demo-compact", "css-demo-contrast"];
    // Each state also updates the code sample and explanation shown beside the demo.
    const cssExamples = [
      {
        label: "Spacious layout",
        explanation: "CSS state: increased padding creates more breathing room and improves readability.",
        code: `.css-demo-spacious {
  padding: 1.25rem 1.35rem;
}`
      },
      {
        label: "Accent highlight",
        explanation: "CSS state: stronger color and shadow draw attention to an important card.",
        code: `.css-demo-accent {
  background: rgba(99, 102, 241, 0.16);
  border-color: rgba(236, 72, 153, 0.52);
  box-shadow: 0 0 18px rgba(236, 72, 153, 0.16);
}`
      },
      {
        label: "Compact layout",
        explanation: "CSS state: reduced padding fits tighter spaces, but it should still remain readable.",
        code: `.css-demo-compact {
  padding: 0.65rem 0.75rem;
}`
      },
      {
        label: "High contrast mode",
        explanation: "CSS state: high contrast improves legibility when text needs stronger separation from the background.",
        code: `.css-demo-contrast {
  background: #f8fafc;
  border-color: #22c55e;
  color: #0f172a;
}`
      }
    ];

    cssDemoButton.addEventListener("click", () => {
      // Remove the previous demo state before applying the next one.
      cssDemoTarget.classList.remove(...cssStates);
      cssStep = (cssStep + 1) % cssStates.length;
      cssDemoTarget.classList.add(cssStates[cssStep]);
      cssDemoCode.textContent = cssExamples[cssStep].code;
      cssDemoExplanation.textContent = cssExamples[cssStep].explanation;
      cssDemoButton.textContent = `Toggle CSS State: ${cssExamples[cssStep].label}`;
    });
  }

  // Tutorial JavaScript lab: only runs when the DOM update demo exists.
  if (demoButton && demoOutput && jsDemoState && jsDemoExplanation) {
    let demoStep = -1;
    // Each button click advances to the next DOM update example.
    const demoMessages = [
      {
        label: "State: text updated",
        output: "DOM update 1: JavaScript changed this message after your click.",
        explanation: "JavaScript selected the output paragraph and replaced its textContent."
      },
      {
        label: "State: class applied",
        output: "DOM update 2: The card now has an active visual state.",
        explanation: "JavaScript added a CSS class so the interface gives visible feedback."
      },
      {
        label: "State: interaction repeated",
        output: "DOM update 3: One event listener can respond every time the user clicks.",
        explanation: "The same click listener can keep updating the DOM without refreshing the page."
      }
    ];

    demoButton.addEventListener("click", () => {
      demoStep = (demoStep + 1) % demoMessages.length;
      // The demo changes text and applies CSS classes without reloading the page.
      demoOutput.textContent = demoMessages[demoStep].output;
      jsDemoState.textContent = demoMessages[demoStep].label;
      jsDemoExplanation.textContent = demoMessages[demoStep].explanation;
      demoOutput.classList.add("demo-active");
      jsDemoState.classList.add("js-state-active");
    });
  }

  // Tutorial code playground: renders user HTML/CSS/JS inside a sandboxed iframe.
  if (
    htmlPlaygroundInput &&
    cssPlaygroundInput &&
    jsPlaygroundInput &&
    runPlaygroundButton &&
    resetPlaygroundButton &&
    codePlaygroundFrame &&
    playgroundStatus
  ) {
    const starterCode = {
      html: htmlPlaygroundInput.value,
      css: cssPlaygroundInput.value,
      js: jsPlaygroundInput.value
    };

    const renderCodePlayground = () => {
      // Escape closing script tags so user input cannot break out of the preview script block.
      const safeScript = jsPlaygroundInput.value.replace(/<\/script/gi, "<\\/script");

      // srcdoc writes the combined HTML, CSS and JavaScript into the sandboxed iframe.
      codePlaygroundFrame.srcdoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
${cssPlaygroundInput.value}
  </style>
</head>
<body>
${htmlPlaygroundInput.value}
  <script>
${safeScript}
  <\/script>
</body>
</html>`;

      const now = new Date();
      playgroundStatus.textContent = `Output updated at ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}.`;
    };

    // Render the latest editor content when the user presses Run Code.
    runPlaygroundButton.addEventListener("click", renderCodePlayground);

    // Restore the starter code so users can safely experiment and reset.
    resetPlaygroundButton.addEventListener("click", () => {
      htmlPlaygroundInput.value = starterCode.html;
      cssPlaygroundInput.value = starterCode.css;
      jsPlaygroundInput.value = starterCode.js;
      renderCodePlayground();
    });

    renderCodePlayground();
  }

  const toggleProjectDetails = document.getElementById("toggleProjectDetails");
  const projectDetails = document.getElementById("projectDetails");

  // CV page project button: toggles the hidden project highlights panel.
  if (toggleProjectDetails && projectDetails) {
    toggleProjectDetails.addEventListener("click", () => {
      const isHidden = projectDetails.classList.contains("hidden");
      projectDetails.classList.toggle("hidden");

      toggleProjectDetails.textContent = isHidden
        ? "Hide Project Highlights"
        : "Explore Project Highlights";
    });
  }

  const revealCandidates = document.querySelectorAll(
    ".reveal-section, main > .hero-section, main > .page-intro, main > .content-card, .feature-card, .tutorial-module, .tutorial-demo, .tutorial-cta"
  );

  // Adds reveal behavior consistently to cards/sections even if the HTML did not include the class.
  revealCandidates.forEach((section) => {
    section.classList.add("reveal-section");
  });

  const revealSections = document.querySelectorAll(".reveal-section");
  const skillFills = document.querySelectorAll(".skill-fill");

  // IntersectionObserver starts animations only when the section scrolls into view.
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");

        entry.target.querySelectorAll(".skill-fill").forEach((bar) => {
          // Each skill bar stores its target width in HTML using data-width.
          const width = bar.dataset.width || "0%";
          bar.style.width = width;
        });

        obs.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    revealSections.forEach((section) => observer.observe(section));
  } else {
    // Fallback for older browsers: show sections and skill bars immediately.
    revealSections.forEach((section) => section.classList.add("is-visible"));
    skillFills.forEach((bar) => {
      const width = bar.dataset.width || "0%";
      bar.style.width = width;
    });
  }
}

// Start after the DOM exists; if it already exists, run immediately.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialiseDevQuestPage);
} else {
  initialiseDevQuestPage();
}
