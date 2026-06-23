// ============================================================
// app.js — главный контроллер: состояние, события, связь модулей.
// ============================================================

(function () {
  const canvas = document.getElementById('field');
  const ctx = canvas.getContext('2d');
  const slider = document.getElementById('k-slider');
  const kValue = document.getElementById('k-value');

  const state = {
    points: [],
    k: CONFIG.DEFAULT_K,
    activeColor: 'blue',
    testPoints: [],
    testRevealed: false,
    trained: false,
    lastAccuracy: null,
    history: []   // снимки points для отмены (Ctrl+Z / кнопка «Отменить»)
  };

  // ---- История для отмены ----
  // Перед каждым изменением набора точек сохраняем его копию. undo() возвращает
  // предыдущее состояние: отменяется и постановка точки, и очистка/стартовый
  // набор/импорт.
  function snapshot() {
    return state.points.map(function (p) { return { x: p.x, y: p.y, label: p.label }; });
  }

  function pushHistory() {
    state.history.push(snapshot());
    if (state.history.length > CONFIG.UNDO_LIMIT) state.history.shift();
    updateUndoBtn();
  }

  function updateUndoBtn() {
    document.getElementById('btn-undo').disabled = state.history.length === 0;
  }

  function undo() {
    if (!state.history.length) { setStatus('Отменять нечего ↩'); return; }
    state.points = state.history.pop();
    state.trained = false; // данные изменились — нужно переобучить
    updateUndoBtn();
    setStatus('Последнее действие отменено ↩');
    render();
  }

  // ---- Отрисовка всего поля ----
  function render() {
    clearCanvas(ctx);
    if (state.trained) drawHeatmap(ctx, state.points, state.k);
    drawGrid(ctx);
    drawPoints(ctx, state.points);
    drawTestPoints(ctx, state.testPoints, state.testRevealed);
    updateStats();
  }

  function setStatus(msg) { document.getElementById('status').textContent = msg; }

  function updateStats() {
    const blue = state.points.filter(function (p) { return p.label === 'blue'; }).length;
    const red = state.points.length - blue;
    document.getElementById('stat-points').textContent =
      state.points.length + ' (🔵 ' + blue + ' / 🔴 ' + red + ')';
    document.getElementById('stat-acc').textContent =
      state.lastAccuracy === null ? '—' : state.lastAccuracy + ' / ' + CONFIG.TEST_COUNT;
  }

  // ---- Добавление точек кликом ----
  function canvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scale = CONFIG.CANVAS_SIZE / rect.width;
    return { x: (e.clientX - rect.left) * scale, y: (e.clientY - rect.top) * scale };
  }

  function addPoint(e, label) {
    pushHistory();
    const pos = canvasPos(e);
    state.points.push({ x: pos.x, y: pos.y, label: label });
    state.trained = false; // данные изменились — нужно переобучить
    render();
  }

  function other(c) { return c === 'blue' ? 'red' : 'blue'; }

  function updateToggle() {
    const btn = document.getElementById('color-toggle');
    const blue = state.activeColor === 'blue';
    btn.textContent = blue ? '🔵 Рисую: Синий' : '🔴 Рисую: Красный';
    btn.className = blue ? 'btn toggle-blue' : 'btn toggle-red';
  }

  // ---- Стартовый датасет: 15 синих + 15 красных с диагональной границей ----
  function makeStarter() {
    const size = CONFIG.CANVAS_SIZE, n = CONFIG.STARTER_PER_CLASS, gap = 60, m = 35;
    const pts = [];
    function rnd() { return m + Math.random() * (size - 2 * m); }
    let added = 0;
    while (added < n) { const x = rnd(), y = rnd(); if (x < y - gap) { pts.push({ x: x, y: y, label: 'blue' }); added++; } }
    added = 0;
    while (added < n) { const x = rnd(), y = rnd(); if (x > y + gap) { pts.push({ x: x, y: y, label: 'red' }); added++; } }
    return pts;
  }

  // ---- Секретный тест ----
  function startTest() {
    if (!state.points.length) { setStatus('Сначала нанеси точки и обучи модель!'); return; }
    state.testPoints = generateTestPoints();
    state.testRevealed = false;
    const box = document.getElementById('answers');
    box.innerHTML = '';
    state.testPoints.forEach(function (p, i) {
      const row = document.createElement('div');
      row.className = 'answer-row';
      row.innerHTML = '<label>Точка ' + (i + 1) + ':</label>' +
        '<select data-idx="' + i + '"><option value="">?</option>' +
        '<option value="blue">🔵 Синий</option>' +
        '<option value="red">🔴 Красный</option></select>';
      box.appendChild(row);
    });
    document.getElementById('test-panel').classList.add('active');
    setStatus('Угадай класс каждой серой точки и нажми «Показать ответы»');
    render();
  }

  function revealAnswers() {
    if (!state.testPoints.length) { setStatus('Сначала запусти «Секретный тест»'); return; }
    classifyTestPoints(state.testPoints, state.points, state.k);
    const selects = document.querySelectorAll('#answers select');
    const answers = [];
    selects.forEach(function (s) { answers[+s.dataset.idx] = s.value; });
    const correct = countCorrect(state.testPoints, answers);
    selects.forEach(function (s) {
      const i = +s.dataset.idx;
      s.classList.toggle('correct', s.value === state.testPoints[i].label);
      s.classList.toggle('wrong', !!s.value && s.value !== state.testPoints[i].label);
    });
    state.lastAccuracy = correct;
    state.testRevealed = true;
    setStatus('🎯 Результат: ' + correct + ' из ' + CONFIG.TEST_COUNT + ' правильно!');
    render();
  }

  // ---- Очистка / экспорт / импорт ----
  function clearAll() {
    pushHistory();
    state.points = []; state.testPoints = [];
    state.trained = false; state.testRevealed = false; state.lastAccuracy = null;
    document.getElementById('answers').innerHTML = '';
    document.getElementById('test-panel').classList.remove('active');
    setStatus('Поле очищено — начни заново!');
    render();
  }

  function exportJson() {
    if (!state.points.length) { setStatus('Нет точек для экспорта'); return; }
    const data = JSON.stringify({ k: state.k, points: state.points }, null, 2);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    a.download = 'dataset.json';
    a.click();
    URL.revokeObjectURL(a.href);
    setStatus('Файл dataset.json сохранён 📤');
  }

  function importJson(file) {
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const data = JSON.parse(reader.result);
        const raw = Array.isArray(data) ? data : data.points;
        if (!Array.isArray(raw)) throw new Error('bad');
        pushHistory();
        state.points = raw.filter(function (p) {
          return typeof p.x === 'number' && typeof p.y === 'number' &&
            (p.label === 'blue' || p.label === 'red');
        });
        if (data && data.k) { state.k = data.k; slider.value = data.k; kValue.textContent = data.k; }
        state.trained = false;
        setStatus('Загружено точек: ' + state.points.length + ' 📥');
        render();
      } catch (err) { setStatus('Не удалось прочитать файл 😕'); }
    };
    reader.readAsText(file);
  }

  // ---- Привязка событий ----
  canvas.addEventListener('click', function (e) { addPoint(e, state.activeColor); });
  canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); addPoint(e, other(state.activeColor)); });

  slider.addEventListener('input', function () {
    state.k = +slider.value;
    kValue.textContent = slider.value;
    if (state.trained) render(); // тепловая карта зависит от k — обновим вживую
  });

  document.getElementById('color-toggle').onclick = function () {
    state.activeColor = other(state.activeColor); updateToggle();
  };
  document.getElementById('btn-train').onclick = function () {
    if (!state.points.length) { setStatus('Сначала нанеси точки!'); return; }
    state.trained = true; setStatus('Модель обучена — смотри тепловую карту! 🧠'); render();
  };
  document.getElementById('btn-starter').onclick = function () {
    pushHistory();
    state.points = makeStarter(); state.trained = false;
    setStatus('Загружен стартовый датасет (30 точек). Нажми «Обучить»!'); render();
  };
  document.getElementById('btn-test').onclick = startTest;
  document.getElementById('btn-reveal').onclick = revealAnswers;
  document.getElementById('btn-clear').onclick = clearAll;
  document.getElementById('btn-undo').onclick = undo;

  // «Начать заново» из колонки-гида (guide.js): полный сброс поля и истории.
  document.addEventListener('lesson3:restart', function () {
    state.points = []; state.testPoints = [];
    state.trained = false; state.testRevealed = false; state.lastAccuracy = null;
    state.history = [];
    document.getElementById('answers').innerHTML = '';
    document.getElementById('test-panel').classList.remove('active');
    updateUndoBtn();
    setStatus('Урок начат заново — поле очищено! 👇');
    render();
  });

  // Ctrl+Z (или ⌘+Z) — отмена. e.code === 'KeyZ' срабатывает и в русской
  // раскладке (где физическая клавиша Z даёт «я»). Shift+Ctrl+Z не трогаем.
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.code === 'KeyZ') {
      e.preventDefault();
      undo();
    }
  });
  document.getElementById('btn-export').onclick = exportJson;
  document.getElementById('file-import').addEventListener('change', function (e) {
    if (e.target.files[0]) importJson(e.target.files[0]);
    e.target.value = '';
  });

  // ---- Старт ----
  slider.value = CONFIG.DEFAULT_K;
  kValue.textContent = CONFIG.DEFAULT_K;
  updateToggle();
  updateUndoBtn();
  setStatus('Привет! Нанеси точки или загрузи стартовый датасет 👇');
  render();
})();
