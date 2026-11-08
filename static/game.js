(() => {
  const tg = window.Telegram?.WebApp;
  tg?.ready(); tg?.expand();
  const $ = id => document.getElementById(id);
  const playBtn = $("play"), collectBtn = $("collect"), stage = $("stage");
  let balance = 68000, best = 0, active = false;
  let multiplier = 1, crashAt = 0, startTime = 0, raf = null, history = [];

  const fmt = n => Math.floor(n).toLocaleString("ru-RU");
  function render() {
    $("balance").textContent = fmt(balance);
    $("best").textContent = best ? best.toFixed(2) + "x" : "—";
  }
  function addHistory(value) {
    history.unshift(value); history = history.slice(0, 7);
    $("historyList").innerHTML = history.map(v =>
      `<span class="history-chip" style="color:${v>=2?'#65d6a5':'#ff8797'}">${v.toFixed(2)}x</span>`
    ).join("");
  }
  function resetPlane() {
    $("plane").style.left = "16%";
    $("plane").style.top = "55%";
    $("trail").style.width = "0";
    stage.classList.remove("flying");
  }
  function finish(collected) {
    active = false;
    cancelAnimationFrame(raf);
    collectBtn.disabled = true; playBtn.disabled = false;
    stage.classList.remove("flying");
    if (collected) {
      const earned = Math.floor(3500 * multiplier);
      balance += earned;
      best = Math.max(best, multiplier);
      $("status").textContent = `ЗАЧИСЛЕНО: +${fmt(earned)} РУБЛЕЙ`;
      $("hint").textContent = "Отлично поебашил! Деньги переведены на карту.";
    } else {
      $("status").textContent = "ПОЕЗДКА ЗАВЕРШЕНА";
      $("hint").textContent = "Ты проебались. Попробуй ещё раз!";
      $("plane").classList.add("bump");
    }
    addHistory(multiplier); render();
  }
  function tick(now) {
    if (!active) return;
    const elapsed = (now - startTime) / 1000;
    multiplier = Math.exp(elapsed * 0.19);
    if (multiplier >= crashAt) {
      multiplier = crashAt;
      $("multiplier").textContent = multiplier.toFixed(2) + "x";
      finish(false); return;
    }
    $("multiplier").textContent = multiplier.toFixed(2) + "x";
    const progress = Math.min(1, elapsed / 12);
    const x = Math.min(78, 16 + elapsed * 5.2);
    const y = Math.max(18, 55 - elapsed * 3.1);
    $("plane").style.left = x + "%";
    $("plane").style.top = y + "%";
    $("trail").style.width = Math.max(0, (x - 12) * 1.05) + "%";
    raf = requestAnimationFrame(tick);
  }
  playBtn.addEventListener("click", () => {
    if (active || balance < 3500) {
      if (balance < 3500) $("hint").textContent = "Недостаточно денег. Пополнить счёт можно через Тёму.";
      return;
    }
    balance -= 3500; render();
    multiplier = 1; crashAt = 1.15 + Math.random() * 7.85;
    startTime = performance.now(); active = true;
    playBtn.disabled = true; collectBtn.disabled = false;
    stage.classList.add("flying");
    $("status").textContent = "ПОГРУЗЧИК ВЗЛЕТЕЛ";
    $("hint").textContent = "Нажми «Забрать деньги» до завершения поездки.";
    resetPlane();
    stage.classList.add("flying");
    $("multiplier").textContent = "1.00x";
    raf = requestAnimationFrame(tick);
  });
  collectBtn.addEventListener("click", () => {
    if (active) finish(true);
  });
  render();
})();
