/**
 * 匯率轉換器前端邏輯
 * 負責用戶界面交互和API調用
 */
class CurrencyConverter {
    constructor() {
        this.apiBaseUrl = '/api'; // 後端 API 基礎路徑
        this.debounceTimer = null;
        this.initEventListeners();
        this.loadInitialRates();
    }

    /**
     * 初始化事件監聽器
     */
    initEventListeners() {
        const form = document.getElementById('converterForm');
        const swapBtn = document.getElementById('swapBtn');
        const fromAmount = document.getElementById('fromAmount');
        const fromCurrency = document.getElementById('fromCurrency');
        const toCurrency = document.getElementById('toCurrency');

        // 表單提交事件
        form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // 交換貨幣按鈕
        swapBtn.addEventListener('click', () => this.swapCurrencies());
        
        // 即時轉換事件
        fromAmount.addEventListener('input', () => this.debounceConvert());
        fromCurrency.addEventListener('change', () => this.convertCurrency());
        toCurrency.addEventListener('change', () => this.convertCurrency());
    }

    /**
     * 防抖動轉換，避免過於頻繁的API請求
     */
    debounceConvert() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => this.convertCurrency(), 500);
    }

    /**
     * 載入初始匯率
     */
    async loadInitialRates() {
        await this.convertCurrency();
    }

    /**
     * 處理表單提交
     */
    handleSubmit(e) {
        e.preventDefault();
        this.convertCurrency();
    }

    /**
     * 交換來源和目標貨幣
     */
    swapCurrencies() {
        const fromCurrency = document.getElementById('fromCurrency');
        const toCurrency = document.getElementById('toCurrency');
        
        const temp = fromCurrency.value;
        fromCurrency.value = toCurrency.value;
        toCurrency.value = temp;
        
        this.convertCurrency();
    }

    /**
     * 執行貨幣轉換
     */
    async convertCurrency() {
        const fromAmount = parseFloat(document.getElementById('fromAmount').value);
        const fromCurrency = document.getElementById('fromCurrency').value;
        const toCurrency = document.getElementById('toCurrency').value;

        // 驗證輸入
        if (!fromAmount || fromAmount <= 0) {
            this.hideElements();
            return;
        }

        // 相同貨幣直接返回
        if (fromCurrency === toCurrency) {
            document.getElementById('toAmount').value = fromAmount.toFixed(2);
            this.showResult(fromAmount, fromCurrency, fromAmount, toCurrency, 1);
            return;
        }

        const convertBtn = document.getElementById('convertBtn');
        
        this.showLoading(convertBtn);
        this.hideElements();

        try {
            // 調用後端API
            const response = await fetch(`${this.apiBaseUrl}/convert`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: fromAmount,
                    from: fromCurrency,
                    to: toCurrency
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '轉換失敗');
            }

            const data = await response.json();
            
            // 更新結果
            document.getElementById('toAmount').value = data.convertedAmount.toFixed(2);
            this.showResult(fromAmount, fromCurrency, data.convertedAmount, toCurrency, data.rate);
            this.showRateInfo(fromCurrency, toCurrency, data.rate, data.lastUpdate);

        } catch (error) {
            console.error('轉換錯誤:', error);
            this.showError(error.message);
            
            // 如果後端不可用，回退到直接調用外部API
            await this.fallbackConvert(fromAmount, fromCurrency, toCurrency);
        } finally {
            this.hideLoading(convertBtn);
        }
    }

    /**
     * 後備轉換方法（直接調用外部API）
     */
    async fallbackConvert(fromAmount, fromCurrency, toCurrency) {
        try {
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
            
            if (!response.ok) {
                throw new Error('無法獲取匯率資料');
            }

            const data = await response.json();
            const rate = data.rates[toCurrency];

            if (!rate) {
                throw new Error('不支援的幣別轉換');
            }

            const convertedAmount = fromAmount * rate;
            document.getElementById('toAmount').value = convertedAmount.toFixed(2);
            
            this.showResult(fromAmount, fromCurrency, convertedAmount, toCurrency, rate);
            this.showRateInfo(fromCurrency, toCurrency, rate, data.date);

        } catch (error) {
            this.showError('連接失敗，請稍後再試');
        }
    }

    /**
     * 顯示載入狀態
     */
    showLoading(btn) {
        btn.disabled = true;
        btn.innerHTML = '轉換中... <div class="loading"></div>';
    }

    /**
     * 隱藏載入狀態
     */
    hideLoading(btn) {
        btn.disabled = false;
        btn.innerHTML = '💸 立即轉換';
    }

    /**
     * 顯示轉換結果
     */
    showResult(fromAmount, fromCurrency, toAmount, toCurrency, rate) {
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = `
            <div style="font-size: 1.1em; margin-bottom: 10px;">
                ${fromAmount.toLocaleString()} ${fromCurrency} = 
            </div>
            <div style="font-size: 1.5em; font-weight: bold;">
                ${toAmount.toLocaleString()} ${toCurrency}
            </div>
        `;
        resultDiv.classList.add('show');
        resultDiv.style.display = 'block';
    }

    /**
     * 顯示匯率資訊
     */
    showRateInfo(fromCurrency, toCurrency, rate, date) {
        const rateInfoDiv = document.getElementById('rateInfo');
        rateInfoDiv.innerHTML = `
            📊 匯率：1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}<br>
            📅 更新時間：${date || '最新'}
        `;
        rateInfoDiv.style.display = 'block';
    }

    /**
     * 顯示錯誤訊息
     */
    showError(message) {
        const errorDiv = document.getElementById('error');
        errorDiv.textContent = `❌ 錯誤：${message}`;
        errorDiv.style.display = 'block';
    }

    /**
     * 隱藏所有結果元素
     */
    hideElements() {
        document.getElementById('result').style.display = 'none';
        document.getElementById('error').style.display = 'none';
        document.getElementById('rateInfo').style.display = 'none';
        document.getElementById('result').classList.remove('show');
    }
}

// 初始化應用程式
document.addEventListener('DOMContentLoaded', () => {
    new CurrencyConverter();
});