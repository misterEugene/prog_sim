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
  // Гаттер (число визуальных строк при переносе) и чипы цветов считаются по
  // пиксельным метрикам - у скрытого редактора их нет; пересчитываем для
  // показанного теперь редактора.
  const shown = els.editors.find((ta) => ta.id === tabId);
  if (shown) {
    updateGutter(shown);
    refreshSwatches(shown);
  }
}

// Пересчитать перенос (нумерацию строк-продолжений и чипы) для видимого
// редактора - после изменения его ширины (ресайз колонок/окна).
function refreshWrapForVisible() {
  if (!wordWrap) return;
  const ta = els.editors.find((e) => e.offsetParent !== null);
  if (ta) {
    updateGutter(ta);
    refreshSwatches(ta);
    syncScroll(ta);
  }
}
