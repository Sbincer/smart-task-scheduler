from __future__ import annotations

from datetime import date, datetime
from pathlib import Path
from uuid import uuid4

from flask import Flask, jsonify, render_template, request
from flask_cors import CORS

from scheduler import (
    benchmark_schedulers,
    build_schedule,
    parse_task_payload,
    read_tasks,
    save_tasks,
)


app = Flask(__name__)
CORS(app)

DATA_PATH = Path(__file__).parent / "data" / "tasks.json"


@app.errorhandler(ValueError)
def handle_bad_request(error: ValueError):
    return jsonify({"error": str(error)}), 400


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/api/tasks")
def get_tasks():
    return jsonify(read_tasks(DATA_PATH))


@app.post("/api/tasks")
def create_task():
    payload = request.get_json(force=True)
    task = parse_task_payload(payload)
    task["id"] = str(uuid4())
    task["created_at"] = datetime.now().isoformat(timespec="seconds")

    tasks = read_tasks(DATA_PATH)
    tasks.append(task)
    save_tasks(DATA_PATH, tasks)
    return jsonify(task), 201


@app.delete("/api/tasks/<task_id>")
def delete_task(task_id: str):
    tasks = read_tasks(DATA_PATH)
    next_tasks = [task for task in tasks if task["id"] != task_id]
    save_tasks(DATA_PATH, next_tasks)
    return jsonify({"deleted": len(tasks) - len(next_tasks)})


@app.post("/api/schedule")
def schedule_tasks():
    payload = request.get_json(silent=True) or {}
    available_hours = float(payload.get("available_hours", 8))
    start_time = payload.get("start_time", "09:00")
    target_date = payload.get("target_date", date.today().isoformat())
    algorithm = payload.get("algorithm", "heap")

    tasks = read_tasks(DATA_PATH)
    result = build_schedule(
        tasks,
        available_hours=available_hours,
        start_time=start_time,
        target_date=target_date,
        algorithm=algorithm,
    )
    return jsonify(result)


@app.get("/api/benchmark")
def benchmark():
    task_count = int(request.args.get("task_count", 3000))
    rounds = int(request.args.get("rounds", 5))
    return jsonify(benchmark_schedulers(task_count=task_count, rounds=rounds))


if __name__ == "__main__":
    app.run(debug=True)
