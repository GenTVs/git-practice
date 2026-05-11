/* =========================================================
    GitVerse Control Room
    File: app.js

    Purpose:
    This JavaScript file adds interactivity to the GitHub
    collaboration practice project.

    Practice role:
    - This file can be uploaded from branch: version1
    - styles.css can be uploaded from branch: css

    Features:
    - Mobile navigation toggle
    - Workflow step controller
    - Pull Request merge simulation
    - Git vocabulary learning cards
    - Copy terminal commands button
    - Checklist progress system
    - LocalStorage save/load
    - Small visual effects
========================================================= */

"use strict";

/* =========================================================
    1. GLOBAL HELPERS
========================================================= */

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const appState = {
    currentWorkflowStep: 1,
    totalWorkflowSteps: 8,
    mergedPullRequests: new Set(),
    checklistKey: "gitverse-checklist-state",
};

function safeText(value) {
    return String(value ?? "").trim();
}

function setLiveMessage(element, message) {
    if (!element) return;
    element.textContent = message;
}

function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text) {
        element.textContent = text;
    }

    return element;
}

/* =========================================================
    2. APP INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initMobileNavigation();
    initWorkflowController();
    initPullRequestSimulator();
    initVocabularyCards();
    initCopyTerminalCommands();
    initChecklistProgress();
    initSmoothAnchorClosing();
    initScrollReveal();
    initKeyboardShortcuts();
    initConsoleWelcome();

    console.log("✅ GitVerse Control Room initialized.");
});

/* =========================================================
    3. MOBILE NAVIGATION
========================================================= */

function initMobileNavigation() {
    const navToggle = $("#navToggle");
    const navMenu = $("#navMenu");

    if (!navToggle || !navMenu) return;

    navToggle.addEventListener("click", () => {
        const isOpen = document.body.classList.toggle("nav-open");

        navToggle.setAttribute("aria-expanded", String(isOpen));
        navToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );
    });
}

function initSmoothAnchorClosing() {
    const navLinks = $$(".nav-menu a");

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            document.body.classList.remove("nav-open");

            const navToggle = $("#navToggle");
            if (navToggle) {
                navToggle.setAttribute("aria-expanded", "false");
                navToggle.setAttribute("aria-label", "Open navigation menu");
            }
        });
    });
}

/* =========================================================
    4. WORKFLOW STEP CONTROLLER
========================================================= */

function initWorkflowController() {
    const steps = $$(".workflow-step");
    const nextButton = $("#nextStepBtn");
    const prevButton = $("#prevStepBtn");

    if (!steps.length || !nextButton || !prevButton) return;

    appState.totalWorkflowSteps = steps.length;

    updateWorkflowUI();

    nextButton.addEventListener("click", () => {
        if (appState.currentWorkflowStep < appState.totalWorkflowSteps) {
            appState.currentWorkflowStep++;
        } else {
            appState.currentWorkflowStep = 1;
        }

        updateWorkflowUI();
        focusActiveWorkflowStep();
    });

    prevButton.addEventListener("click", () => {
        if (appState.currentWorkflowStep > 1) {
            appState.currentWorkflowStep--;
        } else {
            appState.currentWorkflowStep = appState.totalWorkflowSteps;
        }

        updateWorkflowUI();
        focusActiveWorkflowStep();
    });

    steps.forEach((step) => {
        step.setAttribute("tabindex", "0");

        step.addEventListener("click", () => {
            const stepNumber = Number(step.dataset.step);

            if (!Number.isNaN(stepNumber)) {
                appState.currentWorkflowStep = stepNumber;
                updateWorkflowUI();
            }
        });

        step.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();

                const stepNumber = Number(step.dataset.step);

                if (!Number.isNaN(stepNumber)) {
                    appState.currentWorkflowStep = stepNumber;
                    updateWorkflowUI();
                }
            }
        });
    });
}

function updateWorkflowUI() {
    const steps = $$(".workflow-step");

    steps.forEach((step) => {
        const stepNumber = Number(step.dataset.step);

        step.classList.toggle("active", stepNumber === appState.currentWorkflowStep);
        step.classList.toggle("completed", stepNumber < appState.currentWorkflowStep);

        step.setAttribute(
            "aria-label",
            stepNumber === appState.currentWorkflowStep
                ? `Current workflow step ${stepNumber}`
                : `Workflow step ${stepNumber}`
        );
    });

    updateWorkflowControlLabels();
}

function updateWorkflowControlLabels() {
    const nextButton = $("#nextStepBtn");
    const prevButton = $("#prevStepBtn");

    if (!nextButton || !prevButton) return;

    const isLastStep = appState.currentWorkflowStep === appState.totalWorkflowSteps;
    const isFirstStep = appState.currentWorkflowStep === 1;

    nextButton.textContent = isLastStep ? "Restart Workflow" : "Next Step";
    prevButton.textContent = isFirstStep ? "Last Step" : "Previous Step";
}

function focusActiveWorkflowStep() {
    const activeStep = $(`.workflow-step[data-step="${appState.currentWorkflowStep}"]`);

    if (!activeStep) return;

    activeStep.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
    });
}

/* =========================================================
    5. PULL REQUEST MERGE SIMULATOR
========================================================= */

function initPullRequestSimulator() {
    const mergeButtons = $$(".merge-button");
    const mergeResult = $("#mergeResult");

    if (!mergeButtons.length || !mergeResult) return;

    mergeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const pullRequestName = safeText(button.dataset.pr);

            if (!pullRequestName) return;

            simulatePullRequestMerge(pullRequestName, button);
        });
    });
}

function simulatePullRequestMerge(pullRequestName, button) {
    const mergeResult = $("#mergeResult");
    const prCard = button.closest(".pr-card");
    const statusBadge = prCard ? $(".pr-status", prCard) : null;

    appState.mergedPullRequests.add(pullRequestName);

    button.classList.add("merged");
    button.disabled = true;
    button.textContent = "Merged Successfully";

    if (prCard) {
        prCard.classList.add("is-merged");
    }

    if (statusBadge) {
        statusBadge.classList.remove("open");
        statusBadge.classList.add("merged");
        statusBadge.textContent = "Merged";
    }

    if (mergeResult) {
        mergeResult.classList.add("success");

        mergeResult.innerHTML = `
            <span class="merge-result-icon">✅</span>
            <p>
                Pull Request from <strong>${pullRequestName}</strong> has been merged into
                <strong>main</strong>. Your final project is becoming more complete.
            </p>
        `;
    }

    updateRepositoryMergePreview();
}

function updateRepositoryMergePreview() {
    const mergedCount = appState.mergedPullRequests.size;
    const finalNode = $(".node-final");

    if (!finalNode) return;

    if (mergedCount >= 2) {
        finalNode.style.transform = "scale(1.45)";
        finalNode.style.transition = "transform 220ms ease";
        finalNode.title = "Both branches merged into main!";
    } else {
        finalNode.style.transform = "scale(1.12)";
        finalNode.style.transition = "transform 220ms ease";
        finalNode.title = "Waiting for all branches to merge.";
    }
}

/* =========================================================
    6. VOCABULARY LEARNING CARDS
========================================================= */

const gitVocabulary = {
    clone: {
        title: "📥 Clone",
        description:
            "Clone means downloading a GitHub repository to your computer. It gives you the project files, commit history, and remote connection.",
        command: "git clone <repo-url>",
        example:
            "Example: git clone https://github.com/GenTVs/git-practice.git",
    },

    branch: {
        title: "🌿 Branch",
        description:
            "A branch is a separate timeline of your project. You use branches so you can work safely without breaking main.",
        command: "git switch -c <branch-name>",
        example: "Example: git switch -c version1",
    },

    commit: {
        title: "💾 Commit",
        description:
            "A commit is a saved snapshot of your staged changes. It records what changed, who changed it, and when.",
        command: 'git commit -m "message"',
        example: 'Example: git commit -m "Add homepage layout"',
    },

    push: {
        title: "☁️ Push",
        description:
            "Push means uploading your local commits or branch to GitHub so other people can see and review your work.",
        command: "git push origin <branch-name>",
        example: "Example: git push origin version1",
    },

    "pull-request": {
        title: "📬 Pull Request",
        description:
            "A Pull Request is a request to merge changes from one branch into another branch, usually into main.",
        command: "Open PR on GitHub",
        example: "Example: version1 → main",
    },

    merge: {
        title: "🔀 Merge",
        description:
            "Merge means combining changes from one branch into another. After merge, main receives the approved changes.",
        command: "Merge pull request",
        example: "Example: css branch merged into main",
    },
};

function initVocabularyCards() {
    const cards = $$(".vocab-card");
    const output = $("#vocabOutput");

    if (!cards.length || !output) return;

    cards.forEach((card) => {
        card.addEventListener("click", () => {
            const term = safeText(card.dataset.term);
            showVocabularyTerm(term, card);
        });

        card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();

                const term = safeText(card.dataset.term);
                showVocabularyTerm(term, card);
            }
        });
    });
}

function showVocabularyTerm(term, selectedCard) {
    const output = $("#vocabOutput");
    const data = gitVocabulary[term];

    if (!output || !data) return;

    $$(".vocab-card").forEach((card) => {
        card.classList.remove("active");
    });

    selectedCard.classList.add("active");

    output.classList.remove("revealed");

    output.innerHTML = `
        <h3>${data.title}</h3>
        <p>${data.description}</p>

        <div class="dynamic-code-block">
            <strong>Command:</strong>
            <code>${data.command}</code>
        </div>

        <div class="dynamic-code-block">
            <strong>Example:</strong>
            <code>${data.example}</code>
        </div>
    `;

    requestAnimationFrame(() => {
        output.classList.add("revealed");
    });
}

/* =========================================================
    7. COPY TERMINAL COMMANDS
========================================================= */

function initCopyTerminalCommands() {
    const copyButton = $("#copyTerminalBtn");
    const terminalCode = $("#terminalCode");

    if (!copyButton || !terminalCode) return;

    copyButton.addEventListener("click", async () => {
        const textToCopy = terminalCode.textContent;

        try {
            await navigator.clipboard.writeText(textToCopy);
            showCopySuccess(copyButton);
        } catch (error) {
            fallbackCopyText(textToCopy);
            showCopySuccess(copyButton);
        }
    });
}

function showCopySuccess(button) {
    const originalText = button.textContent;

    button.textContent = "Copied!";
    button.classList.add("copied");

    setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove("copied");
    }, 1600);
}

function fallbackCopyText(text) {
    const textarea = document.createElement("textarea");

    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";

    document.body.appendChild(textarea);

    textarea.select();
    document.execCommand("copy");

    document.body.removeChild(textarea);
}

/* =========================================================
    8. CHECKLIST PROGRESS SYSTEM
========================================================= */

function initChecklistProgress() {
    const checklistPanel = $(".checklist-panel");
    const checkboxes = $$(".checklist-panel input[type='checkbox']");

    if (!checklistPanel || !checkboxes.length) return;

    const progressBox = createChecklistProgressBox();
    checklistPanel.parentElement.insertBefore(progressBox, checklistPanel);

    loadChecklistState(checkboxes);
    updateChecklistProgress(checkboxes);

    checkboxes.forEach((checkbox, index) => {
        checkbox.addEventListener("change", () => {
            saveChecklistState(checkboxes);
            updateChecklistProgress(checkboxes);
            celebrateChecklistProgress(checkboxes, index);
        });
    });
}

function createChecklistProgressBox() {
    const wrapper = createElement("div", "checklist-progress");

    wrapper.innerHTML = `
        <div class="checklist-progress-info">
            <strong>Practice Progress</strong>
            <span id="checklistProgressText">0% complete</span>
        </div>

        <div class="checklist-progress-track">
            <div class="checklist-progress-bar" id="checklistProgressBar"></div>
        </div>
    `;

    addDynamicChecklistStyles();

    return wrapper;
}

function updateChecklistProgress(checkboxes) {
    const checkedCount = checkboxes.filter((checkbox) => checkbox.checked).length;
    const totalCount = checkboxes.length;
    const percentage = Math.round((checkedCount / totalCount) * 100);

    const progressText = $("#checklistProgressText");
    const progressBar = $("#checklistProgressBar");

    if (progressText) {
        progressText.textContent = `${percentage}% complete (${checkedCount}/${totalCount})`;
    }

    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
}

function saveChecklistState(checkboxes) {
    const state = checkboxes.map((checkbox) => checkbox.checked);

    localStorage.setItem(appState.checklistKey, JSON.stringify(state));
}

function loadChecklistState(checkboxes) {
    const savedState = localStorage.getItem(appState.checklistKey);

    if (!savedState) return;

    try {
        const parsedState = JSON.parse(savedState);

        checkboxes.forEach((checkbox, index) => {
            checkbox.checked = Boolean(parsedState[index]);
        });
    } catch (error) {
        console.warn("Could not load checklist state:", error);
    }
}

function celebrateChecklistProgress(checkboxes, index) {
    const checkedCount = checkboxes.filter((checkbox) => checkbox.checked).length;

    if (checkedCount === checkboxes.length) {
        showFloatingToast("🎉 Collaboration checklist complete!");
        launchMiniConfetti();
        return;
    }

    if (checkboxes[index].checked) {
        showFloatingToast("✅ Nice! One step closer to merging everything.");
    }
}

/* =========================================================
    9. TOAST NOTIFICATIONS
========================================================= */

function showFloatingToast(message) {
    let toastContainer = $(".toast-container");

    if (!toastContainer) {
        toastContainer = createElement("div", "toast-container");
        document.body.appendChild(toastContainer);
        addDynamicToastStyles();
    }

    const toast = createElement("div", "toast-message", message);

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    setTimeout(() => {
        toast.classList.remove("show");

        setTimeout(() => {
            toast.remove();
        }, 250);
    }, 2200);
}

/* =========================================================
    10. MINI CONFETTI EFFECT
========================================================= */

function launchMiniConfetti() {
    const confettiCount = 42;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = createElement("span", "mini-confetti");

        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const duration = 1.2 + Math.random() * 1.4;
        const rotate = Math.random() * 360;

        confetti.style.left = `${left}%`;
        confetti.style.animationDelay = `${delay}s`;
        confetti.style.animationDuration = `${duration}s`;
        confetti.style.transform = `rotate(${rotate}deg)`;

        document.body.appendChild(confetti);

        setTimeout(() => {
            confetti.remove();
        }, (delay + duration) * 1000 + 300);
    }

    addDynamicConfettiStyles();
}

/* =========================================================
    11. SCROLL REVEAL EFFECT
========================================================= */

function initScrollReveal() {
    const revealTargets = [
        ...$$(".concept-card"),
        ...$$(".workflow-step"),
        ...$$(".branch-card"),
        ...$$(".pr-card"),
        ...$$(".terminal-window"),
        ...$$(".vocab-card"),
        ...$$(".check-item"),
    ];

    if (!revealTargets.length) return;

    addDynamicRevealStyles();

    revealTargets.forEach((target) => {
        target.classList.add("reveal-target");
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.16,
            rootMargin: "0px 0px -40px 0px",
        }
    );

    revealTargets.forEach((target) => {
        observer.observe(target);
    });
}

/* =========================================================
    12. KEYBOARD SHORTCUTS
========================================================= */

function initKeyboardShortcuts() {
    document.addEventListener("keydown", (event) => {
        const isTyping =
            event.target instanceof HTMLInputElement ||
            event.target instanceof HTMLTextAreaElement ||
            event.target.isContentEditable;

        if (isTyping) return;

        if (event.key.toLowerCase() === "n") {
            moveWorkflowByKeyboard(1);
        }

        if (event.key.toLowerCase() === "p") {
            moveWorkflowByKeyboard(-1);
        }

        if (event.key.toLowerCase() === "t") {
            $("#terminal")?.scrollIntoView({ behavior: "smooth" });
        }
    });
}

function moveWorkflowByKeyboard(direction) {
    const next = appState.currentWorkflowStep + direction;

    if (next > appState.totalWorkflowSteps) {
        appState.currentWorkflowStep = 1;
    } else if (next < 1) {
        appState.currentWorkflowStep = appState.totalWorkflowSteps;
    } else {
        appState.currentWorkflowStep = next;
    }

    updateWorkflowUI();
}

/* =========================================================
    13. DYNAMIC STYLE INJECTION
    These styles support JS-created elements.
========================================================= */

function injectStyleOnce(id, css) {
    if (document.getElementById(id)) return;

    const style = document.createElement("style");

    style.id = id;
    style.textContent = css;

    document.head.appendChild(style);
}

function addDynamicChecklistStyles() {
    injectStyleOnce(
        "gitverse-checklist-progress-style",
        `
        .checklist-progress {
            margin-bottom: 18px;
            padding: 18px;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 22px;
            background: rgba(255, 255, 255, 0.05);
        }

        .checklist-progress-info {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 12px;
            color: #f8fbff;
        }

        .checklist-progress-info span {
            color: #c9d5f2;
            font-size: 0.9rem;
            font-weight: 700;
        }

        .checklist-progress-track {
            height: 12px;
            overflow: hidden;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.08);
        }

        .checklist-progress-bar {
            width: 0%;
            height: 100%;
            border-radius: inherit;
            background: linear-gradient(135deg, #5dff9f, #35e6ff);
            box-shadow: 0 0 22px rgba(93, 255, 159, 0.35);
            transition: width 260ms ease;
        }

        @media (max-width: 620px) {
            .checklist-progress-info {
                flex-direction: column;
                align-items: flex-start;
            }
        }
        `
    );
}

function addDynamicToastStyles() {
    injectStyleOnce(
        "gitverse-toast-style",
        `
        .toast-container {
            position: fixed;
            right: 22px;
            bottom: 22px;
            z-index: 999;
            display: grid;
            gap: 10px;
            pointer-events: none;
        }

        .toast-message {
            max-width: 320px;
            padding: 14px 16px;
            border: 1px solid rgba(255, 255, 255, 0.14);
            border-radius: 18px;
            background: rgba(8, 13, 31, 0.92);
            color: #f8fbff;
            box-shadow: 0 18px 48px rgba(0, 0, 0, 0.35);
            backdrop-filter: blur(20px);
            opacity: 0;
            transform: translateY(12px) scale(0.96);
            transition:
                opacity 220ms ease,
                transform 220ms ease;
        }

        .toast-message.show {
            opacity: 1;
            transform: translateY(0) scale(1);
        }

        @media (max-width: 620px) {
            .toast-container {
                left: 14px;
                right: 14px;
                bottom: 14px;
            }

            .toast-message {
                max-width: none;
            }
        }
        `
    );
}

function addDynamicConfettiStyles() {
    injectStyleOnce(
        "gitverse-confetti-style",
        `
        .mini-confetti {
            position: fixed;
            top: -20px;
            z-index: 1000;
            width: 10px;
            height: 16px;
            border-radius: 3px;
            background: linear-gradient(135deg, #35e6ff, #a46bff);
            pointer-events: none;
            animation-name: gitverseConfettiFall;
            animation-timing-function: ease-in;
            animation-fill-mode: forwards;
        }

        .mini-confetti:nth-child(3n) {
            background: linear-gradient(135deg, #ff5ac8, #ffe66b);
        }

        .mini-confetti:nth-child(4n) {
            background: linear-gradient(135deg, #5dff9f, #35e6ff);
        }

        @keyframes gitverseConfettiFall {
            0% {
                opacity: 1;
                transform: translateY(0) rotate(0deg);
            }

            100% {
                opacity: 0;
                transform: translateY(110vh) rotate(720deg);
            }
        }
        `
    );
}

function addDynamicRevealStyles() {
    injectStyleOnce(
        "gitverse-reveal-style",
        `
        .reveal-target {
            opacity: 0;
            transform: translateY(24px);
            transition:
                opacity 520ms ease,
                transform 520ms ease;
        }

        .reveal-target.is-visible {
            opacity: 1;
            transform: translateY(0);
        }
        `
    );
}

/* =========================================================
    14. CONSOLE WELCOME MESSAGE
========================================================= */

function initConsoleWelcome() {
    const message = `
%c🌊 GitVerse Control Room
%cGitHub Flow Practice Project

Commands practiced:
- git clone
- git switch -c
- git add .
- git commit -m
- git push origin branch
- Pull Request
- Merge
- git pull

Tip:
Open DevTools Console while editing app.js to see JavaScript behavior.
`;

    console.log(
        message,
        "color: #35e6ff; font-size: 18px; font-weight: bold;",
        "color: #c9d5f2; font-size: 13px;"
    );
}

/* =========================================================
    15. OPTIONAL DEBUG HELPERS
    You can run these in the browser console.
========================================================= */

window.GitVerse = {
    state: appState,

    resetChecklist() {
        localStorage.removeItem(appState.checklistKey);

        $$(".checklist-panel input[type='checkbox']").forEach((checkbox) => {
            checkbox.checked = false;
        });

        updateChecklistProgress($$(".checklist-panel input[type='checkbox']"));
        showFloatingToast("Checklist reset.");
    },

    jumpToStep(stepNumber) {
        const number = Number(stepNumber);

        if (Number.isNaN(number)) return;

        appState.currentWorkflowStep = Math.min(
            Math.max(number, 1),
            appState.totalWorkflowSteps
        );

        updateWorkflowUI();
        focusActiveWorkflowStep();
    },

    simulateAllMerges() {
        $$(".merge-button").forEach((button) => {
            if (!button.disabled) {
                button.click();
            }
        });
    },
};