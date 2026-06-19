// ============================================================
// Редактор кода: метрики курсора («зеркало»), нумерация строк, перенос,
// вставка таба/текста как пользовательский ввод, умный Enter.
// ============================================================

// ---- Перенос строк (Alt+Z, как в VS Code) ----
const WORD_WRAP_KEY = "wordWrap";
let wordWrap = false;

// Включить/выключить перенос длинных строк во всех редакторах.
function setWordWrap(on) {
  wordWrap = !!on;
  document.body.classList.toggle("word-wrap", wordWrap);
  els.editors.forEach((ta) => {
    ta.wrap = wordWrap ? "soft" : "off"; // textarea сам тоже должен переносить
    updateHighlight(ta); // перенос изменил раскладку → пересчитать слои/чипы
  });
  try {
    localStorage.setItem(WORD_WRAP_KEY, wordWrap ? "1" : "0");
  } catch (e) {
    /* storage недоступен — настройка просто не сохранится */
  }
}

// Свойства, влияющие на раскладку текста — копируем в «зеркало», чтобы
// вычислить пиксельные координаты курсора внутри textarea.
const MIRROR_PROPS = [
  "boxSizing", "width", "paddingTop", "paddingRight", "paddingBottom",
  "paddingLeft", "borderTopWidth", "borderRightWidth", "borderBottomWidth",
  "borderLeftWidth", "fontFamily", "fontSize", "fontWeight", "fontStyle",
  "lineHeight", "letterSpacing", "wordSpacing", "tabSize", "MozTabSize",
  "textIndent",
];

let mirrorEl = null; // переиспользуемый невидимый div для измерений

// Координаты курсора (позиция pos) ОТНОСИТЕЛЬНО области текста textarea, без
// учёта прокрутки. Приём «зеркало»: невидимый div с теми же метриками, в нём
// текст до курсора + span-маркер; берём offset маркера.
function caretCoords(ta, pos) {
  if (!mirrorEl) {
    mirrorEl = document.createElement("div");
    mirrorEl.setAttribute("aria-hidden", "true");
    document.body.appendChild(mirrorEl);
  }
  const div = mirrorEl;
  const cs = getComputedStyle(ta);
  MIRROR_PROPS.forEach((p) => { div.style[p] = cs[p]; });
  div.style.position = "absolute";
  div.style.visibility = "hidden";
  // В режиме переноса (Alt+Z) зеркало тоже должно переносить строки по ширине,
  // иначе координаты курсора/чипов разойдутся с реальной раскладкой.
  div.style.whiteSpace = wordWrap ? "pre-wrap" : "pre";
  div.style.overflowWrap = wordWrap ? "anywhere" : "normal";
  div.style.overflow = "hidden";
  div.style.top = "-9999px";
  div.style.left = "0";
  // Ширину берём по РЕАЛЬНОЙ области текста (clientWidth уже без скроллбара и
  // border), иначе в режиме переноса (scrollbar-gutter: stable) зеркало
  // переносит строки на бОльшей ширине, чем textarea, и чипы уезжают вверх.
  const padL = parseFloat(cs.paddingLeft) || 0;
  const padR = parseFloat(cs.paddingRight) || 0;
  div.style.boxSizing = "content-box";
  div.style.width = Math.max(0, ta.clientWidth - padL - padR) + "px";

  div.textContent = ta.value.slice(0, pos);
  const marker = document.createElement("span");
  marker.textContent = "​"; // нулевой пробел — место курсора
  div.appendChild(marker);

  const left = marker.offsetLeft;
  const top = marker.offsetTop;
  const lineHeight = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4;
  return { left, top, lineHeight };
}

function syncScroll(editor) {
  const pre = editor._preEl;
  if (pre) {
    pre.scrollTop = editor.scrollTop;
    pre.scrollLeft = editor.scrollLeft;
  }
  // Номера строк двигаются только по вертикали (по горизонтали стоят на месте).
  if (editor._gutterEl) editor._gutterEl.scrollTop = editor.scrollTop;
}

// Перерисовать колонку с номерами строк. Без переноса — по одному номеру на
// строку. С переносом (Alt+Z) логическая строка может занимать несколько
// визуальных: номер ставим у первой визуальной строки, а на строки-продолжения
// добавляем ПУСТЫЕ записи — так номера остаются вровень с кодом.
function updateGutter(editor) {
  const gutter = editor._gutterEl;
  if (!gutter) return;
  const lines = editor.value.split("\n");
  const rows = wordWrap ? wrappedRowCounts(editor, lines) : null;
  if (!rows) {
    let out = "1";
    for (let i = 2; i <= lines.length; i++) out += "\n" + i;
    gutter.textContent = out;
    return;
  }
  const parts = [];
  for (let i = 0; i < lines.length; i++) {
    parts.push(String(i + 1));
    for (let r = 1; r < rows[i]; r++) parts.push(""); // безномерные продолжения
  }
  gutter.textContent = parts.join("\n");
}

// Сколько визуальных строк занимает каждая логическая строка при переносе.
// Меряем «зеркалом» (по одному div на строку, ширина = текстовая область
// редактора). null → измерить нельзя (редактор скрыт) → обычная нумерация.
let wrapMirror = null;
function wrappedRowCounts(editor, lines) {
  if (editor.offsetParent === null) return null;
  // Меряем по слою подсветки <pre> — именно он показывает перенесённый код,
  // рядом с которым стоят номера (у него те же метрики, что у textarea).
  const target = editor._preEl || editor;
  const cs = getComputedStyle(target);
  const padL = parseFloat(cs.paddingLeft) || 0;
  const padR = parseFloat(cs.paddingRight) || 0;
  const contentW = target.clientWidth - padL - padR;
  if (contentW <= 0) return null;
  const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5;

  if (!wrapMirror) {
    wrapMirror = document.createElement("div");
    wrapMirror.setAttribute("aria-hidden", "true");
    wrapMirror.style.position = "absolute";
    wrapMirror.style.visibility = "hidden";
    wrapMirror.style.top = "-9999px";
    wrapMirror.style.left = "0";
    wrapMirror.style.whiteSpace = "pre-wrap"; // наследуется детьми
    wrapMirror.style.overflowWrap = "anywhere";
    document.body.appendChild(wrapMirror);
  }
  const m = wrapMirror;
  m.style.width = contentW + "px";
  m.style.fontFamily = cs.fontFamily;
  m.style.fontSize = cs.fontSize;
  m.style.lineHeight = cs.lineHeight;
  m.style.fontWeight = cs.fontWeight;
  m.style.letterSpacing = cs.letterSpacing;
  m.style.tabSize = cs.tabSize;
  m.style.MozTabSize = cs.tabSize;

  // Один div на строку (переиспользуем) → один пересчёт раскладки на все строки
  while (m.children.length < lines.length) m.appendChild(document.createElement("div"));
  while (m.children.length > lines.length) m.removeChild(m.lastChild);
  for (let i = 0; i < lines.length; i++) {
    m.children[i].textContent = lines[i].length ? lines[i] : "​";
  }
  const rows = new Array(lines.length);
  for (let i = 0; i < lines.length; i++) {
    rows[i] = Math.max(1, Math.round(m.children[i].offsetHeight / lh));
  }
  return rows;
}

// Вставка символа табуляции в позицию курсора (заменяя выделение, если есть).
// execCommand('insertText') сохраняет нативную историю отмены (Ctrl+Z) и сам
// диспатчит событие 'input' (→ подсветка + автосохранение). Если он недоступен —
// откатываемся на ручную вставку с эмуляцией 'input'.
function insertTab(editor) {
  const ok =
    typeof document.execCommand === "function" &&
    document.execCommand("insertText", false, "\t");
  if (!ok) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const v = editor.value;
    editor.value = v.slice(0, start) + "\t" + v.slice(end);
    editor.selectionStart = editor.selectionEnd = start + 1;
    editor.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

// Вставить текст в редактор КАК ПОЛЬЗОВАТЕЛЬСКИЙ ВВОД: фокус + выделение
// диапазона [start, end) + execCommand('insertText'). Это кладёт вставку в
// нативную историю отмены (Ctrl+Z убирает её одним шагом, как свой ввод) и
// само диспатчит 'input' (→ подсветка + автосохранение). Редактор должен быть
// видим (см. switchTab перед вызовом) — скрытый textarea не фокусируется.
function insertAsUserInput(editor, start, end, text) {
  editor.focus();
  editor.setSelectionRange(start, end);
  const ok =
    typeof document.execCommand === "function" &&
    document.execCommand("insertText", false, text);
  if (!ok) {
    // Фолбэк без нативного Undo, но с тем же событием input
    const v = editor.value;
    editor.value = v.slice(0, start) + text + v.slice(end);
    editor.dispatchEvent(new Event("input", { bubbles: true }));
  }
  const caret = start + text.length;
  editor.setSelectionRange(caret, caret);
  // Прокручиваем так, чтобы вставленный код оказался на виду
  const c = caretCoords(editor, caret);
  editor.scrollTop = Math.max(0, c.top - editor.clientHeight / 2);
  syncScroll(editor);
}

// Умный Enter (как в VS Code): сохраняет отступ строки, углубляет его после
// открывающего тега/скобки, а если курсор стоит МЕЖДУ открытым и закрытым
// (`<p>|</p>`, `{|}`, `(|)`, `[|]`) — раскрывает на три строки: открытие на
// месте, курсор на средней строке с отступом на уровень глубже, закрытие на
// своей строке на исходном уровне. Возвращает true, если Enter обработан сам.
function smartEnter(editor) {
  const v = editor.value;
  const s = editor.selectionStart;
  if (s !== editor.selectionEnd) return false; // есть выделение → обычный Enter

  const lineStart = v.lastIndexOf("\n", s - 1) + 1;
  const indent = v.slice(lineStart, s).match(/^[ \t]*/)[0]; // отступ текущей строки
  const unit = "\t"; // один уровень (редактор отбивает табами)
  const before = v[s - 1];
  const isHtml = editor.dataset.lang === "html";

  // Курсор между парой «открыли — сразу закрыли»?
  const tagPair = isHtml && before === ">" && v.slice(s, s + 2) === "</";
  const bracePair =
    (before === "{" && v[s] === "}") ||
    (before === "(" && v[s] === ")") ||
    (before === "[" && v[s] === "]");

  if (tagPair || bracePair) {
    const mid = "\n" + indent + unit;     // средняя строка (курсор тут)
    insertAsUserInput(editor, s, s, mid + "\n" + indent);
    const caret = s + mid.length;
    editor.setSelectionRange(caret, caret);
    return true;
  }

  // Иначе — перенос с сохранением отступа (+уровень после открывающего)
  const opensBlock =
    before === "{" ||
    before === "(" ||
    before === "[" ||
    (isHtml && before === ">" && endsWithOpenTag(v, s));
  const newIndent = opensBlock ? indent + unit : indent;
  insertAsUserInput(editor, s, s, "\n" + newIndent);
  return true;
}

// Перед позицией `s` стоит «>» — это конец ОТКРЫВАЮЩЕГО тега (не закрывающего,
// не самозакрывающегося, не комментария/доктайпа)?
function endsWithOpenTag(v, s) {
  const open = v.lastIndexOf("<", s - 1);
  if (open < 0) return false;
  const tag = v.slice(open, s); // например "<p>", "</p>", "<br/>", "<!-- ... >"
  if (tag.length < 2) return false;
  if (tag[1] === "/" || tag[1] === "!") return false; // закрывающий / коммент-доктайп
  if (tag[tag.length - 2] === "/") return false;      // самозакрывающийся <br/>
  return true;
}
