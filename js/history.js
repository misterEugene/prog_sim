// ============================================================
// Своя история отмены/повтора (переживает перезагрузку страницы)
// ============================================================
// Нативная история textarea стирается при перезагрузке (контент грузится через
// value=). Поэтому ведём свой стек снимков на каждый редактор и храним его в
// localStorage; Ctrl+Z/Ctrl+Shift+Z (Ctrl+Y) работают и после перезагрузки.
// Ключ истории отмен зависит от урока (см. LESSON_KEY_SUFFIX в lesson-data*.js):
// иначе история редакторов урока 1 подхватилась бы в редакторы урока 2 и затёрла
// бы их стартовый код. lesson-data* подключается ДО history.js (см. index*.html).
const HISTORY_KEY =
  "undoHistory" + (typeof LESSON_KEY_SUFFIX !== "undefined" ? LESSON_KEY_SUFFIX : "");
const HIST_MAX = 80;        // максимум шагов на редактор
const COALESCE_MS = 400;    // быстрый набор внутри строки = один шаг отмены
let restoring = false;      // идёт восстановление снимка → не записываем в историю
let saveHistTimer = null;

function countNL(s) {
  let n = 0;
  for (let i = 0; i < s.length; i++) if (s[i] === "\n") n++;
  return n;
}

// Завести историю редактору с текущим значением как базой.
function histInit(ta) {
  ta._hist = [{ v: ta.value, s: ta.value.length, e: ta.value.length }];
  ta._histIdx = 0;
  ta._histTime = 0;
}

// Записать текущее состояние редактора как шаг истории (с коалесингом набора).
function histRecord(ta) {
  if (restoring || !ta._hist) return;
  const h = ta._hist;
  const prev = h[ta._histIdx];
  if (ta.value === prev.v) return; // без изменений
  // Срезаем «redo»-ветку при новой правке после отмены
  if (ta._histIdx < h.length - 1) h.splice(ta._histIdx + 1);
  const snap = { v: ta.value, s: ta.selectionStart, e: ta.selectionEnd };
  const now = Date.now();
  const sameLines = countNL(ta.value) === countNL(prev.v);
  if (now - ta._histTime < COALESCE_MS && sameLines && ta._histIdx >= 1) {
    h[ta._histIdx] = snap; // сливаем быстрый набор в текущий шаг
  } else {
    h.push(snap);
    if (h.length > HIST_MAX) h.shift();
    ta._histIdx = h.length - 1;
  }
  ta._histTime = now;
  saveHistorySoon();
}

function histApply(ta, snap) {
  restoring = true;
  ta.value = snap.v;
  ta.setSelectionRange(snap.s, snap.e);
  restoring = false;
  ta._histTime = 0; // следующая правка — отдельный шаг (без коалесинга)
  updateHighlight(ta);
  autosave();
  // Прокрутить к курсору, чтобы было видно, что откатилось
  if (ta.offsetParent !== null) {
    const c = caretCoords(ta, snap.e);
    ta.scrollTop = Math.max(0, c.top - ta.clientHeight / 2);
    syncScroll(ta);
  }
  saveHistorySoon();
}

function histUndo(ta) {
  if (!ta._hist || ta._histIdx <= 0) return;
  ta._histIdx--;
  histApply(ta, ta._hist[ta._histIdx]);
}

function histRedo(ta) {
  if (!ta._hist || ta._histIdx >= ta._hist.length - 1) return;
  ta._histIdx++;
  histApply(ta, ta._hist[ta._histIdx]);
}

// Сохранение истории в localStorage (с дебаунсом и обрезкой при переполнении).
function saveHistorySoon() {
  clearTimeout(saveHistTimer);
  saveHistTimer = setTimeout(saveHistoryNow, 250);
}

function saveHistoryNow() {
  clearTimeout(saveHistTimer);
  const data = {};
  els.editors.forEach((ta) => {
    if (ta._hist) data[ta.id] = { stack: ta._hist, idx: ta._histIdx };
  });
  let json = JSON.stringify(data);
  try {
    localStorage.setItem(HISTORY_KEY, json);
  } catch (e) {
    // Переполнение квоты → ужимаем стеки вдвое и пробуем ещё раз
    els.editors.forEach((ta) => {
      if (ta._hist && ta._hist.length > 8) {
        const drop = ta._hist.length >> 1;
        ta._hist.splice(0, drop);
        ta._histIdx = Math.max(0, ta._histIdx - drop);
      }
    });
    try {
      const d2 = {};
      els.editors.forEach((ta) => {
        if (ta._hist) d2[ta.id] = { stack: ta._hist, idx: ta._histIdx };
      });
      localStorage.setItem(HISTORY_KEY, JSON.stringify(d2));
    } catch (e2) {
      /* всё равно не влезает — оставляем только в памяти */
    }
  }
}

// Загрузить историю из localStorage (после reload). Возвращает true, если для
// редактора нашёлся валидный стек (тогда значение берём из него).
function histLoad(ta) {
  let data = null;
  try {
    data = JSON.parse(localStorage.getItem(HISTORY_KEY) || "null");
  } catch (e) {
    data = null;
  }
  const rec = data && data[ta.id];
  if (
    !rec ||
    !Array.isArray(rec.stack) ||
    rec.stack.length === 0 ||
    typeof rec.idx !== "number"
  ) {
    return false;
  }
  ta._hist = rec.stack;
  ta._histIdx = Math.min(Math.max(0, rec.idx), rec.stack.length - 1);
  ta._histTime = 0;
  ta.value = ta._hist[ta._histIdx].v; // показываем состояние на указателе истории
  return true;
}
