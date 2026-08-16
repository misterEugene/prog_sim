// ============================================================
// 🐞 Баг-трекер - урок 4 «Тестировщик»
// ============================================================
// Что это. Витрина того самого 🐞 ЖУРНАЛА БАГОВ, который лежит комментариями в
// конце main.js. Трекер НЕ заводит своё хранилище: он читает записи прямо из
// кода в редакторе и туда же их записывает в том же формате. Поэтому суть урока
// не меняется - источник истины остаётся кодом, а все проверки шагов
// (t4bugFilled / t4bugFixed в lesson-data-testing.js) продолжают работать как
// раньше, независимо от того, заполнил ребёнок запись руками в main.js или через
// эту форму.
//
// Формат записи (менять нельзя - на него завязаны проверки):
//   // BUG-01 | Заголовок: ...
//   //   Шаги:        ...
//   //   Ожидаемо:    ...
//   //   Фактически:  ...
//   //   Серьёзность: ...
//   //   Статус:      ...
//
// Пустое поле формы записывается обратно как метка [ВПИШИ …] - ровно как в
// шаблоне. Так чек-лист шага честно остаётся невыполненным, пока поле пустое.
//
// Подключается ТОЛЬКО из урок_4.html и последним - после main.js, чтобы его
// DOMContentLoaded-обработчик сработал уже после init() платформы.
// ============================================================

const BT_COUNT = 13; // столько записей в журнале (BUG-01 … BUG-13)

// Поля записи: ключ, подпись в форме, метка в коде, ширина отступа после метки
// (чтобы значения в журнале стояли ровным столбиком, как в шаблоне) и
// плейсхолдер-метка из шаблона.
const BT_FIELDS = [
  {
    key: "title",
    label: "Заголовок",
    code: "Заголовок:",
    ph: "[ВПИШИ ЗАГОЛОВОК]",
    help: "Коротко и по делу: что именно сломано.",
    kind: "text",
    hint: "Например: «Счётчик корзины растёт на 2 вместо 1»",
  },
  {
    key: "steps",
    label: "Шаги воспроизведения",
    code: "Шаги:",
    ph: "[ВПИШИ ШАГИ]",
    help: "По пунктам, чтобы разработчик повторил баг у себя.",
    kind: "area",
    hint: "1) Открыть сайт 2) Нажать «В корзину» 3) Посмотреть на счётчик",
  },
  {
    key: "expected",
    label: "Ожидаемо",
    code: "Ожидаемо:",
    ph: "[ВПИШИ ОЖИДАЕМО]",
    help: "Как ДОЛЖНО работать.",
    kind: "area",
    hint: "Счётчик показывает 1",
  },
  {
    key: "actual",
    label: "Фактически",
    code: "Фактически:",
    ph: "[ВПИШИ ФАКТИЧЕСКИ]",
    help: "Как есть на самом деле.",
    kind: "area",
    hint: "Счётчик показывает 2",
  },
  {
    key: "severity",
    label: "Серьёзность",
    code: "Серьёзность:",
    ph: "[ВПИШИ СЕРЬЁЗНОСТЬ]",
    help: "Насколько сильно баг мешает покупателю.",
    kind: "choice",
    options: ["низкая", "средняя", "высокая"],
  },
  {
    key: "status",
    label: "Статус",
    code: "Статус:",
    ph: "[ВПИШИ СТАТУС]",
    help: "«исправлен» ставь только после ретеста - когда сам проверил, что баг ушёл.",
    kind: "choice",
    options: ["открыт", "исправлен"],
  },
];

// Ширина колонки под метку в журнале: "Серьёзность:" - самая длинная.
const BT_PAD = 13;

const btEls = {};        // ссылки на элементы трекера
let btSelected = "01";   // какая запись открыта в правой части
let btFilter = "all";    // all | empty | open | fixed
let btWriting = false;   // идёт запись в редактор (чтобы не перерисовать себя же)

// ---------- Чтение журнала из кода ----------

function btJs() {
  return els && els.jsEditor ? els.jsEditor.value : "";
}

function btNum(n) {
  return n < 10 ? "0" + n : String(n);
}

// Есть ли вообще журнал в коде (его могли стереть).
function btHasJournal() {
  const js = btJs();
  return js.indexOf("ЖУРНАЛ БАГОВ") !== -1 && js.indexOf("// BUG-01 |") !== -1;
}

// Границы записи BUG-NN в тексте кода: от строки заголовка до конца последней
// строки-поля. null - записи нет (её стёрли или переписали заголовок).
function btEntryRange(js, num) {
  const re = new RegExp("^//\\s*BUG-" + num + "\\s*\\|.*$", "m");
  const m = re.exec(js);
  if (!m) return null;
  const start = m.index;
  let end = start + m[0].length;
  const lineRe = /^\/\/[ \t]+(Шаги|Ожидаемо|Фактически|Серьёзность|Статус):.*$/;
  // Забираем идущие следом строки-поля записи
  let pos = end;
  while (js[pos] === "\n") {
    const lineEnd = js.indexOf("\n", pos + 1);
    const line = js.slice(pos + 1, lineEnd === -1 ? js.length : lineEnd);
    if (!lineRe.test(line)) break;
    end = lineEnd === -1 ? js.length : lineEnd;
    pos = end;
  }
  return { start, end };
}

// Значение поля: убираем метку-плейсхолдер (пустое поле = пустая строка).
function btCleanValue(raw) {
  const v = (raw || "").trim();
  if (!v || /^\[ВПИШИ[^\]]*\]$/.test(v)) return "";
  return v;
}

// Разобрать запись BUG-NN в объект { title, steps, expected, actual, severity, status }.
function btParse(num) {
  const js = btJs();
  const range = btEntryRange(js, num);
  const bug = { num: num, found: false };
  BT_FIELDS.forEach(function (f) { bug[f.key] = ""; });
  if (!range) return bug;
  bug.found = true;
  const block = js.slice(range.start, range.end);
  // Заголовок - в первой строке, после «| Заголовок:»
  const head = /\|\s*Заголовок:(.*)$/m.exec(block);
  if (head) bug.title = btCleanValue(head[1]);
  BT_FIELDS.forEach(function (f) {
    if (f.key === "title") return;
    const re = new RegExp("^//[ \\t]+" + f.code + "(.*)$", "m");
    const m = re.exec(block);
    if (m) bug[f.key] = btCleanValue(m[1]);
  });
  return bug;
}

function btParseAll() {
  const out = [];
  for (let n = 1; n <= BT_COUNT; n++) out.push(btParse(btNum(n)));
  return out;
}

// Запись «описана» = заполнены все поля, кроме статуса (статус появляется после
// починки). Ровно этого же требует чек-лист шага.
function btIsDescribed(bug) {
  return BT_FIELDS.every(function (f) {
    return f.key === "status" ? true : !!bug[f.key];
  });
}

function btIsFixed(bug) {
  return (bug.status || "").toLowerCase().indexOf("исправлен") !== -1;
}

// ---------- Запись журнала обратно в код ----------

// Собрать текст записи ровно в формате шаблона.
function btSerialize(bug) {
  const lines = [];
  BT_FIELDS.forEach(function (f) {
    const value = bug[f.key] ? String(bug[f.key]).replace(/\s*\n\s*/g, " ").trim() : f.ph;
    if (f.key === "title") {
      lines.push("// BUG-" + bug.num + " | Заголовок: " + value);
    } else {
      const pad = " ".repeat(Math.max(1, BT_PAD - f.code.length));
      lines.push("//   " + f.code + pad + value);
    }
  });
  return lines.join("\n");
}

// Записать изменённую запись в редактор main.js. Значение подменяем целиком, а
// потом диспатчим 'input' - так срабатывает вся обычная цепочка платформы:
// подсветка, автосохранение, история отмены (Ctrl+Z) и пересчёт чек-листов.
function btWrite(bug) {
  const ta = els.jsEditor;
  const js = ta.value;
  const range = btEntryRange(js, bug.num);
  if (!range) return false;
  const next = js.slice(0, range.start) + btSerialize(bug) + js.slice(range.end);
  if (next === js) return true;
  const scroll = ta.scrollTop;
  const selStart = ta.selectionStart;
  const selEnd = ta.selectionEnd;
  btWriting = true;
  ta.value = next;
  // Курсор мог «уехать» из-за смены длины текста - ставим не дальше конца
  const max = next.length;
  ta.setSelectionRange(Math.min(selStart, max), Math.min(selEnd, max));
  ta.scrollTop = scroll;
  ta.dispatchEvent(new Event("input", { bubbles: true }));
  btWriting = false;
  return true;
}

// ---------- Построение интерфейса ----------

function btBuild() {
  const overlay = document.createElement("div");
  overlay.className = "tracker-overlay";
  overlay.id = "tracker-overlay";
  overlay.hidden = true;

  const win = document.createElement("div");
  win.className = "tracker";
  win.setAttribute("role", "dialog");
  win.setAttribute("aria-modal", "true");
  win.setAttribute("aria-label", "Баг-трекер");

  // Шапка
  const head = document.createElement("div");
  head.className = "tracker-head";
  head.innerHTML =
    '<div>' +
    '<h2 class="tracker-title">🐞 Баг-трекер · МегаМагазин 2.0</h2>' +
    '<div class="tracker-sub">Твой журнал багов из конца <code>main.js</code> - ' +
    'что напишешь здесь, то появится в коде</div>' +
    '</div>' +
    '<button type="button" class="btn tracker-close">✕ Закрыть</button>';
  win.appendChild(head);

  // Статистика
  const stats = document.createElement("div");
  stats.className = "tracker-stats";
  stats.innerHTML =
    '<span class="tracker-stat">Всего багов: <b>' + BT_COUNT + '</b></span>' +
    '<span class="tracker-stat">Описано: <b class="bt-described">0</b></span>' +
    '<span class="tracker-stat">Исправлено: <b class="bt-fixed">0</b></span>' +
    '<span class="tracker-stat">Осталось: <b class="bt-left">' + BT_COUNT + '</b></span>' +
    '<span class="tracker-bar"><span class="tracker-bar-fill"></span></span>';
  win.appendChild(stats);

  // Тело
  const body = document.createElement("div");
  body.className = "tracker-body";

  const listCol = document.createElement("div");
  listCol.className = "tracker-list-col";
  const filters = document.createElement("div");
  filters.className = "tracker-filters";
  [
    ["all", "Все"],
    ["empty", "Не описаны"],
    ["open", "Открытые"],
    ["fixed", "Исправлены"],
  ].forEach(function (f) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tracker-filter" + (f[0] === "all" ? " active" : "");
    b.dataset.filter = f[0];
    b.textContent = f[1];
    b.addEventListener("click", function () {
      btFilter = f[0];
      filters.querySelectorAll(".tracker-filter").forEach(function (x) {
        x.classList.toggle("active", x.dataset.filter === btFilter);
      });
      btRender();
    });
    filters.appendChild(b);
  });
  listCol.appendChild(filters);

  const list = document.createElement("div");
  list.className = "tracker-list";
  listCol.appendChild(list);
  body.appendChild(listCol);

  const detail = document.createElement("div");
  detail.className = "tracker-detail";
  body.appendChild(detail);
  win.appendChild(body);

  // Подвал
  const foot = document.createElement("div");
  foot.className = "tracker-foot";
  foot.innerHTML =
    '<span>📝 Всё, что ты пишешь здесь, тут же попадает в 🐞 ЖУРНАЛ БАГОВ ' +
    'в конце <code>main.js</code>. Можно писать и там - трекер подхватит.</span>' +
    '<span class="tracker-saved">✓ записано в main.js</span>';
  win.appendChild(foot);

  overlay.appendChild(win);
  document.body.appendChild(overlay);

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) btClose();
  });
  head.querySelector(".tracker-close").addEventListener("click", btClose);

  btEls.overlay = overlay;
  btEls.list = list;
  btEls.detail = detail;
  btEls.described = stats.querySelector(".bt-described");
  btEls.fixedCount = stats.querySelector(".bt-fixed");
  btEls.left = stats.querySelector(".bt-left");
  btEls.barFill = stats.querySelector(".tracker-bar-fill");
  btEls.saved = foot.querySelector(".tracker-saved");
}

// ---------- Отрисовка ----------

function btRender() {
  if (!btEls.overlay) return;
  const bugs = btParseAll();
  btRenderStats(bugs);
  btRenderList(bugs);
  btRenderDetail(bugs);
}

function btRenderStats(bugs) {
  const described = bugs.filter(btIsDescribed).length;
  const fixed = bugs.filter(btIsFixed).length;
  btEls.described.textContent = String(described);
  btEls.fixedCount.textContent = String(fixed);
  btEls.left.textContent = String(BT_COUNT - fixed);
  btEls.barFill.style.width = Math.round((fixed / BT_COUNT) * 100) + "%";
}

// Состояние записи одним словом - им же красится левая полоска карточки.
function btState(bug) {
  if (btIsFixed(bug)) return "fixed";
  if (btIsDescribed(bug)) return "open";
  return "empty";
}

function btRenderList(bugs) {
  btEls.list.innerHTML = "";
  const shown = bugs.filter(function (b) {
    return btFilter === "all" || btState(b) === btFilter;
  });
  if (!shown.length) {
    const empty = document.createElement("p");
    empty.className = "tracker-broken";
    empty.textContent = "В этой стопке пока пусто.";
    btEls.list.appendChild(empty);
    return;
  }
  shown.forEach(function (bug) {
    const state = btState(bug);
    const item = document.createElement("button");
    item.type = "button";
    item.className =
      "tracker-item is-" + state + (bug.num === btSelected ? " active" : "");
    const top = document.createElement("div");
    top.className = "tracker-item-top";
    top.innerHTML =
      '<span class="tracker-id">BUG-' + bug.num + "</span>" +
      (bug.severity ? '<span class="tracker-chip ' + btSevClass(bug.severity) +
        '">' + btEsc(bug.severity) + "</span>" : "") +
      '<span class="tracker-chip ' + (state === "fixed" ? "st-fixed" : "st-open") + '">' +
      (state === "fixed" ? "🟢 исправлен" : state === "open" ? "🔴 открыт" : "⬜ не описан") +
      "</span>";
    const title = document.createElement("div");
    title.className = "tracker-item-title" + (bug.title ? "" : " is-blank");
    title.textContent = bug.title || "запись пока пустая";
    item.appendChild(top);
    item.appendChild(title);
    item.addEventListener("click", function () {
      btSelected = bug.num;
      btRender();
    });
    btEls.list.appendChild(item);
  });
}

function btSevClass(sev) {
  const s = (sev || "").toLowerCase();
  if (s.indexOf("выс") === 0) return "sv-high";
  if (s.indexOf("сред") === 0) return "sv-mid";
  return "sv-low";
}

function btEsc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function btRenderDetail(bugs) {
  const box = btEls.detail;
  box.innerHTML = "";
  if (!btHasJournal()) {
    const p = document.createElement("p");
    p.className = "tracker-broken";
    p.innerHTML =
      "🐞 ЖУРНАЛ БАГОВ не найден в <code>main.js</code>. Похоже, его случайно " +
      "стёрли. Нажми <b>Ctrl+Z</b> нужное число раз, чтобы вернуть - или " +
      "«↺ Начать заново», если совсем всё запуталось.";
    box.appendChild(p);
    return;
  }
  const bug = bugs.filter(function (b) { return b.num === btSelected; })[0] || bugs[0];
  if (!bug) return;

  const head = document.createElement("div");
  head.className = "tracker-detail-head";
  const state = btState(bug);
  head.innerHTML =
    '<span class="tracker-detail-id">BUG-' + bug.num + "</span>" +
    '<span class="tracker-chip ' + (state === "fixed" ? "st-fixed" : "st-open") + '">' +
    (state === "fixed" ? "🟢 исправлен" : state === "open" ? "🔴 открыт" : "⬜ не описан") +
    "</span>";
  box.appendChild(head);

  const note = document.createElement("p");
  note.className = "tracker-detail-note";
  note.textContent = bug.found
    ? "Цикл тестировщика: 🔴 воспроизведи баг → 📝 опиши его здесь → 🟢 почини код и нажми ▶ Запустить → ✅ повтори проверку (ретест) и поставь статус «исправлен»."
    : "Запись BUG-" + bug.num + " не найдена в main.js - видимо, её строки изменили. Верни их через Ctrl+Z, чтобы редактировать баг отсюда.";
  box.appendChild(note);
  if (!bug.found) return;

  BT_FIELDS.forEach(function (f) {
    box.appendChild(btField(bug, f));
  });
}

// Одно поле формы. Любое изменение сразу пишется в журнал в коде.
function btField(bug, f) {
  const wrap = document.createElement("div");
  wrap.className = "tracker-field";
  const label = document.createElement("label");
  label.textContent = f.label;
  const help = document.createElement("span");
  help.className = "tracker-help";
  help.textContent = f.help;
  label.appendChild(help);
  wrap.appendChild(label);

  if (f.kind === "choice") {
    const row = document.createElement("div");
    row.className = "tracker-radio";
    f.options.forEach(function (opt) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = opt;
      if ((bug[f.key] || "").toLowerCase() === opt) b.classList.add("on");
      b.addEventListener("click", function () {
        // Повторный клик по выбранному - снять выбор (вернуть метку [ВПИШИ …])
        bug[f.key] = (bug[f.key] || "").toLowerCase() === opt ? "" : opt;
        btSave(bug);
        btRender();
      });
      row.appendChild(b);
    });
    wrap.appendChild(row);
    return wrap;
  }

  const input =
    f.kind === "area" ? document.createElement("textarea") : document.createElement("input");
  if (f.kind === "area") input.rows = f.key === "steps" ? 3 : 2;
  else input.type = "text";
  input.value = bug[f.key] || "";
  input.placeholder = f.hint || "";
  input.spellcheck = false;
  input.addEventListener("input", function () {
    bug[f.key] = input.value;
    btSaveSoon(bug);
  });
  // Ушли из поля - обновим список и статистику (заголовок мог поменяться)
  input.addEventListener("blur", function () {
    btSave(bug);
    btRender();
  });
  wrap.appendChild(input);
  return wrap;
}

// Печать в поле - пишем в код с задержкой, чтобы не дёргать редактор на каждую
// букву (и чтобы история отмены копила ввод одним шагом).
let btSaveTimer = null;
function btSaveSoon(bug) {
  clearTimeout(btSaveTimer);
  btSaveTimer = setTimeout(function () { btSave(bug); }, 350);
}

function btSave(bug) {
  clearTimeout(btSaveTimer);
  if (!btWrite(bug)) return;
  btFlashSaved();
  btUpdateBadge();
}

function btFlashSaved() {
  if (!btEls.saved) return;
  btEls.saved.classList.add("show");
  clearTimeout(btEls._savedTimer);
  btEls._savedTimer = setTimeout(function () {
    btEls.saved.classList.remove("show");
  }, 1200);
}

// ---------- Открытие / закрытие ----------

function btOpen() {
  if (!btEls.overlay) btBuild();
  btRender();
  btEls.overlay.hidden = false;
  const first = btEls.detail.querySelector("input, textarea, button");
  if (first) first.focus();
}

function btClose() {
  if (btEls.overlay) btEls.overlay.hidden = true;
}

function btToggle() {
  if (btEls.overlay && !btEls.overlay.hidden) btClose();
  else btOpen();
}

// ---------- Кнопка в верхней панели ----------

// Счётчик «описано / всего» прямо на кнопке - видно, сколько работы осталось.
function btUpdateBadge() {
  const badge = document.querySelector(".tracker-badge");
  if (!badge) return;
  let described = 0;
  for (let n = 1; n <= BT_COUNT; n++) {
    if (btIsDescribed(btParse(btNum(n)))) described++;
  }
  badge.textContent = described + "/" + BT_COUNT;
}

function btInit() {
  const btn = document.getElementById("tracker-btn");
  if (!btn || !els || !els.jsEditor) return; // не урок 4 - трекера просто нет
  btn.addEventListener("click", btToggle);
  btUpdateBadge();

  // Правки журнала руками в main.js - трекер должен показывать то же самое.
  els.jsEditor.addEventListener("input", function () {
    btUpdateBadge();
    if (btWriting) return; // это наша же запись - перерисовывать не нужно
    if (btEls.overlay && !btEls.overlay.hidden) btRender();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && btEls.overlay && !btEls.overlay.hidden) btClose();
  });
}

document.addEventListener("DOMContentLoaded", btInit);
