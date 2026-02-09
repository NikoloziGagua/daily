(function () {
  "use strict";

  const STORAGE_KEY = "daily_compass_state_v1";
  const CONTEXTS = ["Home", "Work", "Errands"];
  const SUCCESS_THRESHOLD = 0.7;
  const REMINDER_FALLBACK_TIME = "09:00";
  const RECAP_REASON_SUGGESTIONS = [
    "Unexpected urgent work",
    "Underestimated effort",
    "Low energy window",
    "Waiting on someone else",
    "Changed priorities",
  ];

  const app = {
    state: null,
    activePage: "dashboard",
    plannerDateKey: "",
    selectedFilter: "All",
    notesQuery: "",
    notesSort: "recent",
    editingNoteId: "",
    reminderTimer: null,
    toastTimer: null,
    voiceListening: false,
    drawerOpen: false,
    quickPanelOpen: false,
    dropdownOpen: false,
  };

  const el = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheElements();
    app.state = loadState();
    if (!Array.isArray(app.state.notes)) {
      app.state.notes = [];
    }
    runDailyRollover();
    ensureToday();
    app.plannerDateKey = todayKey();
    ensureDay(app.plannerDateKey);
    app.notesSort = el.notesSortSelect?.value || "recent";
    setQuickPlannerDateInput(todayKey());
    bindEvents();
    hydrateReminderDefaults();
    renderAll();
    setupReminderLoop();
    setupPwa();
    updateInstallCard();
    saveState();
  }

  function cacheElements() {
    el.topNav = document.getElementById("topNav");
    el.drawerNav = document.getElementById("drawerNav");
    el.menuDrawerBtn = document.getElementById("menuDrawerBtn");
    el.closeDrawerBtn = document.getElementById("closeDrawerBtn");
    el.navDrawer = document.getElementById("navDrawer");
    el.quickPanel = document.getElementById("quickPanel");
    el.quickPanelBtn = document.getElementById("quickPanelBtn");
    el.closeQuickPanelBtn = document.getElementById("closeQuickPanelBtn");
    el.overlay = document.getElementById("overlay");
    el.quickDropdown = document.getElementById("quickDropdown");
    el.dropdownToggleBtn = document.getElementById("dropdownToggleBtn");
    el.dropdownMenu = document.getElementById("dropdownMenu");
    el.quickTaskForm = document.getElementById("quickTaskForm");
    el.quickTaskInput = document.getElementById("quickTaskInput");
    el.quickTaskContext = document.getElementById("quickTaskContext");
    el.quickTaskMinutes = document.getElementById("quickTaskMinutes");
    el.quickTaskMustDo = document.getElementById("quickTaskMustDo");
    el.quickPlannerDateInput = document.getElementById("quickPlannerDateInput");
    el.quickPlannerOpenBtn = document.getElementById("quickPlannerOpenBtn");
    el.heroCard = document.getElementById("heroCard");
    el.todayHeading = document.getElementById("todayHeading");
    el.dateLabel = document.getElementById("dateLabel");
    el.manualRolloverBtn = document.getElementById("manualRolloverBtn");
    el.plannerNavCard = document.getElementById("plannerNavCard");
    el.weekDayNav = document.getElementById("weekDayNav");
    el.plannerRangeLabel = document.getElementById("plannerRangeLabel");
    el.plannerDayLabel = document.getElementById("plannerDayLabel");
    el.prevWeekBtn = document.getElementById("prevWeekBtn");
    el.nextWeekBtn = document.getElementById("nextWeekBtn");
    el.kickoffCard = document.getElementById("kickoffCard");
    el.kickoffInput = document.getElementById("kickoffInput");
    el.saveKickoffBtn = document.getElementById("saveKickoffBtn");
    el.metricsGrid = document.getElementById("metricsGrid");
    el.streakValue = document.getElementById("streakValue");
    el.consistencyValue = document.getElementById("consistencyValue");
    el.todayDoneValue = document.getElementById("todayDoneValue");
    el.addTaskHeading = document.getElementById("addTaskHeading");
    el.addTaskCard = document.getElementById("addTaskCard");
    el.taskListHeading = document.getElementById("taskListHeading");
    el.taskForm = document.getElementById("taskForm");
    el.taskInput = document.getElementById("taskInput");
    el.contextSelect = document.getElementById("contextSelect");
    el.minutesInput = document.getElementById("minutesInput");
    el.mustDoInput = document.getElementById("mustDoInput");
    el.voiceBtn = document.getElementById("voiceBtn");
    el.voiceStatus = document.getElementById("voiceStatus");
    el.filterChips = document.getElementById("filterChips");
    el.taskList = document.getElementById("taskList");
    el.tasksCard = document.getElementById("tasksCard");
    el.emptyTasks = document.getElementById("emptyTasks");
    el.taskTemplate = document.getElementById("taskItemTemplate");
    el.reminderCard = document.getElementById("reminderCard");
    el.reminderToggle = document.getElementById("reminderToggle");
    el.routineInsight = document.getElementById("routineInsight");
    el.reminderTimeInput = document.getElementById("reminderTimeInput");
    el.saveReminderBtn = document.getElementById("saveReminderBtn");
    el.reminderStatus = document.getElementById("reminderStatus");
    el.recapCard = document.getElementById("recapCard");
    el.recapSummary = document.getElementById("recapSummary");
    el.delayReasonsWrap = document.getElementById("delayReasonsWrap");
    el.recapInput = document.getElementById("recapInput");
    el.saveRecapBtn = document.getElementById("saveRecapBtn");
    el.weeklyCard = document.getElementById("weeklyCard");
    el.weeklyReview = document.getElementById("weeklyReview");
    el.notesToolbarCard = document.getElementById("notesToolbarCard");
    el.notesEditorCard = document.getElementById("notesEditorCard");
    el.notesListCard = document.getElementById("notesListCard");
    el.noteForm = document.getElementById("noteForm");
    el.noteTitleInput = document.getElementById("noteTitleInput");
    el.noteBodyInput = document.getElementById("noteBodyInput");
    el.notePinInput = document.getElementById("notePinInput");
    el.saveNoteBtn = document.getElementById("saveNoteBtn");
    el.notesSearchInput = document.getElementById("notesSearchInput");
    el.notesSortSelect = document.getElementById("notesSortSelect");
    el.notesList = document.getElementById("notesList");
    el.emptyNotes = document.getElementById("emptyNotes");
    el.noteTemplate = document.getElementById("noteItemTemplate");
    el.installCard = document.getElementById("installCard");
    el.toast = document.getElementById("toast");
  }

  function bindEvents() {
    bindPageNavigation(el.topNav);
    bindPageNavigation(el.drawerNav);

    el.menuDrawerBtn.addEventListener("click", openDrawer);
    el.closeDrawerBtn.addEventListener("click", closeDrawer);
    el.quickPanelBtn.addEventListener("click", openQuickPanel);
    el.closeQuickPanelBtn.addEventListener("click", closeQuickPanel);
    el.overlay.addEventListener("click", closePanelsAndMenus);

    el.dropdownToggleBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      toggleDropdown();
    });

    el.dropdownMenu.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-action]");
      if (!button) {
        return;
      }
      runDropdownAction(button.dataset.action);
    });

    document.addEventListener("click", function (event) {
      if (!app.dropdownOpen) {
        return;
      }
      if (el.quickDropdown.contains(event.target)) {
        return;
      }
      closeDropdown();
    });

    el.quickTaskForm.addEventListener("submit", function (event) {
      event.preventDefault();
      addTaskFromValues({
        text: el.quickTaskInput.value,
        context: el.quickTaskContext.value,
        minutes: el.quickTaskMinutes.value,
        mustDo: el.quickTaskMustDo.checked,
        source: "quick",
        dateKey: app.activePage === "planner" ? getPlannerDateKey() : todayKey(),
      });
      el.quickTaskInput.value = "";
      el.quickTaskMustDo.checked = false;
      closeQuickPanel();
      renderAll();
      showToast("Quick task added.");
    });

    el.quickPlannerOpenBtn.addEventListener("click", function () {
      const value = (el.quickPlannerDateInput.value || "").trim();
      if (!isValidDateKey(value)) {
        showToast("Select a valid date first.");
        return;
      }
      app.plannerDateKey = value;
      ensureDay(value);
      setActivePage("planner");
      closeQuickPanel();
      renderAll();
    });

    el.weekDayNav.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-day-key]");
      if (!button) {
        return;
      }
      const dateKeyValue = button.dataset.dayKey;
      if (!isValidDateKey(dateKeyValue)) {
        return;
      }
      app.plannerDateKey = dateKeyValue;
      ensureDay(app.plannerDateKey);
      renderAll();
    });

    el.prevWeekBtn.addEventListener("click", function () {
      app.plannerDateKey = shiftDateKey(getPlannerDateKey(), -7);
      ensureDay(app.plannerDateKey);
      renderAll();
    });

    el.nextWeekBtn.addEventListener("click", function () {
      app.plannerDateKey = shiftDateKey(getPlannerDateKey(), 7);
      ensureDay(app.plannerDateKey);
      renderAll();
    });

    el.saveKickoffBtn.addEventListener("click", saveKickoff);

    el.taskForm.addEventListener("submit", function (event) {
      event.preventDefault();
      addTaskFromInput("typed");
    });

    el.voiceBtn.addEventListener("click", startVoiceCapture);

    el.filterChips.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-filter]");
      if (!button) {
        return;
      }
      app.selectedFilter = button.dataset.filter;
      renderFilterChips();
      renderTasks();
    });

    el.taskList.addEventListener("change", function (event) {
      if (!event.target.classList.contains("task-check")) {
        return;
      }
      const taskId = event.target.closest(".task-item")?.dataset.taskId;
      if (!taskId) {
        return;
      }
      setTaskCompleted(taskId, event.target.checked);
    });

    el.taskList.addEventListener("click", function (event) {
      const item = event.target.closest(".task-item");
      if (!item) {
        return;
      }
      const taskId = item.dataset.taskId;
      if (!taskId) {
        return;
      }
      if (event.target.classList.contains("edit-btn")) {
        editTask(taskId);
      }
      if (event.target.classList.contains("delete-btn")) {
        deleteTask(taskId);
      }
    });

    el.saveRecapBtn.addEventListener("click", saveRecap);

    el.delayReasonsWrap.addEventListener("input", function (event) {
      const reasonInput = event.target.closest("input[data-delay-task]");
      if (!reasonInput) {
        return;
      }
      const day = getTodayDay();
      day.recap.delayReasons[reasonInput.dataset.delayTask] = reasonInput.value.trim();
      saveState();
    });

    el.reminderToggle.addEventListener("change", async function () {
      app.state.settings.remindersEnabled = el.reminderToggle.checked;
      if (app.state.settings.remindersEnabled) {
        const granted = await ensureNotificationPermission();
        if (!granted) {
          app.state.settings.remindersEnabled = false;
          el.reminderToggle.checked = false;
          setReminderStatus("Notification permission was not granted. In-app reminder only.");
        }
      }
      saveState();
      renderReminderCard();
      checkAndSendReminder();
    });

    el.saveReminderBtn.addEventListener("click", function () {
      const value = (el.reminderTimeInput.value || "").trim();
      if (!isValidTimeValue(value)) {
        showToast("Choose a valid reminder time.");
        return;
      }
      app.state.settings.reminderTime = value;
      app.state.settings.lastReminderSentDate = "";
      saveState();
      renderReminderCard();
      showToast("Reminder time updated.");
    });

    el.manualRolloverBtn.addEventListener("click", function () {
      const today = todayKey();
      const tomorrow = shiftDateKey(today, 1);
      const moved = copyPendingTasks(today, tomorrow);
      saveState();
      renderAll();
      if (moved > 0) {
        showToast("Moved " + moved + " pending task(s) to tomorrow.");
      } else {
        showToast("No pending tasks to roll over.");
      }
    });

    el.noteForm.addEventListener("submit", function (event) {
      event.preventDefault();
      saveNoteFromForm();
    });

    el.notesSearchInput.addEventListener("input", function () {
      app.notesQuery = el.notesSearchInput.value.trim().toLowerCase();
      renderNotes();
    });

    el.notesSortSelect.addEventListener("change", function () {
      app.notesSort = el.notesSortSelect.value;
      renderNotes();
    });

    el.notesList.addEventListener("click", function (event) {
      const item = event.target.closest(".note-item");
      if (!item) {
        return;
      }
      const noteId = item.dataset.noteId;
      if (!noteId) {
        return;
      }
      if (event.target.classList.contains("note-pin-btn")) {
        togglePinNote(noteId);
      } else if (event.target.classList.contains("note-edit-btn")) {
        loadNoteForEdit(noteId);
      } else if (event.target.classList.contains("note-delete-btn")) {
        deleteNote(noteId);
      }
    });
  }

  function bindPageNavigation(container) {
    if (!container) {
      return;
    }
    container.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-page]");
      if (!button) {
        return;
      }
      const page = String(button.dataset.page || "").trim();
      if (!page) {
        return;
      }
      setActivePage(page);
      closePanelsAndMenus();
      renderAll();
    });
  }

  function setActivePage(page) {
    const valid = ["dashboard", "planner", "notes"];
    const next = valid.includes(page) ? page : "dashboard";
    app.activePage = next;
    if (next === "planner") {
      ensureDay(getPlannerDateKey());
      setQuickPlannerDateInput(getPlannerDateKey());
    }
  }

  function runDropdownAction(action) {
    if (action === "open-quick-panel") {
      closeDropdown();
      openQuickPanel();
      return;
    }
    if (action === "rollover-now") {
      closeDropdown();
      const today = todayKey();
      const tomorrow = shiftDateKey(today, 1);
      const moved = copyPendingTasks(today, tomorrow);
      saveState();
      renderAll();
      showToast(moved > 0 ? "Moved " + moved + " pending task(s)." : "No pending tasks to roll over.");
      return;
    }
    if (action === "go-notes") {
      closeDropdown();
      setActivePage("notes");
      renderAll();
    }
  }

  function closePanelsAndMenus() {
    closeDrawer();
    closeQuickPanel();
    closeDropdown();
  }

  function openDrawer() {
    closeDropdown();
    closeQuickPanel();
    app.drawerOpen = true;
    el.navDrawer.classList.add("open");
    el.navDrawer.setAttribute("aria-hidden", "false");
    syncOverlay();
  }

  function closeDrawer() {
    app.drawerOpen = false;
    el.navDrawer.classList.remove("open");
    el.navDrawer.setAttribute("aria-hidden", "true");
    syncOverlay();
  }

  function openQuickPanel() {
    closeDropdown();
    closeDrawer();
    app.quickPanelOpen = true;
    el.quickPanel.classList.add("open");
    el.quickPanel.setAttribute("aria-hidden", "false");
    setQuickPlannerDateInput(app.activePage === "planner" ? getPlannerDateKey() : todayKey());
    syncOverlay();
  }

  function closeQuickPanel() {
    app.quickPanelOpen = false;
    el.quickPanel.classList.remove("open");
    el.quickPanel.setAttribute("aria-hidden", "true");
    syncOverlay();
  }

  function toggleDropdown() {
    if (app.dropdownOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }

  function openDropdown() {
    app.dropdownOpen = true;
    el.dropdownMenu.hidden = false;
    el.dropdownToggleBtn.setAttribute("aria-expanded", "true");
  }

  function closeDropdown() {
    app.dropdownOpen = false;
    el.dropdownMenu.hidden = true;
    el.dropdownToggleBtn.setAttribute("aria-expanded", "false");
  }

  function syncOverlay() {
    const show = app.drawerOpen || app.quickPanelOpen;
    el.overlay.hidden = !show;
    el.overlay.classList.toggle("show", show);
  }

  function setQuickPlannerDateInput(dateKeyValue) {
    if (!el.quickPlannerDateInput) {
      return;
    }
    if (!isValidDateKey(dateKeyValue)) {
      return;
    }
    el.quickPlannerDateInput.value = dateKeyValue;
  }

  function loadState() {
    const fallback = createDefaultState();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return fallback;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return fallback;
      }
      return {
        version: 1,
        days: parsed.days && typeof parsed.days === "object" ? parsed.days : {},
        notes: Array.isArray(parsed.notes) ? parsed.notes : [],
        settings: {
          lastOpenedDate: parsed.settings?.lastOpenedDate || null,
          remindersEnabled: Boolean(parsed.settings?.remindersEnabled),
          reminderTime: parsed.settings?.reminderTime || "",
          lastReminderSentDate: parsed.settings?.lastReminderSentDate || "",
          bestStreak: Number(parsed.settings?.bestStreak || 0),
        },
      };
    } catch (error) {
      return fallback;
    }
  }

  function createDefaultState() {
    return {
      version: 1,
      days: {},
      notes: [],
      settings: {
        lastOpenedDate: null,
        remindersEnabled: false,
        reminderTime: "",
        lastReminderSentDate: "",
        bestStreak: 0,
      },
    };
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(app.state));
    } catch (error) {
      showToast("Storage is full. Some updates may not save.");
    }
  }

  function ensureDay(dateKeyValue) {
    if (!app.state.days[dateKeyValue]) {
      app.state.days[dateKeyValue] = {
        kickoff: "",
        tasks: [],
        recap: {
          summary: "",
          delayReasons: {},
        },
        rolledForward: false,
      };
      return app.state.days[dateKeyValue];
    }

    const day = app.state.days[dateKeyValue];
    if (!Array.isArray(day.tasks)) {
      day.tasks = [];
    }
    if (!day.recap || typeof day.recap !== "object") {
      day.recap = { summary: "", delayReasons: {} };
    }
    if (!day.recap.delayReasons || typeof day.recap.delayReasons !== "object") {
      day.recap.delayReasons = {};
    }
    if (typeof day.kickoff !== "string") {
      day.kickoff = "";
    }
    if (typeof day.rolledForward !== "boolean") {
      day.rolledForward = false;
    }
    return day;
  }

  function ensureToday() {
    ensureDay(todayKey());
  }

  function getTodayDay() {
    return ensureDay(todayKey());
  }

  function getPlannerDateKey() {
    if (!isValidDateKey(app.plannerDateKey)) {
      app.plannerDateKey = todayKey();
    }
    return app.plannerDateKey;
  }

  function getActiveDateKey() {
    if (app.activePage === "planner") {
      return getPlannerDateKey();
    }
    return todayKey();
  }

  function getActiveDay() {
    return ensureDay(getActiveDateKey());
  }

  function runDailyRollover() {
    const today = todayKey();
    const lastOpen = app.state.settings.lastOpenedDate;

    if (!lastOpen || !isValidDateKey(lastOpen)) {
      app.state.settings.lastOpenedDate = today;
      ensureDay(today);
      return;
    }

    if (lastOpen >= today) {
      app.state.settings.lastOpenedDate = today;
      ensureDay(today);
      return;
    }

    let cursor = lastOpen;
    while (cursor < today) {
      const next = shiftDateKey(cursor, 1);
      ensureDay(cursor);
      ensureDay(next);
      const day = ensureDay(cursor);

      if (!day.rolledForward) {
        copyPendingTasks(cursor, next);
        day.rolledForward = true;
      }

      cursor = next;
    }

    app.state.settings.lastOpenedDate = today;
  }

  function copyPendingTasks(fromKey, toKey) {
    const fromDay = ensureDay(fromKey);
    const toDay = ensureDay(toKey);
    const existingCarryIds = new Set(
      toDay.tasks.map(function (task) {
        return task.carrySourceId || "";
      })
    );
    let moved = 0;

    fromDay.tasks
      .filter(function (task) {
        return !task.completed;
      })
      .forEach(function (task) {
        const carrySourceId = task.carrySourceId || task.id;
        if (existingCarryIds.has(carrySourceId)) {
          return;
        }
        toDay.tasks.push({
          id: uid(),
          text: task.text,
          context: CONTEXTS.includes(task.context) ? task.context : "Home",
          mustDo: Boolean(task.mustDo),
          minutes: normalizeMinutes(task.minutes),
          completed: false,
          createdAt: new Date().toISOString(),
          completedAt: "",
          rolledFrom: fromKey,
          carrySourceId: carrySourceId,
          source: "rollover",
        });
        existingCarryIds.add(carrySourceId);
        moved += 1;
      });

    return moved;
  }

  function saveKickoff() {
    const day = getTodayDay();
    day.kickoff = el.kickoffInput.value.trim();
    saveState();
    showToast("Kickoff saved.");
    renderHeader();
  }

  function addTaskFromInput(source) {
    const added = addTaskFromValues({
      text: el.taskInput.value,
      context: el.contextSelect.value,
      minutes: el.minutesInput.value,
      mustDo: el.mustDoInput.checked,
      source: source || "typed",
      dateKey: getActiveDateKey(),
    });
    if (!added) {
      return;
    }

    el.taskInput.value = "";
    if (source !== "voice") {
      el.mustDoInput.checked = false;
    }

    renderAll();
    showToast(source === "voice" ? "Voice task added." : "Task added.");
  }

  function addTaskFromValues(input) {
    const text = String(input.text || "").trim().replace(/\s+/g, " ");
    if (!text) {
      return false;
    }

    const dateKeyValue = isValidDateKey(input.dateKey) ? input.dateKey : getActiveDateKey();
    const day = ensureDay(dateKeyValue);
    const activeMustDos = day.tasks.filter(function (task) {
      return task.mustDo && !task.completed;
    }).length;

    if (input.mustDo && activeMustDos >= 3) {
      showToast("You already have 3 active must-do tasks.");
    }

    day.tasks.push({
      id: uid(),
      text: text,
      context: CONTEXTS.includes(input.context) ? input.context : "Home",
      mustDo: Boolean(input.mustDo),
      minutes: normalizeMinutes(input.minutes),
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: "",
      rolledFrom: "",
      carrySourceId: "",
      source: input.source || "typed",
    });

    saveState();
    return true;
  }

  function setTaskCompleted(taskId, completed) {
    const day = getActiveDay();
    const task = day.tasks.find(function (item) {
      return item.id === taskId;
    });
    if (!task) {
      return;
    }
    task.completed = Boolean(completed);
    task.completedAt = task.completed ? new Date().toISOString() : "";
    saveState();
    renderAll();
  }

  function editTask(taskId) {
    const day = getActiveDay();
    const task = day.tasks.find(function (item) {
      return item.id === taskId;
    });
    if (!task) {
      return;
    }
    const nextText = window.prompt("Edit task", task.text);
    if (nextText === null) {
      return;
    }
    const clean = nextText.trim().replace(/\s+/g, " ");
    if (!clean) {
      showToast("Task text cannot be empty.");
      return;
    }
    task.text = clean;
    saveState();
    renderAll();
  }

  function deleteTask(taskId) {
    const day = getActiveDay();
    const index = day.tasks.findIndex(function (item) {
      return item.id === taskId;
    });
    if (index < 0) {
      return;
    }
    day.tasks.splice(index, 1);
    delete day.recap.delayReasons[taskId];
    saveState();
    renderAll();
    showToast("Task deleted.");
  }

  function saveRecap() {
    const day = getTodayDay();
    day.recap.summary = el.recapInput.value.trim();
    saveState();
    showToast("Recap saved.");
  }

  function renderAll() {
    renderViewState();
    renderTopNavigation();
    renderHeader();
    renderPlannerNav();
    renderKickoff();
    renderFilterChips();
    renderMetrics();
    renderTasks();
    renderRecap();
    renderReminderCard();
    renderWeeklyReview();
    renderNotes();
    updateInstallCard();
  }

  function renderHeader() {
    if (app.activePage === "planner") {
      const key = getPlannerDateKey();
      const weekKeys = getWeekDateKeys(key);
      const selectedDate = fromDateKey(key);
      el.todayHeading.textContent = "Week planner for " + formatPlannerDay(selectedDate);
      el.dateLabel.textContent =
        "Week range: " + formatMonthDay(fromDateKey(weekKeys[0])) + " - " + formatMonthDay(fromDateKey(weekKeys[6]));
      return;
    }

    if (app.activePage === "notes") {
      el.todayHeading.textContent = "Notes vault";
      el.dateLabel.textContent = "Capture ideas, plans, and quick references.";
      return;
    }

    const now = new Date();
    const day = getTodayDay();
    const kickoffText = day.kickoff ? " Today: " + day.kickoff : "";
    el.todayHeading.textContent = "Your day, clearly focused." + kickoffText;
    el.dateLabel.textContent = formatReadableDate(now);
  }

  function renderKickoff() {
    el.kickoffInput.value = getTodayDay().kickoff || "";
  }

  function renderFilterChips() {
    const chips = Array.from(el.filterChips.querySelectorAll("button[data-filter]"));
    chips.forEach(function (button) {
      const active = button.dataset.filter === app.selectedFilter;
      button.classList.toggle("active", active);
    });
  }

  function renderViewState() {
    const isDashboard = app.activePage === "dashboard";
    const isPlanner = app.activePage === "planner";
    const isNotes = app.activePage === "notes";

    el.kickoffCard.hidden = !isDashboard;
    el.metricsGrid.hidden = !isDashboard;
    el.reminderCard.hidden = !isDashboard;
    el.recapCard.hidden = !isDashboard;
    el.manualRolloverBtn.hidden = isNotes;
    el.plannerNavCard.hidden = !isPlanner;
    el.weeklyCard.hidden = !isPlanner;
    el.addTaskCard.hidden = isNotes;
    el.tasksCard.hidden = isNotes;
    el.notesToolbarCard.hidden = !isNotes;
    el.notesEditorCard.hidden = !isNotes;
    el.notesListCard.hidden = !isNotes;
    el.installCard.hidden = !isDashboard;

    if (isDashboard || isNotes) {
      setQuickPlannerDateInput(todayKey());
    } else {
      setQuickPlannerDateInput(getPlannerDateKey());
    }
  }

  function renderTopNavigation() {
    const navButtons = Array.from(document.querySelectorAll("button[data-page]"));
    navButtons.forEach(function (button) {
      button.classList.toggle("active", button.dataset.page === app.activePage);
    });
  }

  function renderPlannerNav() {
    if (app.activePage !== "planner") {
      return;
    }

    const selectedKey = getPlannerDateKey();
    const weekKeys = getWeekDateKeys(selectedKey);
    if (!weekKeys.includes(selectedKey)) {
      app.plannerDateKey = weekKeys[0];
    }

    el.weekDayNav.innerHTML = "";
    weekKeys.forEach(function (key) {
      const date = fromDateKey(key);
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.dayKey = key;
      button.className = "chip week-day-tab" + (key === getPlannerDateKey() ? " active" : "");
      button.innerHTML =
        '<span class="day-main">' +
        date.toLocaleDateString(undefined, { weekday: "short" }) +
        "</span>" +
        '<span class="day-sub">' +
        formatMonthDay(date) +
        "</span>";
      el.weekDayNav.appendChild(button);
    });

    const selectedDay = ensureDay(getPlannerDateKey());
    const doneCount = selectedDay.tasks.filter(function (task) {
      return task.completed;
    }).length;
    el.plannerRangeLabel.textContent =
      "Week: " + formatMonthDay(fromDateKey(weekKeys[0])) + " - " + formatMonthDay(fromDateKey(weekKeys[6]));
    el.plannerDayLabel.textContent =
      "Planned: " + selectedDay.tasks.length + " tasks. Completed: " + doneCount + ".";
  }

  function renderMetrics() {
    const today = getTodayDay();
    const total = today.tasks.length;
    const completed = today.tasks.filter(function (task) {
      return task.completed;
    }).length;

    const streak = computeStreak();
    app.state.settings.bestStreak = Math.max(app.state.settings.bestStreak, streak);
    saveState();

    el.streakValue.textContent = streak + " day" + (streak === 1 ? "" : "s");
    el.consistencyValue.textContent = computeConsistencyScore() + "%";
    el.todayDoneValue.textContent = completed + " / " + total;
  }

  function renderTasks() {
    const tasks = getVisibleTasks();
    el.taskList.innerHTML = "";
    el.emptyTasks.style.display = tasks.length === 0 ? "block" : "none";
    if (app.activePage === "planner") {
      const selected = fromDateKey(getPlannerDateKey());
      const label = formatPlannerDay(selected);
      el.addTaskHeading.textContent = "Plan tasks for " + label;
      el.taskListHeading.textContent = "Tasks for " + label;
      el.taskInput.placeholder = "Add a task for " + label + "...";
      el.emptyTasks.textContent = "No tasks planned for this day yet.";
    } else {
      el.addTaskHeading.textContent = "Top priorities";
      el.taskListHeading.textContent = "Today list";
      el.taskInput.placeholder = "Most important thing to do...";
      el.emptyTasks.textContent = "No tasks yet. Add your first must-do above.";
    }

    tasks.forEach(function (task) {
      const fragment = el.taskTemplate.content.cloneNode(true);
      const item = fragment.querySelector(".task-item");
      const check = fragment.querySelector(".task-check");
      const text = fragment.querySelector(".task-text");
      const meta = fragment.querySelector(".task-meta");

      item.dataset.taskId = task.id;
      item.classList.toggle("done", task.completed);
      check.checked = Boolean(task.completed);
      text.textContent = task.text;

      if (task.mustDo) {
        meta.appendChild(buildPill("Must-do", "must"));
      }
      meta.appendChild(buildPill(task.context, "context"));
      meta.appendChild(buildPill(task.minutes + "m", "time"));
      if (task.rolledFrom) {
        meta.appendChild(buildPill("Rolled from " + shortDate(task.rolledFrom), "roll"));
      }

      el.taskList.appendChild(fragment);
    });
  }

  function getVisibleTasks() {
    const day = getActiveDay();
    const tasks = day.tasks.slice().sort(compareTasks);

    return tasks.filter(function (task) {
      if (app.selectedFilter === "All") {
        return true;
      }
      if (app.selectedFilter === "Must-Do") {
        return task.mustDo;
      }
      return task.context === app.selectedFilter;
    });
  }

  function compareTasks(a, b) {
    const byDone = Number(a.completed) - Number(b.completed);
    if (byDone !== 0) {
      return byDone;
    }
    const byPriority = Number(b.mustDo) - Number(a.mustDo);
    if (byPriority !== 0) {
      return byPriority;
    }
    return String(a.createdAt).localeCompare(String(b.createdAt));
  }

  function renderRecap() {
    const day = getTodayDay();
    const total = day.tasks.length;
    const completed = day.tasks.filter(function (task) {
      return task.completed;
    });
    const pending = day.tasks.filter(function (task) {
      return !task.completed;
    });
    el.recapSummary.textContent =
      "Completed " + completed.length + " of " + total + " tasks. Delayed: " + pending.length + ".";
    el.recapInput.value = day.recap.summary || "";

    if (pending.length === 0) {
      el.delayReasonsWrap.innerHTML = '<p class="hint">No delayed tasks today.</p>';
      return;
    }

    const root = document.createElement("div");
    root.className = "delay-reason-grid";
    pending.forEach(function (task) {
      const row = document.createElement("div");
      row.className = "delay-reason-row";

      const title = document.createElement("p");
      title.className = "delay-reason-title";
      title.textContent = task.text;
      row.appendChild(title);

      const input = document.createElement("input");
      input.type = "text";
      input.dataset.delayTask = task.id;
      input.maxLength = 120;
      input.placeholder = RECAP_REASON_SUGGESTIONS[Math.floor(Math.random() * RECAP_REASON_SUGGESTIONS.length)];
      input.value = day.recap.delayReasons[task.id] || "";
      row.appendChild(input);

      root.appendChild(row);
    });

    el.delayReasonsWrap.innerHTML = "";
    el.delayReasonsWrap.appendChild(root);
  }

  function renderReminderCard() {
    const suggestion = getRoutineSuggestion();
    const current = app.state.settings.reminderTime || suggestion.time || REMINDER_FALLBACK_TIME;
    el.reminderTimeInput.value = current;
    el.reminderToggle.checked = Boolean(app.state.settings.remindersEnabled);
    el.routineInsight.textContent = suggestion.message;

    if (!("Notification" in window)) {
      setReminderStatus("Notifications are unavailable in this browser. In-app reminders still work.");
      return;
    }

    if (!app.state.settings.remindersEnabled) {
      setReminderStatus("Reminder is off.");
      return;
    }

    if (Notification.permission === "granted") {
      setReminderStatus("Reminders enabled. Next nudge around " + current + ".");
      return;
    }

    if (Notification.permission === "denied") {
      setReminderStatus("Notification permission is blocked. Enable it in browser settings.");
      return;
    }

    setReminderStatus("Reminders enabled with in-app prompts until permission is granted.");
  }

  function setReminderStatus(message) {
    el.reminderStatus.textContent = message;
  }

  function renderWeeklyReview() {
    const analysis = buildWeeklyAnalysis();
    const maxContextMinutes = Math.max.apply(
      null,
      analysis.timeByContext.map(function (item) {
        return item.minutes;
      })
    );
    const maxDelay = Math.max.apply(
      null,
      analysis.delayByContext.map(function (item) {
        return item.count;
      })
    );

    let winsHtml = "";
    if (analysis.topWins.length === 0) {
      winsHtml = '<p class="hint">Complete must-do tasks this week to surface top wins.</p>';
    } else {
      winsHtml =
        "<ul>" +
        analysis.topWins
          .map(function (task) {
            return "<li>" + escapeHtml(task) + "</li>";
          })
          .join("") +
        "</ul>";
    }

    const timeBars = analysis.timeByContext
      .map(function (entry) {
        const width = maxContextMinutes ? Math.round((entry.minutes / maxContextMinutes) * 100) : 0;
        return (
          '<div class="bar-row">' +
          "<span>" +
          entry.context +
          "</span>" +
          '<div class="bar-track"><div class="bar-fill" style="width:' +
          width +
          '%"></div></div>' +
          "<strong>" +
          entry.minutes +
          "m</strong>" +
          "</div>"
        );
      })
      .join("");

    const delayBars = analysis.delayByContext
      .map(function (entry) {
        const width = maxDelay ? Math.round((entry.count / maxDelay) * 100) : 0;
        return (
          '<div class="bar-row">' +
          "<span>" +
          entry.context +
          "</span>" +
          '<div class="bar-track"><div class="bar-fill" style="width:' +
          width +
          '%"></div></div>' +
          "<strong>" +
          entry.count +
          "</strong>" +
          "</div>"
        );
      })
      .join("");

    const frequentReason = analysis.topDelayReason || "No clear delay pattern yet";

    el.weeklyReview.innerHTML =
      '<div class="weekly-wrap">' +
      '<div class="weekly-grid">' +
      '<article class="mini-card"><p>Tasks completed</p><strong>' +
      analysis.totalCompleted +
      "</strong></article>" +
      '<article class="mini-card"><p>Must-do completion</p><strong>' +
      analysis.mustCompletionRate +
      "%</strong></article>" +
      '<article class="mini-card"><p>Best streak</p><strong>' +
      app.state.settings.bestStreak +
      " days</strong></article>" +
      "</div>" +
      '<article class="mini-card"><p>Top wins</p>' +
      winsHtml +
      "</article>" +
      '<article class="mini-card"><p>Time usage by context</p><div class="bar-chart">' +
      timeBars +
      "</div></article>" +
      '<article class="mini-card"><p>Missed patterns by context</p><div class="bar-chart">' +
      delayBars +
      "</div></article>" +
      '<article class="mini-card"><p>Common delay reason</p><strong>' +
      escapeHtml(frequentReason) +
      "</strong></article>" +
      "</div>";
  }

  function renderNotes() {
    if (!el.notesList) {
      return;
    }
    const notes = getFilteredSortedNotes();
    el.notesList.innerHTML = "";
    el.emptyNotes.style.display = notes.length ? "none" : "block";

    notes.forEach(function (note) {
      const fragment = el.noteTemplate.content.cloneNode(true);
      const item = fragment.querySelector(".note-item");
      const title = fragment.querySelector(".note-title");
      const body = fragment.querySelector(".note-body");
      const meta = fragment.querySelector(".note-meta");
      const pinBtn = fragment.querySelector(".note-pin-btn");

      item.dataset.noteId = note.id;
      item.classList.toggle("pinned", Boolean(note.pinned));
      title.textContent = note.title;
      body.textContent = note.body;
      meta.textContent =
        (note.pinned ? "Pinned · " : "") +
        "Updated " +
        formatReadableDateTime(note.updatedAt) +
        " · " +
        note.body.length +
        " chars";
      pinBtn.textContent = note.pinned ? "Unpin" : "Pin";

      el.notesList.appendChild(fragment);
    });
  }

  function getFilteredSortedNotes() {
    const query = String(app.notesQuery || "").trim().toLowerCase();
    let list = app.state.notes.slice();

    if (query) {
      list = list.filter(function (note) {
        const haystack = (note.title + " " + note.body).toLowerCase();
        return haystack.includes(query);
      });
    }

    list.sort(function (a, b) {
      if (app.notesSort === "title") {
        return a.title.localeCompare(b.title);
      }
      if (app.notesSort === "pinned") {
        const pinDiff = Number(Boolean(b.pinned)) - Number(Boolean(a.pinned));
        if (pinDiff !== 0) {
          return pinDiff;
        }
      }
      return String(b.updatedAt).localeCompare(String(a.updatedAt));
    });

    return list;
  }

  function saveNoteFromForm() {
    const title = String(el.noteTitleInput.value || "").trim().replace(/\s+/g, " ");
    const body = String(el.noteBodyInput.value || "").trim();
    const pinned = Boolean(el.notePinInput.checked);

    if (!title) {
      showToast("Note title is required.");
      return;
    }

    if (app.editingNoteId) {
      const existing = app.state.notes.find(function (note) {
        return note.id === app.editingNoteId;
      });
      if (existing) {
        existing.title = title;
        existing.body = body;
        existing.pinned = pinned;
        existing.updatedAt = new Date().toISOString();
      }
      showToast("Note updated.");
    } else {
      app.state.notes.push({
        id: uid(),
        title: title,
        body: body,
        pinned: pinned,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      showToast("Note saved.");
    }

    clearNoteForm();
    saveState();
    renderNotes();
  }

  function loadNoteForEdit(noteId) {
    const note = app.state.notes.find(function (item) {
      return item.id === noteId;
    });
    if (!note) {
      return;
    }
    app.editingNoteId = note.id;
    el.noteTitleInput.value = note.title;
    el.noteBodyInput.value = note.body;
    el.notePinInput.checked = Boolean(note.pinned);
    el.saveNoteBtn.textContent = "Update note";
    showToast("Editing note.");
  }

  function deleteNote(noteId) {
    const index = app.state.notes.findIndex(function (note) {
      return note.id === noteId;
    });
    if (index < 0) {
      return;
    }
    app.state.notes.splice(index, 1);
    if (app.editingNoteId === noteId) {
      clearNoteForm();
    }
    saveState();
    renderNotes();
    showToast("Note deleted.");
  }

  function togglePinNote(noteId) {
    const note = app.state.notes.find(function (item) {
      return item.id === noteId;
    });
    if (!note) {
      return;
    }
    note.pinned = !note.pinned;
    note.updatedAt = new Date().toISOString();
    saveState();
    renderNotes();
  }

  function clearNoteForm() {
    app.editingNoteId = "";
    el.noteTitleInput.value = "";
    el.noteBodyInput.value = "";
    el.notePinInput.checked = false;
    el.saveNoteBtn.textContent = "Save note";
  }

  function buildWeeklyAnalysis() {
    const keys = lastNDates(7);
    let totalCompleted = 0;
    let totalMust = 0;
    let completedMust = 0;
    const topWins = [];
    const delayReasonCount = {};
    const timeByContext = {
      Home: 0,
      Work: 0,
      Errands: 0,
    };
    const delayByContext = {
      Home: 0,
      Work: 0,
      Errands: 0,
    };

    keys.forEach(function (key) {
      const day = ensureDay(key);
      day.tasks.forEach(function (task) {
        if (task.completed) {
          totalCompleted += 1;
          timeByContext[task.context] += normalizeMinutes(task.minutes);
        } else {
          delayByContext[task.context] += 1;
        }
        if (task.mustDo) {
          totalMust += 1;
          if (task.completed) {
            completedMust += 1;
            if (topWins.length < 5) {
              topWins.push(task.text);
            }
          }
        }
      });

      Object.keys(day.recap.delayReasons).forEach(function (taskId) {
        const reason = String(day.recap.delayReasons[taskId] || "").trim().toLowerCase();
        if (!reason) {
          return;
        }
        delayReasonCount[reason] = (delayReasonCount[reason] || 0) + 1;
      });
    });

    const mustCompletionRate = totalMust ? Math.round((completedMust / totalMust) * 100) : 0;
    const topDelayReason =
      Object.entries(delayReasonCount).sort(function (a, b) {
        return b[1] - a[1];
      })[0]?.[0] || "";

    return {
      totalCompleted: totalCompleted,
      mustCompletionRate: mustCompletionRate,
      topWins: topWins,
      topDelayReason: topDelayReason,
      timeByContext: CONTEXTS.map(function (context) {
        return { context: context, minutes: timeByContext[context] || 0 };
      }),
      delayByContext: CONTEXTS.map(function (context) {
        return { context: context, count: delayByContext[context] || 0 };
      }),
    };
  }

  function computeStreak() {
    let streak = 0;
    let date = new Date();
    let key = todayKey(date);

    if (!hasTasks(key) || !isSuccessfulDay(key)) {
      date = fromDateKey(shiftDateKey(key, -1));
      key = todayKey(date);
    }

    while (hasTasks(key) && isSuccessfulDay(key)) {
      streak += 1;
      date.setDate(date.getDate() - 1);
      key = todayKey(date);
    }

    return streak;
  }

  function hasTasks(dateKeyValue) {
    const day = ensureDay(dateKeyValue);
    return day.tasks.length > 0;
  }

  function isSuccessfulDay(dateKeyValue) {
    const day = ensureDay(dateKeyValue);
    if (day.tasks.length === 0) {
      return false;
    }
    const mustTasks = day.tasks.filter(function (task) {
      return task.mustDo;
    });
    if (mustTasks.length > 0) {
      return mustTasks.every(function (task) {
        return task.completed;
      });
    }
    const completed = day.tasks.filter(function (task) {
      return task.completed;
    }).length;
    return completed / day.tasks.length >= SUCCESS_THRESHOLD;
  }

  function computeConsistencyScore() {
    const dates = lastNDates(14);
    let total = 0;
    let completed = 0;
    dates.forEach(function (key) {
      const day = ensureDay(key);
      total += day.tasks.length;
      completed += day.tasks.filter(function (task) {
        return task.completed;
      }).length;
    });
    if (!total) {
      return 0;
    }
    return Math.round((completed / total) * 100);
  }

  function hydrateReminderDefaults() {
    if (!app.state.settings.reminderTime) {
      app.state.settings.reminderTime = getRoutineSuggestion().time || REMINDER_FALLBACK_TIME;
    }
  }

  function getRoutineSuggestion() {
    const dates = lastNDates(21);
    const completionMinutes = [];

    dates.forEach(function (key) {
      const day = ensureDay(key);
      day.tasks.forEach(function (task) {
        if (task.completedAt) {
          const date = new Date(task.completedAt);
          if (!Number.isNaN(date.getTime())) {
            completionMinutes.push(date.getHours() * 60 + date.getMinutes());
          }
        }
      });
    });

    if (completionMinutes.length === 0) {
      return {
        time: REMINDER_FALLBACK_TIME,
        message: "No routine history yet. A morning reminder at 09:00 is a good start.",
      };
    }

    completionMinutes.sort(function (a, b) {
      return a - b;
    });
    const medianIndex = Math.floor(completionMinutes.length / 2);
    const median = completionMinutes[medianIndex];
    const reminderMinute = Math.max(420, median - 45);
    const reminderTime = toTimeValue(reminderMinute);

    return {
      time: reminderTime,
      message:
        "You usually finish tasks around " +
        toTimeValue(median) +
        ". Reminder set a little earlier for a gentle nudge.",
    };
  }

  async function ensureNotificationPermission() {
    if (!("Notification" in window)) {
      return false;
    }
    if (Notification.permission === "granted") {
      return true;
    }
    if (Notification.permission === "denied") {
      return false;
    }
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  function setupReminderLoop() {
    if (app.reminderTimer) {
      clearInterval(app.reminderTimer);
    }
    app.reminderTimer = window.setInterval(checkAndSendReminder, 60 * 1000);
    checkAndSendReminder();
  }

  function checkAndSendReminder() {
    const settings = app.state.settings;
    if (!settings.remindersEnabled) {
      return;
    }

    const targetTime = settings.reminderTime || REMINDER_FALLBACK_TIME;
    if (!isValidTimeValue(targetTime)) {
      return;
    }

    const now = new Date();
    const today = todayKey(now);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const targetMinutes = parseTimeValue(targetTime);

    if (currentMinutes < targetMinutes) {
      return;
    }
    if (settings.lastReminderSentDate === today) {
      return;
    }

    const day = getTodayDay();
    const pending = day.tasks.filter(function (task) {
      return !task.completed;
    });
    if (pending.length === 0) {
      settings.lastReminderSentDate = today;
      saveState();
      return;
    }

    const mustPending = pending.filter(function (task) {
      return task.mustDo;
    }).length;

    const body =
      mustPending > 0
        ? mustPending +
          " must-do task" +
          (mustPending === 1 ? "" : "s") +
          " still open. A 15-minute sprint can close one."
        : pending.length +
          " task" +
          (pending.length === 1 ? "" : "s") +
          " still pending. A quick check-in now will help.";

    notify(body);
    settings.lastReminderSentDate = today;
    saveState();
  }

  function notify(message) {
    showToast(message);
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }
    try {
      new Notification("Daily Compass", {
        body: message,
        icon: "./icons/icon-192.png",
        badge: "./icons/icon-192.png",
      });
    } catch (error) {
      // Some browsers require app install for notifications; toast already handles fallback.
    }
  }

  function startVoiceCapture() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      el.voiceStatus.textContent = "Voice capture is not supported on this browser.";
      showToast("Voice capture not available here.");
      return;
    }
    if (app.voiceListening) {
      return;
    }

    const recognizer = new SpeechRecognition();
    recognizer.lang = "en-US";
    recognizer.interimResults = false;
    recognizer.maxAlternatives = 1;

    recognizer.onstart = function () {
      app.voiceListening = true;
      el.voiceStatus.textContent = "Listening...";
    };

    recognizer.onresult = function (event) {
      const transcript = String(event.results?.[0]?.[0]?.transcript || "").trim();
      if (!transcript) {
        return;
      }
      el.taskInput.value = transcript;
      addTaskFromInput("voice");
    };

    recognizer.onerror = function () {
      el.voiceStatus.textContent = "Voice capture error. Try again.";
    };

    recognizer.onend = function () {
      app.voiceListening = false;
      el.voiceStatus.textContent = "Tap voice capture and speak your task.";
    };

    try {
      recognizer.start();
    } catch (error) {
      app.voiceListening = false;
      el.voiceStatus.textContent = "Unable to start voice capture.";
    }
  }

  function updateInstallCard() {
    const ua = navigator.userAgent || "";
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;

    if (!isIOS || standalone) {
      el.installCard.style.display = "none";
    } else {
      el.installCard.style.display = "grid";
    }
  }

  function setupPwa() {
    if (!("serviceWorker" in navigator)) {
      return;
    }
    navigator.serviceWorker.register("./sw.js").catch(function () {
      // Non-blocking registration failure.
    });
  }

  function showToast(message) {
    el.toast.textContent = message;
    el.toast.classList.add("show");
    if (app.toastTimer) {
      clearTimeout(app.toastTimer);
    }
    app.toastTimer = setTimeout(function () {
      el.toast.classList.remove("show");
    }, 2200);
  }

  function lastNDates(count) {
    const keys = [];
    const cursor = new Date();
    for (let i = 0; i < count; i += 1) {
      keys.unshift(todayKey(cursor));
      cursor.setDate(cursor.getDate() - 1);
    }
    return keys;
  }

  function buildPill(text, className) {
    const span = document.createElement("span");
    span.className = "pill " + className;
    span.textContent = text;
    return span;
  }

  function uid() {
    return "t_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function normalizeMinutes(input) {
    const value = Number(input);
    if (!Number.isFinite(value)) {
      return 25;
    }
    return Math.min(300, Math.max(5, Math.round(value)));
  }

  function todayKey(dateObj) {
    const date = dateObj || new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  }

  function fromDateKey(key) {
    const parts = String(key).split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
  }

  function shiftDateKey(key, days) {
    const date = fromDateKey(key);
    date.setDate(date.getDate() + days);
    return todayKey(date);
  }

  function isValidDateKey(key) {
    return /^\d{4}-\d{2}-\d{2}$/.test(String(key));
  }

  function formatReadableDate(dateObj) {
    return dateObj.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatReadableDateTime(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) {
      return "unknown time";
    }
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function shortDate(key) {
    const date = fromDateKey(key);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function getWeekDateKeys(anchorKey) {
    const date = fromDateKey(anchorKey);
    const mondayOffset = (date.getDay() + 6) % 7;
    date.setDate(date.getDate() - mondayOffset);
    const keys = [];
    for (let i = 0; i < 7; i += 1) {
      keys.push(todayKey(date));
      date.setDate(date.getDate() + 1);
    }
    return keys;
  }

  function formatMonthDay(date) {
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function formatPlannerDay(date) {
    return date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
  }

  function toTimeValue(minutes) {
    const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
    const hh = String(Math.floor(normalized / 60)).padStart(2, "0");
    const mm = String(normalized % 60).padStart(2, "0");
    return hh + ":" + mm;
  }

  function parseTimeValue(value) {
    const match = /^(\d{2}):(\d{2})$/.exec(String(value));
    if (!match) {
      return 0;
    }
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    return hours * 60 + minutes;
  }

  function isValidTimeValue(value) {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value));
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
