// ============================================================
// Встроенная консоль: приём сообщений из iframe и вывод на платформе
// ============================================================
const MAX_CONSOLE_LINES = 500;

function clearConsole() {
  if (!els.consoleOutput) return;
  els.consoleOutput.innerHTML =
    '<div class="console-empty">Здесь появится вывод console.log и ошибки.</div>';
}

function appendConsoleLine(level, text) {
  const out = els.consoleOutput;
  if (!out) return;
  // Убираем плейсхолдер «пусто» при первом сообщении
  const empty = out.querySelector(".console-empty");
  if (empty) empty.remove();

  const line = document.createElement("div");
  line.className = "console-line console-" + level;
  line.textContent = text;
  out.appendChild(line);

  // Ограничиваем число строк, чтобы не разрасталось
  while (out.childElementCount > MAX_CONSOLE_LINES) out.firstElementChild.remove();

  out.scrollTop = out.scrollHeight; // автопрокрутка вниз
}

function handleConsoleMessage(e) {
  // Принимаем только сообщения от нашего превью-iframe
  if (els.preview && e.source !== els.preview.contentWindow) return;
  const data = e.data;
  if (!data || data.__console !== true) return;
  const level = ["log", "info", "warn", "error", "debug"].includes(data.level)
    ? data.level
    : "log";
  appendConsoleLine(level, typeof data.text === "string" ? data.text : String(data.text));
}
