# 匯率轉換器 🏦

一個現代化的匯率轉換器應用程式，採用前後端分離架構，提供即時匯率查詢和轉換功能。

## ✨ 功能特色

- 🔄 **即時匯率轉換** - 支援12種主要貨幣
- 💾 **智能緩存** - 減少API請求，提升響應速度
- 📱 **響應式設計** - 完美支援手機和桌面瀏覽
- 🎨 **現代化UI** - 漸層背景、動畫效果
- 🔒 **錯誤處理** - 完善的錯誤處理和回退機制
- ⚡ **防抖動** - 避免頻繁API請求

## 🏗️ 技術架構

### 前端
- **HTML5** - 語義化標記
- **CSS3** - 現代化樣式、動畫效果
- **Vanilla JavaScript** - ES6+ 語法
- **Fetch API** - 異步資料請求

### 後端
- **Node.js** - JavaScript 運行環境
- **Express.js** - Web 應用框架
- **Axios** - HTTP 客戶端
- **內存緩存** - 提升性能

## 📁 專案結構

```
currency-converter/
├── public/              # 前端靜態檔案
│   ├── index.html      # 主頁面
│   ├── styles.css      # 樣式檔案
│   └── app.js          # 前端邏輯
├── server.js           # 後端伺服器
├── package.json        # 套件配置
└── README.md          # 專案說明
```

## 🚀 快速開始

### 環境需求
- Node.js >= 14.0.0
- npm >= 6.0.0

### 安裝步驟

1. **克隆專案**
   ```bash
   git clone https://github.com/tokuyoD/currency-converter.git
   cd currency-converter
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

4. **開啟瀏覽器**
   ```
   http://localhost:3000
   ```

## 📖 API 文件

### 基礎路徑
```
http://localhost:3000/api
```

### 端點列表

#### 1. 貨幣轉換
**POST** `/api/convert`

**請求體:**
```json
{
  "amount": 100,
  "from": "TWD",
  "to": "USD"
}
```

**響應:**
```json
{
  "success": true,
  "data": {
    "amount": 100,
    "from": "TWD",
    "to": "USD",
    "rate": 0.0312,
    "convertedAmount": 3.12,
    "lastUpdate": "2024-01-15"
  },
  "message": "轉換成功"
}
```

#### 2. 獲取匯率
**GET** `/api/rates/{currency}`

**響應:**
```json
{
  "success": true,
  "data": {
    "base": "USD",
    "rates": {
      "TWD": 32.05,
      "EUR": 0.85,
      "JPY": 110.25
    },
    "lastUpdate": "2024-01-15"
  }
}
```

#### 3. 支援貨幣列表
**GET** `/api/currencies`

**響應:**
```json
{
  "success": true,
  "currencies": ["USD", "EUR", "GBP", "JPY", "TWD", "CNY", "KRW", "HKD", "SGD", "AUD", "CAD", "CHF"]
}
```

#### 4. 健康檢查
**GET** `/api/health`

## 💰 支援貨幣

| 代碼 | 貨幣名稱 | 符號 |
| --- | --- | --- |
| USD | 美元 | $ |
| EUR | 歐元 | € |
| GBP | 英鎊 | £ |
| JPY | 日圓 | ¥ |
| TWD | 台幣 | NT$ |
| CNY | 人民幣 | ¥ |
| KRW | 韓圓 | ₩ |
| HKD | 港幣 | HK$ |
| SGD | 新幣 | S$ |
| AUD | 澳幣 | A$ |
| CAD | 加幣 | C$ |
| CHF | 瑞士法郎 | CHF |

## 🔧 開發指令

```bash
# 安裝依賴
npm install

# 開發模式（自動重啟）
npm run dev

# 生產模式
npm start

# 運行測試
npm test

# 建置專案
npm run build
```

## 📊 性能特色

- **緩存機制**: 匯率資料緩存1小時，減少外部API請求
- **防抖動**: 用戶輸入500ms後才發送請求
- **錯誤回退**: 後端不可用時自動使用前端直接調用
- **請求超時**: 10秒超時保護

## 🛠️ 自定義配置

### 修改緩存時間
在 `server.js` 中修改：
```javascript
this.cacheTimeout = 60 * 60 * 1000; // 1小時（毫秒）
```

### 添加新貨幣
在 `server.js` 中的 `supportedCurrencies` 陣列中添加：
```javascript
this.supportedCurrencies = [
    'USD', 'EUR', 'GBP', 'JPY', 'TWD', 'CNY', 
    'KRW', 'HKD', 'SGD', 'AUD', 'CAD', 'CHF',
    'NEW_CURRENCY' // 添加新貨幣
];
```

同時在前端 `index.html` 中添加對應的 option。

## 📝 授權條款

MIT License - 請參閱 [LICENSE](LICENSE) 檔案

## 🤝 貢獻指南

1. Fork 這個專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📞 聯絡資訊

如有問題或建議，請通過以下方式聯絡：

- 📧 Email: rubyluh11@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/tokuyoD/currency-converter/issues)

## 🔮 待開發功能

- [ ] 歷史匯率查詢
- [ ] 匯率走勢圖表
- [ ] 用戶偏好設定
- [ ] 多語言支援
- [ ] PWA 支援
- [ ] 匯率預警功能

---

⭐ 如果這個專案對你有幫助，請給我們一個星星！