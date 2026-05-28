const taskForm = document.querySelector("#taskForm");
const taskList = document.querySelector("#taskList");
const taskCount = document.querySelector("#taskCount");
const summaryPill = document.querySelector("#summaryPill");
const scheduleButton = document.querySelector("#scheduleButton");
const scheduleList = document.querySelector("#scheduleList");
const scheduleMeta = document.querySelector("#scheduleMeta");
const warning = document.querySelector("#warning");
const benchmarkButton = document.querySelector("#benchmarkButton");
const benchmarkSize = document.querySelector("#benchmarkSize");
const benchmarkResult = document.querySelector("#benchmarkResult");
const targetDate = document.querySelector("#targetDate");
const startTime = document.querySelector("#startTime");
const availableHours = document.querySelector("#availableHours");
const algorithm = document.querySelector("#algorithm");
const statsGrid = document.querySelector("#statsGrid");

let currentTasks = [];

const labels = {
  high: "高",
  medium: "中",
  low: "低",
};

const statusLabels = {
  overdue: "已逾期",
  today: "今天到期",
  upcoming: "未到期",
  completed: "已完成",
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }

  return data;
}

async function refreshAll() {
  await loadTasks();
  await loadStats();
}

async function loadTasks() {
  currentTasks = await api("/api/tasks");
  renderTasks(currentTasks);
  return currentTasks;
}

async function loadStats() {
  const stats = await api(`/api/stats?target_date=${targetDate.value}`);
  renderStats(stats);
  return stats;
}

function renderStats(stats) {
  const errorText =
    stats.average_estimate_error === null ? "尚無資料" : `${stats.average_estimate_error} 小時`;
  statsGrid.innerHTML = `
    <article class="stat-card">
      <span>完成率</span>
      <strong>${stats.completion_rate}%</strong>
      <small>${stats.completed} / ${stats.total} 個任務</small>
    </article>
    <article class="stat-card">
      <span>待辦壓力</span>
      <strong>${stats.pending}</strong>
      <small>逾期 ${stats.overdue} · 今天到期 ${stats.due_today}</small>
    </article>
    <article class="stat-card">
      <span>本週完成</span>
      <strong>${stats.weekly_completed}</strong>
      <small>自 ${stats.week_start} 起算</small>
    </article>
    <article class="stat-card">
      <span>估時誤差</span>
      <strong>${errorText}</strong>
      <small>完成時填入實際時數後計算</small>
    </article>
  `;
}

function renderTasks(tasks) {
  const pendingCount = tasks.filter((task) => !task.done).length;
  taskCount.textContent = `${tasks.length} 筆`;
  summaryPill.textContent = `${pendingCount} 個待排任務`;

  if (!tasks.length) {
    taskList.innerHTML = `<div class="empty-state">目前沒有任務</div>`;
    return;
  }

  taskList.innerHTML = tasks
    .map((task) => {
      const actualHours = task.actual_hours ?? "";
      const doneClass = task.done ? "done" : "";
      return `
        <article class="task-item ${doneClass}">
          <div>
            <div class="task-name">${escapeHtml(task.name)}</div>
            <div class="task-meta">
              Deadline ${task.deadline} · 預估 ${task.estimated_hours} 小時 ·
              <span class="priority ${task.priority}">${labels[task.priority] || "中"}</span>
            </div>
            <div class="actual-row">
              <label>
                實際時數
                <input class="actual-input" data-actual="${task.id}" type="number" min="0" step="0.5" value="${actualHours}" placeholder="完成後填" />
              </label>
            </div>
          </div>
          <div class="task-actions">
            <button class="complete-button" data-toggle="${task.id}">
              ${task.done ? "復原" : "完成"}
            </button>
            <button class="delete-button" data-delete="${task.id}">刪除</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderSchedule(result) {
  scheduleMeta.textContent = `${result.algorithm_meta.name} · ${result.algorithm_meta.complexity} · 已安排 ${result.used_hours} / ${result.available_hours} 小時`;

  if (result.has_conflict) {
    warning.textContent = `可用時間不足，尚有 ${result.overflow_hours} 小時任務無法排入今日。`;
    warning.classList.remove("hidden");
  } else {
    warning.classList.add("hidden");
  }

  if (!result.scheduled.length) {
    scheduleList.className = "schedule-list empty-state";
    scheduleList.textContent = "沒有可排入的任務";
    return;
  }

  scheduleList.className = "schedule-list";
  scheduleList.innerHTML = result.scheduled
    .map(
      (item) => `
        <article class="schedule-item status-${item.deadline_status}">
          <div class="time-block">${item.start}<br />${item.end}</div>
          <div>
            <div class="schedule-name">${escapeHtml(item.name)}</div>
            <div class="schedule-meta">
              Deadline ${item.deadline} · ${item.estimated_hours} 小時 · 優先 ${item.priority_label} · ${statusLabels[item.deadline_status]}
            </div>
          </div>
          <div class="score">Score ${item.score}</div>
        </article>
      `,
    )
    .join("");
}

function renderBenchmark(data) {
  const fastest = Math.min(...data.results.map((item) => item.average_ms));
  benchmarkResult.innerHTML = data.results
    .map((item) => {
      const width = Math.max((fastest / item.average_ms) * 100, 8);
      return `
        <article class="benchmark-card">
          <strong>${item.meta.name}</strong>
          <span>${item.meta.data_structure} · ${item.meta.complexity}</span>
          <div class="bar-track"><div class="bar-fill" style="width: ${width}%"></div></div>
          <span>平均：${item.average_ms} ms</span>
          <span>最快：${item.best_ms} ms · 最慢：${item.worst_ms} ms</span>
          <small>${item.meta.purpose}</small>
        </article>
      `;
    })
    .join("");
}

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(taskForm);
  await api("/api/tasks", {
    method: "POST",
    body: JSON.stringify(Object.fromEntries(form.entries())),
  });
  taskForm.reset();
  taskForm.elements.deadline.value = today();
  taskForm.elements.estimated_hours.value = 1;
  taskForm.elements.priority.value = "medium";
  await refreshAll();
});

taskList.addEventListener("click", async (event) => {
  const deleteButton = event.target.closest("[data-delete]");
  if (deleteButton) {
    await api(`/api/tasks/${deleteButton.dataset.delete}`, { method: "DELETE" });
    await refreshAll();
    return;
  }

  const toggleButton = event.target.closest("[data-toggle]");
  if (toggleButton) {
    const task = currentTasks.find((item) => item.id === toggleButton.dataset.toggle);
    const actualInput = document.querySelector(`[data-actual="${toggleButton.dataset.toggle}"]`);
    await api(`/api/tasks/${toggleButton.dataset.toggle}`, {
      method: "PATCH",
      body: JSON.stringify({
        done: !task.done,
        actual_hours: actualInput.value,
      }),
    });
    await refreshAll();
  }
});

taskList.addEventListener("change", async (event) => {
  const input = event.target.closest("[data-actual]");
  if (!input) return;
  await api(`/api/tasks/${input.dataset.actual}`, {
    method: "PATCH",
    body: JSON.stringify({ actual_hours: input.value }),
  });
  await refreshAll();
});

scheduleButton.addEventListener("click", async () => {
  const result = await api("/api/schedule", {
    method: "POST",
    body: JSON.stringify({
      available_hours: Number(availableHours.value),
      start_time: startTime.value,
      target_date: targetDate.value,
      algorithm: algorithm.value,
    }),
  });
  renderSchedule(result);
  await loadStats();
});

benchmarkButton.addEventListener("click", async () => {
  benchmarkButton.disabled = true;
  benchmarkButton.textContent = "測試中";
  const size = Math.max(Number(benchmarkSize.value) || 5000, 100);
  const data = await api(`/api/benchmark?task_count=${size}&rounds=5`);
  renderBenchmark(data);
  benchmarkButton.disabled = false;
  benchmarkButton.textContent = "執行測試";
});

targetDate.addEventListener("change", loadStats);

targetDate.value = today();
taskForm.elements.deadline.value = today();
refreshAll();
