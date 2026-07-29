// ============================================================
// app.js - главный контроллер: состояние, события, связь модулей.
// ============================================================

(function () {
  const canvas = document.getElementById('field');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('overlay');
  const octx = overlay.getContext('2d');
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
    inspector: false, // режим инспектора: клик по точке выделяет её (не рисует)
    selected: [],  // выделенные инспектором точки (ссылки на объекты из points)
    hover: null,   // позиция курсора над полем в px ({x, y}) или null
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
    // сколько тестов сдано на «маленьких» и «больших» данных и при конкретных k
    // (шаги «сколько данных нужно?» и «повторяемость эксперимента»)
    'revealSmall', 'revealBig', 'revealK5', 'revealK7', 'revealK15',
    // выученные узоры главы «Создатель ИИ»
    'patternVertical', 'patternIsland', 'patternStripes', 'patternQuads',
    'patternDiag', 'patternRing', 'patternBands4', 'patternCross',
    'patternSpots3', 'patternTshape',
    // карта поделена между классами по-честному (для шага «свой узор»)
    'balancedMap'];

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
    },
    patternDiag: {
      name: 'Диагональ',
      target: function (x, y) { return x < y ? 'blue' : 'red'; },
      minRecall: 0.75
    },
    patternRing: {
      name: 'Бублик',
      target: function (x, y) {
        var d = Math.hypot(x - 300, y - 300);
        return (d > 120 && d < 215) ? 'red' : 'blue';
      },
      minRecall: 0.6
    },
    patternBands4: {
      name: 'Четыре полосы',
      target: function (x, y) { return Math.floor(x / 150) % 2 === 0 ? 'blue' : 'red'; },
      minRecall: 0.65
    },
    patternCross: {
      name: 'Крест',
      target: function (x, y) {
        return (Math.abs(x - 300) < 90 || Math.abs(y - 300) < 90) ? 'red' : 'blue';
      },
      minRecall: 0.6
    },
    patternSpots3: {
      name: 'Три острова',
      target: function (x, y) {
        var spots = [[150, 150], [450, 150], [300, 450]];
        for (var i = 0; i < spots.length; i++) {
          if (Math.hypot(x - spots[i][0], y - spots[i][1]) < 95) return 'red';
        }
        return 'blue';
      },
      minRecall: 0.6
    },
    patternTshape: {
      name: 'Буква Т',
      target: function (x, y) {
        return (y < 150 || Math.abs(x - 300) < 80) ? 'red' : 'blue';
      },
      minRecall: 0.6
    }
  };

  // Узоров много, поэтому предсказания модели по сетке считаем ОДИН раз, а потом
  // сравниваем эту карту с целевой функцией каждого узора.
  // Узор засчитывается КАЖДЫЙ раз, когда обученная модель его показала (счётчик,
  // а не флаг): гид проверяет узор через прирост от начала шага, иначе случайно
  // подошедший чужой датасет «сдавал» бы будущие шаги за ребёнка. Чтобы один
  // «🧠 Обучить» не накручивал счётчик на каждой перерисовке, помним, какие узоры
  // уже показаны текущей моделью (patternHot), и сбрасываем эту память, как только
  // данные изменились (тогда trained = false и мы уходим по раннему возврату).
  function evaluatePatterns() {
    if (!state.trained || !state.points.length) { state.patternHot = {}; return; }
    var grid = CONFIG.HEATMAP_GRID;
    var cell = CONFIG.CANVAS_SIZE / grid;
    var got = [];      // предсказания модели по ячейкам
    var cxs = [], cys = [];
    var blueCells = 0;
    for (var gx = 0; gx < grid; gx++) {
      for (var gy = 0; gy < grid; gy++) {
        var cx = gx * cell + cell / 2;
        var cy = gy * cell + cell / 2;
        var label = knnPredict(cx, cy, state.points, state.k).label;
        got.push(label); cxs.push(cx); cys.push(cy);
        if (label === 'blue') blueCells++;
      }
    }
    var cells = got.length;

    var hot = state.patternHot || (state.patternHot = {});
    Object.keys(PATTERNS).forEach(function (key) {
      var p = PATTERNS[key];
      var okB = 0, totB = 0, okR = 0, totR = 0;
      for (var i = 0; i < cells; i++) {
        var want = p.target(cxs[i], cys[i]);
        if (want === 'blue') { totB++; if (got[i] === 'blue') okB++; }
        else { totR++; if (got[i] === 'red') okR++; }
      }
      var recall = Math.min(okB / totB, okR / totR);
      var matched = recall >= p.minRecall;
      if (matched && !hot[key]) {
        state.stats[key] = (state.stats[key] || 0) + 1;
        setStatus('🏆 Ура! Твой ИИ выучил узор «' + p.name + '»!');
      }
      hot[key] = matched;
    });

    // Шаг «свой узор»: карта честно поделена между классами (у каждого не меньше
    // 30% поля) на достаточном датасете - значит, ребёнок собрал осмысленные данные,
    // а не залил всё одним цветом.
    var share = Math.min(blueCells, cells - blueCells) / cells;
    var balanced = state.points.length >= 30 && share >= 0.3;
    if (balanced && !hot.balancedMap) {
      state.stats.balancedMap++;
      setStatus('🎨 Отличный датасет: твой ИИ честно поделил поле между цветами!');
    }
    hot.balancedMap = balanced;
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
    // Сами точки в координатах поля 0..100 - по ним гид честно проверяет
    // геометрические задания («поставь точку около (50, 10)»).
    snap.pts = state.points.map(function (p) {
      return { x: pxToUnit(p.x), y: pxToUnit(p.y), label: p.label };
    });
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
    if (pruneSelection()) renderSelection(); // выделенные точки могли исчезнуть
    renderOverlay();    // подписи инспектора зависят от набора точек
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
  // («около (20, 15)»), и ребёнок сверяет их с прицелом у курсора и табло.
  const coordOut = document.getElementById('coord-readout');

  function showCoords(e) {
    state.hover = canvasPos(e);
    coordOut.textContent =
      'x: ' + pxToUnit(state.hover.x) + '   y: ' + pxToUnit(state.hover.y);
    renderOverlay();
  }

  function hideCoords() {
    state.hover = null;
    coordOut.textContent = 'x: -   y: -';
    renderOverlay();
  }

  // ---- Линейки с числами вокруг поля ----
  // Деления ставим в процентах от ширины/высоты линейки: они совпадают с сеткой
  // поля при любом его размере (поле резиновое, см. style.css).
  function buildRulers() {
    const step = CONFIG.AXIS_LABEL_STEP;
    const rx = document.getElementById('ruler-x');
    const ry = document.getElementById('ruler-y');
    rx.innerHTML = '';
    ry.innerHTML = '';
    const max = CONFIG.AXIS_UNITS;
    for (let u = 0; u <= max; u += step) {
      const pct = (u / max * 100) + '%';
      // Крайние подписи (0 и 100) прижимаем внутрь, иначе половина числа
      // вылезает за поле и обрезается.
      const sx = document.createElement('span');
      sx.textContent = u;
      sx.style.left = pct;
      if (u === 0) sx.style.transform = 'translateX(0)';
      if (u === max) sx.style.transform = 'translateX(-100%)';
      rx.appendChild(sx);
      const sy = document.createElement('span');
      sy.textContent = u;
      sy.style.top = pct;
      if (u === 0) sy.style.transform = 'translateY(0)';
      if (u === max) sy.style.transform = 'translateY(-100%)';
      ry.appendChild(sy);
    }
  }

  // ---- Инспектор точек ----
  // Отдельный режим: клик не рисует, а выделяет точку; у всех точек видны их
  // координаты. Нужен, чтобы проверить «а куда я на самом деле поставил точку».

  // Индекс точки под курсором (или -1).
  function pointAt(pos) {
    let bestI = -1, bestD = CONFIG.POINT_RADIUS + 8;
    for (let i = 0; i < state.points.length; i++) {
      const d = Math.hypot(state.points[i].x - pos.x, state.points[i].y - pos.y);
      if (d <= bestD) { bestD = d; bestI = i; }
    }
    return bestI;
  }

  // Слой поверх поля: прицел под курсором + подписи точек в режиме инспектора.
  function renderOverlay() {
    clearOverlay(octx);
    let hoverIdx = -1;
    if (state.inspector) {
      hoverIdx = state.hover ? pointAt(state.hover) : -1;
      drawPointLabels(octx, state.points, state.selected, hoverIdx);
    }
    if (state.hover) drawCrosshair(octx, state.hover, hoverIdx === -1);
  }

  // Список выделенных точек с координатами (под полем).
  function renderSelection() {
    const box = document.getElementById('selected-list');
    box.innerHTML = '';
    if (!state.selected.length) {
      const li = document.createElement('li');
      li.className = 'empty';
      li.textContent = 'Пока ничего не выделено - щёлкни по точке на поле.';
      box.appendChild(li);
      return;
    }
    state.selected.forEach(function (p, n) {
      const li = document.createElement('li');
      li.textContent = (n + 1) + ') ' + (p.label === 'blue' ? '🔵' : '🔴') +
        ' x: ' + pxToUnit(p.x) + '  y: ' + pxToUnit(p.y);
      box.appendChild(li);
    });
  }

  // Выделяем сами объекты точек, поэтому «уехавшие» точки (стёртые ластиком,
  // исчезнувшие после отмены/импорта) отваливаются из выделения сами - см.
  // pruneSelection() в render().
  function pruneSelection() {
    const before = state.selected.length;
    state.selected = state.selected.filter(function (p) {
      return state.points.indexOf(p) !== -1;
    });
    return state.selected.length !== before;
  }

  function clearSelection() {
    state.selected = [];
    renderSelection();
    renderOverlay();
  }

  function toggleSelect(e) {
    const idx = pointAt(canvasPos(e));
    if (idx === -1) {
      setStatus('Тут нет точки - наведись прямо на кружок 🔎');
      return;
    }
    const p = state.points[idx];
    const at = state.selected.indexOf(p);
    if (at === -1) state.selected.push(p);
    else state.selected.splice(at, 1);
    setStatus(at === -1
      ? '🔎 Точка выделена: x = ' + pxToUnit(p.x) + ', y = ' + pxToUnit(p.y)
      : 'Выделение снято с точки (' + pxToUnit(p.x) + ', ' + pxToUnit(p.y) + ')');
    renderSelection();
    renderOverlay();
  }

  function updateInspector() {
    const btn = document.getElementById('inspector-toggle');
    btn.textContent = state.inspector ? '🔎 Инспектор: ВКЛ' : '🔎 Инспектор: выкл';
    btn.classList.toggle('inspector-on', state.inspector);
    canvas.classList.toggle('inspecting', state.inspector);
    document.getElementById('inspector-panel').hidden = !state.inspector;
    renderSelection();
    renderOverlay();
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
      // На каком объёме данных сдан тест (шаг «сколько данных нужно?»)
      if (state.points.length <= 6) state.stats.revealSmall++;
      if (state.points.length >= 20) state.stats.revealBig++;
      // И при каком k (шаги про повторяемость эксперимента)
      if (state.k === 5) state.stats.revealK5++;
      if (state.k === 7) state.stats.revealK7++;
      if (state.k === 15) state.stats.revealK15++;
      // запомним, при каком k сдан тест (шаг «найди лучшее k»)
      if (state.stats.revealKList.indexOf(state.k) === -1) state.stats.revealKList.push(state.k);
    }
    state.lastAccuracy = correct;
    state.testRevealed = true;
    setStatus('🎯 Результат: ' + correct + ' из ' + CONFIG.TEST_COUNT + ' правильно!');
    render();
  }

  // Закрыть панель теста: серые точки убираем с поля, панель прячем. Результат
  // последнего теста («Точность теста») сохраняем - он нужен для отчётов.
  function closeTest() {
    state.testPoints = [];
    state.testRevealed = false;
    document.getElementById('answers').innerHTML = '';
    document.getElementById('test-panel').classList.remove('active');
    setStatus('Тест закрыт. Можно снова рисовать точки и обучать модель 🔵🔴');
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
    if (state.inspector) { toggleSelect(e); return; }
    if (state.eraser) { eraseAt(e); return; }
    addPoint(e, state.activeColor);
  });
  canvas.addEventListener('mousemove', showCoords);
  canvas.addEventListener('mouseleave', hideCoords);
  canvas.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    if (state.inspector) { toggleSelect(e); return; }
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
  document.getElementById('inspector-toggle').onclick = function () {
    state.inspector = !state.inspector;
    // Инспектор и ластик - разные режимы клика, вместе включать нельзя
    if (state.inspector && state.eraser) { state.eraser = false; updateEraser(); }
    updateInspector();
    setStatus(state.inspector
      ? 'Режим инспектора 🔎 - у точек видны координаты; щёлкай по точкам, чтобы выделять их. Рисование пока выключено.'
      : 'Инспектор выключен - снова рисуем точки 🔵🔴');
  };
  document.getElementById('btn-clear-selection').onclick = function () {
    clearSelection();
    setStatus('Выделение снято');
  };
  document.getElementById('eraser-toggle').onclick = function () {
    state.eraser = !state.eraser;
    if (state.eraser && state.inspector) { state.inspector = false; updateInspector(); }
    updateEraser();
    setStatus(state.eraser
      ? 'Режим ластика 🧽 - кликай по точкам, чтобы удалять их. Выключи кнопку, чтобы снова рисовать.'
      : 'Ластик выключен - снова рисуем точки 🔵🔴');
  };
  document.getElementById('btn-train').onclick = function () {
    if (!state.points.length) { setStatus('Сначала нанеси точки!'); return; }
    state.trained = true; state.stats.trains++;
    // Опыт с «крайним» k считаем и здесь: ребёнок часто сначала ставит точки и k,
    // и только потом жмёт «Обучить» - тогда обработчик ползунка ничего не засчитал
    // (модель ещё не была обучена), а опыт по факту проведён.
    if (state.k === CONFIG.MIN_K) state.stats.kTo1++;
    if (state.k === CONFIG.MAX_K) state.stats.kTo15++;
    if (state.k >= 12) state.stats.kHigh++;
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
  document.getElementById('btn-close-test').onclick = closeTest;
  document.getElementById('btn-clear').onclick = clearAll;
  document.getElementById('btn-undo').onclick = undo;

  // «Начать заново» из колонки-гида (guide.js): полный сброс поля и истории.
  document.addEventListener('lesson3:restart', function () {
    state.points = []; state.testPoints = [];
    state.trained = false; state.testRevealed = false; state.lastAccuracy = null;
    state.history = [];
    state.selected = [];
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
  buildRulers();  // числа осей вокруг поля
  updateToggle();
  updateEraser();
  updateInspector();
  updateUndoBtn();
  hideCoords();
  setStatus(state.points.length
    ? 'С возвращением! Твои точки на месте (' + state.points.length + '). Продолжай 👇'
    : 'Привет! Нанеси точки или загрузи стартовый датасет 👇');
  render();
})();
