(() => {
  const tg = window.Telegram?.WebApp;
  tg?.ready(); tg?.expand();
  const $ = id => document.getElementById(id);
  const playBtn = $("play"), collectBtn = $("collect"), stage = $("stage");
  const BET = 3500;
  const BALANCE_KEY = "karschiki_balance";
  const REDEEMED_KEY = "karschiki_redeemed_promos_v1";
  const MAX_PROFILE_URL = "https://max.ru/u/f9LHodD0cOLneOcaWjEmFgBMwk43kHjgXIXkgV5Iri4Pyzd-kON9N1Y9ptg";

  // Промокоды для начисления виртуальных рублей. Каждый код действует один раз в этом браузере.
  const PROMO_CODES = {
    "START5000": 5000,
    "BONUS10000": 10000,
    "KARSH25000": 25000,
    "KARSH50000": 50000,
    "KARSH100000": 100000
  };

  let balance = (() => {
    try {
      const saved = localStorage.getItem(BALANCE_KEY);
      return saved === null ? 68000 : Math.max(0, Number(saved) || 0);
    } catch (_) { return 68000; }
  })();
  let redeemed = (() => {
    try {
      const value = JSON.parse(localStorage.getItem(REDEEMED_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
  })();
  let best = 0, active = false;
  let multiplier = 1, crashAt = 0, startTime = 0, raf = null, history = [];

  const fmt = n => Math.floor(n).toLocaleString("ru-RU");
  function render() {
    try {
      localStorage.setItem(BALANCE_KEY, String(balance));
      localStorage.setItem(REDEEMED_KEY, JSON.stringify(redeemed));
    } catch (_) {
      $("hint").textContent = "Не удалось сохранить данные браузера.";
    }
    $("balance").textContent = fmt(balance);
    $("best").textContent = best ? best.toFixed(2) + "x" : "—";
  }

  function applyPromo() {
    const input = $("promoInput");
    const message = $("promoMessage");
    const code = input.value.trim().toUpperCase();
    if (!code) { message.textContent = "Введи промокод."; return; }
    const amount = PROMO_CODES[code];
    if (!amount) { message.textContent = "Такого промокода нет."; return; }
    if (redeemed.includes(code)) { message.textContent = "Этот промокод уже активирован в этом браузере."; return; }
    balance += amount;
    redeemed.push(code);
    render();
    message.textContent = `Успешно! Начислено ${fmt(amount)} ₽.`;
    input.value = "";
  }

  $("promoApply").addEventListener("click", applyPromo);
  $("promoInput").addEventListener("keydown", event => {
    if (event.key === "Enter") applyPromo();
  });

  function addHistory(value) {
    history.unshift(value); history = history.slice(0, 7);
    $("historyList").innerHTML = history.map(v =>
      `<span class="history-chip" style="color:${v >= 2 ? '#65d6a5' : '#ff8797'}">${v.toFixed(2)}x</span>`
    ).join("");
  }
  function resetPlane() {
    $("plane").classList.remove("crash-flyaway", "bump");
    $("plane").style.left = "16%";
    $("plane").style.top = "55%";
    $("plane").style.opacity = "";
    $("plane").style.transform = "";
    $("trail").style.width = "0";
    stage.classList.remove("flying");
  }

  // При аварийном завершении погрузчик резко вылетает за край игрового поля.
  const crashStyle = document.createElement("style");
  crashStyle.textContent = `
    #plane.crash-flyaway {
      animation: karshik-flyaway 650ms cubic-bezier(.35,.02,.85,.35) forwards !important;
      pointer-events: none;
      transform-origin: center center;
      z-index: 20;
    }
    @keyframes karshik-flyaway {
      0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; }
      18% { transform: translate(-5px, 8px) rotate(-8deg) scale(1.04); opacity: 1; }
      100% { transform: translate(125vw, -115vh) rotate(38deg) scale(.55); opacity: 0; }
    }
  `;
  document.head.appendChild(crashStyle);

  function finish(collected) {
    active = false;
    cancelAnimationFrame(raf);
    collectBtn.disabled = true;
    playBtn.disabled = false;
    stage.classList.remove("flying");
    if (collected) {
      const earned = Math.floor(BET * multiplier);
      balance += earned;
      best = Math.max(best, multiplier);
      $("status").textContent = `ЗАЧИСЛЕНО: +${fmt(earned)} РУБЛЕЙ`;
      $("hint").textContent = "Выигрыш добавлен к виртуальному балансу.";
    } else {
      $("status").textContent = `ПОЕЗДКА ЗАВЕРШЕНА — ${multiplier.toFixed(2)}x`;
      $("hint").textContent = `Ушёл в минус на ${fmt(BET)} ₽. Попробуй ещё раз!`;
      $("plane").classList.remove("crash-flyaway");
    }
    addHistory(multiplier);
    render();
  }
  function tick(now) {
    if (!active) return;
    const elapsed = (now - startTime) / 1000;
    multiplier = Math.exp(elapsed * 0.19);
    if (multiplier >= crashAt) {
      multiplier = crashAt;
      $("multiplier").textContent = multiplier.toFixed(2) + "x";
      // Сразу блокируем управление, затем проигрываем вылет и завершаем поездку.
      active = false;
      cancelAnimationFrame(raf);
      collectBtn.disabled = true;
      playBtn.disabled = true;
      stage.classList.remove("flying");
      $("status").textContent = "ПОГРУЗЧИК СРЫВАЕТСЯ!";
      $("hint").textContent = "Поездка завершается...";
      const plane = $("plane");
      plane.classList.remove("bump");
      void plane.offsetWidth;
      plane.classList.add("crash-flyaway");
      const complete = () => {
        plane.removeEventListener("animationend", onFlyawayEnd);
        finish(false);
      };
      const onFlyawayEnd = event => {
        if (event.animationName === "karshik-flyaway") complete();
      };
      plane.addEventListener("animationend", onFlyawayEnd);
      // Запасной вариант на случай, если браузер не отправит animationend.
      window.setTimeout(() => {
        if (playBtn.disabled) complete();
      }, 750);
      return;
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
      if (balance < BET) $("hint").textContent = "Недостаточно виртуальных рублей. Пополни счёт через кнопку ниже.";
      return;
    }
    balance -= BET;
    render();
    multiplier = 1;
    crashAt = 1.15 + Math.random() * 7.85;
    startTime = performance.now();
    active = true;
    playBtn.disabled = true;
    collectBtn.disabled = false;
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
