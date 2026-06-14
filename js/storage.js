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
        // Прогресс вставки; нет/битое поле → пустой список (обратная совместимость)
        done: Array.isArray(data.done) ? data.done : [],
      };
    }
    return null;
  } catch (e) {
    // Повреждённые данные или недоступный storage — ведём себя как «нет данных»
    return null;
  }
}

function saveToLocalStorage(html, css, js, done) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ html, css, js, done }));
  } catch (e) {
    // Запись недоступна (приватный режим и т.п.) — молча игнорируем
  }
}

// Сохранить текущее состояние всех редакторов и прогресс вставки частей.
function autosave() {
  saveToLocalStorage(
    els.htmlEditor.value,
    els.cssEditor.value,
    els.jsEditor.value,
    Array.from(doneParts)
  );
}
