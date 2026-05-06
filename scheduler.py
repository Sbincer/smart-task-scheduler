from __future__ import annotations

import heapq
import json
import random
import statistics
import time
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Iterable


PRIORITY_WEIGHT = {"low": 1, "medium": 2, "high": 3}
PRIORITY_LABEL = {"low": "低", "medium": "中", "high": "高"}


def read_tasks(path: Path) -> list[dict]:
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def save_tasks(path: Path, tasks: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as file:
        json.dump(tasks, file, ensure_ascii=False, indent=2)


def parse_task_payload(payload: dict) -> dict:
    name = str(payload.get("name", "")).strip()
    if not name:
        raise ValueError("Task name is required")

    deadline = str(payload.get("deadline", "")).strip()
    datetime.strptime(deadline, "%Y-%m-%d")

    estimated_hours = float(payload.get("estimated_hours", 1))
    if estimated_hours <= 0:
        raise ValueError("Estimated hours must be positive")

    priority = str(payload.get("priority", "medium")).lower()
    if priority not in PRIORITY_WEIGHT:
        priority = "medium"

    return {
        "name": name,
        "deadline": deadline,
        "estimated_hours": estimated_hours,
        "priority": priority,
        "done": False,
    }


def score_task(task: dict, target_date: str | None = None) -> float:
    today = datetime.strptime(target_date or date.today().isoformat(), "%Y-%m-%d").date()
    deadline = datetime.strptime(task["deadline"], "%Y-%m-%d").date()
    days_left = max((deadline - today).days, 0)
    urgency = 100 / (days_left + 1)
    priority = PRIORITY_WEIGHT.get(task.get("priority", "medium"), 2) * 30
    duration_bias = 8 / max(float(task.get("estimated_hours", 1)), 0.25)
    return round(urgency + priority + duration_bias, 4)


def _heap_order(tasks: Iterable[dict], target_date: str) -> list[dict]:
    heap: list[tuple[float, str, int, dict]] = []
    for index, task in enumerate(tasks):
        score = score_task(task, target_date)
        heapq.heappush(heap, (-score, task["deadline"], index, task))
    return [heapq.heappop(heap)[3] for _ in range(len(heap))]


def _sorted_order(tasks: Iterable[dict], target_date: str) -> list[dict]:
    return sorted(
        tasks,
        key=lambda task: (-score_task(task, target_date), task["deadline"]),
    )


def _sjf_order(tasks: Iterable[dict], target_date: str) -> list[dict]:
    return sorted(
        tasks,
        key=lambda task: (float(task.get("estimated_hours", 1)), task["deadline"], -score_task(task, target_date)),
    )


def order_tasks(tasks: list[dict], algorithm: str, target_date: str) -> list[dict]:
    pending = [task for task in tasks if not task.get("done")]
    if algorithm == "sort":
        return _sorted_order(pending, target_date)
    if algorithm == "sjf":
        return _sjf_order(pending, target_date)
    return _heap_order(pending, target_date)


def build_schedule(
    tasks: list[dict],
    available_hours: float,
    start_time: str,
    target_date: str,
    algorithm: str = "heap",
) -> dict:
    ordered = order_tasks(tasks, algorithm, target_date)
    remaining_minutes = int(available_hours * 60)
    cursor = datetime.strptime(f"{target_date} {start_time}", "%Y-%m-%d %H:%M")
    scheduled = []
    overflow = []

    for task in ordered:
        minutes = int(float(task["estimated_hours"]) * 60)
        enriched = {
            **task,
            "score": score_task(task, target_date),
            "priority_label": PRIORITY_LABEL.get(task.get("priority"), "中"),
        }
        if minutes <= remaining_minutes:
            end = cursor + timedelta(minutes=minutes)
            scheduled.append(
                {
                    **enriched,
                    "start": cursor.strftime("%H:%M"),
                    "end": end.strftime("%H:%M"),
                    "minutes": minutes,
                }
            )
            cursor = end
            remaining_minutes -= minutes
        else:
            overflow.append({**enriched, "minutes": minutes})

    total_minutes = sum(int(float(task["estimated_hours"]) * 60) for task in ordered)
    return {
        "algorithm": algorithm,
        "available_hours": available_hours,
        "used_hours": round((int(available_hours * 60) - remaining_minutes) / 60, 2),
        "overflow_hours": round(max(total_minutes - int(available_hours * 60), 0) / 60, 2),
        "has_conflict": total_minutes > int(available_hours * 60),
        "scheduled": scheduled,
        "overflow": overflow,
    }


def _fake_tasks(task_count: int) -> list[dict]:
    base = date.today()
    tasks = []
    for index in range(task_count):
        tasks.append(
            {
                "id": str(index),
                "name": f"Task {index}",
                "deadline": (base + timedelta(days=random.randint(0, 30))).isoformat(),
                "estimated_hours": random.choice([0.5, 1, 1.5, 2, 3, 4]),
                "priority": random.choice(["low", "medium", "high"]),
                "done": False,
            }
        )
    return tasks


def benchmark_schedulers(task_count: int = 3000, rounds: int = 5) -> dict:
    tasks = _fake_tasks(task_count)
    target_date = date.today().isoformat()
    results: dict[str, list[float]] = {"heap": [], "sort": [], "sjf": []}

    for _ in range(rounds):
        for algorithm in results:
            start = time.perf_counter()
            order_tasks(tasks, algorithm, target_date)
            elapsed_ms = (time.perf_counter() - start) * 1000
            results[algorithm].append(elapsed_ms)

    return {
        "task_count": task_count,
        "rounds": rounds,
        "results": [
            {
                "algorithm": algorithm,
                "average_ms": round(statistics.mean(values), 3),
                "best_ms": round(min(values), 3),
                "worst_ms": round(max(values), 3),
            }
            for algorithm, values in results.items()
        ],
        "note": "heap 使用 Priority Queue；sort 使用完整排序；sjf 使用 Shortest Job First 作為比較基準。",
    }
