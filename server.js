/**
 * 匯率轉換器後端 API
 * 使用 Node.js + Express
 * 提供匯率轉換服務並緩存資料
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中介軟體設定
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // 靜態檔案服務

// 匯率緩存
class RateCache {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 60 * 60 * 1000; // 1小時緩存
    }

    set(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    get(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        // 檢查是否過期
        if (Date.now() - cached.timestamp > this.cacheTimeout) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    clear() {
        this.cache.clear();
    }
}

const rateCache = new RateCache();

/**
 * 匯率服務類別
 */
class CurrencyService {
    constructor() {
        this.apiUrl = 'https://api.exchangerate-api.com/v4/latest';
        this.supportedCurrencies = [
            'USD', 'EUR', 'GBP', 'JPY', 'TWD', 'CNY', 
            'KRW', 'HKD', 'SGD', 'AUD', 'CAD', 'CHF'
        ];
    }

    /**
     * 驗證貨幣代碼
     */
    isValidCurrency(currency) {
        return this.supportedCurrencies.includes(currency.toUpperCase());
    }

    /**
     * 獲取匯率資料
     */
    async getRates(baseCurrency) {
        const cacheKey = `rates_${baseCurrency}`;
        
        // 先檢查緩存
        const cachedData = rateCache.get(cacheKey);
        if (cachedData) {
            console.log(`使用緩存匯率資料: ${baseCurrency}`);
            return cachedData;
        }

        try {
            console.log(`從API獲取匯率資料: ${baseCurrency}`);
            const response = await axios.get(`${this.apiUrl}/${baseCurrency}`, {
                timeout: 10000 // 10秒超時
            });

            const data = {
                base: response.data.base,
                rates: response.data.rates,
                lastUpdate: response.data.date || new Date().toISOString().split('T')[0]
            };

            // 儲存到緩存
            rateCache.set(cacheKey, data);
            
            return data;

        } catch (error) {
            console.error('獲取匯率失敗:', error.message);
            throw new Error('無法獲取最新匯率資料');
        }
    }

    /**
     * 執行貨幣轉換
     */
    async convert(amount, fromCurrency, toCurrency) {
        // 驗證輸入
        if (!amount || amount <= 0) {
            throw new Error('金額必須大於0');
        }

        if (!this.isValidCurrency(fromCurrency)) {
            throw new Error(`不支援的來源貨幣: ${fromCurrency}`);
        }

        if (!this.isValidCurrency(toCurrency)) {
            throw new Error(`不支援的目標貨幣: ${toCurrency}`);
        }

        // 相同貨幣直接返回
        if (fromCurrency === toCurrency) {
            return {
                amount,
                from: fromCurrency,
                to: toCurrency,
                rate: 1,
                convertedAmount: amount,
                lastUpdate: new Date().toISOString().split('T')[0]
            };
        }

        // 獲取匯率並轉換
        const rateData = await this.getRates(fromCurrency);
        const rate = rateData.rates[toCurrency];

        if (!rate) {
            throw new Error(`無法找到 ${fromCurrency} 到 ${toCurrency} 的匯率`);
        }

        const convertedAmount = amount * rate;

        return {
            amount,
            from: fromCurrency,
            to: toCurrency,
            rate,
            convertedAmount,
            lastUpdate: rateData.lastUpdate
        };
    }
}

const currencyService = new CurrencyService();

// 路由定義

/**
 * 首頁路由
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * 獲取支援的貨幣列表
 */
app.get('/api/currencies', (req, res) => {
    res.json({
        success: true,
        currencies: currencyService.supportedCurrencies,
        message: '支援的貨幣列表'
    });
});

/**
 * 獲取特定貨幣的匯率
 */
app.get('/api/rates/:currency', async (req, res) => {
    try {
        const currency = req.params.currency;
        const upperCurrency = currency.toUpperCase();

        if (!currencyService.isValidCurrency(upperCurrency)) {
            return res.status(400).json({
                success: false,
                message: `不支援的貨幣: ${currency}`
            });
        }

        const rateData = await currencyService.getRates(upperCurrency);
        
        res.json({
            success: true,
            data: rateData,
            message: '匯率資料獲取成功'
        });

    } catch (error) {
        console.error('獲取匯率錯誤:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * 貨幣轉換 API
 */
app.post('/api/convert', async (req, res) => {
    try {
        const { amount, from, to } = req.body;

        // 驗證必要參數
        if (amount === undefined || !from || !to) {
            return res.status(400).json({
                success: false,
                message: '缺少必要參數: amount, from, to'
            });
        }

        const result = await currencyService.convert(
            parseFloat(amount), 
            from.toUpperCase(), 
            to.toUpperCase()
        );

        res.json({
            success: true,
            data: result,
            message: '轉換成功'
        });

    } catch (error) {
        console.error('轉換錯誤:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * 清除緩存 API（管理功能）
 */
app.delete('/api/cache', (req, res) => {
    rateCache.clear();
    res.json({
        success: true,
        message: '緩存已清除'
    });
});

/**
 * 健康檢查 API
 */
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API 服務正常運行',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 404 處理
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: '找不到請求的資源'
    });
});

// 錯誤處理中介軟體
app.use((error, req, res, next) => {
    console.error('伺服器錯誤:', error);
    res.status(500).json({
        success: false,
        message: '伺服器內部錯誤'
    });
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`🚀 匯率轉換器 API 伺服器運行在 http://localhost:${PORT}`);
    console.log(`📊 支援的貨幣: ${currencyService.supportedCurrencies.join(', ')}`);
});

module.exports = app;