// ============================================================
// 🐞 Баг-трекер - урок 4 «Тестировщик»
// ============================================================
// Что это. Витрина того самого 🐞 ЖУРНАЛА БАГОВ, который лежит комментариями в
// конце main.js. Трекер НЕ заводит своё хранилище: он читает записи прямо из
// кода в редакторе и туда же их записывает в том же формате. Источник истины -
// код, как у настоящего тестировщика.
//
// ВАЖНО (переделка на 20 шагов). Раньше трекер был «формой для копирования»:
// в шаге урока лежал готовый текст баг-репорта, ребёнок переносил его в поля.
// Теперь готового текста в уроке НЕТ, а трекер работает как настоящая система
// учёта дефектов и сам проверяет качество репорта:
//
//   1. Запись живёт в трёх состояниях: ⬜ черновик → 🔴 открыт (отправлен
//      разработчику) → 🟢 исправлен (закрыт после ретеста).
//   2. Кнопка «📨 Отправить разработчику» разблокируется, только когда репорт
//      прошёл ВСЕ проверки качества (см. BT_RULES): заголовок-предложение,
//      минимум два пронумерованных шага, разные «Ожидаемо» и «Фактически»,
//      правильно указанный файл-источник, осмысленные серьёзность и приоритет.
//      Заголовки не должны повторяться - один текст на 13 багов не пройдёт.
//   3. Кнопка «✅ Закрыть после ретеста» разблокируется, только когда починка
//      РЕАЛЬНО есть в коде редактора (проверка lesson.bugMeta[i].fixed).
//      Поставить «исправлен» «на честном слове» невозможно.
//
// Ключ ответов (какой файл виноват, какая серьёзность/приоритет уместны и как
// выглядит починка) лежит НЕ здесь, а в js/lesson-data-testing.js →
// lesson.bugMeta - трекер остаётся общим механизмом.
//
// Формат записи в коде (на него завязаны проверки шагов):
//   // BUG-01 | Заголовок: ...
//   //   Шаги:        ...
//   //   Ожидаемо:    ...
//   //   Фактически:  ...
//   //   Где:         ...
//   //   Серьёзность: ...
//   //   Приоритет:   ...
//   //   Статус:      ...
//
// Пустое поле формы записывается обратно как метка [ВПИШИ …] - ровно как в
// шаблоне. Так чек-лист шага честно остаётся невыполненным, пока поле пустое.
//
// Подключается ТОЛЬКО из урок_4.html и последним - после main.js, чтобы его
// DOMContentLoaded-обработчик сработал уже после init() платформы.
// ============================================================

const BT_COUNT = 13; // столько записей в журнале (BUG-01 … BUG-13)

// Поля записи: ключ, подпись в форме, метка в коде и плейсхолдер из шаблона.
const BT_FIELDS = [
  {
    key: "title",
    label: "Заголовок",
    code: "Заголовок:",
    ph: "[ВПИШИ ЗАГОЛОВОК]",
    help: "Одно предложение: ЧТО и ГДЕ сломано. Так, чтобы понял человек, который бага не видел.",
    kind: "text",
    hint: "Что именно ведёт себя неправильно?",
  },
  {
    key: "steps",
    label: "Шаги воспроизведения",
    code: "Шаги:",
    ph: "[ВПИШИ ШАГИ]",
    help: "Пронумерованные действия: 1) … 2) … Минимум два пункта, иначе разработчик не повторит баг.",
    kind: "area",
    hint: "1) … 2) … 3) …",
  },
  {
    key: "expected",
    label: "Ожидаемо",
    code: "Ожидаемо:",
    ph: "[ВПИШИ ОЖИДАЕМО]",
    help: "Как ДОЛЖНО быть. Если речь о числах - пиши число, которое посчитал сам.",
    kind: "area",
    hint: "Как должно работать правильно",
  },
  {
    key: "actual",
    label: "Фактически",
    code: "Фактически:",
    ph: "[ВПИШИ ФАКТИЧЕСКИ]",
    help: "Как есть на самом деле. Это должен быть ДРУГОЙ текст, а не повтор «Ожидаемо».",
    kind: "area",
    hint: "Что происходит на самом деле",
  },
  {
    key: "place",
    label: "Где причина (файл)",
    code: "Где:",
    ph: "[ВПИШИ ФАЙЛ]",
    help: "Твоя гипотеза: в каком файле лежит причина. Разметка - index.html, внешний вид - style.css, поведение - main.js.",
    kind: "choice",
    options: ["index.html", "style.css", "main.js"],
  },
  {
    key: "severity",
    label: "Серьёзность",
    code: "Серьёзность:",
    ph: "[ВПИШИ СЕРЬЁЗНОСТЬ]",
    help: "Насколько баг вредит покупателю: низкая - некрасиво, средняя - неудобно, высокая - купить нельзя или магазин теряет деньги.",
    kind: "choice",
    options: ["низкая", "средняя", "высокая"],
  },
  {
    key: "priority",
    label: "Приоритет",
    code: "Приоритет:",
    ph: "[ВПИШИ ПРИОРИТЕТ]",
    help: "Насколько СРОЧНО чинить. Не всегда совпадает с серьёзностью: мелочь на главной странице видят все - значит срочно.",
    kind: "choice",
    options: ["низкий", "средний", "высокий"],
  },
  {
    key: "status",
    label: "Статус",
    code: "Статус:",
    ph: "[ВПИШИ СТАТУС]",
    help: "Меняется кнопками внизу карточки, руками писать не нужно.",
    kind: "readonly",
    options: ["открыт", "исправлен"],
  },
];

// Ширина колонки под метку в журнале: "Серьёзность:" - самая длинная.
const BT_PAD = 13;

// ---------- Правила качества баг-репорта ----------
// Каждое правило: {label, test(bug, ctx) -> true/false, fail(bug, ctx) -> текст}.
// ctx = { meta: запись из lesson.bugMeta, others: остальные баги }.
// Пока хоть одно правило не выполнено, репорт нельзя отправить разработчику.

function btWords(s) {
  return String(s || "").trim().split(/\s+/).filter(function (w) { return w.length > 1; });
}

function btNorm(s) {
  return String(s || "").toLowerCase().replace(/[^a-zа-яё0-9]+/gi, " ").trim();
}

const BT_RULES = [
  {
    label: "Заголовок - понятное предложение (от 20 символов, минимум 3 слова)",
    test: function (bug) {
      return bug.title.trim().length >= 20 && btWords(bug.title).length >= 3;
    },
    fail: function () {
      return "«Не работает» - плохой заголовок. Напиши, что именно и где ведёт себя не так.";
    },
  },
  {
    label: "Заголовок не повторяет заголовок другого бага",
    test: function (bug, ctx) {
      const mine = btNorm(bug.title);
      if (!mine) return false;
      return !ctx.others.some(function (o) {
        return o.num !== bug.num && btNorm(o.title) === mine;
      });
    },
    fail: function () {
      return "Такой же заголовок уже есть у другой записи. Каждый баг описывается своими словами.";
    },
  },
  {
    label: "Шаги: минимум два пронумерованных пункта (1) … 2) …)",
    test: function (bug) {
      const s = bug.steps;
      return /(^|\s)1\s*[).]/.test(s) && /(^|\s)2\s*[).]/.test(s) && s.trim().length >= 30;
    },
    fail: function () {
      return "Разработчик повторяет баг по твоим шагам. Нужно хотя бы два пункта: «1) … 2) …».";
    },
  },
  {
    label: "«Ожидаемо» и «Фактически» заполнены и отличаются друг от друга",
    test: function (bug) {
      const e = bug.expected.trim();
      const a = bug.actual.trim();
      return e.length >= 12 && a.length >= 12 && btNorm(e) !== btNorm(a);
    },
    fail: function () {
      return "Смысл баг-репорта - в разнице между «как должно» и «как есть». Опиши обе стороны по-разному.";
    },
  },
  {
    label: "Указан файл, в котором лежит причина бага",
    test: function (bug, ctx) {
      if (!bug.place) return false;
      if (!ctx.meta) return true;
      return bug.place === ctx.meta.file;
    },
    fail: function (bug) {
      return bug.place
        ? "Файл выбран, но причина, похоже, не там. Подумай: это текст в разметке, внешний вид или поведение?"
        : "Выбери файл: разметка - index.html, внешний вид - style.css, поведение - main.js.";
    },
  },
  {
    label: "Серьёзность соответствует последствиям для покупателя",
    test: function (bug, ctx) {
      if (!bug.severity) return false;
      if (!ctx.meta) return true;
      return ctx.meta.severity.indexOf(bug.severity) !== -1;
    },
    fail: function (bug, ctx) {
      if (!bug.severity) return "Выбери серьёзность.";
      return (ctx.meta && ctx.meta.why) || "Подумай ещё раз: мешает ли этот баг купить товар и теряет ли магазин деньги?";
    },
  },
  {
    label: "Приоритет выставлен обдуманно",
    test: function (bug, ctx) {
      if (!bug.priority) return false;
      if (!ctx.meta) return true;
      return ctx.meta.priority.indexOf(bug.priority) !== -1;
    },
    fail: function (bug, ctx) {
      if (!bug.priority) return "Выбери приоритет.";
      return (ctx.meta && ctx.meta.whyPriority) || "Приоритет - это про срочность: как быстро баг увидят покупатели.";
    },
  },
];

const btEls = {};        // ссылки на элементы трекера
let btSelected = "01";   // какая запись открыта в правой части
let btFilter = "all";    // all | draft | open | fixed
let btWriting = false;   // идёт запись в редактор (чтобы не перерисовать себя же)

// ---------- Чтение журнала из кода ----------

function btJs() {
  return els && els.jsEditor ? els.jsEditor.value : "";
}

// Текущий код всех трёх редакторов - нужен проверкам «починка реально сделана».
function btCode() {
  return {
    html: els && els.htmlEditor ? els.htmlEditor.value : "",
    css: els && els.cssEditor ? els.cssEditor.value : "",
    js: btJs(),
  };
}

// Ключ ответов урока (какой файл виноват, какая серьёзность уместна, как
// выглядит починка). Урок может его не задать - трекер тогда работает мягче.
function btMeta(num) {
  if (typeof lesson === "undefined" || !lesson.bugMeta) return null;
  const found = lesson.bugMeta.filter(function (m) { return m.num === num; });
  return found.length ? found[0] : null;
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
  const lineRe = /^\/\/[ \t]+(Шаги|Ожидаемо|Фактически|Где|Серьёзность|Приоритет|Статус):.*$/;
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

// Разобрать запись BUG-NN в объект со всеми полями.
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

// Результаты всех правил качества для одной записи.
function btCheckRules(bug, all) {
  const ctx = { meta: btMeta(bug.num), others: all || [] };
  return BT_RULES.map(function (r) {
    const ok = r.test(bug, ctx);
    return { label: r.label, ok: ok, fail: ok ? "" : r.fail(bug, ctx) };
  });
}

function btRulesOk(bug, all) {
  return btCheckRules(bug, all).every(function (r) { return r.ok; });
}

// Отправлен разработчику (или уже закрыт) - в коде стоит статус.
function btIsReported(bug) {
  const s = (bug.status || "").toLowerCase();
  return s.indexOf("открыт") !== -1 || s.indexOf("исправлен") !== -1;
}

function btIsFixed(bug) {
  return (bug.status || "").toLowerCase().indexOf("исправлен") !== -1;
}

// Починка действительно есть в коде редакторов (ключ ответов урока).
function btFixDone(bug) {
  const meta = btMeta(bug.num);
  if (!meta || typeof meta.fixed !== "function") return true;
  try {
    return !!meta.fixed(btCode());
  } catch (e) {
    return false;
  }
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
    '<div class="tracker-sub">Черновик → отправлен разработчику → закрыт после ретеста. ' +
    'Всё, что здесь написано, лежит в журнале багов в конце <code>main.js</code></div>' +
    '</div>' +
    '<button type="button" class="btn tracker-close">✕ Закрыть</button>';
  win.appendChild(head);

  // Статистика
  const stats = document.createElement("div");
  stats.className = "tracker-stats";
  stats.innerHTML =
    '<span class="tracker-stat">Всего багов: <b>' + BT_COUNT + '</b></span>' +
    '<span class="tracker-stat">Черновиков: <b class="bt-draft">' + BT_COUNT + '</b></span>' +
    '<span class="tracker-stat">Отправлено: <b class="bt-described">0</b></span>' +
    '<span class="tracker-stat">Закрыто: <b class="bt-fixed">0</b></span>' +
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
    ["draft", "Черновики"],
    ["open", "Отправлены"],
    ["fixed", "Закрыты"],
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
    'в конце <code>main.js</code>. Статус меняется только кнопками - и только ' +
    'когда репорт готов, а починка есть в коде.</span>' +
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
  btEls.draft = stats.querySelector(".bt-draft");
  btEls.described = stats.querySelector(".bt-described");
  btEls.fixedCount = stats.querySelector(".bt-fixed");
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
  const reported = bugs.filter(btIsReported).length;
  const fixed = bugs.filter(btIsFixed).length;
  btEls.draft.textContent = String(BT_COUNT - reported);
  btEls.described.textContent = String(reported - fixed);
  btEls.fixedCount.textContent = String(fixed);
  btEls.barFill.style.width = Math.round((fixed / BT_COUNT) * 100) + "%";
}

// Состояние записи одним словом - им же красится левая полоска карточки.
function btState(bug) {
  if (btIsFixed(bug)) return "fixed";
  if (btIsReported(bug)) return "open";
  return "draft";
}

const BT_STATE_TEXT = {
  draft: "⬜ черновик",
  open: "🔴 отправлен",
  fixed: "🟢 закрыт",
};

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
      "tracker-item is-" + (state === "draft" ? "empty" : state) +
      (bug.num === btSelected ? " active" : "");
    const top = document.createElement("div");
    top.className = "tracker-item-top";
    top.innerHTML =
      '<span class="tracker-id">BUG-' + bug.num + "</span>" +
      (bug.severity ? '<span class="tracker-chip ' + btSevClass(bug.severity) +
        '">' + btEsc(bug.severity) + "</span>" : "") +
      '<span class="tracker-chip ' + (state === "fixed" ? "st-fixed" : "st-open") + '">' +
      BT_STATE_TEXT[state] + "</span>";
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

  const state = btState(bug);
  const head = document.createElement("div");
  head.className = "tracker-detail-head";
  head.innerHTML =
    '<span class="tracker-detail-id">BUG-' + bug.num + "</span>" +
    '<span class="tracker-chip ' + (state === "fixed" ? "st-fixed" : "st-open") + '">' +
    BT_STATE_TEXT[state] + "</span>";
  box.appendChild(head);

  const note = document.createElement("p");
  note.className = "tracker-detail-note";
  note.textContent = bug.found
    ? "Путь записи: ⬜ черновик → 📨 отправлен разработчику → 🟢 закрыт после ретеста. Формулировки придумываешь сам: готового текста в уроке нет."
    : "Запись BUG-" + bug.num + " не найдена в main.js - видимо, её строки изменили. Верни их через Ctrl+Z, чтобы редактировать баг отсюда.";
  box.appendChild(note);
  if (!bug.found) return;

  const locked = state !== "draft"; // отправленную запись правят через «вернуть в работу»
  BT_FIELDS.forEach(function (f) {
    if (f.kind === "readonly") return; // статус меняется только кнопками
    box.appendChild(btField(bug, f, locked));
  });

  box.appendChild(btRulesBox(bug, bugs, state));
  box.appendChild(btActions(bug, bugs, state));
}

// Список проверок качества репорта.
function btRulesBox(bug, bugs, state) {
  const wrap = document.createElement("div");
  wrap.className = "tracker-rules";
  const h = document.createElement("div");
  h.className = "tracker-rules-title";
  h.textContent = "🔎 Проверка баг-репорта";
  wrap.appendChild(h);

  btCheckRules(bug, bugs).forEach(function (r) {
    const row = document.createElement("div");
    row.className = "tracker-rule" + (r.ok ? " is-ok" : "");
    row.innerHTML =
      '<span class="tracker-rule-mark">' + (r.ok ? "✅" : "⬜") + "</span>" +
      '<span class="tracker-rule-text">' + btEsc(r.label) +
      (r.ok ? "" : '<span class="tracker-rule-fail">' + btEsc(r.fail) + "</span>") +
      "</span>";
    wrap.appendChild(row);
  });

  if (state !== "draft") {
    const fix = document.createElement("div");
    fix.className = "tracker-rule" + (btFixDone(bug) ? " is-ok" : "");
    fix.innerHTML =
      '<span class="tracker-rule-mark">' + (btFixDone(bug) ? "✅" : "⬜") + "</span>" +
      '<span class="tracker-rule-text">Починка есть в коде редактора' +
      (btFixDone(bug) ? "" : '<span class="tracker-rule-fail">Закрыть баг можно только после того, как правка сделана и проверена ретестом.</span>') +
      "</span>";
    wrap.appendChild(fix);
  }
  return wrap;
}

// Кнопки перевода статуса.
function btActions(bug, bugs, state) {
  const row = document.createElement("div");
  row.className = "tracker-actions";

  function mkBtn(text, enabled, title, onClick) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn tracker-action";
    b.textContent = enabled ? text : "🔒 " + text;
    b.disabled = !enabled;
    b.title = title;
    if (enabled) b.addEventListener("click", onClick);
    row.appendChild(b);
    return b;
  }

  if (state === "draft") {
    const ready = btRulesOk(bug, bugs);
    mkBtn(
      "📨 Отправить разработчику",
      ready,
      ready ? "Записать статус «открыт» в журнал" : "Сначала выполни все пункты проверки выше",
      function () {
        bug.status = "открыт";
        btSave(bug);
        btRender();
      }
    );
  } else if (state === "open") {
    const canClose = btFixDone(bug);
    mkBtn(
      "✅ Закрыть после ретеста",
      canClose,
      canClose ? "Записать статус «исправлен»" : "Починки в коде пока нет",
      function () {
        bug.status = "исправлен";
        btSave(bug);
        btRender();
      }
    );
    mkBtn("↩ Вернуть в черновик", true, "Хочу переписать репорт", function () {
      bug.status = "";
      btSave(bug);
      btRender();
    });
  } else {
    mkBtn("↩ Открыть заново", true, "Баг вернулся - открываем снова", function () {
      bug.status = "открыт";
      btSave(bug);
      btRender();
    });
  }
  return row;
}

// Одно поле формы. Любое изменение сразу пишется в журнал в коде.
function btField(bug, f, locked) {
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
      b.disabled = !!locked;
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
  input.readOnly = !!locked;
  input.addEventListener("input", function () {
    bug[f.key] = input.value;
    btSaveSoon(bug);
  });
  // Ушли из поля - обновим список, проверки и статистику
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

// Счётчик «отправлено разработчику / всего» прямо на кнопке.
function btUpdateBadge() {
  const badge = document.querySelector(".tracker-badge");
  if (!badge) return;
  let reported = 0;
  for (let n = 1; n <= BT_COUNT; n++) {
    if (btIsReported(btParse(btNum(n)))) reported++;
  }
  badge.textContent = reported + "/" + BT_COUNT;
}

function btInit() {
  const btn = document.getElementById("tracker-btn");
  if (!btn || !els || !els.jsEditor) return; // не урок 4 - трекера просто нет
  btn.addEventListener("click", btToggle);
  btUpdateBadge();

  // Правки журнала руками в main.js - трекер должен показывать то же самое.
  // Правки кода вообще - могут разблокировать кнопку «закрыть после ретеста».
  ["htmlEditor", "cssEditor", "jsEditor"].forEach(function (key) {
    if (!els[key]) return;
    els[key].addEventListener("input", function () {
      if (key === "jsEditor") btUpdateBadge();
      if (btWriting) return; // это наша же запись - перерисовывать не нужно
      if (btEls.overlay && !btEls.overlay.hidden) btRender();
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && btEls.overlay && !btEls.overlay.hidden) btClose();
  });
}

document.addEventListener("DOMContentLoaded", btInit);
