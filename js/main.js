// ============================================================
// Точка входа: инициализация платформы и навешивание обработчиков.
// Загружается ПОСЛЕ всех модулей (см. порядок <script> в index.html).
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
  ensureColorSpacing(els.cssEditor); // ≥2 пробела перед #hex для цветных чипов
  // История отмены: восстановить из localStorage (переживает перезагрузку),
  // иначе завести с текущим значением как базой.
  els.editors.forEach((ta) => {
    if (!histLoad(ta)) histInit(ta);
  });

  // Восстанавливаем прогресс вставки (какие части блоков уже вставлены)
  doneParts.clear();
  if (saved && Array.isArray(saved.done)) {
    saved.done.forEach((entry) => {
      // Старый формат — номер шага: считаем вставленными все его части
      if (typeof entry === "number") {
        if (entry >= 0 && entry < lesson.steps.length) {
          stepLangs(lesson.steps[entry]).forEach((lang) =>
            doneParts.add(partKey(entry, lang))
          );
        }
        return;
      }
      if (typeof entry !== "string") return;
      const [i, lang] = entry.split(":");
      const idx = Number(i);
      if (
        idx >= 0 &&
        idx < lesson.steps.length &&
        stepLangs(lesson.steps[idx]).includes(lang)
      ) {
        doneParts.add(entry);
      }
    });
  }

  renderLesson();
  initLayout();                  // ширины колонок, разделители, сворачивание задания
  switchTab("index.html");       // активная вкладка редактора (задание — отдельная колонка)
  els.editors.forEach(updateHighlight); // первичная отрисовка подсветки
  clearConsole(); // плейсхолдер в консоли
  updateIframe();

  // ---- Обработчики ----
  els.runBtn.addEventListener("click", updateIframe);
  els.openTabBtn.addEventListener("click", openInNewTab);
  els.resetBtn.addEventListener("click", openResetModal);
  els.hintBtn.addEventListener("click", showHint);

  // Модальное окно подтверждения сброса
  els.resetModalInput.addEventListener("input", validateResetPhrase);
  els.resetModalCancel.addEventListener("click", closeResetModal);
  els.resetModalConfirm.addEventListener("click", confirmReset);
  // Enter в поле подтверждает (если фраза верна), Escape — закрывает окно
  els.resetModalInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      confirmReset();
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeResetModal();
    }
  });
  // Клик по затемнённому фону (вне самого окна) — закрыть без сброса
  els.resetModal.addEventListener("click", (e) => {
    if (e.target === els.resetModal) closeResetModal();
  });
  els.downloadBtn.addEventListener("click", downloadProject);
  els.consoleClearBtn.addEventListener("click", clearConsole);
  // Выбор цвета в нативной палитре → подставить в код (change = по подтверждению)
  els.colorInput.addEventListener("change", applyPickedColor);

  // Сообщения из iframe (console.* и ошибки) → встроенная консоль
  window.addEventListener("message", handleConsoleMessage);

  // Перед закрытием/перезагрузкой — дописать историю отмены (вдруг дебаунс не успел)
  window.addEventListener("beforeunload", saveHistoryNow);

  // Изменение размера окна меняет ширину редактора → пересчитать перенос строк
  window.addEventListener("resize", refreshWrapForVisible);

  els.editors.forEach((ta) => {
    // Ввод → пересобрать подсветку, сохранить прогресс, обновить Emmet-превью
    ta.addEventListener("input", () => {
      ensureColorSpacing(ta); // ≥2 пробела перед #hex (для цветных чипов в CSS)
      updateHighlight(ta);
      autosave();
      updateEmmetPreview(ta);
      histRecord(ta); // запомнить шаг для своей отмены (переживает перезагрузку)
    });
    // Прокрутка textarea → двигаем слой подсветки, чипы цветов и превью
    ta.addEventListener("scroll", () => {
      syncScroll(ta);
      refreshSwatches(ta);
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
      // Alt+Z — переключить перенос строк (как в VS Code)
      if (e.altKey && e.code === "KeyZ" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setWordWrap(!wordWrap);
        return;
      }
      // В режиме переноса (Alt+Z) Shift+↓ выделяет до начала СЛЕДУЮЩЕЙ
      // нумерованной строки, а не следующей визуальной — чтобы приём из уроков
      // «щёлкни в начало строки → Shift+↓ → Delete» работал за одно нажатие
      // даже на длинных перенесённых строках (см. selectToNextLine).
      if (wordWrap && e.shiftKey && e.key === "ArrowDown" &&
          !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        selectToNextLine(ta);
        return;
      }
      // Своя отмена/повтор (работает и после перезагрузки): Ctrl+Z / Ctrl+Shift+Z,
      // Ctrl+Y. Перехватываем до нативной, чтобы источник истины — наш стек.
      const mod = e.ctrlKey || e.metaKey;
      if (mod && !e.altKey && e.code === "KeyZ") {
        e.preventDefault();
        if (e.shiftKey) histRedo(ta);
        else histUndo(ta);
        return;
      }
      if (mod && !e.altKey && !e.shiftKey && e.code === "KeyY") {
        e.preventDefault();
        histRedo(ta);
        return;
      }
      if (e.key === "Tab" && !e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        hideEmmetPreview();
        if (!e.shiftKey && tryExpandEmmet(ta)) return;
        insertTab(ta);
        return;
      }
      // Enter — умный отступ (как в VS Code): сохраняет уровень, раскрывает пары
      if (e.key === "Enter" && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
        hideEmmetPreview();
        if (smartEnter(ta)) e.preventDefault();
      }
    });
  });

  // Клики по вкладкам
  els.tabs.forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  // Восстановить сохранённый режим переноса строк (Alt+Z)
  let wrapPref = "0";
  try { wrapPref = localStorage.getItem(WORD_WRAP_KEY) || "0"; } catch (e) {}
  if (wrapPref === "1") setWordWrap(true);
}

document.addEventListener("DOMContentLoaded", init);
