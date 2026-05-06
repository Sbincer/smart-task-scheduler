# Smart Task Scheduler

## Proposal Report

### 動機與目標
面對資管系沉重的課業壓力與活動需求，時間管理成為必備技巧。現有工具（如 Notion、Apple 提醒事項）雖能記錄任務，卻缺乏自動化的排程邏輯，無法根據緊急程度與預估時間直接給出今日安排。本專題旨在實作一個 Web App，使用者僅需輸入任務資訊，系統便能自動產出建議排程，解決「不知道該先做什麼」的痛點。

### 競品比較
- **Notion / Apple 提醒事項：** 優點是跨平台與記錄方便；缺點是需手動排序，無法自動處理 deadline 與任務時長的優先權計算。
- **Todoist：** 具備良好的 UI 設計與標籤功能，但自動排程引擎非核心強項，且部分進階功能需付費。
- **本專案優勢：** 專注於「排程引擎」，利用 Priority Queue 結合 Greedy Algorithm，針對學生需求客製化自動排序邏輯。

### 預期功能
- **任務新增：** 支援名稱、Deadline、預估時數、優先等級（高/中/低）。
- **排程引擎：** 根據權重公式計算分數，利用 Max-heap 進行排序。
- **每日排程檢視：** 視覺化的時間區塊顯示。
- **衝突偵測：** 總預估時數超過當日可用時間時主動發出警告。
- **資料儲存：** Prototype 階段先使用 JSON 儲存，Final 階段可改為 MongoDB。
- **延伸功能：** 每週完成率統計、預估與實際時間的誤差分析。

### 使用技術
- **前端：** HTML / CSS / Vanilla JavaScript。
- **後端：** Python + Flask。
- **資料庫：** Prototype 使用 JSON，後續可擴充為 MongoDB。
- **部署：** 本機執行或部署至 Render。
- **核心算法：** Priority Queue (Max-heap)、Greedy Algorithm、Shortest Job First (SJF)。

### Prototype 預計可驗證內容
- 驗證排程引擎的邏輯是否能正確處理 Deadline 與優先級的排序。
- 測試前後端資料傳遞（API 串接）的流暢性。
- 驗證簡單的 UI 介面是否能清晰呈現排程結果。
- 比較同一個排程流程中，不同資料結構/演算法的執行效率。

## Prototype Report

### 目前進度
- 已完成 Flask 後端雛形，提供任務新增、任務讀取、任務刪除、產生排程與效能分析 API。
- 已完成 Web 前端雛形，使用者可以輸入任務名稱、Deadline、預估時數與優先等級。
- 已完成每日排程檢視，可依照開始時間與可用時數產生時間區塊。
- 已完成衝突偵測，當任務總時數超過今日可用時間時會顯示警告。
- 已加入演算法比較功能，可比較 Priority Queue / Max-heap、完整排序 Sort、Shortest Job First 三種策略的平均執行時間。

### 遇到的困難
- 排程分數需要同時考慮 Deadline、優先等級與預估時數，如果權重設計不佳，可能會讓某個因素過度影響結果。
- Heap 與 Sort 在小資料量時速度差異不明顯，因此效能分析需要產生較大量的測試任務才容易觀察差距。
- Prototype 階段使用 JSON 儲存資料，雖然容易開發，但多人同時使用與進階查詢能力不足，後續若要部署成正式服務需改為 MongoDB。

### 下一步計畫
- 調整排程分數公式，測試不同權重對排程結果的影響。
- 將效能分析結果整理成圖表或表格，用於期末報告中的實際比較。
- 增加任務完成狀態與每週完成率統計。
- 若時間允許，將 JSON 儲存替換為 MongoDB，並部署至 Render。

## Final Report

### 專案說明
待期末完成後補上。

### 使用方式

1. 建立並啟動虛擬環境。

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. 啟動 Flask 伺服器。

```bash
python app.py
```

3. 開啟瀏覽器進入：

```text
http://127.0.0.1:5000
```

## 專案結構

```text
.
├── app.py
├── scheduler.py
├── requirements.txt
├── data/
│   └── tasks.json
├── static/
│   ├── app.js
│   └── styles.css
└── templates/
    └── index.html
```

## 排程分數公式

Prototype 目前使用以下概念計算每個任務的分數：

```text
score = deadline urgency + priority weight + duration bias
```

- Deadline 越近，urgency 越高。
- 優先等級越高，priority weight 越高。
- 預估時間較短的任務會得到一些 duration bias，避免小任務一直被延後。

最後系統會使用 Greedy Algorithm，依照分數由高到低把任務放入今日可用時段中。
