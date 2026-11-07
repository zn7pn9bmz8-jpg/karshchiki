(() => {
  const tg = window.Telegram?.WebApp;
  tg?.ready(); tg?.expand();
  const $ = id => document.getElementById(id);
  const playBtn = $("play"), collectBtn = $("collect");
  let balance = 1000, best = 0, active = false, crashed = false;
  let multiplier = 1, crashAt = 0, startTime = 0, raf = null, history = [];

  const fmt = n => Math.floor(n).toLocaleString("ru-RU");
  function render() {
    $("balance").textContent = fmt(balance);
    $("best").textContent = best ? best.toFixed(2) + "x" : "—";
  }
  function addHistory(value) {
    history.unshift(value); history = history.slice(0, 7);
    $("historyList").innerHTML = history.map(v =>
      `<span class="history-chip" style="color:${v>=2?'#65d6a5':'#ff7b84'}">${v.toFixed(2)}x</span>`
    ).join("");
  }
  function finish(collected) {
    active = false; crashed = true;
    cancelAnimationFrame(raf);
    collectBtn.disabled = true; playBtn.disabled = false;
    if (collected) {
      const earned = Math.floor(50 * multiplier);
      balance += earned;
      best = Math.max(best, multiplier);
      $("status").textContent = `ЗАФИКСИРОВАНО: +${fmt(earned)} ОЧКОВ`;
      $("hint").textContent = "Отличный полёт! Очки доступны только внутри игры.";
    } else {
      $("status").textContent = "ПОЛЁТ ЗАВЕРШЁН";
      $("hint").textContent = "Попробуй ещё раз — это случайная аркадная игра.";
    }
    addHistory(multiplier); render();
    $("plane").style.left = "78%"; $("plane").style.top = "18%";
  }
  function tick(now) {
    if (!active) return;
    const elapsed = (now - startTime) / 1000;
    multiplier = Math.exp(elapsed * 0.19);
    if (multiplier >= crashAt) {
      multiplier = crashAt; $("multiplier").textContent = multiplier.toFixed(2)+"x";
      finish(false); return;
    }
    $("multiplier").textContent = multiplier.toFixed(2)+"x";
    $("plane").style.left = Math.min(78, 16 + elapsed*5.2)+"%";
    $("plane").style.top = Math.max(18, 53 - elapsed*3.1)+"%";
    raf = requestAnimationFrame(tick);
  }
  playBtn.addEventListener("click", () => {
    if (active || balance < 50) {
      if (balance < 50) $("hint").textContent = "Недостаточно виртуальных очков. В демо-версии баланс можно восстановить перезапуском.";
      return;
    }
    balance -= 50; render();
    multiplier = 1; crashAt = 1.15 + Math.random() * 7.85;
    startTime = performance.now(); active = true; crashed = false;
    playBtn.disabled = true; collectBtn.disabled = false;
    $("status").textContent = "САМОЛЁТ ВЗЛЕТЕЛ";
    $("hint").textContent = "Нажми «Зафиксировать очки» до завершения полёта.";
    $("plane").style.left = "16%"; $("plane").style.top = "53%";
    $("multiplier").textContent = "1.00x";
    raf = requestAnimationFrame(tick);
  });
  collectBtn.addEventListener("click", () => {
    if (!active) return;
    finish(true);
  });
  render();
})();
