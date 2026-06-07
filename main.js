// ============================================================
// Урок программирования — единственный предустановленный урок.
// Локально, без сервера и без внешних библиотек.
// ============================================================

// ---- Данные урока (источник истины) ----
const lesson = {
  title: "Урок 1: Измени цвет текста",
  descriptionMd: `# Измени цвет текста

У тебя есть абзац с текстом.
**Задача:** сделать его цвет **синим**.

Подсказка: используй CSS-свойство \`color\`.`,
  initialHTML: `<p>Привет, я учусь программировать!</p>`,
  initialCSS: ``,
  initialJS: ``,
  hint: "Напиши в CSS: p { color: blue; }",
};

const STORAGE_KEY = "savedLessonCode";

// ---- Ссылки на DOM-элементы ----
const els = {};

function cacheDom() {
  els.title = document.getElementById("lesson-title");
  els.htmlEditor = document.getElementById("index.html");
  els.cssEditor = document.getElementById("style.css");
  els.jsEditor = document.getElementById("main.js");
  els.markdown = document.getElementById("task.md");
  els.preview = document.getElementById("preview");
  els.toastContainer = document.getElementById("toast-container");
  els.tabs = Array.from(document.querySelectorAll(".tab"));
  els.panes = Array.from(document.querySelectorAll(".tab-pane"));

  // Редакторы кода + связь со слоем подсветки внутри той же обёртки
  els.editors = [els.htmlEditor, els.cssEditor, els.jsEditor];
  els.editors.forEach((ta) => {
    const wrap = ta.closest(".editor-wrap");
    ta._preEl = wrap.querySelector(".highlight");
    ta._codeEl = wrap.querySelector(".highlight code");
  });
  // Кнопки
  els.runBtn = document.getElementById("run-btn");
  els.resetBtn = document.getElementById("reset-btn");
  els.hintBtn = document.getElementById("hint-btn");
  els.downloadBtn = document.getElementById("download-btn");
  // Консоль
  els.consoleOutput = document.getElementById("console-output");
  els.consoleClearBtn = document.getElementById("console-clear");
  // Emmet-превью (всплывающая подсказка у курсора)
  els.emmetPreview = document.getElementById("emmet-preview");
  els.emmetPreviewCode = els.emmetPreview.querySelector("code");
}

// ============================================================
// Markdown → HTML (минимальный парсер без библиотек)
// Поддержка: # ## ###, списки -/*, **жирный**, *курсив*, `код`, абзацы.
// ============================================================
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Инлайн-замены. Порядок важен: код → жирный → курсив.
function inlineMarkdown(text) {
  return text
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function markdownToHtml(md) {
  const lines = escapeHtml(md).split("\n");
  const html = [];
  let listItems = null; // накапливаем пункты текущего списка
  let paragraph = null; // накапливаем строки текущего абзаца

  const flushList = () => {
    if (listItems) {
      html.push("<ul>" + listItems.join("") + "</ul>");
      listItems = null;
    }
  };
  const flushParagraph = () => {
    if (paragraph) {
      html.push("<p>" + inlineMarkdown(paragraph.join(" ")) + "</p>");
      paragraph = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line === "") {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const listItem = line.match(/^[-*]\s+(.*)$/);
    if (listItem) {
      flushParagraph();
      if (!listItems) listItems = [];
      listItems.push("<li>" + inlineMarkdown(listItem[1]) + "</li>");
      continue;
    }

    // Обычная строка абзаца
    flushList();
    if (!paragraph) paragraph = [];
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return html.join("\n");
}

// ============================================================
// Рендер описания урока
// ============================================================
function renderDescription() {
  els.markdown.innerHTML = markdownToHtml(lesson.descriptionMd);
}

// ============================================================
// Подсветка синтаксиса (без библиотек)
//
// Приём «оверлей»: раскрашенный <pre> лежит ПОД прозрачным <textarea>.
// Здесь — токенайзер: бежим по строке, на каждой позиции пробуем
// «липкие» (sticky, флаг /y) регэкспы по порядку. Совпал — оборачиваем
// в <span class="tok-…">, иначе экранируем один символ и идём дальше.
// Экранирование (escapeHtml) обязательно: код вставляется через innerHTML.
// ============================================================
function tokenize(code, patterns) {
  let out = "";
  let i = 0;
  const n = code.length;
  while (i < n) {
    let matched = false;
    for (const p of patterns) {
      p.re.lastIndex = i; // sticky: ищем строго с позиции i
      const m = p.re.exec(code);
      if (m && m[0].length > 0) {
        out += `<span class="tok-${p.cls}">${escapeHtml(m[0])}</span>`;
        i += m[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      out += escapeHtml(code[i]);
      i++;
    }
  }
  return out;
}

const HTML_PATTERNS = [
  { cls: "comment", re: /<!--[\s\S]*?-->/y },
  { cls: "keyword", re: /<!doctype[^>]*>/iy },
  { cls: "tag", re: /<\/?[a-zA-Z][\w-]*|\/?>/y }, // < / имя тега и закрывающая >
  { cls: "attr", re: /\s[a-zA-Z_:][\w:.-]*(?=\s*=)/y }, // имя атрибута перед =
  { cls: "string", re: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/y },
];

const CSS_PATTERNS = [
  { cls: "comment", re: /\/\*[\s\S]*?\*\//y },
  { cls: "string", re: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/y },
  { cls: "keyword", re: /@[\w-]+/y }, // @media, @import …
  { cls: "number", re: /#[0-9a-fA-F]{3,8}\b/y }, // hex-цвет
  { cls: "number", re: /-?\b\d*\.?\d+(?:[a-z%]+)?\b/y }, // число с единицей
  { cls: "property", re: /[a-zA-Z-]+(?=\s*:)/y }, // свойство перед двоеточием
  { cls: "punct", re: /[{}:;,]/y },
];

const JS_PATTERNS = [
  { cls: "comment", re: /\/\/[^\n]*/y },
  { cls: "comment", re: /\/\*[\s\S]*?\*\//y },
  {
    cls: "string",
    re: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/y,
  },
  {
    cls: "keyword",
    re: /\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|default|break|continue|new|class|extends|super|this|typeof|instanceof|in|of|null|undefined|true|false|try|catch|finally|throw|async|await|yield|delete|void)\b/y,
  },
  { cls: "number", re: /\b0x[0-9a-fA-F]+\b|\b\d*\.?\d+\b/y },
  { cls: "func", re: /[a-zA-Z_$][\w$]*(?=\s*\()/y }, // имя перед "("
  { cls: "punct", re: /[{}()[\];,.]/y },
];

const PATTERNS_BY_LANG = {
  html: HTML_PATTERNS,
  css: CSS_PATTERNS,
  js: JS_PATTERNS,
};

function highlight(code, lang) {
  return tokenize(code, PATTERNS_BY_LANG[lang] || []);
}

// Перерисовать слой подсветки под textarea и синхронизировать прокрутку.
function updateHighlight(editor) {
  const codeEl = editor._codeEl;
  if (!codeEl) return;
  codeEl.innerHTML = highlight(editor.value, editor.dataset.lang);
  syncScroll(editor);
}

function syncScroll(editor) {
  const pre = editor._preEl;
  if (!pre) return;
  pre.scrollTop = editor.scrollTop;
  pre.scrollLeft = editor.scrollLeft;
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

// ============================================================
// Emmet: раскрытие HTML-аббревиатур по Tab (движок — в emmet.js)
// ============================================================

// Извлечь аббревиатуру слева от курсора. Скользим влево, учитывая скобки
// [] {} () (внутри них пробелы — часть аббревиатуры). Останавливаемся на
// пробеле/начале строки. Если упёрлись в '<' — значит задели готовую
// разметку, аббревиатуры нет (вернём пустую).
function extractAbbreviation(text, caret) {
  let i = caret;
  let start = caret;
  let depth = 0;
  while (i > 0) {
    const c = text[i - 1];
    if (c === "\n") break;
    if (c === "]" || c === "}" || c === ")") { depth++; i--; start = i; continue; }
    if (c === "[" || c === "{" || c === "(") {
      if (depth > 0) { depth--; i--; start = i; continue; }
      break; // незакрытая открывающая скобка на верхнем уровне
    }
    if (depth > 0) { i--; start = i; continue; }
    if (c === " " || c === "\t") break;
    if (c === "<") return { start: caret, abbr: "" }; // задели разметку
    i--; start = i;
  }
  return { start, abbr: text.slice(start, caret) };
}

// Попытка раскрыть аббревиатуру в позиции курсора. true — раскрыли.
function tryExpandEmmet(ta) {
  if (ta.dataset.lang !== "html") return false; // Emmet — только для HTML
  if (!global_Emmet()) return false;
  if (ta.selectionStart !== ta.selectionEnd) return false; // есть выделение → обычный Tab

  const caret = ta.selectionStart;
  const { start, abbr } = extractAbbreviation(ta.value, caret);
  if (!abbr || !window.Emmet.isExpandable(abbr)) return false;

  const res = window.Emmet.expand(abbr);
  if (!res || !res.text) return false;

  // Отступ текущей строки — добавляем его к каждой новой строке раскрытия
  const lineStart = ta.value.lastIndexOf("\n", start - 1) + 1;
  const pad = (/^[\t ]*/.exec(ta.value.slice(lineStart, start)) || [""])[0];
  const text = res.text.replace(/\n/g, "\n" + pad);

  // Курсор: смещаем на величину добавленных отступов до позиции метки
  const newlinesBefore = res.text.slice(0, res.caret).split("\n").length - 1;
  const caretOffset = res.caret + newlinesBefore * pad.length;

  // Заменяем аббревиатуру на раскрытие (через execCommand — с историей отмены)
  ta.selectionStart = start;
  ta.selectionEnd = caret;
  const ok =
    typeof document.execCommand === "function" &&
    document.execCommand("insertText", false, text);
  if (!ok) {
    const v = ta.value;
    ta.value = v.slice(0, start) + text + v.slice(caret);
    ta.dispatchEvent(new Event("input", { bubbles: true }));
  }
  ta.selectionStart = ta.selectionEnd = start + caretOffset;
  return true;
}

function global_Emmet() {
  return typeof window.Emmet === "object" && window.Emmet;
}

// ============================================================
// Emmet-превью: всплывающая подсказка со структурой, которую вставит Tab
// ============================================================

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
  div.style.whiteSpace = "pre"; // wrap="off" → строки не переносятся
  div.style.overflow = "hidden";
  div.style.top = "-9999px";
  div.style.left = "0";

  div.textContent = ta.value.slice(0, pos);
  const marker = document.createElement("span");
  marker.textContent = "​"; // нулевой пробел — место курсора
  div.appendChild(marker);

  const left = marker.offsetLeft;
  const top = marker.offsetTop;
  const lineHeight = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4;
  return { left, top, lineHeight };
}

function hideEmmetPreview() {
  if (els.emmetPreview) els.emmetPreview.hidden = true;
}

// Показать (или обновить/скрыть) подсказку для текущей позиции в редакторе.
// Использует те же extractAbbreviation/isExpandable/expand, что и Tab —
// поэтому превью точно совпадает с тем, что реально вставится.
function updateEmmetPreview(ta) {
  if (ta.dataset.lang !== "html") return hideEmmetPreview();
  if (!global_Emmet()) return hideEmmetPreview();
  if (ta.selectionStart !== ta.selectionEnd) return hideEmmetPreview();

  const caret = ta.selectionStart;
  const { abbr } = extractAbbreviation(ta.value, caret);
  if (!abbr || !window.Emmet.isExpandable(abbr)) return hideEmmetPreview();

  const res = window.Emmet.expand(abbr);
  if (!res || !res.text) return hideEmmetPreview();

  const box = els.emmetPreview;
  els.emmetPreviewCode.innerHTML = highlight(res.text, "html");
  box.hidden = false; // снимаем hidden до замеров offsetWidth/Height

  // Позиция: под строкой курсора. Координаты курсора → экранные (textarea
  // bounding rect + смещение в тексте − прокрутка).
  const c = caretCoords(ta, caret);
  const taRect = ta.getBoundingClientRect();
  let x = taRect.left + c.left - ta.scrollLeft;
  let y = taRect.top + c.top - ta.scrollTop + c.lineHeight + 4;

  // Клампим в пределах окна; если не влезает вниз — показываем над строкой.
  const bw = box.offsetWidth;
  const bh = box.offsetHeight;
  if (x + bw > window.innerWidth - 8) x = window.innerWidth - 8 - bw;
  if (x < 8) x = 8;
  if (y + bh > window.innerHeight - 8) {
    y = taRect.top + c.top - ta.scrollTop - bh - 4;
  }
  if (y < 8) y = 8;
  box.style.left = x + "px";
  box.style.top = y + "px";
}

// ============================================================
// localStorage: загрузка / сохранение прогресса
// ============================================================
function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && typeof data === "object") {
      return {
        html: typeof data.html === "string" ? data.html : lesson.initialHTML,
        css: typeof data.css === "string" ? data.css : lesson.initialCSS,
        js: typeof data.js === "string" ? data.js : lesson.initialJS,
      };
    }
    return null;
  } catch (e) {
    // Повреждённые данные или недоступный storage — ведём себя как «нет данных»
    return null;
  }
}

function saveToLocalStorage(html, css, js) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ html, css, js }));
  } catch (e) {
    // Запись недоступна (приватный режим и т.п.) — молча игнорируем
  }
}

// ============================================================
// Сборка и обновление iframe
// ============================================================
// Скрипт-перехватчик: подменяет console.* и ловит ошибки внутри iframe,
// пересылая всё родителю через postMessage (→ встроенная консоль платформы).
const CONSOLE_HOOK = `(function(){
  function fmt(a){
    if(typeof a==='string') return a;
    if(a instanceof Error) return a.name+': '+a.message;
    if(typeof a==='function') return String(a);
    try{ return JSON.stringify(a); }catch(e){ return String(a); }
  }
  function send(level,args){
    try{
      var t=Array.prototype.map.call(args,fmt).join(' ');
      parent.postMessage({__console:true,level:level,text:t},'*');
    }catch(e){}
  }
  ['log','info','warn','error','debug'].forEach(function(m){
    var orig=console[m]?console[m].bind(console):null;
    console[m]=function(){ send(m,arguments); if(orig) orig.apply(null,arguments); };
  });
  window.addEventListener('error',function(e){
    send('error',[e.message+(e.lineno?' (строка '+e.lineno+')':'')]);
  });
  window.addEventListener('unhandledrejection',function(e){
    send('error',['Необработанная ошибка промиса: '+fmt(e.reason)]);
  });
})();`;

function updateIframe() {
  const html = els.htmlEditor.value;
  const css = els.cssEditor.value;
  // Экранируем закрывающий тег, чтобы он не оборвал инлайновый <script>
  const js = els.jsEditor.value.replace(/<\/script>/gi, "<\\/script>");

  clearConsole(); // новый запуск — чистим вывод прошлого

  const doc = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <style>${css}</style>
  </head>
  <body>
${html}
    <script>${CONSOLE_HOOK}<\/script>
    <script>${js}<\/script>
  </body>
</html>`;

  els.preview.srcdoc = doc;
}

// ============================================================
// Встроенная консоль: приём сообщений из iframe и вывод на платформе
// ============================================================
const MAX_CONSOLE_LINES = 500;

function clearConsole() {
  if (!els.consoleOutput) return;
  els.consoleOutput.innerHTML =
    '<div class="console-empty">Здесь появится вывод console.log и ошибки.</div>';
}

function appendConsoleLine(level, text) {
  const out = els.consoleOutput;
  if (!out) return;
  // Убираем плейсхолдер «пусто» при первом сообщении
  const empty = out.querySelector(".console-empty");
  if (empty) empty.remove();

  const line = document.createElement("div");
  line.className = "console-line console-" + level;
  line.textContent = text;
  out.appendChild(line);

  // Ограничиваем число строк, чтобы не разрасталось
  while (out.childElementCount > MAX_CONSOLE_LINES) out.firstElementChild.remove();

  out.scrollTop = out.scrollHeight; // автопрокрутка вниз
}

function handleConsoleMessage(e) {
  // Принимаем только сообщения от нашего превью-iframe
  if (els.preview && e.source !== els.preview.contentWindow) return;
  const data = e.data;
  if (!data || data.__console !== true) return;
  const level = ["log", "info", "warn", "error", "debug"].includes(data.level)
    ? data.level
    : "log";
  appendConsoleLine(level, typeof data.text === "string" ? data.text : String(data.text));
}

// ============================================================
// Сброс к шаблону
// ============================================================
function resetToTemplate() {
  els.htmlEditor.value = lesson.initialHTML;
  els.cssEditor.value = lesson.initialCSS;
  els.jsEditor.value = lesson.initialJS;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    /* недоступный storage — не критично */
  }
  els.editors.forEach(updateHighlight);
  updateIframe();
}

// ============================================================
// Скачивание проекта одним ZIP-архивом (без внешних библиотек)
// ============================================================

// CRC32 (полином 0xEDB88320), без предвычисленной таблицы
function crc32(bytes) {
  let crc = ~0;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (~crc) >>> 0;
}

// Сборка ZIP-архива методом "store" (без сжатия).
// files: [{ name, content }] → Blob
function buildZip(files) {
  const encoder = new TextEncoder();
  const u16 = (n) => new Uint8Array([n & 0xff, (n >>> 8) & 0xff]);
  const u32 = (n) =>
    new Uint8Array([
      n & 0xff,
      (n >>> 8) & 0xff,
      (n >>> 16) & 0xff,
      (n >>> 24) & 0xff,
    ]);

  const localParts = []; // локальные заголовки + данные
  const centralParts = []; // записи центрального каталога
  let offset = 0; // смещение очередного локального заголовка
  let centralSize = 0;

  for (const f of files) {
    const nameBytes = encoder.encode(f.name);
    const data = encoder.encode(f.content);
    const crc = crc32(data);
    const size = data.length;

    // Локальный заголовок файла
    const local = [
      u32(0x04034b50), // сигнатура
      u16(20), // версия для распаковки
      u16(0x0800), // флаги: имена в UTF-8
      u16(0), // метод: store
      u16(0), // время
      u16(0), // дата
      u32(crc),
      u32(size), // сжатый размер
      u32(size), // исходный размер
      u16(nameBytes.length),
      u16(0), // длина extra
      nameBytes,
      data,
    ];
    const localOffset = offset;
    for (const part of local) {
      localParts.push(part);
      offset += part.length;
    }

    // Запись центрального каталога
    const central = [
      u32(0x02014b50), // сигнатура
      u16(20), // версия создателя
      u16(20), // версия для распаковки
      u16(0x0800), // флаги UTF-8
      u16(0), // метод store
      u16(0), // время
      u16(0), // дата
      u32(crc),
      u32(size),
      u32(size),
      u16(nameBytes.length),
      u16(0), // extra
      u16(0), // comment
      u16(0), // номер диска
      u16(0), // внутренние атрибуты
      u32(0), // внешние атрибуты
      u32(localOffset),
      nameBytes,
    ];
    for (const part of central) {
      centralParts.push(part);
      centralSize += part.length;
    }
  }

  const centralOffset = offset;

  // Конец центрального каталога (EOCD)
  const eocd = [
    u32(0x06054b50),
    u16(0), // номер диска
    u16(0), // диск, где начинается каталог
    u16(files.length),
    u16(files.length),
    u32(centralSize),
    u32(centralOffset),
    u16(0), // длина комментария
  ];

  return new Blob([...localParts, ...centralParts, ...eocd], {
    type: "application/zip",
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadProject() {
  const zip = buildZip([
    { name: "index.html", content: els.htmlEditor.value },
    { name: "style.css", content: els.cssEditor.value },
    { name: "main.js", content: els.jsEditor.value },
  ]);
  downloadBlob(zip, "project.zip");
}

// ============================================================
// Подсказка (тост, исчезает через 5 секунд)
// ============================================================
function showHint() {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML =
    '<div class="toast-title">💡 Подсказка</div>' +
    '<div class="toast-text"></div>';
  toast.querySelector(".toast-text").textContent = lesson.hint;
  els.toastContainer.appendChild(toast);

  // Запускаем появление в следующем кадре, чтобы сработал transition
  requestAnimationFrame(() => toast.classList.add("visible"));

  setTimeout(() => {
    toast.classList.remove("visible");
    // Удаляем из DOM после завершения анимации исчезновения
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// ============================================================
// Переключение вкладок
// ============================================================
function switchTab(tabId) {
  els.tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabId);
  });
  els.panes.forEach((pane) => {
    pane.hidden = pane.dataset.pane !== tabId;
  });
  hideEmmetPreview(); // при смене вкладки подсказка неактуальна
}

// ============================================================
// Инициализация
// ============================================================
function init() {
  cacheDom();

  els.title.textContent = lesson.title;
  document.title = lesson.title;

  // Загружаем сохранённый код либо начальный шаблон
  const saved = loadFromLocalStorage();
  els.htmlEditor.value = saved ? saved.html : lesson.initialHTML;
  els.cssEditor.value = saved ? saved.css : lesson.initialCSS;
  els.jsEditor.value = saved ? saved.js : lesson.initialJS;

  renderDescription();
  switchTab("task.md");
  els.editors.forEach(updateHighlight); // первичная отрисовка подсветки
  clearConsole(); // плейсхолдер в консоли
  updateIframe();

  // ---- Обработчики ----
  els.runBtn.addEventListener("click", updateIframe);
  els.resetBtn.addEventListener("click", resetToTemplate);
  els.hintBtn.addEventListener("click", showHint);
  els.downloadBtn.addEventListener("click", downloadProject);
  els.consoleClearBtn.addEventListener("click", clearConsole);

  // Сообщения из iframe (console.* и ошибки) → встроенная консоль
  window.addEventListener("message", handleConsoleMessage);

  // Автосохранение всех трёх редакторов при любом вводе
  const autosave = () =>
    saveToLocalStorage(
      els.htmlEditor.value,
      els.cssEditor.value,
      els.jsEditor.value
    );

  els.editors.forEach((ta) => {
    // Ввод → пересобрать подсветку, сохранить прогресс, обновить Emmet-превью
    ta.addEventListener("input", () => {
      updateHighlight(ta);
      autosave();
      updateEmmetPreview(ta);
    });
    // Прокрутка textarea → двигаем слой подсветки и переставляем превью
    ta.addEventListener("scroll", () => {
      syncScroll(ta);
      if (!els.emmetPreview.hidden) updateEmmetPreview(ta);
    });
    // Курсор сместился (клик/стрелки) → пересчитать превью
    ta.addEventListener("keyup", (e) => {
      if (e.key.startsWith("Arrow") || e.key === "Home" || e.key === "End") {
        updateEmmetPreview(ta);
      }
    });
    ta.addEventListener("click", () => updateEmmetPreview(ta));
    ta.addEventListener("blur", hideEmmetPreview);
    // Tab: сначала пробуем раскрыть Emmet-аббревиатуру (только HTML),
    // иначе вставляем символ табуляции. Shift+Tab — всегда таб.
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Escape") return hideEmmetPreview();
      if (e.key === "Tab" && !e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        hideEmmetPreview();
        if (!e.shiftKey && tryExpandEmmet(ta)) return;
        insertTab(ta);
      }
    });
  });

  // Клики по вкладкам
  els.tabs.forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });
}

document.addEventListener("DOMContentLoaded", init);
