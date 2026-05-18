/* =============================================================
   Песочница HTML / CSS / JS — клиентское приложение без сервера.
   Логика: переключение вкладок, автообновление iframe через srcdoc,
   автосохранение в localStorage, кнопка сброса, перехват консоли.
   ============================================================= */

/* ---------- 1. Примеры по умолчанию ---------- */
// Эти значения подставляются в редакторы при первом запуске
// или после нажатия кнопки «Сбросить».
const DEFAULT_FILES = {
  'index.html':
`<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Моя страница</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Привет, мир!</h1>
  <p>Это моя первая страница в песочнице.</p>
  <button id="btn">Нажми меня</button>

  <script src="main.js"></script>
</body>
</html>`,

  'style.css':
`/* Стили для страницы ученика */
body {
  font-family: system-ui, sans-serif;
  background: #f0f8ff;
  color: #222;
  padding: 24px;
  margin: 0;
}

h1 {
  color: #2a7ae2;
}

button {
  padding: 8px 16px;
  background: #2a7ae2;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background: #1a5fbf;
}`,

  'main.js':
`// Скрипт ученика. Выполняется внутри iframe.
console.log('Скрипт загружен!');

const btn = document.getElementById('btn');
if (btn) {
  btn.addEventListener('click', () => {
    const p = document.createElement('p');
    p.textContent = 'Кнопка нажата в ' + new Date().toLocaleTimeString();
    document.body.appendChild(p);
    console.log('Добавлен новый параграф');
  });
}`
};

/* ---------- 2. Ключи для localStorage ---------- */
// У каждого виртуального файла свой ключ хранения.
const STORAGE_KEYS = {
  'index.html': 'sandbox::index.html',
  'style.css':  'sandbox::style.css',
  'main.js':    'sandbox::main.js'
};

/* ---------- 3. Получаем ссылки на элементы интерфейса ---------- */
const editor          = document.getElementById('editor');
const tabs            = document.querySelectorAll('.tab');
const preview         = document.getElementById('preview');
const runBtn          = document.getElementById('run-btn');
const resetBtn        = document.getElementById('reset-btn');
const consoleEl       = document.getElementById('console');
const clearConsoleBtn = document.getElementById('clear-console');
const savedIndicator  = document.getElementById('saved-indicator');

/* ---------- 4. Состояние: содержимое виртуальных файлов ---------- */
// files[имя] === текущее содержимое соответствующего редактора
const files = {};
let activeTab = 'index.html';

/* ---------- 5. Загрузка и сохранение ---------- */

// Загрузить из localStorage или взять примеры по умолчанию.
function loadFiles() {
  for (const name of Object.keys(DEFAULT_FILES)) {
    const saved = localStorage.getItem(STORAGE_KEYS[name]);
    files[name] = saved !== null ? saved : DEFAULT_FILES[name];
  }
}

// Сохранить все три виртуальных файла в localStorage.
function saveFiles() {
  for (const name of Object.keys(files)) {
    localStorage.setItem(STORAGE_KEYS[name], files[name]);
  }
  flashSavedIndicator();
}

// Маленькая визуальная подсказка «Сохранено».
let savedTimer = null;
function flashSavedIndicator() {
  savedIndicator.classList.add('show');
  clearTimeout(savedTimer);
  savedTimer = setTimeout(() => savedIndicator.classList.remove('show'), 700);
}

/* ---------- 6. Переключение вкладок ---------- */
function switchTab(name) {
  if (name === activeTab) return;
  // Перед уходом с вкладки запоминаем то, что было в редакторе.
  files[activeTab] = editor.value;
  activeTab = name;
  editor.value = files[name];

  tabs.forEach(t => {
    t.classList.toggle('active', t.dataset.file === name);
  });
}

/* ---------- 7. Сборка единого HTML-документа для iframe ---------- */

/*
 * Берём содержимое виртуального index.html и подставляем в него
 *  - содержимое style.css вместо  <link href="style.css">
 *  - содержимое main.js  вместо  <script src="main.js"></script>
 * Если соответствующих тегов нет — вставляем <style> в <head>,
 * а <script> перед </body>. Если нет даже <html> — оборачиваем
 * содержимое в базовый шаблон.
 */
function buildHTML() {
  let html  = files['index.html'];
  const css = files['style.css'];
  const js  = files['main.js'];

  // Если пользователь стёр всю структуру — оборачиваем в базовый шаблон.
  if (!/<html[\s>]/i.test(html)) {
    html =
      '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
      '<title>Preview</title></head><body>' +
      html +
      '</body></html>';
  }

  // ---------- CSS ----------
  // Регулярка ловит <link ... href="style.css" ...> с любым порядком атрибутов
  // и любыми кавычками.
  const linkRegex = /<link\b[^>]*\bhref\s*=\s*["']style\.css["'][^>]*>/i;
  const styleTag  = '<style>\n' + css + '\n</style>';

  if (linkRegex.test(html)) {
    html = html.replace(linkRegex, styleTag);
  } else if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, styleTag + '</head>');
  } else {
    // нет </head> — просто кладём стили в начало
    html = styleTag + html;
  }

  // ---------- JS ----------
  const scriptRegex =
    /<script\b[^>]*\bsrc\s*=\s*["']main\.js["'][^>]*>\s*<\/script>/i;
  const scriptTag = '<script>\n' + js + '\n</script>';

  if (scriptRegex.test(html)) {
    html = html.replace(scriptRegex, scriptTag);
  } else if (/<\/body>/i.test(html)) {
    html = html.replace(/<\/body>/i, scriptTag + '</body>');
  } else {
    html = html + scriptTag;
  }

  // ---------- Перехват console.* и ошибок ----------
  // Этот скрипт встраивается ПЕРВЫМ в <head>, чтобы поймать все
  // последующие вызовы console.log/warn/error/info и window.onerror.
  const consoleHook =
`<script>
(function () {
  function serialize(arg) {
    if (arg instanceof Error) return arg.stack || (arg.name + ': ' + arg.message);
    if (typeof arg === 'object' && arg !== null) {
      try { return JSON.stringify(arg); } catch (e) { return String(arg); }
    }
    return String(arg);
  }
  function send(level, args) {
    try {
      parent.postMessage({
        __sandboxConsole: true,
        level: level,
        message: Array.prototype.map.call(args, serialize).join(' ')
      }, '*');
    } catch (e) { /* ignore */ }
  }
  ['log', 'info', 'warn', 'error'].forEach(function (level) {
    var orig = console[level];
    console[level] = function () {
      send(level, arguments);
      if (orig) orig.apply(console, arguments);
    };
  });
  window.addEventListener('error', function (e) {
    send('error', [e.message + ' (' + (e.filename || '') + ':' + e.lineno + ')']);
  });
  window.addEventListener('unhandledrejection', function (e) {
    send('error', ['Unhandled promise rejection: ' + serialize(e.reason)]);
  });
})();
</script>`;

  if (/<head[^>]*>/i.test(html)) {
    html = html.replace(/<head[^>]*>/i, function (match) {
      return match + consoleHook;
    });
  } else {
    html = consoleHook + html;
  }

  return html;
}

/* ---------- 8. Обновление iframe ---------- */
// Меняем только srcdoc — сам iframe не пересоздаём,
// чтобы не было «мигания» и потенциальных циклов.
function updatePreview() {
  preview.srcdoc = buildHTML();
}

/* ---------- 9. Обработчики событий ---------- */

// Любое изменение текста: только сохраняем. Перезапуск — по кнопке.
editor.addEventListener('input', () => {
  files[activeTab] = editor.value;
  saveFiles();
});

// Поддержка Tab — вставляем два пробела вместо смены фокуса.
// Ctrl/Cmd+Enter — запустить предпросмотр.
editor.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = editor.selectionStart;
    const end   = editor.selectionEnd;
    const indent = '  ';
    editor.value = editor.value.slice(0, start) + indent + editor.value.slice(end);
    editor.selectionStart = editor.selectionEnd = start + indent.length;
    // вручную триггерим input, чтобы сохранилось
    editor.dispatchEvent(new Event('input'));
  } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    runPreview();
  }
});

// Запуск предпросмотра по кнопке.
function runPreview() {
  // Синхронизируем редактор в файл, на случай если input ещё не успел сработать.
  files[activeTab] = editor.value;
  updatePreview();
}

runBtn.addEventListener('click', runPreview);

// Клики по вкладкам.
tabs.forEach(t => {
  t.addEventListener('click', () => switchTab(t.dataset.file));
});

// Кнопка сброса.
resetBtn.addEventListener('click', () => {
  const ok = confirm(
    'Сбросить все файлы к исходным примерам?\n' +
    'Все ваши изменения будут потеряны.'
  );
  if (!ok) return;

  for (const name of Object.keys(DEFAULT_FILES)) {
    files[name] = DEFAULT_FILES[name];
    localStorage.removeItem(STORAGE_KEYS[name]);
  }
  editor.value = files[activeTab];
  consoleEl.innerHTML = '';
  updatePreview();
});

// Приём сообщений из iframe (наши перехваченные console.*).
window.addEventListener('message', (e) => {
  const data = e.data;
  if (!data || data.__sandboxConsole !== true) return;

  const line = document.createElement('div');
  line.className = 'console-line console-' + data.level;
  line.textContent = '[' + data.level + '] ' + data.message;
  consoleEl.appendChild(line);
  consoleEl.scrollTop = consoleEl.scrollHeight;
});

// Очистка консоли.
clearConsoleBtn.addEventListener('click', () => {
  consoleEl.innerHTML = '';
});

/* ---------- 10. Инициализация ---------- */
loadFiles();
editor.value = files[activeTab];
updatePreview();
