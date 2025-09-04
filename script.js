  function showDay(dayId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const sections = document.querySelectorAll('.day-section');
      sections.forEach(section => section.classList.remove('active'));
      document.getElementById(dayId).classList.add('active');
    }
//旅遊倒數工具
  // 設定旅遊出發日期
  const targetDate = new Date("2025-09-07T23:30:00").getTime();
  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;
    if (distance < 0) {
      document.getElementById("countdown").innerHTML = "出發日已到！";
      return;
    }
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    document.getElementById("days").innerText = days;
    document.getElementById("hours").innerText = hours;
    document.getElementById("minutes").innerText = minutes;
    document.getElementById("seconds").innerText = seconds;
  }
  // 每秒更新一次倒數計時
  setInterval(updateCountdown, 1000);
  updateCountdown(); // 初始執行

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

//相簿

  const fileInput = document.getElementById('fileInput');
  const uploadBtn = document.getElementById('uploadBtn');
  const gallery = document.getElementById('gallery');

  uploadBtn.addEventListener('click', () => {
    console.log("Upload button clicked");
    const file = fileInput.files[0];
    if (!file) return alert('請先選一張照片！');

    // 建立一個儲存位置 (以檔名存)
    const storageRef = firebase.storage().ref('photos/' + file.name);

    // 上傳
    storageRef.put(file).then(() => {
      alert('上傳成功！');
      loadPhotos();
    });
  });

  // 載入相簿照片
  function loadPhotos() {
    const storageRef = firebase.storage().ref('photos/');
    storageRef.listAll().then(result => {
      gallery.innerHTML = ''; // 清空畫面
      result.items.forEach(itemRef => {
        itemRef.getDownloadURL().then(url => {
          const img = document.createElement('img');
          img.src = url;
          img.width = 200;
          gallery.appendChild(img);

          // 加一個下載連結
          const link = document.createElement('a');
          link.href = url;
          link.download = itemRef.name;
          link.innerText = '下載';
          gallery.appendChild(link);
        });
      });
    });
  }

  // 一開始就載入
  loadPhotos();

