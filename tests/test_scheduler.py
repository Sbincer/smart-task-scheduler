import unittest

from scheduler import build_schedule, task_statistics, update_task_payload


class SchedulerTest(unittest.TestCase):
    def test_heap_schedule_prioritizes_urgent_high_priority_task(self):
        tasks = [
            {
                "id": "low",
                "name": "Low priority later task",
                "deadline": "2026-05-25",
                "estimated_hours": 1,
                "priority": "low",
                "done": False,
            },
            {
                "id": "urgent",
                "name": "Urgent final report",
                "deadline": "2026-05-19",
                "estimated_hours": 1,
                "priority": "high",
                "done": False,
            },
        ]

        result = build_schedule(
            tasks,
            available_hours=2,
            start_time="09:00",
            target_date="2026-05-19",
            algorithm="heap",
        )

        self.assertEqual(result["scheduled"][0]["id"], "urgent")
        self.assertFalse(result["has_conflict"])

    def test_schedule_reports_overflow_when_hours_are_not_enough(self):
        tasks = [
            {
                "id": "a",
                "name": "Long task",
                "deadline": "2026-05-19",
                "estimated_hours": 4,
                "priority": "high",
                "done": False,
            }
        ]

        result = build_schedule(
            tasks,
            available_hours=2,
            start_time="09:00",
            target_date="2026-05-19",
            algorithm="heap",
        )

        self.assertTrue(result["has_conflict"])
        self.assertEqual(result["overflow_hours"], 2)

    def test_completed_task_updates_statistics_with_actual_hours(self):
        task = {
            "id": "a",
            "name": "Report",
            "deadline": "2026-05-19",
            "estimated_hours": 2,
            "priority": "high",
            "done": False,
        }
        updated = update_task_payload(task, {"done": True, "actual_hours": 3})
        stats = task_statistics([updated], target_date="2026-05-19")

        self.assertTrue(updated["done"])
        self.assertEqual(stats["completion_rate"], 100)
        self.assertEqual(stats["average_estimate_error"], 1)


if __name__ == "__main__":
    unittest.main()
