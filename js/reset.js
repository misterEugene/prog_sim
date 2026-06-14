// ============================================================
// Сброс к шаблону
// ============================================================
// Фраза, которую ребёнок должен ввести ВРУЧНУЮ, чтобы подтвердить сброс.
// Защита от случайного нажатия: одного клика «Да» недостаточно — нужно
// осознанно перепечатать фразу целиком.
const RESET_CONFIRM_PHRASE =
  "Да, я уверен, что хочу начать заново и знаю, что это необратимо";

// Открыть модальное окно подтверждения сброса.
function openResetModal() {
  // Подставляем эталонную фразу в окно и сбрасываем поле ввода.
  els.resetModalPhrase.textContent = RESET_CONFIRM_PHRASE;
  els.resetModalInput.value = "";
  els.resetModalConfirm.disabled = true;
  els.resetModal.hidden = false;
  els.resetModalInput.focus();
}

// Закрыть модальное окно без сброса.
function closeResetModal() {
  els.resetModal.hidden = true;
}

// Кнопку «Да, начать заново» включаем, только когда введённая фраза
// в точности совпадает с эталонной (пробелы по краям не считаем).
function validateResetPhrase() {
  els.resetModalConfirm.disabled =
    els.resetModalInput.value.trim() !== RESET_CONFIRM_PHRASE;
}

// Подтверждённый сброс: закрыть окно и обнулить проект.
function confirmReset() {
  if (els.resetModalInput.value.trim() !== RESET_CONFIRM_PHRASE) return;
  closeResetModal();
  resetToTemplate();
}

function resetToTemplate() {
  els.htmlEditor.value = lesson.initialHTML;
  els.cssEditor.value = lesson.initialCSS;
  els.jsEditor.value = lesson.initialJS;
  doneParts.clear(); // сбрасываем прогресс вставки частей
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    /* недоступный storage — не критично */
  }
  els.editors.forEach(updateHighlight);
  els.editors.forEach(histInit); // история начинается заново с чистого шаблона
  saveHistoryNow();
  renderLesson(); // перерисовать карточки шагов (кнопки снова активны)
  updateIframe();
}
