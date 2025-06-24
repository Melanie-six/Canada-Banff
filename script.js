async function convertToTWD() {
  const amount = parseFloat(document.getElementById("cadInput").value);
  if (isNaN(amount)) {
    document.getElementById("result").textContent = "請輸入有效的數字";
    return;
  }

  try {
    const response = await fetch('https://api.exchangerate.host/latest?base=CAD&symbols=TWD');
    const data = await response.json();
    const rate = data.rates.TWD;
    const result = amount * rate;

    document.getElementById("result").textContent =
      `${amount} 加幣 ≈ ${result.toFixed(2)} 台幣（匯率：${rate.toFixed(2)}）`;
  } catch (error) {
    document.getElementById("result").textContent = "取得匯率失敗，請稍後再試";
    console.error("錯誤：", error);
  }
}

  function showDay(dayId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const sections = document.querySelectorAll('.day-section');
      sections.forEach(section => section.classList.remove('active'));
      document.getElementById(dayId).classList.add('active');
    }
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

  //天氣
  !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='https://weatherwidget.io/js/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','weatherwidget-io-js');

  