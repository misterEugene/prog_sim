// ============================================================
// app.js - главный контроллер: состояние, события, связь модулей.
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
    history: [],  // снимки points для отмены (Ctrl+Z / кнопка «Отменить»)
    eraser: false, // режим ластика: клик по точке удаляет её
    stats: null    // счётчики действий для авто-проверки шагов гида (см. sanitizeStats)
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
    saveHistory();
    updateUndoBtn();
  }

  function updateUndoBtn() {
    document.getElementById('btn-undo').disabled = state.history.length === 0;
  }

  function undo() {
    if (!state.history.length) { setStatus('Отменять нечего ↩'); return; }
    state.points = state.history.pop();
    state.trained = false; // данные изменились - нужно переобучить
    state.stats.undo++;
    saveHistory();
    updateUndoBtn();
    setStatus('Последнее действие отменено ↩');
    render();
  }

  // ---- Сохранение поля между перезагрузками ----
  // Храним точки, число k и факт обучения (тепловую карту). Тестовые точки -
  // временные, их не сохраняем.
  var FIELD_KEY = 'lesson3Field';
  var HISTORY_KEY = 'lesson3History';

  // Очистить список точек от мусора (валидные x/y и цвет).
  function sanitizePoints(arr) {
    return (Array.isArray(arr) ? arr : []).filter(function (p) {
      return p && typeof p.x === 'number' && typeof p.y === 'number' &&
        (p.label === 'blue' || p.label === 'red');
    });
  }

  // Счётчики действий ребёнка: по ним колонка-гид (guide.js) сама проверяет,
  // выполнен ли шаг. Хранятся вместе с полем и переживают перезагрузку.
  var STAT_KEYS = ['added', 'addedRight', 'erased', 'undo', 'trains',
    'kTo1', 'kTo15', 'kHigh', 'starters', 'clears',
    'fullReveals', 'perfects', 'exports', 'imports',
    'patternVertical', 'patternIsland', 'patternStripes', 'patternQuads'];

  function sanitizeStats(s) {
    var clean = {};
    STAT_KEYS.forEach(function (key) {
      clean[key] = (s && typeof s[key] === 'number' && s[key] >= 0) ? s[key] : 0;
    });
    // При каких k ребёнок сдавал секретный тест (для шага «найди лучшее k»).
    clean.revealKList = (s && Array.isArray(s.revealKList))
      ? s.revealKList.filter(function (k) { return typeof k === 'number'; })
      : [];
    return clean;
  }

  // ---- Узоры для главы «Создатель ИИ» ----
  // Ребёнок должен так расставить точки, чтобы обученная модель выучила заданную
  // картину. Проверяем честно: опрашиваем модель по сетке и сравниваем с целевой
  // функцией. Критерий - полнота (recall) ОБОИХ классов, чтобы «залить всё одним
  // цветом» не засчитывалось (у залитого поля recall второго класса = 0).
  var PATTERNS = {
    patternVertical: {
      name: 'Мир пополам',
      target: function (x, y) { return x < 300 ? 'blue' : 'red'; },
      minRecall: 0.75
    },
    patternIsland: {
      name: 'Остров',
      target: function (x, y) { return Math.hypot(x - 300, y - 300) < 150 ? 'red' : 'blue'; },
      minRecall: 0.7
    },
    patternStripes: {
      name: 'Зебра',
      target: function (x, y) { return (x < 200 || x > 400) ? 'blue' : 'red'; },
      minRecall: 0.7
    },
    patternQuads: {
      name: 'Шахматные углы',
      target: function (x, y) { return ((x < 300) === (y < 300)) ? 'blue' : 'red'; },
      minRecall: 0.65
    }
  };

  function evaluatePatterns() {
    if (!state.trained || !state.points.length) return;
    var grid = CONFIG.HEATMAP_GRID;
    var cell = CONFIG.CANVAS_SIZE / grid;
    Object.keys(PATTERNS).forEach(function (key) {
      if (state.stats[key] >= 1) return; // уже выучен - не пересчитываем
      var p = PATTERNS[key];
      var okB = 0, totB = 0, okR = 0, totR = 0;
      for (var gx = 0; gx < grid; gx++) {
        for (var gy = 0; gy < grid; gy++) {
          var cx = gx * cell + cell / 2;
          var cy = gy * cell + cell / 2;
          var want = p.target(cx, cy);
          var got = knnPredict(cx, cy, state.points, state.k).label;
          if (want === 'blue') { totB++; if (got === 'blue') okB++; }
          else { totR++; if (got === 'red') okR++; }
        }
      }
      var recall = Math.min(okB / totB, okR / totR);
      if (recall >= p.minRecall) {
        state.stats[key] = 1;
        setStatus('🏆 Ура! Твой ИИ выучил узор «' + p.name + '»!');
      }
    });
  }

  // Снимок для guide.js: счётчики + текущее состояние поля. Кладём в глобальную
  // переменную (guide.js грузится позже и читает её при старте) и шлём событием.
  function emitStats() {
    var blue = state.points.filter(function (p) { return p.label === 'blue'; }).length;
    var snap = {};
    STAT_KEYS.forEach(function (key) { snap[key] = state.stats[key]; });
    snap.blue = blue;
    snap.red = state.points.length - blue;
    snap.total = state.points.length;
    snap.trained = state.trained;
    snap.k = state.k;
    snap.revealKCount = state.stats.revealKList.length;
    snap.lastAcc = state.lastAccuracy === null ? -1 : state.lastAccuracy;
    window.LESSON3_STATS = snap;
    document.dispatchEvent(new CustomEvent('lesson3:stats', { detail: snap }));
  }

  function saveField() {
    try {
      localStorage.setItem(FIELD_KEY, JSON.stringify({
        points: state.points, k: state.k, trained: state.trained, stats: state.stats
      }));
    } catch (e) { /* приватный режим / file:// */ }
  }

  function loadField() {
    try {
      var data = JSON.parse(localStorage.getItem(FIELD_KEY) || 'null');
      if (!data || !Array.isArray(data.points)) return;
      state.points = sanitizePoints(data.points);
      if (typeof data.k === 'number' && data.k >= CONFIG.MIN_K && data.k <= CONFIG.MAX_K) state.k = data.k;
      state.trained = data.trained === true && state.points.length > 0;
      state.stats = sanitizeStats(data.stats);
    } catch (e) { /* битые данные - начинаем с пустого поля */ }
  }

  // История отмен переживает перезагрузку: храним стек снимков отдельным ключом,
  // пишем только при изменении истории (не на каждый render).
  function saveHistory() {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history)); }
    catch (e) { /* приватный режим / переполнение квоты */ }
  }

  function loadHistory() {
    try {
      var raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      if (!Array.isArray(raw)) return;
      state.history = raw.map(sanitizePoints);
      if (state.history.length > CONFIG.UNDO_LIMIT) {
        state.history = state.history.slice(state.history.length - CONFIG.UNDO_LIMIT);
      }
    } catch (e) { state.history = []; }
  }

  // ---- Отрисовка всего поля ----
  function render() {
    clearCanvas(ctx);
    if (state.trained) drawHeatmap(ctx, state.points, state.k);
    drawGrid(ctx);
    drawAxes(ctx); // координатные «десятки» и подписи 0..100 по краям
    drawPoints(ctx, state.points);
    drawTestPoints(ctx, state.testPoints, state.testRevealed);
    updateStats();
    evaluatePatterns(); // глава «Создатель ИИ»: не выучила ли модель целевой узор
    saveField();
    emitStats();
  }

  function setStatus(msg) { document.getElementById('status').textContent = msg; }

  function updateStats() {
    const blue = state.points.filter(function (p) { return p.label === 'blue'; }).length;
    const red = state.points.length - blue;
    document.getElementById('stat-points').textContent =
      state.points.length + ' (🔵 ' + blue + ' / 🔴 ' + red + ')';
    document.getElementById('stat-acc').textContent =
      state.lastAccuracy === null ? '-' : state.lastAccuracy + ' / ' + CONFIG.TEST_COUNT;
  }

  // ---- Добавление точек кликом ----
  function canvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scale = CONFIG.CANVAS_SIZE / rect.width;
    return { x: (e.clientX - rect.left) * scale, y: (e.clientY - rect.top) * scale };
  }

  function addPoint(e, label, viaRightClick) {
    pushHistory();
    const pos = canvasPos(e);
    state.points.push({ x: pos.x, y: pos.y, label: label });
    state.trained = false; // данные изменились - нужно переобучить
    state.stats.added++;
    if (viaRightClick) state.stats.addedRight++;
    setStatus((label === 'blue' ? '🔵' : '🔴') + ' Точка поставлена в координатах (' +
      pxToUnit(pos.x) + ', ' + pxToUnit(pos.y) + ')');
    render();
  }

  // ---- Координаты курсора над полем ----
  // Показываем, куда именно попадёт точка: инструкции в гиде говорят координаты
  // («около (20, 15)»), и ребёнок сверяет их с этим табло.
  const coordOut = document.getElementById('coord-readout');

  function showCoords(e) {
    const pos = canvasPos(e);
    coordOut.textContent = 'x: ' + pxToUnit(pos.x) + '   y: ' + pxToUnit(pos.y);
  }

  function hideCoords() {
    coordOut.textContent = 'x: -   y: -';
  }

  // ---- Удаление точки кликом (режим ластика) ----
  // Находит ближайшую точку в радиусе ERASE_RADIUS и удаляет её.
  function eraseAt(e) {
    const pos = canvasPos(e);
    let bestI = -1, bestD = CONFIG.ERASE_RADIUS;
    for (let i = 0; i < state.points.length; i++) {
      const d = Math.hypot(state.points[i].x - pos.x, state.points[i].y - pos.y);
      if (d <= bestD) { bestD = d; bestI = i; }
    }
    if (bestI === -1) { setStatus('Тут нет точки - наведись точнее на кружок 🧽'); return; }
    pushHistory();
    state.points.splice(bestI, 1);
    state.trained = false; // данные изменились - нужно переобучить
    state.stats.erased++;
    render();
  }

  function updateEraser() {
    const btn = document.getElementById('eraser-toggle');
    btn.textContent = state.eraser ? '🧽 Ластик: ВКЛ' : '🧽 Ластик: выкл';
    btn.classList.toggle('eraser-on', state.eraser);
    canvas.classList.toggle('erasing', state.eraser);
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
    // Для авто-проверки шагов: тест «сдан», если ребёнок ответил на все точки.
    const filled = answers.filter(function (a) { return a === 'blue' || a === 'red'; }).length;
    if (filled === CONFIG.TEST_COUNT && !state.testRevealed) {
      state.stats.fullReveals++;
      if (correct === CONFIG.TEST_COUNT) state.stats.perfects++;
      // запомним, при каком k сдан тест (шаг «найди лучшее k»)
      if (state.stats.revealKList.indexOf(state.k) === -1) state.stats.revealKList.push(state.k);
    }
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
    state.stats.clears++;
    document.getElementById('answers').innerHTML = '';
    document.getElementById('test-panel').classList.remove('active');
    setStatus('Поле очищено - начни заново!');
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
    state.stats.exports++;
    saveField();
    emitStats();
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
        state.stats.imports++;
        setStatus('Загружено точек: ' + state.points.length + ' 📥');
        render();
      } catch (err) { setStatus('Не удалось прочитать файл 😕'); }
    };
    reader.readAsText(file);
  }

  // ---- Привязка событий ----
  canvas.addEventListener('click', function (e) {
    if (state.eraser) { eraseAt(e); return; }
    addPoint(e, state.activeColor);
  });
  canvas.addEventListener('mousemove', showCoords);
  canvas.addEventListener('mouseleave', hideCoords);
  canvas.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    if (state.eraser) { eraseAt(e); return; }
    addPoint(e, other(state.activeColor), true);
  });

  slider.addEventListener('input', function () {
    state.k = +slider.value;
    kValue.textContent = slider.value;
    if (state.trained) {
      // считаем «крайние» значения k только на обученной модели -
      // тогда ребёнок видит, как меняется карта (это проверяет гид)
      if (state.k === CONFIG.MIN_K) state.stats.kTo1++;
      if (state.k === CONFIG.MAX_K) state.stats.kTo15++;
      if (state.k >= 12) state.stats.kHigh++;
      render(); // тепловая карта зависит от k - обновим вживую
    } else {
      saveField();  // без обучения render не зовём - сохраним k отдельно
      emitStats();
    }
  });

  document.getElementById('color-toggle').onclick = function () {
    state.activeColor = other(state.activeColor); updateToggle();
  };
  document.getElementById('eraser-toggle').onclick = function () {
    state.eraser = !state.eraser; updateEraser();
    setStatus(state.eraser
      ? 'Режим ластика 🧽 - кликай по точкам, чтобы удалять их. Выключи кнопку, чтобы снова рисовать.'
      : 'Ластик выключен - снова рисуем точки 🔵🔴');
  };
  document.getElementById('btn-train').onclick = function () {
    if (!state.points.length) { setStatus('Сначала нанеси точки!'); return; }
    state.trained = true; state.stats.trains++;
    setStatus('Модель обучена - смотри тепловую карту! 🧠'); render();
  };
  document.getElementById('btn-starter').onclick = function () {
    pushHistory();
    state.points = makeStarter(); state.trained = false;
    state.stats.starters++;
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
    state.stats = sanitizeStats(null); // счётчики авто-проверки тоже с нуля
    saveHistory();
    document.getElementById('answers').innerHTML = '';
    document.getElementById('test-panel').classList.remove('active');
    updateUndoBtn();
    setStatus('Урок начат заново - поле очищено! 👇');
    render();
  });

  // Ctrl+Z (или ⌘+Z) - отмена. e.code === 'KeyZ' срабатывает и в русской
  // раскладке (где физическая клавиша Z даёт «я»). Shift+Ctrl+Z не трогаем.
  // Ctrl+U - запасное сочетание: на macOS ⌘+Z иногда перехватывает браузер
  // (страница «уходит» вместо отмены), а Ctrl (не ⌘) там свободен.
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey &&
        (e.code === 'KeyZ' || e.code === 'KeyU')) {
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
  state.stats = sanitizeStats(null); // нули по умолчанию (loadField перезапишет)
  loadField();   // восстановить точки/k/обучение из прошлой сессии
  loadHistory(); // восстановить стек отмены - Ctrl+Z работает и после F5
  slider.value = state.k;
  kValue.textContent = state.k;
  updateToggle();
  updateEraser();
  updateUndoBtn();
  hideCoords();
  setStatus(state.points.length
    ? 'С возвращением! Твои точки на месте (' + state.points.length + '). Продолжай 👇'
    : 'Привет! Нанеси точки или загрузи стартовый датасет 👇');
  render();
})();
