  function showDay(dayId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const sections = document.querySelectorAll('.day-section');
      sections.forEach(section => section.classList.remove('active'));
      document.getElementById(dayId).classList.add('active');
    }

//天氣工具
  !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='https://weatherwidget.io/js/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','weatherwidget-io-js');

//匯率兌換工具
let currentRates = {}; // 儲存目前匯率資料

function updateLabels() {
  const from = document.getElementById("fromCurrency").value;
  const to = document.getElementById("toCurrency").value;

  const currencyNames = {
    CAD: "加幣 (CAD)",
    USD: "美金 (USD)",
    TWD: "台幣 (TWD)"
  };

  document.getElementById("amountLabel").textContent = `${currencyNames[from]} 金額`;
  document.getElementById("resultLabel").textContent = `${currencyNames[to]} 結果`;

  // 嘗試重新換算（在切換幣別時）
  convertAndDisplay();
}

async function calculateExchange() {
  const from = document.getElementById("fromCurrency").value;

  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    const data = await response.json();

    if (data.result !== "success") {
      throw new Error("匯率取得失敗");
    }

    currentRates = data.rates;
    convertAndDisplay(); // 換算顯示
  } catch (error) {
    document.getElementById("convertedResult").value = "錯誤，請稍後再試";
    console.error(error);
  }
}

function convertAndDisplay() {
  const from = document.getElementById("fromCurrency").value;
  const to = document.getElementById("toCurrency").value;
  const amount = parseFloat(document.getElementById("amountInput").value);

  if (!amount || isNaN(amount) || !currentRates[to]) {
    document.getElementById("convertedResult").value = "";
    return;
  }

  const rate = currentRates[to];
  const converted = amount * rate;
  document.getElementById("convertedResult").value = converted.toFixed(2);
}

// 綁定事件
document.getElementById("fromCurrency").addEventListener("change", calculateExchange);
document.getElementById("toCurrency").addEventListener("change", convertAndDisplay);
document.getElementById("amountInput").addEventListener("input", convertAndDisplay);

// 頁面初始化
updateLabels();
calculateExchange();

document.querySelectorAll('.checklist-item').forEach(item => {
  item.addEventListener('click', () => {
    item.classList.toggle('active');
  });
});

// --- [新增] 雙時區時鐘工具 ---

// 取得顯示時間的 DOM 元素
const taiwanClockDiv = document.getElementById("taiwan-clock");
const vancouverClockDiv = document.getElementById("vancouver-clock");

function updateWorldClocks() {
  const now = new Date();

  // --- 設定時間格式 ---
  // 我們使用 Intl.DateTimeFormat 這個強大的內建工具來處理時區和格式
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false // 使用 24 小時制
  };

  // --- 格式化台灣時間 ---
  const taiwanFormatter = new Intl.DateTimeFormat('zh-TW', {
    ...options,
    timeZone: 'Asia/Taipei'
  });
  const taiwanParts = taiwanFormatter.formatToParts(now);
  const taiwanDate = `${taiwanParts.find(p => p.type === 'year').value}/${taiwanParts.find(p => p.type === 'month').value}/${taiwanParts.find(p => p.type === 'day').value}`;
  const taiwanTime = `${taiwanParts.find(p => p.type === 'hour').value}:${taiwanParts.find(p => p.type === 'minute').value}:${taiwanParts.find(p => p.type === 'second').value}`;

  // --- 格式化溫哥華時間 ---
  const vancouverFormatter = new Intl.DateTimeFormat('en-CA', {
    ...options,
    timeZone: 'America/Vancouver'
  });
  const vancouverParts = vancouverFormatter.formatToParts(now);
  const vancouverDate = `${vancouverParts.find(p => p.type === 'year').value}-${vancouverParts.find(p => p.type === 'month').value}-${vancouverParts.find(p => p.type === 'day').value}`;
  const vancouverTime = `${vancouverParts.find(p => p.type === 'hour').value}:${vancouverParts.find(p => p.type === 'minute').value}:${vancouverParts.find(p => p.type === 'second').value}`;

  // --- 更新 HTML 內容 ---
  taiwanClockDiv.innerHTML = `
    <div class="location">台灣時間 (Taipei)</div>
    <div class="time">${taiwanTime}</div>
    <div class="date">${taiwanDate}</div>
  `;
  
  vancouverClockDiv.innerHTML = `
    <div class="location">當地時間 (Vancouver)</div>
    <div class="time">${vancouverTime}</div>
    <div class="date">${vancouverDate}</div>
  `;
}

// 每秒更新一次時鐘
setInterval(updateWorldClocks, 1000);
// 立即執行一次，避免頁面載入時延遲一秒才顯示
updateWorldClocks();