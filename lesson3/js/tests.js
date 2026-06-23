// ============================================================
// tests.js - логика «секретного теста»: генерация точек, проверка ответов.
// Чистая логика без DOM (DOM-списки строит app.js).
// ============================================================

// Сгенерировать N случайных точек внутри поля (с отступом от краёв).
// Класс пока неизвестен (label: null) - его предскажет KNN при проверке.
function generateTestPoints() {
  const n = CONFIG.TEST_COUNT;
  const margin = CONFIG.TEST_MARGIN;
  const span = CONFIG.CANVAS_SIZE - margin * 2;
  const pts = [];
  for (let i = 0; i < n; i++) {
    pts.push({
      x: margin + Math.random() * span,
      y: margin + Math.random() * span,
      label: null
    });
  }
  return pts;
}

// Проставить каждой тестовой точке класс, предсказанный KNN, по обучающим точкам.
function classifyTestPoints(testPoints, points, k) {
  for (let i = 0; i < testPoints.length; i++) {
    const t = testPoints[i];
    const res = knnPredict(t.x, t.y, points, k);
    t.label = res.label;
  }
}

// Сравнить ответы ребёнка (массив 'blue'|'red') с предсказаниями KNN.
// Возвращает количество совпадений (Accuracy).
function countCorrect(testPoints, answers) {
  let correct = 0;
  for (let i = 0; i < testPoints.length; i++) {
    if (answers[i] && answers[i] === testPoints[i].label) correct++;
  }
  return correct;
}
