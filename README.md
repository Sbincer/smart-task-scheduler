# Smart Task Scheduler

## Proposal Report

### 動機與目標
面對資管系沉重的課業壓力與活動需求，時間管理成為必備技巧。現有工具（如 Notion、Apple 提醒事項）雖能記錄任務，卻缺乏自動化的排程邏輯，無法根據緊急程度與預估時間直接給出今日安排。本專題旨在實作一個 Web App，使用者僅需輸入任務資訊，系統便能自動產出建議排程，解決「不知道該先做什麼」的痛點。

### 競品比較
* **Notion / Apple 提醒事項：** 優點是跨平台與記錄方便；缺點是需手動排序，無法自動處理 deadline 與任務時長的優先權計算。
* **Todoist：** 具備良好的 UI 設計與標籤功能，但自動排程引擎非核心強項，且部分進階功能需付費。
* **本專案優勢：** 專注於「排程引擎」，利用 Priority Queue 結合 Greedy Algorithm，針對學生需求客製化自動排序邏輯。

### 預期功能
* **任務新增：** 支援名稱、Deadline、預估時數、優先等級（高/中/低）。
* **排程引擎：** 根據權重公式計算分數，利用 Max-heap 進行排序。
* **每日排程檢視：** 視覺化的時間區塊顯示（參考 Todoist 風格）。
* **衝突偵測：** 總預估時數超過當日可用時間時主動發出警告。
* **資料儲存：** 使用 SQLite 或 JSON 儲存資料。
* **延伸功能：** 每週完成率統計、預估與實際時間的誤差分析。

### 使用技術
* **前端：** HTML / Tailwind CSS / Vanilla JavaScript。
* **後端：** Python + Flask。
* **資料庫：** SQLite。
* **部署：** 本機執行或部署至 Render。
* **核心算法：** Priority Queue (Max-heap)、Greedy Algorithm、Shortest Job First (SJF)。

### Prototype 預計可驗證內容
* 驗證排程引擎的邏輯是否能正確處理 Deadline 與優先級的排序。
* 測試前後端資料傳遞（API 串接）的流暢性。
* 驗證簡單的 UI 介面是否能清晰呈現排程結果。

---

## Prototype Report

### 目前進度

### 遇到的困難

### 下一步計畫

---

## Final Report

### 專案說明

使用方式
