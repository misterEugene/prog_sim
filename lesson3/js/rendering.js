// ============================================================
// rendering.js - вся отрисовка на canvas: сетка, тепловая карта, точки.
// Не хранит состояние - получает данные и рисует.
// ============================================================

// Превратить [r,g,b] + alpha в строку rgba(...).
function rgba(rgb, alpha) {
  return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + alpha + ')';
}

// Полностью очистить поле (залить фоном).
function clearCanvas(ctx) {
  ctx.fillStyle = CONFIG.COLORS.bg;
  ctx.fillRect(0, 0, CONFIG.CANVAS_SIZE, CONFIG.CANVAS_SIZE);
}

// Нарисовать тонкую сетку поверх фона.
function drawGrid(ctx) {
  const size = CONFIG.CANVAS_SIZE;
  const step = size / CONFIG.GRID_LINES;
  ctx.strokeStyle = CONFIG.COLORS.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 1; i < CONFIG.GRID_LINES; i++) {
    const p = Math.round(i * step) + 0.5;
    ctx.moveTo(p, 0); ctx.lineTo(p, size);
    ctx.moveTo(0, p); ctx.lineTo(size, p);
  }
  ctx.stroke();
}

// Перевод пикселей canvas в «клетки» 0..100, которые видит ребёнок, и обратно.
function pxToUnit(px) {
  return Math.round(px / CONFIG.CANVAS_SIZE * CONFIG.AXIS_UNITS);
}

function unitToPx(u) {
  return u / CONFIG.AXIS_UNITS * CONFIG.CANVAS_SIZE;
}

// Координатные оси: более заметные линии на «десятках» и подписи чисел по
// верхнему и левому краю. Нужны, чтобы в инструкции можно было честно сказать
// «поставь точку около (20, 15)», а ребёнок нашёл это место глазами.
function drawAxes(ctx) {
  const size = CONFIG.CANVAS_SIZE;
  const step = CONFIG.AXIS_LABEL_STEP;

  // Линии-«десятки» поверх обычной сетки
  ctx.strokeStyle = CONFIG.COLORS.gridMajor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let u = step; u < CONFIG.AXIS_UNITS; u += step) {
    const p = Math.round(unitToPx(u)) + 0.5;
    ctx.moveTo(p, 0); ctx.lineTo(p, size);
    ctx.moveTo(0, p); ctx.lineTo(size, p);
  }
  ctx.stroke();

  // Подписи чисел: X - по верхнему краю, Y - по левому
  ctx.fillStyle = CONFIG.COLORS.axisText;
  ctx.font = 'bold 11px Arial, sans-serif';
  for (let u = 0; u <= CONFIG.AXIS_UNITS; u += step) {
    const p = unitToPx(u);
    // X сверху
    ctx.textBaseline = 'top';
    ctx.textAlign = u === 0 ? 'left' : (u === CONFIG.AXIS_UNITS ? 'right' : 'center');
    ctx.fillText(String(u), Math.min(Math.max(p, 2), size - 2), 4);
    // Y слева (нуль не дублируем - он уже подписан в углу)
    if (u === 0) continue;
    ctx.textAlign = 'left';
    ctx.textBaseline = u === CONFIG.AXIS_UNITS ? 'bottom' : 'middle';
    ctx.fillText(String(u), 4, Math.min(p, size - 2));
  }

  // Названия осей: у конца каждой оси - буква со стрелкой направления счёта.
  ctx.fillStyle = CONFIG.COLORS.axisName;
  ctx.font = 'bold 15px Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText('x →', size - 6, 22);   // вправо по верхнему краю
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  // чуть правее столбика чисел, иначе наложится на подпись «100»
  ctx.fillText('y ↓', 28, size - 6);   // вниз по левому краю
}

// ---- Слой-подсказка (отдельный canvas поверх поля) ----
// Тут рисуется всё, что зависит только от курсора: прицел с координатами и
// подписи точек в режиме инспектора. Отдельный слой нужен, чтобы движение мыши
// не заставляло пересчитывать тепловую карту.

// Табличка с текстом (тёмная плашка + светлые буквы), чтобы подписи читались
// на любом фоне. Сама подгоняется, чтобы не уехать за край поля.
function drawTag(ctx, text, x, y, color) {
  ctx.font = 'bold 13px Arial, sans-serif';
  var padX = 6, padY = 4;
  var w = ctx.measureText(text).width + padX * 2;
  var h = 20;
  var size = CONFIG.CANVAS_SIZE;
  var left = Math.min(Math.max(x, 2), size - w - 2);
  var top = Math.min(Math.max(y, 2), size - h - 2);
  ctx.fillStyle = 'rgba(10, 13, 20, 0.85)';
  ctx.strokeStyle = color || CONFIG.COLORS.crosshair;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.rect(left + 0.5, top + 0.5, w, h);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color || CONFIG.COLORS.crosshair;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, left + padX, top + h / 2 + 1);
}

function clearOverlay(ctx) {
  ctx.clearRect(0, 0, CONFIG.CANVAS_SIZE, CONFIG.CANVAS_SIZE);
}

// Прицел под курсором: пунктир до осей + координаты будущей точки у самого курсора.
function drawCrosshair(ctx, pos, withTag) {
  var size = CONFIG.CANVAS_SIZE;
  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = CONFIG.COLORS.crosshair;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pos.x, 0); ctx.lineTo(pos.x, size);
  ctx.moveTo(0, pos.y); ctx.lineTo(size, pos.y);
  ctx.stroke();
  ctx.setLineDash([]);
  // маленькое кольцо в самой точке будущего клика
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, CONFIG.POINT_RADIUS + 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  // Подпись у курсора не нужна, когда курсор стоит на точке: её координаты уже
  // подписаны инспектором, и две плашки наложились бы друг на друга.
  if (withTag !== false) {
    drawTag(ctx, '(' + pxToUnit(pos.x) + ', ' + pxToUnit(pos.y) + ')',
      pos.x + 14, pos.y + 14);
  }
}

// Инспектор: у каждой точки её координаты; выделенные обведены, точка под
// курсором - крупная подпись.
function drawPointLabels(ctx, points, selected, hoverIdx) {
  for (var i = 0; i < points.length; i++) {
    var p = points[i];
    var isSel = selected.indexOf(p) !== -1; // в selected лежат сами точки
    var color = p.label === 'blue' ? CONFIG.COLORS.blue : CONFIG.COLORS.red;
    if (isSel || i === hoverIdx) {
      ctx.save();
      ctx.strokeStyle = isSel ? CONFIG.COLORS.selected : CONFIG.COLORS.crosshair;
      ctx.lineWidth = isSel ? 3 : 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, CONFIG.POINT_RADIUS + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    var text = '(' + pxToUnit(p.x) + ', ' + pxToUnit(p.y) + ')';
    drawTag(ctx, text, p.x + CONFIG.POINT_RADIUS + 4, p.y - 24,
      isSel ? CONFIG.COLORS.selected : color);
  }
}

// Тепловая карта: поле бьётся на сетку, каждая ячейка красится цветом
// предсказанного класса с прозрачностью по уверенности KNN.
function drawHeatmap(ctx, points, k) {
  if (!points.length) return;
  const grid = CONFIG.HEATMAP_GRID;
  const cell = CONFIG.CANVAS_SIZE / grid;
  const aMin = CONFIG.HEAT_ALPHA_MIN;
  const aMax = CONFIG.HEAT_ALPHA_MAX;

  for (let gx = 0; gx < grid; gx++) {
    for (let gy = 0; gy < grid; gy++) {
      const cx = gx * cell + cell / 2;
      const cy = gy * cell + cell / 2;
      const res = knnPredict(cx, cy, points, k);
      if (!res.label) continue;
      // уверенность 0.5..1 → доля 0..1 → прозрачность aMin..aMax
      const t = (res.confidence - 0.5) / 0.5;
      const alpha = aMin + t * (aMax - aMin);
      const rgb = res.label === 'blue' ? CONFIG.COLORS.blueRgb : CONFIG.COLORS.redRgb;
      ctx.fillStyle = rgba(rgb, alpha);
      ctx.fillRect(gx * cell, gy * cell, cell + 1, cell + 1);
    }
  }
}

// Одна точка со свечением.
function drawPoint(ctx, p, radius, color) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = CONFIG.GLOW_BLUR;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // тонкая тёмная окантовка для контраста
  ctx.lineWidth = 2;
  ctx.strokeStyle = CONFIG.COLORS.pointStroke;
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
  ctx.stroke();
}

// Обучающие точки двух классов.
function drawPoints(ctx, points) {
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const color = p.label === 'blue' ? CONFIG.COLORS.blue : CONFIG.COLORS.red;
    drawPoint(ctx, p, CONFIG.POINT_RADIUS, color);
  }
}

// Тестовые точки: серые пока не проверены, иначе цвет предсказанного класса.
// Подписываем номером, чтобы их было легко соотнести со списками ответов.
function drawTestPoints(ctx, testPoints, revealed) {
  for (let i = 0; i < testPoints.length; i++) {
    const p = testPoints[i];
    let color = CONFIG.COLORS.test;
    if (revealed && p.label) {
      color = p.label === 'blue' ? CONFIG.COLORS.blue : CONFIG.COLORS.red;
    }
    drawPoint(ctx, p, CONFIG.TEST_RADIUS, color);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(i + 1), p.x, p.y - CONFIG.TEST_RADIUS - 8);
  }
}
