# AI115 海洋實驗室｜石門國小備戰站

給桃園市龍潭區石門國民小學六年級選手使用的 115 年度總統盃 AI 素養爭霸賽行前教材。這是一個不需要建置工具的靜態 GitHub Pages 網站，內容將官方規則改寫成學生可以照著完成的練習流程。

🌐 **線上教材**：<https://cagoooo.github.io/ai115-shimen-prep/>

## 本站包含

- 桃園市賽資格、報名、指定版本與重要日期
- 「魷來魷去對戰版」正式賽的學生版流程：蒐集資料、訓練、測試、匯出、上傳
- 9/14 至 10/3 的五段練習航線與兩人分工
- 2 小時模擬賽節奏、上傳檔案檢查與合法性紅線
- 比賽日時間表、出發前互動檢查表與四題小測驗
- 依教育部 115 年度教學資源整理的「PAIA 平臺全解析」、「魷來魷去」與 Proly 課程導覽
- 六段官方課程實作地圖：安裝觀察、特徵目標、蒐集訓練測試、資料策略、模型優化、匯出上傳
- PAIA 官方操作說明、指定版本下載、六份課程簡報與原始教材入口
- 桃園市官方最新消息、教育部競賽細則、PAIA 工具與學習教材連結
- `resources/AI115_Taoyuan_Implementation_Plan.pdf`：提供的桃園市實施計畫備查副本
- `assets/`：favicon、Apple／Android app icon、OG 社群分享圖與原始插畫
- `manifest.webmanifest`、`sw.js`、`version.json`：GitHub Pages 子路徑相容的 PWA 與新版提示

## 本機預覽

在 PowerShell 進入本資料夾後執行：

```powershell
py -m http.server 4173
```

接著開啟 <http://127.0.0.1:4173/>。也可以直接雙擊 `index.html`，但用本機伺服器較接近 GitHub Pages 的開啟方式。

若要重新產生圖示與 OG 圖（需要 Python Pillow）：

```powershell
python scripts\generate-assets.py
```

若網站內容已修改，請在提交前升級版本，讓 Service Worker 的 byte、`version.json`、`APP_VERSION` 與本地資源 query 一起更新：

```powershell
powershell -ExecutionPolicy Bypass -File scripts\bump-version.ps1 -Notes "更新教材內容"
```

新版 Service Worker 不會自動打斷學生正在閱讀的頁面；偵測到新版後，會在右下角提示「立刻更新」，由使用者按下後才套用 `skipWaiting` 並重新整理。本站是純靜態單檔頁面，沒有 Vite 動態 chunk，因此不套用只針對 hashed chunk 404 的破壞性清快取自癒流程。

教育部教材頁的「通用安裝」內容與年度競賽公告可能使用不同版本；學生可用教材頁學操作，但正式比賽下載與設定一定以當年度指定版本公告為準。本站已在「教材實作」區整理這個版本辨識提醒。

## 發布到 GitHub Pages

1. 建立一個公開 GitHub repository，將本資料夾內的檔案放到 repository 根目錄。
2. 到 **Settings → Pages**，選擇 **Deploy from a branch**，分支選 `main`、資料夾選 `/ (root)`。
3. 等待 GitHub Pages 完成部署，再用手機與電腦各開一次首頁，檢查 PDF 與所有外部資源連結。

公開前請由學校確認學生姓名、照片、家長同意與網站可見範圍；本站沒有放入任何學生個資。OG 與 canonical URL 已預設為 `https://cagoooo.github.io/ai115-shimen-prep/`。

## 更新原則

網站內容查核基準為 2026-09-14。桃園市報名期限、場地、競賽時程與工具版本可能由主辦單位更新；正式比賽前請以 [桃園市 AI115 官方網站](https://game.tyc.edu.tw/AI115/) 與 [教育部 AI 素養爭霸賽官網](https://proj.moe.edu.tw/Ai-literacy/) 為準。

<!-- akai-edu-tools:backlink -->

---

## 🔗 阿凱老師教育工具集

這個專案是[阿凱老師教育工具集](https://cagoooo.github.io/Akai/)的 **#127 桃園市AI素養爭霸賽**，由桃園市龍潭區石門國民小學阿凱老師開發。

- 工具介紹頁：[https://cagoooo.github.io/Akai/tool/127/](https://cagoooo.github.io/Akai/tool/127/)
- 線上使用：[https://cagoooo.github.io/ai115-shimen-prep/](https://cagoooo.github.io/ai115-shimen-prep/)
- 教學情境文章：[https://cagoooo.github.io/Akai/blog/ai-literacy-127-taoyuan-competition-prep/](https://cagoooo.github.io/Akai/blog/ai-literacy-127-taoyuan-competition-prep/)
- 全部工具（上百個教育工具與原始碼）：[https://cagoooo.github.io/Akai/](https://cagoooo.github.io/Akai/)

想改造成自己的版本？到上面的教學情境文章，按左下角「複製 AI 開發提示詞」，貼給 ChatGPT、Claude、Gemini 等 AI 助手，就能參考這份原始碼開始規劃。
