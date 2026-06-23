// ============================================================
// knn.js - реализация алгоритма k ближайших соседей (KNN).
// Чистая логика без DOM: расстояние, предсказание, уверенность.
// ============================================================

// Евклидово расстояние между двумя точками {x, y}.
function euclidean(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Предсказать класс точки (x, y) по массиву обучающих точек.
// Каждая точка: { x, y, label: 'blue' | 'red' }.
// Возвращает { label, confidence } - класс и уверенность (0.5..1).
function knnPredict(x, y, points, k) {
  if (!points || points.length === 0) {
    return { label: null, confidence: 0 };
  }

  // 1) Считаем расстояние до всех точек и сортируем по близости.
  const sorted = points
    .map(function (p) { return { p: p, d: euclidean({ x: x, y: y }, p) }; })
    .sort(function (a, b) { return a.d - b.d; });

  // 2) Берём k ближайших (но не больше, чем точек всего).
  const kk = Math.min(k, sorted.length);

  // 3) Голосование: сколько среди соседей синих и красных.
  let blue = 0;
  let red = 0;
  for (let i = 0; i < kk; i++) {
    if (sorted[i].p.label === 'blue') blue++;
    else red++;
  }

  // 4) Решение большинством. При ничьей побеждает самый близкий сосед.
  let label;
  let count;
  if (blue === red) {
    label = sorted[0].p.label;
    count = Math.max(blue, red);
  } else if (blue > red) {
    label = 'blue';
    count = blue;
  } else {
    label = 'red';
    count = red;
  }

  // 5) Уверенность = доля голосов за победивший класс.
  return { label: label, confidence: count / kk };
}
