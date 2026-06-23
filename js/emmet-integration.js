// ============================================================
// Emmet: раскрытие HTML-аббревиатур по Tab (движок - в emmet.js)
// ============================================================

// Извлечь аббревиатуру слева от курсора. Скользим влево, учитывая скобки
// [] {} () (внутри них пробелы - часть аббревиатуры). Останавливаемся на
// пробеле/начале строки. Если упёрлись в '<' - значит задели готовую
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

// Попытка раскрыть аббревиатуру в позиции курсора. true - раскрыли.
function tryExpandEmmet(ta) {
  if (ta.dataset.lang !== "html") return false; // Emmet - только для HTML
  if (!global_Emmet()) return false;
  if (ta.selectionStart !== ta.selectionEnd) return false; // есть выделение → обычный Tab

  const caret = ta.selectionStart;
  const { start, abbr } = extractAbbreviation(ta.value, caret);
  if (!abbr || !window.Emmet.isExpandable(abbr)) return false;

  const res = window.Emmet.expand(abbr);
  if (!res || !res.text) return false;

  // Отступ текущей строки - добавляем его к каждой новой строке раскрытия
  const lineStart = ta.value.lastIndexOf("\n", start - 1) + 1;
  const pad = (/^[\t ]*/.exec(ta.value.slice(lineStart, start)) || [""])[0];
  const text = res.text.replace(/\n/g, "\n" + pad);

  // Курсор: смещаем на величину добавленных отступов до позиции метки
  const newlinesBefore = res.text.slice(0, res.caret).split("\n").length - 1;
  const caretOffset = res.caret + newlinesBefore * pad.length;

  // Заменяем аббревиатуру на раскрытие (через execCommand - с историей отмены)
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

function hideEmmetPreview() {
  if (els.emmetPreview) els.emmetPreview.hidden = true;
}

// Показать (или обновить/скрыть) подсказку для текущей позиции в редакторе.
// Использует те же extractAbbreviation/isExpandable/expand, что и Tab -
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

  // Клампим в пределах окна; если не влезает вниз - показываем над строкой.
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
