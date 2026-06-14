// ============================================================
// Тост (всплывающее уведомление, исчезает через 5 секунд)
// ============================================================
function showToast(title, text) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML =
    '<div class="toast-title"></div>' + '<div class="toast-text"></div>';
  toast.querySelector(".toast-title").textContent = title;
  toast.querySelector(".toast-text").textContent = text;
  els.toastContainer.appendChild(toast);

  // Запускаем появление в следующем кадре, чтобы сработал transition
  requestAnimationFrame(() => toast.classList.add("visible"));

  setTimeout(() => {
    toast.classList.remove("visible");
    // Удаляем из DOM после завершения анимации исчезновения
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// Общая подсказка по уроку (кнопка «Подсказка» вверху).
function showHint() {
  showToast("💡 Подсказка", lesson.hint);
}
