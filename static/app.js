const taskForm = document.querySelector("#taskForm");
const taskList = document.querySelector("#taskList");
const taskCount = document.querySelector("#taskCount");
const summaryPill = document.querySelector("#summaryPill");
const scheduleButton = document.querySelector("#scheduleButton");
const scheduleList = document.querySelector("#scheduleList");
const scheduleMeta = document.querySelector("#scheduleMeta");
const warning = document.querySelector("#warning");
const benchmarkButton = document.querySelector("#benchmarkButton");
const benchmarkResult = document.querySelector("#benchmarkResult");
const targetDate = document.querySelector("#targetDate");
const startTime = document.querySelector("#startTime");
const availableHours = document.querySelector("#availableHours");
const algorithm = document.querySelector("#algorithm");

const labels = {
  high: "高",
  medium: "中",
  low: "低",
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function escapeHtml(value) {
  return String(value)
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

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

async function loadTasks() {
  const tasks = await api("/api/tasks");
  renderTasks(tasks);
  return tasks;
}

function renderTasks(tasks) {
  taskCount.textContent = `${tasks.length} 筆`;
  summaryPill.textContent = `${tasks.length} 個待排任務`;

  if (!tasks.length) {
    taskList.innerHTML = `<div class="empty-state">目前沒有任務</div>`;
    return;
  }

  taskList.innerHTML = tasks
    .map(
      (task) => `
        <article class="task-item">
          <div>
            <div class="task-name">${escapeHtml(task.name)}</div>
            <div class="task-meta">
              Deadline ${task.deadline} · ${task.estimated_hours} 小時 ·
              <span class="priority ${task.priority}">${labels[task.priority] || "中"}</span>
            </div>
          </div>
          <button class="delete-button" data-delete="${task.id}">刪除</button>
        </article>
      `,
    )
    .join("");
}

function renderSchedule(result) {
  scheduleMeta.textContent = `${result.algorithm} · 已安排 ${result.used_hours} / ${result.available_hours} 小時`;

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
        <article class="schedule-item">
          <div class="time-block">${item.start}<br />${item.end}</div>
          <div>
            <div class="schedule-name">${escapeHtml(item.name)}</div>
            <div class="schedule-meta">
              Deadline ${item.deadline} · ${item.estimated_hours} 小時 · 優先 ${item.priority_label}
            </div>
          </div>
          <div class="score">Score ${item.score}</div>
        </article>
      `,
    )
    .join("");
}

function renderBenchmark(data) {
  benchmarkResult.innerHTML = data.results
    .map(
      (item) => `
        <article class="benchmark-card">
          <strong>${item.algorithm}</strong>
          <span>平均：${item.average_ms} ms</span>
          <span>最快：${item.best_ms} ms</span>
          <span>最慢：${item.worst_ms} ms</span>
        </article>
      `,
    )
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
  await loadTasks();
});

taskList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete]");
  if (!button) return;
  await api(`/api/tasks/${button.dataset.delete}`, { method: "DELETE" });
  await loadTasks();
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
});

benchmarkButton.addEventListener("click", async () => {
  benchmarkButton.disabled = true;
  benchmarkButton.textContent = "測試中";
  const data = await api("/api/benchmark?task_count=5000&rounds=5");
  renderBenchmark(data);
  benchmarkButton.disabled = false;
  benchmarkButton.textContent = "執行測試";
});

targetDate.value = today();
taskForm.elements.deadline.value = today();
loadTasks();
