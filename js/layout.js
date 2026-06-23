// ============================================================
// Раскладка: перетаскивание ширины колонок и сворачивание каждой колонки
// ============================================================
const LAYOUT_KEY = "layoutPrefs";
const COL_MIN_PX = 140;        // минимальная ширина колонки при перетаскивании

// Делает разделитель `splitter` перетаскиваемым: перенос ширины между
// соседними колонками `left`/`right`. Доля каждой колонки - её flex-grow при
// flex-basis:0, поэтому grow ≡ ширина; перетаскивание перераспределяет grow
// только между двумя соседями (как в VS Code), остальные колонки не трогаем.
function makeResizable(splitter, left, right) {
  let startX = 0, startLeft = 0, total = 0, combinedGrow = 0, active = false;

  splitter.addEventListener("pointerdown", (e) => {
    startLeft = left.getBoundingClientRect().width;
    total = startLeft + right.getBoundingClientRect().width;
    combinedGrow =
      parseFloat(getComputedStyle(left).flexGrow) +
      parseFloat(getComputedStyle(right).flexGrow);
    startX = e.clientX;
    active = true;
    splitter.setPointerCapture(e.pointerId);
    splitter.classList.add("dragging");
    document.body.classList.add("resizing"); // гасим выделение и мышь в iframe
    e.preventDefault();
  });

  splitter.addEventListener("pointermove", (e) => {
    if (!active) return;
    // новая ширина левой колонки = исходная + смещение мыши, в пределах [min, total-min]
    let leftPx = startLeft + (e.clientX - startX);
    leftPx = Math.max(COL_MIN_PX, Math.min(total - COL_MIN_PX, leftPx));
    const lg = (combinedGrow * leftPx) / total;
    left.style.flexGrow = lg.toFixed(4);
    right.style.flexGrow = (combinedGrow - lg).toFixed(4);
  });

  const end = (e) => {
    if (!active) return;
    active = false;
    if (splitter.hasPointerCapture(e.pointerId))
      splitter.releasePointerCapture(e.pointerId);
    splitter.classList.remove("dragging");
    document.body.classList.remove("resizing");
    saveLayout();
    refreshWrapForVisible(); // ширина редактора изменилась → пересчитать перенос
  };
  splitter.addEventListener("pointerup", end);
  splitter.addEventListener("pointercancel", end);
}

// Доля колонки (flex-grow). У свёрнутой колонки inline-grow обнулён, поэтому
// её «настоящую» долю помним в `_savedGrow` (для восстановления при развороте).
function growOf(col) {
  if (col.classList.contains("collapsed")) return col._savedGrow || "1";
  return col.style.flexGrow || "";
}

// Свернуть/развернуть колонку. Свёрнутая → тонкая полоса (flex:0 0 auto,
// ширина в CSS); её доля запоминается и восстанавливается при развороте.
// Остальные колонки сохраняют свои пропорции и заполняют освободившееся место.
function setCollapsed(col, collapsed) {
  if (collapsed) {
    if (!col.classList.contains("collapsed")) col._savedGrow = col.style.flexGrow || "1";
    col.classList.add("collapsed");
    col.style.flex = "0 0 auto";
  } else {
    col.classList.remove("collapsed");
    col.style.flex = "";
    col.style.flexGrow = col._savedGrow || "1";
  }
}

// Разделитель между колонками A|B бесполезен, если одна из них свёрнута в полосу.
function updateSplitters() {
  const t = els.colTask.classList.contains("collapsed");
  const e = els.colEditors.classList.contains("collapsed");
  const p = els.colPreview.classList.contains("collapsed");
  els.split1.style.display = t || e ? "none" : "";
  els.split2.style.display = e || p ? "none" : "";
}

function toggleCol(col, collapsed) {
  // Не даём свернуть последнюю развёрнутую колонку - иначе экран пуст.
  if (collapsed) {
    const expanded = [els.colTask, els.colEditors, els.colPreview].filter(
      (c) => !c.classList.contains("collapsed")
    );
    if (expanded.length <= 1) return;
  }
  setCollapsed(col, collapsed);
  updateSplitters();
  saveLayout();
  // Развернули редактор → его чипы цветов считались при скрытой колонке (нулевые
  // координаты), пересчитываем для снова видимого редактора.
  if (!collapsed && col === els.colEditors) {
    const shown = els.editors.find((ta) => ta.offsetParent !== null);
    if (shown) refreshSwatches(shown);
  }
}

function saveLayout() {
  try {
    localStorage.setItem(
      LAYOUT_KEY,
      JSON.stringify({
        grows: [growOf(els.colTask), growOf(els.colEditors), growOf(els.colPreview)],
        collapsed: {
          task: els.colTask.classList.contains("collapsed"),
          editors: els.colEditors.classList.contains("collapsed"),
          preview: els.colPreview.classList.contains("collapsed"),
        },
      })
    );
  } catch (e) {
    /* приватный режим / storage недоступен - раскладка просто не сохранится */
  }
}

function loadLayout() {
  let p = null;
  try {
    p = JSON.parse(localStorage.getItem(LAYOUT_KEY) || "null");
  } catch (e) {
    p = null;
  }
  if (!p) return;
  const cols = [els.colTask, els.colEditors, els.colPreview];
  if (Array.isArray(p.grows)) {
    cols.forEach((col, i) => {
      const g = p.grows[i];
      if (g) {
        col.style.flexGrow = g;
        col._savedGrow = g; // чтобы свёрнутая колонка помнила долю
      }
    });
  }
  if (p.collapsed) {
    if (p.collapsed.task) setCollapsed(els.colTask, true);
    if (p.collapsed.editors) setCollapsed(els.colEditors, true);
    if (p.collapsed.preview) setCollapsed(els.colPreview, true);
  }
}

function initLayout() {
  loadLayout();
  updateSplitters();
  makeResizable(els.split1, els.colTask, els.colEditors);
  makeResizable(els.split2, els.colEditors, els.colPreview);
  [els.colTask, els.colEditors, els.colPreview].forEach((col) => {
    const collapseBtn = col.querySelector(".col-collapse");
    const reopenBtn = col.querySelector(".col-reopen");
    if (collapseBtn) collapseBtn.addEventListener("click", () => toggleCol(col, true));
    if (reopenBtn) reopenBtn.addEventListener("click", () => toggleCol(col, false));
  });
}
