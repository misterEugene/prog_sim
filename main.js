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
  // Кнопки
  els.runBtn = document.getElementById("run-btn");
  els.resetBtn = document.getElementById("reset-btn");
  els.hintBtn = document.getElementById("hint-btn");
  els.downloadBtn = document.getElementById("download-btn");
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
function updateIframe() {
  const html = els.htmlEditor.value;
  const css = els.cssEditor.value;
  // Экранируем закрывающий тег, чтобы он не оборвал инлайновый <script>
  const js = els.jsEditor.value.replace(/<\/script>/gi, "<\\/script>");

  const doc = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <style>${css}</style>
  </head>
  <body>
${html}
    <script>${js}<\/script>
  </body>
</html>`;

  els.preview.srcdoc = doc;
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
  updateIframe();

  // ---- Обработчики ----
  els.runBtn.addEventListener("click", updateIframe);
  els.resetBtn.addEventListener("click", resetToTemplate);
  els.hintBtn.addEventListener("click", showHint);
  els.downloadBtn.addEventListener("click", downloadProject);

  // Автосохранение всех трёх редакторов при любом вводе
  const autosave = () =>
    saveToLocalStorage(
      els.htmlEditor.value,
      els.cssEditor.value,
      els.jsEditor.value
    );
  els.htmlEditor.addEventListener("input", autosave);
  els.cssEditor.addEventListener("input", autosave);
  els.jsEditor.addEventListener("input", autosave);

  // Клики по вкладкам
  els.tabs.forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });
}

document.addEventListener("DOMContentLoaded", init);
