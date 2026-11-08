(() => {
  const tg = window.Telegram?.WebApp;
  tg?.ready(); tg?.expand();
  const $ = id => document.getElementById(id);
  const playBtn = $("play"), collectBtn = $("collect"), stage = $("stage");
  const BET = 3500;
  const START_BALANCE = 68000;
  const BALANCE_KEY = "karschiki_balance_v2";
  const HISTORY_KEY = "karschiki_history_v2";
  const BEST_KEY = "karschiki_best_v2";


  function readJSON(key, fallback) {
    try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; }
    catch (_) { return fallback; }
  }
  function initialBalance() {
    const saved = Number(localStorage.getItem(BALANCE_KEY));
    if (Number.isFinite(saved) && saved >= 0) return saved;
    // Переносим баланс из предыдущей локальной регистрации, если она была.
    try {
      const users = JSON.parse(localStorage.getItem("karschiki_local_users_v1") || "{}");
      const current = localStorage.getItem("karschiki_current_user_v1");
      if (current && users[current] && Number.isFinite(Number(users[current].balance))) return Number(users[current].balance);
    } catch (_) {}
    return START_BALANCE;
  }
  let balance = initialBalance();
  let best = Number(localStorage.getItem(BEST_KEY)) || 0;
  let history = readJSON(HISTORY_KEY, []);
  if (!Array.isArray(history)) history = [];
  let active = false, multiplier = 1, crashAt = 0, startTime = 0, raf = null;

  const fmt = n => Math.floor(n).toLocaleString("ru-RU");
  function save() {
    try {
      localStorage.setItem(BALANCE_KEY, String(balance));
      localStorage.setItem(BEST_KEY, String(best));
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
    } catch (_) { $("hint").textContent = "Не удалось сохранить данные браузера."; }
  }
  function render() {
    $("balance").textContent = fmt(balance);
    $("best").textContent = best ? best.toFixed(2) + "x" : "—";
    save();
  }
  function renderHistory() {
    $("historyList").innerHTML = history.length ? history.slice(0, 7).map(v =>
      `<span class="history-chip" style="color:${v>=2?'#65d6a5':'#ff8797'}">${Number(v).toFixed(2)}x</span>`
    ).join("") : '<span class="empty">Пока нет завершённых поездок</span>';
  }
  function addHistory(value) {
    history.unshift(Number(value)); history = history.slice(0, 30);
    renderHistory(); save();
  }
  function topUpBalance() {
    const input = $("topupAmount");
    const message = $("topupMessage");
    const amount = Number(input.value);
    if (!Number.isSafeInteger(amount) || amount < 1) {
      message.textContent = "Введи целую сумму от 1 ₽.";
      return;
    }
    balance += amount;
    render();
    message.textContent = `Баланс пополнен на ${fmt(amount)} виртуальных рублей.`;
    input.value = "";
  }
  $("topupApply").addEventListener("click", topUpBalance);
  $("topupAmount").addEventListener("keydown", e => { if (e.key === "Enter") topUpBalance(); });

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
      const earned = Math.floor(BET * multiplier);
      balance += earned;
      best = Math.max(best, multiplier);
      $("status").textContent = `ЗАЧИСЛЕНО: +${fmt(earned)} РУБЛЕЙ`;
      $("hint").textContent = "Выигрыш добавлен к виртуальному балансу.";
    } else {
      $("status").textContent = "ПОЕЗДКА ЗАВЕРШЕНА";
      $("hint").textContent = "Не повезло. Попробуй ещё раз!";
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
    const x = Math.min(78, 16 + elapsed * 5.2);
    const y = Math.max(18, 55 - elapsed * 3.1);
    $("plane").style.left = x + "%";
    $("plane").style.top = y + "%";
    $("trail").style.width = Math.max(0, (x - 12) * 1.05) + "%";
    raf = requestAnimationFrame(tick);
  }
  playBtn.addEventListener("click", () => {
    if (active || balance < BET) {
      if (balance < BET) $("hint").textContent = "Недостаточно виртуальных рублей. Пополни баланс выше.";
      return;
    }
    balance -= BET; render();
    multiplier = 1; crashAt = 1.15 + Math.random() * 7.85;
    startTime = performance.now(); active = true;
    playBtn.disabled = true; collectBtn.disabled = false;
    stage.classList.add("flying");
    $("status").textContent = "ПОГРУЗЧИК ВЗЛЕТЕЛ";
    $("hint").textContent = "Нажми «Забрать деньги» до завершения поездки.";
    resetPlane(); stage.classList.add("flying");
    $("multiplier").textContent = "1.00x";
    raf = requestAnimationFrame(tick);
  });
  collectBtn.addEventListener("click", () => { if (active) finish(true); });

  render(); renderHistory();
})();
