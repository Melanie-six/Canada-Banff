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
  let currentRate = null;
  let lastUpdate = null;

  // 初始化：抓匯率並設定輸入框反應
  async function refreshRate() {
    const response = await fetch("https://open.er-api.com/v6/latest/CAD");
    const data = await response.json();

    if (data.result === "success") {
      currentRate = data.rates.TWD;
      lastUpdate = new Date(data.time_last_update_utc);
      updateRateDisplay();
    } else {
      document.getElementById("rate-display").textContent = "匯率載入失敗";
    }
  }

  function updateRateDisplay() {
    document.getElementById("rate-display").textContent =
      `1 CAD = ${currentRate.toFixed(2)} TWD`;
    document.getElementById("last-updated").textContent =
      `最後更新時間：${lastUpdate.toLocaleString("zh-TW")}`;
  }

  document.getElementById("cadInput").addEventListener("input", () => {
    const amount = parseFloat(document.getElementById("cadInput").value);
    const twd = isNaN(amount) ? "" : (amount * currentRate).toFixed(2);
    document.getElementById("twdOutput").value = twd;
  });

  // 頁面載入時自動執行
  refreshRate();