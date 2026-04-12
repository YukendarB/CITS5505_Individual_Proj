function initialiseDevQuestPage() {
  const demoButton = document.getElementById("demoButton");
  const demoOutput = document.getElementById("demoOutput");
  const htmlDemoOutput = document.getElementById("htmlDemoOutput");
  const htmlDemoUseCase = document.getElementById("htmlDemoUseCase");
  const semanticControls = document.querySelectorAll(".semantic-control");
  const semanticRegions = document.querySelectorAll(".semantic-region");
  const cssDemoButton = document.getElementById("cssDemoButton");
  const cssDemoTarget = document.getElementById("cssDemoTarget");
  const cssDemoCode = document.getElementById("cssDemoCode");
  const cssDemoExplanation = document.getElementById("cssDemoExplanation");
  const jsDemoState = document.getElementById("jsDemoState");
  const jsDemoExplanation = document.getElementById("jsDemoExplanation");

  // Tutorial HTML lab: only runs when the semantic preview controls exist.
  if (semanticControls.length > 0 && semanticRegions.length > 0 && htmlDemoOutput && htmlDemoUseCase) {
    const htmlExamples = {
      header: {
        role: "Current element: <header> - introductory content for a page or section.",
        useCase: "Use case: place the site logo, page title, or opening lesson heading where users expect the page to begin."
      },
      nav: {
        role: "Current element: <nav> - a group of links used to move through the site.",
        useCase: "Use case: group lesson links, menu items, or page shortcuts so users can find movement controls quickly."
      },
      main: {
        role: "Current element: <main> - the unique content area of this page.",
        useCase: "Use case: wrap the central tutorial content in <main> so assistive tools can skip repeated navigation."
      },
      article: {
        role: "Current element: <article> - a standalone content block such as a lesson or post.",
        useCase: "Use case: use <article> for a lesson card, blog post, or independent project summary that could stand on its own."
      },
      footer: {
        role: "Current element: <footer> - closing information for a page or section.",
        useCase: "Use case: place copyright text, source notes, or closing navigation at the end of a page."
      }
    };

    semanticControls.forEach((control) => {
      control.addEventListener("click", () => {
        const selectedRegion = control.dataset.region;
        const example = htmlExamples[selectedRegion];

        if (!example) return;

        semanticControls.forEach((item) => {
          item.classList.toggle("semantic-control-active", item === control);
        });
        semanticRegions.forEach((region) => {
          region.classList.toggle("semantic-region-active", region.dataset.region === selectedRegion);
        });

        htmlDemoOutput.textContent = example.role;
        htmlDemoUseCase.textContent = example.useCase;
        htmlDemoOutput.classList.add("lab-output-active");
      });
    });
  }

  // Tutorial CSS lab: only runs when the style switcher elements exist.
  if (cssDemoButton && cssDemoTarget && cssDemoCode && cssDemoExplanation) {
    let cssStep = -1;
    const cssStates = ["css-demo-spacious", "css-demo-accent", "css-demo-compact", "css-demo-contrast"];
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
      demoOutput.textContent = demoMessages[demoStep].output;
      jsDemoState.textContent = demoMessages[demoStep].label;
      jsDemoExplanation.textContent = demoMessages[demoStep].explanation;
      demoOutput.classList.add("demo-active");
      jsDemoState.classList.add("js-state-active");
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
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialiseDevQuestPage);
} else {
  initialiseDevQuestPage();
}
