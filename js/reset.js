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

// Данные, которые САЙТ РЕБЁНКА пишет в localStorage (он делит origin с платформой
// через srcdoc-iframe): пользователи, вход, права, флаги и комментарии по товарам
// (ключи вида comments_<id>). При «Начать заново» их тоже нужно стереть, иначе
// старые комментарии/аккаунты остаются на свежесобранном сайте.
function clearSiteData() {
  const exact = ["users", "isLoggedIn", "currentUser", "is_admin", "secret_flag"];
  try {
    exact.forEach(function (k) { localStorage.removeItem(k); });
    // comments_<id> — id заранее неизвестны, поэтому собираем ключи и чистим по префиксу.
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.indexOf("comments_") === 0) toRemove.push(key);
    }
    toRemove.forEach(function (k) { localStorage.removeItem(k); });
  } catch (e) {
    /* недоступный storage — не критично */
  }
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
  clearSiteData(); // стираем данные, записанные самим сайтом ребёнка
  els.editors.forEach(updateHighlight);
  els.editors.forEach(histInit); // история начинается заново с чистого шаблона
  saveHistoryNow();
  renderLesson(); // перерисовать карточки шагов (кнопки снова активны)
  updateIframe();
}
