// ============================================================
// Цветовые чипы у hex-цветов в CSS (квадрат + нативная палитра/пипетка).
// ============================================================

// ---- Цветовые чипы у hex-цветов (#rgb / #rrggbb) ----
// У hex-цвета рисуем кликабельный цветной квадрат; клик открывает нативную
// палитру (с пипеткой ОС), выбранный цвет подставляется в код.
// Чип показываем, пока введено 3–6 hex-цифр (валидные/набираемые цвета); при
// 7+ цифрах он исчезает. Перед «#» держим место под чип (см. ensureColorSpacing).
const COLOR_RE = /#[0-9a-fA-F]+/g; // «#» + любое число hex-цифр (длину считаем сами)
const CHIP_MIN = 3; // минимум цифр, при котором показываем чип
const CHIP_MAX = 6; // максимум цифр (больше - это уже не похоже на цвет)
const SWATCH_SIZE = 13;
let pickerTarget = null; // {editor, start, len} - что заменяем выбранным цветом

// Любой hex (3/4/5/6 цифр) → валидный #rrggbb для нативного input и фона чипа.
function normalizeHex(hex) {
  const s = hex.slice(1).toLowerCase();
  if (s.length >= 6) return "#" + s.slice(0, 6);
  if (s.length >= 3) return "#" + s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
  return "#000000";
}

// Это hex-цвет (а не ID-селектор)? ID-селектор обычно в начале строки -
// такие «#» пропускаем; цвет стоит внутри значения, после отступа.
function isColorHash(val, hashPos) {
  let sp = 0;
  while (hashPos - 1 - sp >= 0 && val[hashPos - 1 - sp] === " ") sp++;
  const before = hashPos - sp - 1;
  return before >= 0 && val[before] !== "\n";
}

// Пересобрать чипы (только CSS). Чип - СЛЕВА от «#», на пробелах перед ним
// (ensureColorSpacing держит там 2 пробела, пока чип показан), поэтому он не
// закрывает «:» и текст. Рисуем только при 3–6 hex-цифрах.
function refreshSwatches(editor) {
  const layer = editor._swatchLayer;
  if (!layer) return;
  layer.textContent = "";
  if (editor.dataset.lang !== "css") return; // цвета меняем только в CSS
  // Скрытый/несфокусированный редактор имеет нулевые метрики - координаты
  // посчитаем при показе вкладки (switchTab вызывает refreshSwatches снова).
  if (editor.offsetParent === null) return;

  const val = editor.value;
  const viewH = editor.clientHeight;
  const viewW = editor.clientWidth;
  COLOR_RE.lastIndex = 0;
  let m;
  while ((m = COLOR_RE.exec(val))) {
    const start = m.index;
    const hex = m[0];
    const digits = hex.length - 1;
    if (digits < CHIP_MIN || digits > CHIP_MAX) continue; // только 3–6 цифр
    if (!isColorHash(val, start)) continue;

    const c = caretCoords(editor, start);
    const top = c.top - editor.scrollTop + (c.lineHeight - SWATCH_SIZE) / 2;
    const left = c.left - editor.scrollLeft - SWATCH_SIZE - 2; // на пробелах слева от «#»
    // За пределами видимой области (overflow:hidden обрежет, но не рисуем зря)
    if (top < -SWATCH_SIZE || top > viewH || left < -SWATCH_SIZE || left > viewW) continue;

    const sw = document.createElement("button");
    sw.type = "button";
    sw.className = "color-swatch";
    sw.style.top = top + "px";
    sw.style.left = left + "px";
    sw.style.background = normalizeHex(hex);
    sw.title = "Выбрать цвет (" + hex + ")";
    sw.addEventListener("mousedown", (e) => e.preventDefault()); // не сбивать фокус/каретку
    sw.addEventListener("click", () => openColorPicker(editor, start, hex, sw));
    layer.appendChild(sw);
  }
}

// Держать перед «#hex» в CSS нужное число пробелов: 2 пока показан чип (3–6
// цифр) - место под квадрат, иначе 1. Так лишний пробел появляется ВМЕСТЕ с
// чипом и убирается, когда чип исчезает (>6 цифр). Правки - через execCommand
// (сохраняют Undo); повторный вход через событие input гасим флагом.
let adjustingSpacing = false;

function ensureColorSpacing(editor) {
  if (adjustingSpacing) return;
  if (editor.dataset.lang !== "css") return;

  const val = editor.value;
  COLOR_RE.lastIndex = 0;
  let m, fix = null;
  while ((m = COLOR_RE.exec(val))) {
    const hashPos = m.index;
    const digits = m[0].length - 1;
    if (!isColorHash(val, hashPos)) continue;
    let spaces = 0;
    while (hashPos - 1 - spaces >= 0 && val[hashPos - 1 - spaces] === " ") spaces++;
    const target = digits >= CHIP_MIN && digits <= CHIP_MAX ? 2 : 1;
    if (spaces !== target) {
      fix = { runStart: hashPos - spaces, runLen: spaces, target };
      break;
    }
  }
  if (!fix) return;

  applyGap(editor, fix.runStart, fix.runLen, fix.target);
  ensureColorSpacing(editor); // следующие цвета в этом же файле
}

// Привести длину пробельного «зазора» (начинается на runStart, длиной runLen)
// к target: дописать или удалить пробелы, сохранив позицию каретки.
function applyGap(editor, runStart, runLen, target) {
  const delta = target - runLen; // >0 - добавить, <0 - убрать
  if (delta === 0) return;
  const caret = editor.selectionStart;
  const caretEnd = editor.selectionEnd;
  const val = editor.value;
  adjustingSpacing = true;
  editor.focus();

  if (delta > 0) {
    editor.setSelectionRange(runStart, runStart);
    const ok =
      typeof document.execCommand === "function" &&
      document.execCommand("insertText", false, " ".repeat(delta));
    if (!ok) {
      editor.value = val.slice(0, runStart) + " ".repeat(delta) + val.slice(runStart);
      editor.dispatchEvent(new Event("input", { bubbles: true }));
    }
  } else {
    const remEnd = runStart - delta; // удаляем (-delta) пробелов от начала зазора
    editor.setSelectionRange(runStart, remEnd);
    const ok =
      typeof document.execCommand === "function" &&
      document.execCommand("delete");
    if (!ok) {
      editor.value = val.slice(0, runStart) + val.slice(remEnd);
      editor.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  // Сдвиг каретки относительно изменённого зазора
  const shift = (p) => {
    if (delta > 0) return p >= runStart ? p + delta : p;
    const remEnd = runStart - delta;
    if (p >= remEnd) return p + delta;
    return p > runStart ? runStart : p;
  };
  editor.setSelectionRange(shift(caret), shift(caretEnd));
  adjustingSpacing = false;
}

// Открыть нативную палитру у чипа и запомнить, какой фрагмент кода заменить.
function openColorPicker(editor, start, hex, swatch) {
  const input = els.colorInput;
  if (!input) return;
  input.value = normalizeHex(hex);
  pickerTarget = { editor, start, len: hex.length };
  // Ставим скрытый input у чипа - диалог ОС откроется рядом
  const r = swatch.getBoundingClientRect();
  input.style.left = r.left + "px";
  input.style.top = r.bottom + "px";
  input.click();
}

// Применить выбранный цвет: заменить hex в коде как пользовательский ввод
// (Ctrl+Z отменяет, подсветка/автосохранение обновляются сами).
function applyPickedColor() {
  if (!pickerTarget) return;
  const { editor, start, len } = pickerTarget;
  pickerTarget = null;
  insertAsUserInput(editor, start, start + len, els.colorInput.value);
}
