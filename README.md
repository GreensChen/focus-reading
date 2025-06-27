# Focus Reading

專注閱讀追蹤應用程式，幫助您記錄閱讀時間和筆記。

## 功能特色

- 📚 書籍管理
  - 新增書籍和封面圖片
  - 查看書籍列表
  - 記錄閱讀時間
  - 管理閱讀筆記

- ⏱️ 閱讀追蹤
  - 即時記錄閱讀時間
  - 查看閱讀統計
  - 追蹤閱讀進度

- 📝 筆記功能
  - 在閱讀時添加筆記
  - 查看歷史筆記
  - 整理閱讀心得

## 技術架構

- 前端框架：React + TypeScript
- UI 組件：Ant Design
- 後端服務：Supabase
  - 資料庫：PostgreSQL
  - 檔案存儲：Storage
- 部署平台：Vercel

## 本地開發

1. 安裝依賴
```bash
npm install
```

2. 設定環境變數
```bash
# .env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. 啟動開發伺服器
```bash
npm start
```

## 部署

本專案使用 Vercel 進行自動部署：
1. 推送到 GitHub main 分支
2. Vercel 自動檢測更改並部署
3. 部署完成後可在線上環境訪問

## 專案結構

```
src/
├── components/         # React 組件
│   ├── AddBookPage/   # 新增書籍頁面
│   ├── Bookshelf/     # 書架頁面
│   └── ReadingPage/   # 閱讀頁面
├── styles/            # 全局樣式
├── hooks/             # 自定義 Hooks
└── supabaseClient.ts  # Supabase 客戶端配置
```

## 設計規範

### 顏色系統
- 主色：#00D4AA
- 背景：#1A1A1A
- 輸入框：#242424
- 邊框：#333333

### 字體大小
- 標題：16px
- 內文：14px
- 按鈕：16px
- 備註：14px

## 開發團隊

- 設計：@GreensChen
- 開發：@GreensChen

## 授權

本專案為私有專案，保留所有權利。
