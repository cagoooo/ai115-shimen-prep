const APP_VERSION = "2026.09.14-3";

(() => {
  "use strict";

  const deadline = new Date("2026-09-18T12:00:00+08:00");
  const countdown = document.querySelector("#countdown");
  const deadlineStatus = document.querySelector("#deadline-status");

  function updateCountdown() {
    if (!countdown || !deadlineStatus) return;

    const remaining = deadline.getTime() - Date.now();
    if (remaining <= 0) {
      deadlineStatus.textContent = "報名期限已到，請以官方公告確認後續處理";
      countdown.textContent = "截止時間：9/18（五）12:00";
      return;
    }

    const totalMinutes = Math.floor(remaining / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    deadlineStatus.textContent = "距離報名截止還有";
    countdown.textContent = `${days} 天 ${hours} 小時 ${minutes} 分`;
  }

  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  const menuToggle = document.querySelector("#menu-toggle");
  const siteNav = document.querySelector("#site-nav");
  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        siteNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const checkboxes = [...document.querySelectorAll("[data-check]")];
  const progress = document.querySelector("#check-progress");
  const checklistKey = "ai115-shimen-checklist-v1";

  function updateChecklist() {
    const completed = checkboxes.filter((item) => item.checked).length;
    if (progress) progress.textContent = `${completed} / ${checkboxes.length} 完成`;
  }

  try {
    const saved = JSON.parse(window.localStorage.getItem(checklistKey) || "{}");
    checkboxes.forEach((item) => {
      item.checked = saved[item.dataset.check] === true;
    });
  } catch {
    // 若瀏覽器禁止 localStorage，勾選功能仍可在本次瀏覽中使用。
  }

  checkboxes.forEach((item) => {
    item.addEventListener("change", () => {
      try {
        const state = Object.fromEntries(checkboxes.map((checkbox) => [checkbox.dataset.check, checkbox.checked]));
        window.localStorage.setItem(checklistKey, JSON.stringify(state));
      } catch {
        // 不影響畫面上的勾選。
      }
      updateChecklist();
    });
  });
  updateChecklist();

  const resetChecklist = document.querySelector("#reset-checklist");
  if (resetChecklist) {
    resetChecklist.addEventListener("click", () => {
      checkboxes.forEach((item) => { item.checked = false; });
      try { window.localStorage.removeItem(checklistKey); } catch { /* ignore */ }
      updateChecklist();
    });
  }

  const questions = [...document.querySelectorAll(".quiz-question")];
  const quizScore = document.querySelector("#quiz-score");
  const feedback = [
    { b: "答對！正式賽要求監督式學習。" },
    { c: "答對！正式賽指定在遊戲設定選「地圖：12」。" },
    { a: "答對！固定的 Python 檔名是 ml_play.py。" },
    { b: "答對！預存模型不能帶入正式比賽。" },
  ];

  function updateQuizScore() {
    const correct = questions.filter((question) => question.classList.contains("is-correct")).length;
    if (quizScore) quizScore.textContent = `${correct} / ${questions.length}`;
  }

  questions.forEach((question) => {
    const answer = question.dataset.correct;
    const questionIndex = questions.indexOf(question);
    const feedbackBox = question.querySelector(".quiz-feedback");
    question.querySelectorAll("[data-answer]").forEach((button) => {
      button.addEventListener("click", () => {
        question.querySelectorAll("[data-answer]").forEach((item) => item.removeAttribute("data-selected"));
        button.setAttribute("data-selected", "true");
        const correct = button.dataset.answer === answer;
        question.classList.toggle("is-correct", correct);
        question.classList.toggle("is-wrong", !correct);
        if (feedbackBox) {
          feedbackBox.textContent = correct ? feedback[questionIndex][answer] : "再想一下：提示就在題目與規則紅線裡。";
        }
        updateQuizScore();
      });
    });
  });
  updateQuizScore();

  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
  if ("IntersectionObserver" in window && sections.length && navLinks.length) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`));
    }, { rootMargin: "-30% 0px -55% 0px", threshold: [0, .2, .6] });
    sections.forEach((section) => observer.observe(section));
  }
})();

// PWA 更新提示：純靜態 GitHub Pages 站點採 prompt-to-refresh，不打斷學生正在閱讀的內容。
(() => {
  "use strict";

  if (!("serviceWorker" in navigator)) return;

  const toast = document.querySelector("#sw-update-toast");
  const updateNow = document.querySelector("#sw-update-now");
  const updateLater = document.querySelector("#sw-update-later");
  if (!toast || !updateNow || !updateLater) return;

  let registration = null;
  let latestVersion = null;
  let isApplying = false;

  function getNoticeKey(version) {
    return `ai115-sw-noticed-${version || "new"}`;
  }

  function wasAlreadyNoticed(version) {
    try { return window.sessionStorage.getItem(getNoticeKey(version)) === "1"; } catch { return false; }
  }

  function rememberNotice(version) {
    try { window.sessionStorage.setItem(getNoticeKey(version), "1"); } catch { /* ignore */ }
  }

  function showUpdateToast(version = null) {
    if (isApplying || wasAlreadyNoticed(version)) return;
    latestVersion = version || latestVersion || "new";
    toast.hidden = false;
    updateNow.disabled = false;
    updateNow.textContent = "立刻更新";
  }

  function hideUpdateToast(remember = true) {
    if (remember) rememberNotice(latestVersion);
    toast.hidden = true;
  }

  async function applyUpdate() {
    if (isApplying) return;
    isApplying = true;
    updateNow.disabled = true;
    updateNow.textContent = "更新中…";
    hideUpdateToast(false);

    try {
      const activeRegistration = registration || await navigator.serviceWorker.getRegistration("./sw.js");
      registration = activeRegistration || registration;
      // 一定在按鈕點擊當下重新取得 waiting，避免兩條偵測路徑互相使用過期 worker。
      if (registration && !registration.waiting) await registration.update();
      const waitingWorker = registration?.waiting;

      if (waitingWorker) {
        let hasReloaded = false;
        const reloadAfterControllerChange = () => {
          if (hasReloaded) return;
          hasReloaded = true;
          window.location.reload();
        };
        navigator.serviceWorker.addEventListener("controllerchange", reloadAfterControllerChange, { once: true });
        waitingWorker.postMessage({ type: "SKIP_WAITING" });
        // 若瀏覽器沒有送出 controllerchange，仍保留一次安全的保底重整。
        window.setTimeout(reloadAfterControllerChange, 4000);
        return;
      }

      // 極少數 CDN 延遲情境沒有 waiting worker，重整後由 network-first HTML 再取得最新頁面。
      window.location.reload();
    } catch {
      isApplying = false;
      updateNow.disabled = false;
      updateNow.textContent = "再試一次";
      toast.hidden = false;
    }
  }

  updateNow.addEventListener("click", applyUpdate);
  updateLater.addEventListener("click", () => hideUpdateToast(true));

  function watchInstallingWorker(worker) {
    worker?.addEventListener("statechange", () => {
      if (worker.state === "installed" && navigator.serviceWorker.controller) {
        showUpdateToast();
      }
    });
  }

  async function checkVersionFile() {
    try {
      const response = await fetch(`./version.json?t=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      if (data?.version && data.version !== APP_VERSION) {
        latestVersion = data.version;
        if (registration) await registration.update().catch(() => undefined);
        showUpdateToast(data.version);
      }
    } catch {
      // 離線時不打擾使用者；下次 focus、online 或輪詢會再檢查。
    }
  }

  const swUrl = new URL("sw.js", document.baseURI);
  swUrl.searchParams.set("v", APP_VERSION);
  navigator.serviceWorker.register(swUrl, { updateViaCache: "none" })
    .then((nextRegistration) => {
      registration = nextRegistration;
      // 新版若已在 waiting，重新開頁也要顯示提示，不能只依賴 updatefound。
      if (registration.waiting && navigator.serviceWorker.controller) showUpdateToast();
      if (registration.installing) watchInstallingWorker(registration.installing);
      registration.addEventListener("updatefound", () => watchInstallingWorker(registration.installing));
      window.setInterval(() => registration?.update().catch(() => undefined), 60_000);
    })
    .catch(() => undefined);

  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "SW_ACTIVATED" && navigator.serviceWorker.controller && event.data.version !== APP_VERSION) {
      showUpdateToast(event.data.version);
    }
  });

  ["focus", "online"].forEach((eventName) => window.addEventListener(eventName, checkVersionFile));
  window.addEventListener("pageshow", (event) => { if (event.persisted) checkVersionFile(); });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") checkVersionFile();
  });
  window.setTimeout(checkVersionFile, 5_000);
  window.setInterval(checkVersionFile, 180_000);
})();
