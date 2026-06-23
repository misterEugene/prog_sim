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
