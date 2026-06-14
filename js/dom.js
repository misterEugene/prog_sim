// ============================================================
// Ссылки на DOM-элементы платформы (заполняются в cacheDom при старте).
// ============================================================

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
    ta._gutterEl = wrap.querySelector(".gutter");
    ta._swatchLayer = wrap.querySelector(".swatch-layer");
  });
  // Кнопки
  els.runBtn = document.getElementById("run-btn");
  els.openTabBtn = document.getElementById("open-tab-btn");
  els.resetBtn = document.getElementById("reset-btn");
  els.hintBtn = document.getElementById("hint-btn");
  els.downloadBtn = document.getElementById("download-btn");
  // Раскладка: колонки и разделители (перетаскивание ширины, сворачивание)
  els.layout = document.getElementById("layout");
  els.colTask = document.getElementById("col-task");
  els.colEditors = document.getElementById("col-editors");
  els.colPreview = document.getElementById("col-preview");
  els.split1 = document.getElementById("split-1");
  els.split2 = document.getElementById("split-2");
  // Консоль
  els.consoleOutput = document.getElementById("console-output");
  els.consoleClearBtn = document.getElementById("console-clear");
  // Emmet-превью (всплывающая подсказка у курсора)
  els.emmetPreview = document.getElementById("emmet-preview");
  els.emmetPreviewCode = els.emmetPreview.querySelector("code");
  // Нативный выбор цвета (палитра + пипетка) для hex-цветов в коде
  els.colorInput = document.getElementById("color-input");
  // Модальное окно подтверждения «Начать заново»
  els.resetModal = document.getElementById("reset-modal");
  els.resetModalPhrase = document.getElementById("reset-modal-phrase");
  els.resetModalInput = document.getElementById("reset-modal-input");
  els.resetModalCancel = document.getElementById("reset-modal-cancel");
  els.resetModalConfirm = document.getElementById("reset-modal-confirm");
}
