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
  els.saveHtmlBtn = document.getElementById("save-html-btn");
  els.saveCssBtn = document.getElementById("save-css-btn");
  els.saveJsBtn = document.getElementById("save-js-btn");
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
// Скачивание файла
// ============================================================
function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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

  els.saveHtmlBtn.addEventListener("click", () =>
    downloadFile(els.htmlEditor.value, "index.html", "text/html")
  );
  els.saveCssBtn.addEventListener("click", () =>
    downloadFile(els.cssEditor.value, "style.css", "text/css")
  );
  els.saveJsBtn.addEventListener("click", () =>
    downloadFile(els.jsEditor.value, "main.js", "application/javascript")
  );

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
