(() => {
  const tg = window.Telegram?.WebApp;
  tg?.ready(); tg?.expand();
  const $ = id => document.getElementById(id);
  const playBtn = $("play"), collectBtn = $("collect"), stage = $("stage");
  const BET = 3500;
  const START_BALANCE = 68000;
  const USERS_KEY = "karschiki_local_users_v1";
  const CURRENT_KEY = "karschiki_current_user_v1";

  let users = readUsers();
  let currentKey = localStorage.getItem(CURRENT_KEY) || "";
  let currentUser = currentKey && users[currentKey] ? users[currentKey] : null;
  let balance = currentUser?.balance ?? START_BALANCE;
  let best = currentUser?.best ?? 0;
  let history = Array.isArray(currentUser?.history) ? currentUser.history : [];
  let active = false, multiplier = 1, crashAt = 0, startTime = 0, raf = null;

  function readUsers() {
    try {
      const parsed = JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (_) { return {}; }
  }
  const fmt = n => Math.floor(n).toLocaleString("ru-RU");
  function saveUser() {
    if (!currentUser || !currentKey) return;
    currentUser.balance = balance;
    currentUser.best = best;
    currentUser.history = history.slice(0, 30);
    users[currentKey] = currentUser;
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      localStorage.setItem(CURRENT_KEY, currentKey);
    } catch (_) {
      $("hint").textContent = "Не удалось сохранить данные браузера. Проверь свободное место.";
    }
  }
  function render() {
    $("balance").textContent = fmt(balance);
    $("best").textContent = best ? best.toFixed(2) + "x" : "—";
    if (currentUser) {
      $("accountName").textContent = currentUser.username;
      $("accountBar").hidden = false;
    }
    saveUser();
  }
  function renderHistory() {
    $("historyList").innerHTML = history.length ? history.slice(0, 7).map(v =>
      `<span class="history-chip" style="color:${v>=2?'#65d6a5':'#ff8797'}">${Number(v).toFixed(2)}x</span>`
    ).join("") : '<span class="empty">Пока нет завершённых поездок</span>';
  }
  function addHistory(value) {
    history.unshift(Number(value)); history = history.slice(0, 30);
    renderHistory(); saveUser();
  }
  function showAuth(message = "") {
    if (active) return;
    $("authMessage").textContent = message;
    $("authOverlay").style.display = "flex";
    $("accountBar").hidden = true;
    setTimeout(() => $("authUsername").focus(), 0);
  }
  function enterAccount(key, user) {
    currentKey = key; currentUser = user;
    balance = Number.isFinite(user.balance) ? user.balance : START_BALANCE;
    best = Number.isFinite(user.best) ? user.best : 0;
    history = Array.isArray(user.history) ? user.history : [];
    $("authOverlay").style.display = "none";
    $("hint").textContent = "Аккаунт сохранён в этом браузере. Удачной игры!";
    render(); renderHistory();
  }
  function credentials() {
    const username = $("authUsername").value.trim();
    const password = $("authPassword").value;
    if (!/^[\p{L}\p{N}_-]{3,18}$/u.test(username)) {
      throw new Error("Логин: 3–18 символов, только буквы, цифры, _ или -.");
    }
    if (password.length < 4 || password.length > 40) {
      throw new Error("Пароль должен содержать от 4 до 40 символов.");
    }
    return { username, password, key: username.toLocaleLowerCase("ru-RU") };
  }
  $("registerBtn").addEventListener("click", () => {
    try {
      const { username, password, key } = credentials();
      if (users[key]) throw new Error("Такой логин уже есть в этом браузере. Нажми «Войти».");
      const user = { username, password, balance: START_BALANCE, best: 0, history: [], createdAt: Date.now() };
      users[key] = user;
      currentUser = user; currentKey = key;
      try {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        localStorage.setItem(CURRENT_KEY, currentKey);
      } catch (_) { delete users[key]; currentUser = null; currentKey = ""; throw new Error("Браузер не разрешил сохранить аккаунт."); }
      enterAccount(key, user);
    } catch (error) { $("authMessage").textContent = error.message; }
  });
  $("loginBtn").addEventListener("click", () => {
    try {
      const { password, key } = credentials();
      const user = users[key];
      if (!user || user.password !== password) throw new Error("Неверный логин или пароль.");
      enterAccount(key, user);
    } catch (error) { $("authMessage").textContent = error.message; }
  });
  $("authForm").addEventListener("submit", e => e.preventDefault());
  $("switchAccount").addEventListener("click", () => {
    if (active) return;
    localStorage.removeItem(CURRENT_KEY);
    currentKey = ""; currentUser = null;
    showAuth("Войди в другой аккаунт или создай новый.");
  });

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
    if (!currentUser) { showAuth("Сначала войди в аккаунт."); return; }
    if (active || balance < BET) {
      if (balance < BET) $("hint").textContent = "Недостаточно виртуальных рублей. Получи бонус или введи промокод.";
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

  if (currentUser) {
    enterAccount(currentKey, currentUser);
  } else {
    showAuth();
    renderHistory();
  }
})();
