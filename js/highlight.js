// ============================================================
// Подсветка синтаксиса (без библиотек)
//
// Приём «оверлей»: раскрашенный <pre> лежит ПОД прозрачным <textarea>.
// Здесь - токенайзер: бежим по строке, на каждой позиции пробуем
// «липкие» (sticky, флаг /y) регэкспы по порядку. Совпал - оборачиваем
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

// Метка-пропуск [ВПИШИ …] - место, куда ученик вписывает свой текст.
// Ставим её первой во всех наборах, чтобы она подсвечивалась ярко и заметно.
const TODO_PATTERN = { cls: "todo", re: /\[ВПИШИ[^\]]*\]/y };

const HTML_PATTERNS = [
  TODO_PATTERN,
  { cls: "comment", re: /<!--[\s\S]*?-->/y },
  { cls: "keyword", re: /<!doctype[^>]*>/iy },
  { cls: "tag", re: /<\/?[a-zA-Z][\w-]*|\/?>/y }, // < / имя тега и закрывающая >
  { cls: "attr", re: /\s[a-zA-Z_:][\w:.-]*(?=\s*=)/y }, // имя атрибута перед =
  { cls: "string", re: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/y },
];

const CSS_PATTERNS = [
  TODO_PATTERN,
  { cls: "comment", re: /\/\*[\s\S]*?\*\//y },
  { cls: "string", re: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/y },
  { cls: "keyword", re: /@[\w-]+/y }, // @media, @import …
  { cls: "number", re: /#[0-9a-fA-F]{3,8}\b/y }, // hex-цвет
  { cls: "number", re: /-?\b\d*\.?\d+(?:[a-z%]+)?\b/y }, // число с единицей
  { cls: "property", re: /[a-zA-Z-]+(?=\s*:)/y }, // свойство перед двоеточием
  { cls: "punct", re: /[{}:;,]/y },
];

const JS_PATTERNS = [
  TODO_PATTERN,
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
  updateGutter(editor);
  syncScroll(editor);
  refreshSwatches(editor);
}
