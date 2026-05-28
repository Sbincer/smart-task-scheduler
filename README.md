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
Smart Task Scheduler 是一個給學生使用的任務排程 Web App。使用者可以輸入任務名稱、Deadline、預估時數與優先等級，系統會根據任務分數自動產生今日建議排程，並在任務總時數超過可用時間時顯示衝突警告。

Final 版本加入了完整的任務生命週期：使用者可以在完成任務後輸入實際花費時數，系統會計算完成率、本週完成數、逾期任務數與預估誤差。這讓專案不只是一個 todo list，而是能協助使用者回顧時間估計是否準確的排程工具。

### Final 版本功能
- 新增、刪除任務。
- 設定 Deadline、預估時數與優先等級。
- 使用 Priority Queue / Max-heap 產生今日排程。
- 支援 Sort 與 Shortest Job First 作為比較演算法。
- 顯示每日時間區塊、任務分數與 deadline 狀態。
- 偵測今日可用時間不足的排程衝突。
- 標記任務完成並記錄實際時數。
- 顯示完成率、本週完成數、逾期數與估時誤差。
- 內建效能分析工具，可自訂測試任務數，比較不同演算法執行時間。

### 與資料結構及演算法的關聯
本專案最核心的功能是「自動排程」。系統會先為每個任務計算分數：

```text
score = deadline urgency + priority weight + duration bias
```

- Deadline 越近，deadline urgency 越高。
- 優先等級越高，priority weight 越高。
- 預估時間較短的任務會得到 duration bias，避免短任務長期被延後。

排程時，系統使用 Greedy Algorithm，每次優先選擇目前分數最高的任務，直到今日可用時間被用完。Final 版本提供三種策略進行比較：

| 策略 | 使用資料結構 / 方法 | 時間複雜度 | 說明 |
|------|---------------------|------------|------|
| Priority Queue / Max-heap | Binary Heap | O(n log n) | 將任務依分數放入 heap，每次取出最高分任務。 |
| Full Sort | Array + TimSort | O(n log n) | 直接將所有任務依分數排序。 |
| Shortest Job First | Array + Greedy Sort | O(n log n) | 優先安排預估時數較短的任務，作為不同策略的比較基準。 |

透過前端的「效能分析」區塊，可以產生大量假任務並測量三種策略的平均、最快與最慢執行時間。這符合本專題目標：針對系統內同一個功能流程，使用不同資料結構或演算法進行實際效能分析與比較。

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

### 測試方式

```bash
python -m unittest discover
```

目前測試涵蓋：
- 高優先且 deadline 較近的任務會被優先安排。
- 可用時間不足時會產生 overflow 與衝突警告。
- 任務完成後會更新統計與估時誤差。

### Demo 影片建議流程
1. 簡短介紹問題：學生任務多，手動排序很麻煩。
2. 新增幾個任務，展示 deadline、預估時數與優先等級。
3. 產生今日排程，說明分數、時間區塊與衝突警告。
4. 標記任務完成，填入實際時數，展示統計面板。
5. 執行效能分析，說明 Priority Queue、Sort、SJF 的比較結果。
6. 總結課程關聯：heap、greedy、排序、時間複雜度與實測比較。

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

目前使用以下概念計算每個任務的分數：

```text
score = deadline urgency + priority weight + duration bias
```

- Deadline 越近，urgency 越高。
- 優先等級越高，priority weight 越高。
- 預估時間較短的任務會得到一些 duration bias，避免小任務一直被延後。

最後系統會使用 Greedy Algorithm，依照分數由高到低把任務放入今日可用時段中。
