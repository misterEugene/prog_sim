// ============================================================
// Урок программирования — единственный предустановленный урок.
// Локально, без сервера и без внешних библиотек.
// ============================================================

// ---- Данные урока (источник истины) ----
// Многошаговый урок: расширяем объект `lesson` массивом `steps[]`. Каждый шаг —
// учебная цель + готовые сниппеты, которые кнопка «Вставить блок» дописывает в
// нужные редакторы. Картинки товаров — эмодзи (полностью локально, без CDN).
const lesson = {
  title: "Урок: Собери свой интернет-магазин",

  introMd: `# 🛍️ Собери свой интернет-магазин

Сегодня ты — **веб-разработчик**! Шаг за шагом ты соберёшь настоящий
интернет-магазин: с шапкой, баннером, товарами и работающей корзиной.

**Шаг 0 — создай каркас сайта (один раз):** открой вкладку **index.html**,
напечатай **!** и нажми **Tab** — появится основа страницы (теги \`html\`,
\`head\`, \`body\`). Все блоки будут аккуратно вставляться **внутрь** неё.

**Дальше для каждого блока:**

- У блока есть отдельная кнопка на каждый кусочек кода: **HTML** → index.html, **CSS** → style.css, **JS** → main.js. Нажимай их по очереди — платформа откроет нужный файл, и код появится прямо в редакторе.
- Вставка работает как обычный ввод: передумал — нажми **Ctrl+Z**, и кусочек исчезнет.
- Когда все кусочки блока на месте, нажми **▶ Запустить** (вверху) — и увидишь, как сайт растёт!
- Потом измени детали сам: текст, цвета, цены, эмодзи.

Готов? Поехали! 👇`,

  outroMd: `# 🎉 Поздравляем, ты справился!

Ты собрал настоящий интернет-магазин и побывал в роли **веб-разработчика**.
Ты научился:

- добавлять разметку **HTML** (шапка, баннер, карточки, подвал);
- украшать сайт через **CSS** (цвета, отступы, сетка);
- оживлять страницу на **JavaScript** (рабочая кнопка «В корзину»).

Нажми **⬇ Скачать проект** вверху — и твой магазин сохранится в файл!`,

  hint: "Каждый шаг одинаковый: вставь кнопками все кусочки блока (HTML, CSS…) → нажми ▶ Запустить → посмотри результат → измени деталь сам.",

  initialHTML: ``, // пусто — сайт «вырастает» из вставляемых блоков
  initialCSS: ``,
  initialJS: ``,

  steps: [
    {
      // ----- Шаг 1: Шапка -----
      title: "Шапка магазина",
      time: "10 мин",
      goalMd:
        "**Цель:** добавить верхнюю часть сайта — *шапку*.\n\n**Новый термин:** `<header>` — это HTML-тег для «шапки» страницы, где обычно живут логотип и меню.",
      actionMd:
        "Кнопки ниже добавят разметку шапки в **index.html** и её стили в **style.css** — вставь оба кусочка.",
      snippets: {
        html: `<!-- Шапка магазина: логотип, меню и корзина -->
<header class="site-header" id="home">
  <div class="logo">🛍️ МегаМаркет</div>
  <nav class="menu">
    <a href="#home">Главная</a>
    <a href="#products">Товары</a>
    <a href="#contacts">Контакты</a>
  </nav>
  <div class="cart">🛒 Корзина: <span id="cart-count">0</span></div>
</header>`,
        css: `/* Стили шапки */
.site-header {
  display: flex;                 /* всё в одну строку */
  align-items: center;
  justify-content: space-between;
  background: #5b3df5;           /* цвет фона шапки */
  color: #fff;
  padding: 16px 24px;
}
.logo { font-size: 22px; font-weight: bold; }
.menu a { color: #fff; margin-left: 16px; text-decoration: none; }
.menu a:hover { text-decoration: underline; }
.cart { font-weight: bold; }`,
      },
      taskMd:
        "🔧 **Сделай сам:** в **index.html** замени название `МегаМаркет` на имя своего магазина. А в **style.css** поменяй цвет шапки `background: #5b3df5` на свой любимый.\n\n**Ожидаемый результат:** после ▶ Запустить шапка поменяет название и цвет.",
      hintMd:
        "Цвет можно написать словом (`red`, `green`, `teal`) или кодом вида `#ff8a5b`.",
      doneMd:
        "✅ **Готово, когда** вверху сайта видны твой логотип, меню и «🛒 Корзина: 0».",
    },
    {
      // ----- Шаг 2: Баннер -----
      title: "Баннер со скидкой",
      time: "10 мин",
      goalMd:
        "**Цель:** добавить большой яркий баннер с заголовком и кнопкой.\n\n**Новый термин:** `<button>` — это кнопка, на которую можно нажимать.",
      actionMd:
        "Кнопки добавят баннер в **index.html** и его стили в **style.css**.",
      snippets: {
        html: `<!-- Баннер: главный заголовок и кнопка -->
<section class="banner">
  <h1>Скидки до 50%!</h1>
  <p>Самые крутые товары по лучшим ценам</p>
  <button class="banner-btn">Купить сейчас</button>
</section>`,
        css: `/* Стили баннера */
.banner {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #ffd86b, #ff8a5b);
  color: #3a2a00;
}
.banner h1 { font-size: 40px; margin: 0 0 10px; }
.banner-btn {
  background: #5b3df5; color: #fff; border: none;
  padding: 14px 28px; font-size: 18px; border-radius: 8px; cursor: pointer;
}
.banner-btn:hover { background: #4a2fd0; }`,
      },
      taskMd:
        "🔧 **Сделай сам:** поменяй заголовок `Скидки до 50%!` на свой и придумай новый текст для кнопки вместо `Купить сейчас`.\n\n**Ожидаемый результат:** после ▶ Запустить баннер покажет твой текст.",
      hintMd:
        "Заголовок — это текст между `<h1>` и `</h1>`, а текст кнопки — между `<button …>` и `</button>`.",
      doneMd: "✅ **Готово, когда** на сайте виден яркий баннер с заголовком и кнопкой.",
    },
    {
      // ----- Шаг 3: Карточки товаров -----
      title: "Карточки товаров",
      time: "20 мин",
      goalMd:
        "**Цель:** показать товары красивой сеткой — *каждый товар в своей карточке*.\n\n**Новый термин:** `class` — это «ярлык» элемента, по которому CSS понимает, как его украсить. У всех карточек класс `card`.",
      actionMd:
        "Кнопки добавят сетку из трёх товаров в **index.html** и её стили в **style.css**.",
      snippets: {
        html: `<!-- Сетка товаров: три карточки -->
<section class="products" id="products">
  <div class="card">
    <div class="card-img">👟</div>
    <h3 class="card-title">Кроссовки</h3>
    <p class="card-price">3 990 ₽</p>
    <button class="add-to-cart">В корзину</button>
  </div>
  <div class="card">
    <div class="card-img">🎧</div>
    <h3 class="card-title">Наушники</h3>
    <p class="card-price">2 490 ₽</p>
    <button class="add-to-cart">В корзину</button>
  </div>
  <div class="card">
    <div class="card-img">⌚</div>
    <h3 class="card-title">Часы</h3>
    <p class="card-price">5 990 ₽</p>
    <button class="add-to-cart">В корзину</button>
  </div>
</section>`,
        css: `/* Сетка карточек товаров */
.products {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  padding: 24px;
}
.card {
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 16px;
  text-align: center;
  background: #fff;
}
.card-img { font-size: 64px; }
.card-title { margin: 10px 0 4px; font-size: 18px; }
.card-price { color: #5b3df5; font-weight: bold; font-size: 18px; margin: 0 0 12px; }
.add-to-cart {
  background: #5b3df5; color: #fff; border: none;
  padding: 10px 16px; border-radius: 6px; cursor: pointer; width: 100%;
}
.add-to-cart:hover { background: #4a2fd0; }`,
      },
      taskMd:
        "🔧 **Сделай сам:** поменяй у любого товара эмодзи (например, `👟` на `🎒`), название или цену.\n\n⭐ **Со звёздочкой:** скопируй один блок `<div class=\"card\">…</div>` целиком и вставь рядом — получится четвёртый товар!",
      hintMd:
        "Эмодзи можно скопировать прямо из этого задания, а название и цену — просто перепечатать между тегами.",
      doneMd:
        "✅ **Готово, когда** видно три (или больше) карточки товаров с кнопками «В корзину».",
    },
    {
      // ----- Шаг 4: Подвал -----
      title: "Подвал с контактами",
      time: "10 мин",
      goalMd:
        "**Цель:** добавить нижнюю часть сайта — *подвал* с контактами.\n\n**Новый термин:** `<footer>` — это «подвал» страницы, где пишут контакты и копирайт.",
      actionMd:
        "Кнопки добавят подвал в **index.html** и его стили в **style.css**.",
      snippets: {
        html: `<!-- Подвал сайта: контакты и копирайт -->
<footer class="site-footer" id="contacts">
  <p>📞 Телефон: 8-800-555-35-35</p>
  <p>✉️ Почта: shop@example.com</p>
  <p>© 2026 МегаМаркет. Все права защищены.</p>
</footer>`,
        css: `/* Стили подвала */
.site-footer {
  background: #2b2b3a;
  color: #cfcfe0;
  text-align: center;
  padding: 24px;
  margin-top: 20px;
}
.site-footer p { margin: 4px 0; }`,
      },
      taskMd:
        "🔧 **Сделай сам:** замени телефон и почту на свои выдуманные.\n\n**Ожидаемый результат:** после ▶ Запустить в подвале появятся твои контакты.",
      hintMd: "Меняй только текст внутри `<p>…</p>`, сами теги трогать не нужно.",
      doneMd:
        "✅ **Готово, когда** внизу сайта виден подвал с телефоном, почтой и копирайтом.",
    },
    {
      // ----- Шаг 5: Интерактив на JS -----
      title: "Оживляем кнопку «В корзину»",
      time: "15 мин",
      goalMd:
        "**Цель:** сделать так, чтобы кнопка «В корзину» работала и считала товары.\n\n**Новый термин:** `addEventListener('click', …)` — это «слушатель»: он говорит кнопке, что делать по нажатию.",
      actionMd: "Кнопка добавит код в **main.js** — он оживит все кнопки «В корзину».",
      snippets: {
        js: `// Заставляем кнопки "В корзину" работать
let count = 0;
const counter = document.getElementById("cart-count");
const buttons = document.querySelectorAll(".add-to-cart");

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    count = count + 1;            // увеличиваем счётчик
    counter.textContent = count;  // показываем число в корзине
    console.log("Товар добавлен! Всего в корзине: " + count);
  });
});`,
      },
      taskMd:
        "🔧 **Сделай сам:** поменяй сообщение в `console.log(...)` на своё (например, «Ура, покупка!»). Нажми ▶ Запустить и понажимай «В корзину» — смотри, как растёт счётчик и появляются строки в консоли 🖥.",
      hintMd:
        "Счётчик в шапке — это `<span id=\"cart-count\">`. JavaScript находит его по `id` и меняет число.",
      doneMd:
        "✅ **Готово, когда** при клике на «В корзину» число у «🛒 Корзина» растёт, а в консоли видны сообщения.",
    },
  ],
};

const STORAGE_KEY = "savedLessonCode";
// Готовый документ для отдельной вкладки просмотра (preview.html). Пишется на
// каждый «Запустить»; preview.html читает его и обновляется по событию storage.
const PREVIEW_DOC_KEY = "previewDoc";

// ---- Ссылки на DOM-элементы ----
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
  });
  // Кнопки
  els.runBtn = document.getElementById("run-btn");
  els.openTabBtn = document.getElementById("open-tab-btn");
  els.resetBtn = document.getElementById("reset-btn");
  els.hintBtn = document.getElementById("hint-btn");
  els.downloadBtn = document.getElementById("download-btn");
  // Консоль
  els.consoleOutput = document.getElementById("console-output");
  els.consoleClearBtn = document.getElementById("console-clear");
  // Emmet-превью (всплывающая подсказка у курсора)
  els.emmetPreview = document.getElementById("emmet-preview");
  els.emmetPreviewCode = els.emmetPreview.querySelector("code");
}

// ============================================================
// Markdown → HTML (минимальный парсер без библиотек)
// Поддержка: # ## ###, списки -/*, **жирный**, *курсив*, `код`, абзацы.
// ============================================================
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Инлайн-замены. Порядок важен: код → жирный → курсив.
function inlineMarkdown(text) {
  return text
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function markdownToHtml(md) {
  const lines = escapeHtml(md).split("\n");
  const html = [];
  let listItems = null; // накапливаем пункты текущего списка
  let paragraph = null; // накапливаем строки текущего абзаца

  const flushList = () => {
    if (listItems) {
      html.push("<ul>" + listItems.join("") + "</ul>");
      listItems = null;
    }
  };
  const flushParagraph = () => {
    if (paragraph) {
      html.push("<p>" + inlineMarkdown(paragraph.join(" ")) + "</p>");
      paragraph = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line === "") {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const listItem = line.match(/^[-*]\s+(.*)$/);
    if (listItem) {
      flushParagraph();
      if (!listItems) listItems = [];
      listItems.push("<li>" + inlineMarkdown(listItem[1]) + "</li>");
      continue;
    }

    // Обычная строка абзаца
    flushList();
    if (!paragraph) paragraph = [];
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return html.join("\n");
}

// ============================================================
// Рендер урока: вступление + карточки шагов + финал
// ============================================================
// Части блока (сниппеты) вставляются ОТДЕЛЬНЫМИ кнопками — по одной на язык.
// Куда вставляется каждая часть и как она называется в UI:
const PART_INFO = {
  html: { file: "index.html", label: "HTML", editor: () => els.htmlEditor },
  css: { file: "style.css", label: "CSS", editor: () => els.cssEditor },
  js: { file: "main.js", label: "JS", editor: () => els.jsEditor },
};
const PART_ORDER = ["html", "css", "js"];

// Какие части блоков уже вставлены. Ключ — "индексШага:язык" (см. partKey).
const doneParts = new Set();

function partKey(index, lang) {
  return index + ":" + lang;
}

// Языки частей шага в порядке вставки (html → css → js).
function stepLangs(step) {
  return PART_ORDER.filter((lang) => step.snippets && step.snippets[lang]);
}

// Шаг выполнен, когда вставлены ВСЕ его части.
function isStepDone(index) {
  return stepLangs(lesson.steps[index]).every((lang) =>
    doneParts.has(partKey(index, lang))
  );
}

function doneStepCount() {
  let n = 0;
  for (let i = 0; i < lesson.steps.length; i++) if (isStepDone(i)) n++;
  return n;
}

// Построить DOM-карточку одного шага. Каждая часть блока (HTML/CSS/JS) получает
// свою кнопку вставки; их состояние (активна/выполнена/заблокирована) задаёт
// updateProgress.
function buildStepCard(step, index) {
  const card = document.createElement("section");
  card.className = "step";
  card.dataset.stepIndex = String(index);

  const head = document.createElement("div");
  head.className = "step-head";
  head.innerHTML =
    `<span class="step-num">Шаг ${index + 1}</span>` +
    `<span class="step-title"></span>` +
    `<span class="step-time">⏱ ${step.time}</span>`;
  head.querySelector(".step-title").textContent = step.title;
  card.appendChild(head);

  const goal = document.createElement("div");
  goal.className = "step-goal";
  goal.innerHTML = markdownToHtml(step.goalMd);
  card.appendChild(goal);

  const action = document.createElement("div");
  action.className = "step-action";
  action.innerHTML = markdownToHtml(step.actionMd);
  card.appendChild(action);

  const buttons = document.createElement("div");
  buttons.className = "step-buttons";
  stepLangs(step).forEach((lang) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn-insert";
    btn.dataset.insert = String(index);
    btn.dataset.lang = lang;
    btn.addEventListener("click", () => insertPart(index, lang));
    buttons.appendChild(btn);
  });
  card.appendChild(buttons);

  const task = document.createElement("div");
  task.className = "step-task";
  task.innerHTML = markdownToHtml(step.taskMd);
  card.appendChild(task);

  const hint = document.createElement("details");
  hint.className = "step-hint";
  const summary = document.createElement("summary");
  summary.textContent = "💡 Подсказка";
  hint.appendChild(summary);
  const hintBody = document.createElement("div");
  hintBody.innerHTML = markdownToHtml(step.hintMd);
  hint.appendChild(hintBody);
  card.appendChild(hint);

  const done = document.createElement("div");
  done.className = "step-done";
  done.innerHTML = markdownToHtml(step.doneMd);
  card.appendChild(done);

  return card;
}

function renderLesson() {
  const root = els.markdown;
  root.innerHTML = "";

  const intro = document.createElement("div");
  intro.className = "lesson-intro";
  intro.innerHTML = markdownToHtml(lesson.introMd);
  root.appendChild(intro);

  const progress = document.createElement("div");
  progress.className = "lesson-progress";
  progress.innerHTML =
    '<div class="progress-text"></div>' +
    '<div class="progress-bar"><div class="progress-fill"></div></div>';
  root.appendChild(progress);
  els.progressText = progress.querySelector(".progress-text");
  els.progressFill = progress.querySelector(".progress-fill");

  lesson.steps.forEach((step, i) => root.appendChild(buildStepCard(step, i)));

  const outro = document.createElement("div");
  outro.className = "lesson-outro";
  outro.hidden = true;
  outro.innerHTML = markdownToHtml(lesson.outroMd);
  root.appendChild(outro);
  els.outro = outro;

  updateProgress();
}

// Обновить состояние кнопок, прогресс-бар и показ финала.
// Линейная разблокировка: активны кнопки только следующего невыполненного шага.
function updateProgress() {
  const total = lesson.steps.length;
  const doneCount = doneStepCount();
  const next = firstUndoneStep();

  els.markdown.querySelectorAll(".btn-insert").forEach((btn) => {
    const i = Number(btn.dataset.insert);
    const info = PART_INFO[btn.dataset.lang];
    btn.classList.remove("done", "locked");
    btn.title = "";
    if (doneParts.has(partKey(i, btn.dataset.lang))) {
      // Уже добавленную часть можно вставить повторно (если ребёнок удалил код)
      btn.disabled = false;
      btn.classList.add("done");
      btn.textContent = `↻ Вставить ${info.label} снова`;
    } else if (i === next) {
      btn.disabled = false;
      btn.textContent = `➕ Вставить ${info.label} → ${info.file}`;
    } else {
      btn.disabled = true;
      btn.classList.add("locked");
      btn.textContent = `🔒 Вставить ${info.label}`;
      btn.title = `Сначала собери блок ${next + 1}`;
    }
  });

  if (els.progressText) {
    els.progressText.textContent = `Готово блоков: ${doneCount} из ${total}`;
  }
  if (els.progressFill) {
    els.progressFill.style.width = Math.round((doneCount / total) * 100) + "%";
  }
  if (els.outro) els.outro.hidden = doneCount < total;
}

// Индекс первого шага с невставленными частями (или -1, если всё готово).
function firstUndoneStep() {
  for (let i = 0; i < lesson.steps.length; i++) {
    if (!isStepDone(i)) return i;
  }
  return -1;
}

// Обернуть код блока комментариями-границами (свои для каждого языка),
// чтобы в файле было видно, где блок начинается и заканчивается.
function wrapBlock(lang, title, code) {
  const bar = "=======";
  if (lang === "html") {
    return `<!-- ${bar} НАЧАЛО: ${title} ${bar} -->\n${code}\n<!-- ${bar} КОНЕЦ: ${title} ${bar} -->`;
  }
  if (lang === "css") {
    return `/* ${bar} НАЧАЛО: ${title} ${bar} */\n${code}\n/* ${bar} КОНЕЦ: ${title} ${bar} */`;
  }
  return `// ${bar} НАЧАЛО: ${title} ${bar}\n${code}\n// ${bar} КОНЕЦ: ${title} ${bar}`;
}

// Вставить текст в редактор КАК ПОЛЬЗОВАТЕЛЬСКИЙ ВВОД: фокус + выделение
// диапазона [start, end) + execCommand('insertText'). Это кладёт вставку в
// нативную историю отмены (Ctrl+Z убирает её одним шагом, как свой ввод) и
// само диспатчит 'input' (→ подсветка + автосохранение). Редактор должен быть
// видим (см. switchTab перед вызовом) — скрытый textarea не фокусируется.
function insertAsUserInput(editor, start, end, text) {
  editor.focus();
  editor.setSelectionRange(start, end);
  const ok =
    typeof document.execCommand === "function" &&
    document.execCommand("insertText", false, text);
  if (!ok) {
    // Фолбэк без нативного Undo, но с тем же событием input
    const v = editor.value;
    editor.value = v.slice(0, start) + text + v.slice(end);
    editor.dispatchEvent(new Event("input", { bubbles: true }));
  }
  const caret = start + text.length;
  editor.setSelectionRange(caret, caret);
  // Прокручиваем так, чтобы вставленный код оказался на виду
  const c = caretCoords(editor, caret);
  editor.scrollTop = Math.max(0, c.top - editor.clientHeight / 2);
  syncScroll(editor);
}

// Вставить ОДНУ часть блока (html/css/js) в её файл: открыть нужную вкладку,
// вставить код как пользовательский ввод (Ctrl+Z работает), отметить часть
// готовой, сохранить прогресс и подсказать следующий шаг.
function insertPart(index, lang) {
  const key = partKey(index, lang);
  const isReinsert = doneParts.has(key);
  // Новые части вставляем только в текущем блоке; добавленную — повторно в любой момент
  if (!isReinsert && index !== firstUndoneStep()) return;

  const step = lesson.steps[index];
  const code = step.snippets && step.snippets[lang];
  if (!code) return;

  const info = PART_INFO[lang];
  const editor = info.editor();
  const block = wrapBlock(lang, step.title, code);
  const v = editor.value;

  let start, end, text;
  if (lang === "html") {
    // HTML — внутрь каркаса, перед </body> (с отступом на уровень глубже).
    // Каркаса нет — ничего не вставляем (иначе блок попал бы после </body></html>).
    const m = /([ \t]*)<\/body>/i.exec(v);
    if (!m) {
      showToast(
        "⚠ Сначала создай каркас сайта",
        "Открой вкладку index.html, напечатай ! и нажми Tab — появится основа страницы. Потом снова нажми кнопку вставки."
      );
      return;
    }
    const indent = (m[1] || "") + "\t"; // содержимое body — на уровень глубже </body>
    start = end = m.index;
    text =
      block
        .split("\n")
        .map((line) => (line ? indent + line : line))
        .join("\n") + "\n";
  } else {
    // CSS/JS — отдельные файлы, дописываем в конец: выделяем хвостовые пустые
    // строки и заменяем их отбивкой \n\n + блок (одним шагом отмены).
    start = v.search(/\s*$/);
    end = v.length;
    text = start > 0 ? "\n\n" + block : block;
  }

  switchTab(info.file); // показать файл: ребёнок видит вставку, а фокус — возможен
  insertAsUserInput(editor, start, end, text);

  doneParts.add(key);
  autosave();
  updateProgress();

  const remaining = stepLangs(step).filter(
    (l) => !doneParts.has(partKey(index, l))
  );
  if (isReinsert) {
    showToast(
      "Кусочек добавлен снова",
      `${info.label} снова вставлен в ${info.file}. Нажми ▶ Запустить, чтобы увидеть результат!`
    );
  } else if (remaining.length) {
    showToast(
      "Кусочек добавлен",
      `${info.label} вставлен в ${info.file}. Вернись на вкладку 📖 Урок и вставь ещё: ${remaining
        .map((l) => PART_INFO[l].label)
        .join(", ")}.`
    );
  } else if (doneStepCount() === lesson.steps.length) {
    showToast(
      "🎉 Все блоки добавлены!",
      `${info.label} вставлен в ${info.file}. Нажми ▶ Запустить, чтобы увидеть результат!`
    );
  } else {
    showToast(
      `Блок «${step.title}» собран!`,
      `${info.label} вставлен в ${info.file}. Нажми ▶ Запустить, чтобы увидеть результат!`
    );
  }
}

// ============================================================
// Подсветка синтаксиса (без библиотек)
//
// Приём «оверлей»: раскрашенный <pre> лежит ПОД прозрачным <textarea>.
// Здесь — токенайзер: бежим по строке, на каждой позиции пробуем
// «липкие» (sticky, флаг /y) регэкспы по порядку. Совпал — оборачиваем
// в <span class="tok-…">, иначе экранируем один символ и идём дальше.
// Экранирование (escapeHtml) обязательно: код вставляется через innerHTML.
// ============================================================
function tokenize(code, patterns) {
  let out = "";
  let i = 0;
  const n = code.length;
  while (i < n) {
    let matched = false;
    for (const p of patterns) {
      p.re.lastIndex = i; // sticky: ищем строго с позиции i
      const m = p.re.exec(code);
      if (m && m[0].length > 0) {
        out += `<span class="tok-${p.cls}">${escapeHtml(m[0])}</span>`;
        i += m[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      out += escapeHtml(code[i]);
      i++;
    }
  }
  return out;
}

const HTML_PATTERNS = [
  { cls: "comment", re: /<!--[\s\S]*?-->/y },
  { cls: "keyword", re: /<!doctype[^>]*>/iy },
  { cls: "tag", re: /<\/?[a-zA-Z][\w-]*|\/?>/y }, // < / имя тега и закрывающая >
  { cls: "attr", re: /\s[a-zA-Z_:][\w:.-]*(?=\s*=)/y }, // имя атрибута перед =
  { cls: "string", re: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/y },
];

const CSS_PATTERNS = [
  { cls: "comment", re: /\/\*[\s\S]*?\*\//y },
  { cls: "string", re: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/y },
  { cls: "keyword", re: /@[\w-]+/y }, // @media, @import …
  { cls: "number", re: /#[0-9a-fA-F]{3,8}\b/y }, // hex-цвет
  { cls: "number", re: /-?\b\d*\.?\d+(?:[a-z%]+)?\b/y }, // число с единицей
  { cls: "property", re: /[a-zA-Z-]+(?=\s*:)/y }, // свойство перед двоеточием
  { cls: "punct", re: /[{}:;,]/y },
];

const JS_PATTERNS = [
  { cls: "comment", re: /\/\/[^\n]*/y },
  { cls: "comment", re: /\/\*[\s\S]*?\*\//y },
  {
    cls: "string",
    re: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/y,
  },
  {
    cls: "keyword",
    re: /\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|default|break|continue|new|class|extends|super|this|typeof|instanceof|in|of|null|undefined|true|false|try|catch|finally|throw|async|await|yield|delete|void)\b/y,
  },
  { cls: "number", re: /\b0x[0-9a-fA-F]+\b|\b\d*\.?\d+\b/y },
  { cls: "func", re: /[a-zA-Z_$][\w$]*(?=\s*\()/y }, // имя перед "("
  { cls: "punct", re: /[{}()[\];,.]/y },
];

const PATTERNS_BY_LANG = {
  html: HTML_PATTERNS,
  css: CSS_PATTERNS,
  js: JS_PATTERNS,
};

function highlight(code, lang) {
  return tokenize(code, PATTERNS_BY_LANG[lang] || []);
}

// Перерисовать слой подсветки под textarea и синхронизировать прокрутку.
function updateHighlight(editor) {
  const codeEl = editor._codeEl;
  if (!codeEl) return;
  codeEl.innerHTML = highlight(editor.value, editor.dataset.lang);
  syncScroll(editor);
}

function syncScroll(editor) {
  const pre = editor._preEl;
  if (!pre) return;
  pre.scrollTop = editor.scrollTop;
  pre.scrollLeft = editor.scrollLeft;
}

// Вставка символа табуляции в позицию курсора (заменяя выделение, если есть).
// execCommand('insertText') сохраняет нативную историю отмены (Ctrl+Z) и сам
// диспатчит событие 'input' (→ подсветка + автосохранение). Если он недоступен —
// откатываемся на ручную вставку с эмуляцией 'input'.
function insertTab(editor) {
  const ok =
    typeof document.execCommand === "function" &&
    document.execCommand("insertText", false, "\t");
  if (!ok) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const v = editor.value;
    editor.value = v.slice(0, start) + "\t" + v.slice(end);
    editor.selectionStart = editor.selectionEnd = start + 1;
    editor.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

// ============================================================
// Emmet: раскрытие HTML-аббревиатур по Tab (движок — в emmet.js)
// ============================================================

// Извлечь аббревиатуру слева от курсора. Скользим влево, учитывая скобки
// [] {} () (внутри них пробелы — часть аббревиатуры). Останавливаемся на
// пробеле/начале строки. Если упёрлись в '<' — значит задели готовую
// разметку, аббревиатуры нет (вернём пустую).
function extractAbbreviation(text, caret) {
  let i = caret;
  let start = caret;
  let depth = 0;
  while (i > 0) {
    const c = text[i - 1];
    if (c === "\n") break;
    if (c === "]" || c === "}" || c === ")") { depth++; i--; start = i; continue; }
    if (c === "[" || c === "{" || c === "(") {
      if (depth > 0) { depth--; i--; start = i; continue; }
      break; // незакрытая открывающая скобка на верхнем уровне
    }
    if (depth > 0) { i--; start = i; continue; }
    if (c === " " || c === "\t") break;
    if (c === "<") return { start: caret, abbr: "" }; // задели разметку
    i--; start = i;
  }
  return { start, abbr: text.slice(start, caret) };
}

// Попытка раскрыть аббревиатуру в позиции курсора. true — раскрыли.
function tryExpandEmmet(ta) {
  if (ta.dataset.lang !== "html") return false; // Emmet — только для HTML
  if (!global_Emmet()) return false;
  if (ta.selectionStart !== ta.selectionEnd) return false; // есть выделение → обычный Tab

  const caret = ta.selectionStart;
  const { start, abbr } = extractAbbreviation(ta.value, caret);
  if (!abbr || !window.Emmet.isExpandable(abbr)) return false;

  const res = window.Emmet.expand(abbr);
  if (!res || !res.text) return false;

  // Отступ текущей строки — добавляем его к каждой новой строке раскрытия
  const lineStart = ta.value.lastIndexOf("\n", start - 1) + 1;
  const pad = (/^[\t ]*/.exec(ta.value.slice(lineStart, start)) || [""])[0];
  const text = res.text.replace(/\n/g, "\n" + pad);

  // Курсор: смещаем на величину добавленных отступов до позиции метки
  const newlinesBefore = res.text.slice(0, res.caret).split("\n").length - 1;
  const caretOffset = res.caret + newlinesBefore * pad.length;

  // Заменяем аббревиатуру на раскрытие (через execCommand — с историей отмены)
  ta.selectionStart = start;
  ta.selectionEnd = caret;
  const ok =
    typeof document.execCommand === "function" &&
    document.execCommand("insertText", false, text);
  if (!ok) {
    const v = ta.value;
    ta.value = v.slice(0, start) + text + v.slice(caret);
    ta.dispatchEvent(new Event("input", { bubbles: true }));
  }
  ta.selectionStart = ta.selectionEnd = start + caretOffset;
  return true;
}

function global_Emmet() {
  return typeof window.Emmet === "object" && window.Emmet;
}

// ============================================================
// Emmet-превью: всплывающая подсказка со структурой, которую вставит Tab
// ============================================================

// Свойства, влияющие на раскладку текста — копируем в «зеркало», чтобы
// вычислить пиксельные координаты курсора внутри textarea.
const MIRROR_PROPS = [
  "boxSizing", "width", "paddingTop", "paddingRight", "paddingBottom",
  "paddingLeft", "borderTopWidth", "borderRightWidth", "borderBottomWidth",
  "borderLeftWidth", "fontFamily", "fontSize", "fontWeight", "fontStyle",
  "lineHeight", "letterSpacing", "wordSpacing", "tabSize", "MozTabSize",
  "textIndent",
];

let mirrorEl = null; // переиспользуемый невидимый div для измерений

// Координаты курсора (позиция pos) ОТНОСИТЕЛЬНО области текста textarea, без
// учёта прокрутки. Приём «зеркало»: невидимый div с теми же метриками, в нём
// текст до курсора + span-маркер; берём offset маркера.
function caretCoords(ta, pos) {
  if (!mirrorEl) {
    mirrorEl = document.createElement("div");
    mirrorEl.setAttribute("aria-hidden", "true");
    document.body.appendChild(mirrorEl);
  }
  const div = mirrorEl;
  const cs = getComputedStyle(ta);
  MIRROR_PROPS.forEach((p) => { div.style[p] = cs[p]; });
  div.style.position = "absolute";
  div.style.visibility = "hidden";
  div.style.whiteSpace = "pre"; // wrap="off" → строки не переносятся
  div.style.overflow = "hidden";
  div.style.top = "-9999px";
  div.style.left = "0";

  div.textContent = ta.value.slice(0, pos);
  const marker = document.createElement("span");
  marker.textContent = "​"; // нулевой пробел — место курсора
  div.appendChild(marker);

  const left = marker.offsetLeft;
  const top = marker.offsetTop;
  const lineHeight = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4;
  return { left, top, lineHeight };
}

function hideEmmetPreview() {
  if (els.emmetPreview) els.emmetPreview.hidden = true;
}

// Показать (или обновить/скрыть) подсказку для текущей позиции в редакторе.
// Использует те же extractAbbreviation/isExpandable/expand, что и Tab —
// поэтому превью точно совпадает с тем, что реально вставится.
function updateEmmetPreview(ta) {
  if (ta.dataset.lang !== "html") return hideEmmetPreview();
  if (!global_Emmet()) return hideEmmetPreview();
  if (ta.selectionStart !== ta.selectionEnd) return hideEmmetPreview();

  const caret = ta.selectionStart;
  const { abbr } = extractAbbreviation(ta.value, caret);
  if (!abbr || !window.Emmet.isExpandable(abbr)) return hideEmmetPreview();

  const res = window.Emmet.expand(abbr);
  if (!res || !res.text) return hideEmmetPreview();

  const box = els.emmetPreview;
  els.emmetPreviewCode.innerHTML = highlight(res.text, "html");
  box.hidden = false; // снимаем hidden до замеров offsetWidth/Height

  // Позиция: под строкой курсора. Координаты курсора → экранные (textarea
  // bounding rect + смещение в тексте − прокрутка).
  const c = caretCoords(ta, caret);
  const taRect = ta.getBoundingClientRect();
  let x = taRect.left + c.left - ta.scrollLeft;
  let y = taRect.top + c.top - ta.scrollTop + c.lineHeight + 4;

  // Клампим в пределах окна; если не влезает вниз — показываем над строкой.
  const bw = box.offsetWidth;
  const bh = box.offsetHeight;
  if (x + bw > window.innerWidth - 8) x = window.innerWidth - 8 - bw;
  if (x < 8) x = 8;
  if (y + bh > window.innerHeight - 8) {
    y = taRect.top + c.top - ta.scrollTop - bh - 4;
  }
  if (y < 8) y = 8;
  box.style.left = x + "px";
  box.style.top = y + "px";
}

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

// ============================================================
// Сборка и обновление iframe
// ============================================================
// Скрипт-перехватчик: подменяет console.* и ловит ошибки внутри iframe,
// пересылая всё родителю через postMessage (→ встроенная консоль платформы).
const CONSOLE_HOOK = `(function(){
  function fmt(a){
    if(typeof a==='string') return a;
    if(a instanceof Error) return a.name+': '+a.message;
    if(typeof a==='function') return String(a);
    try{ return JSON.stringify(a); }catch(e){ return String(a); }
  }
  function send(level,args){
    try{
      var t=Array.prototype.map.call(args,fmt).join(' ');
      parent.postMessage({__console:true,level:level,text:t},'*');
    }catch(e){}
  }
  ['log','info','warn','error','debug'].forEach(function(m){
    var orig=console[m]?console[m].bind(console):null;
    console[m]=function(){ send(m,arguments); if(orig) orig.apply(null,arguments); };
  });
  window.addEventListener('error',function(e){
    send('error',[e.message+(e.lineno?' (строка '+e.lineno+')':'')]);
  });
  window.addEventListener('unhandledrejection',function(e){
    send('error',['Необработанная ошибка промиса: '+fmt(e.reason)]);
  });
})();`;

// Страж якорных ссылок в превью. В iframe c srcdoc якорные ссылки (#section)
// разрешаются ОТНОСИТЕЛЬНО адреса родителя (платформы), поэтому клик уводил бы
// превью на платформу. Перехватываем клики по #-ссылкам: гасим переход и сами
// плавно прокручиваем к секции с нужным id (если она уже есть на странице).
const LINK_GUARD = `(function(){
  document.addEventListener('click',function(e){
    var t=e.target;
    var a=t&&t.closest?t.closest('a'):null;
    if(!a) return;
    var href=a.getAttribute('href')||'';
    if(href===''||href.charAt(0)==='#'){
      e.preventDefault();
      var id=href.slice(1);
      var el=id?document.getElementById(id):null;
      if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
    }
  },true);
})();`;

// Собрать полный HTML-документ из текущих редакторов (для превью и для открытия
// в новой вкладке). Внедряет стили и служебные скрипты (консоль + страж ссылок).
function buildDocument() {
  const html = els.htmlEditor.value;
  const css = els.cssEditor.value;
  // Экранируем закрывающий тег, чтобы он не оборвал инлайновый <script>
  const js = els.jsEditor.value.replace(/<\/script>/gi, "<\\/script>");

  const styleTag = `<style>${css}</style>`;
  const scripts = `<script>${CONSOLE_HOOK}\n${LINK_GUARD}<\/script>\n    <script>${js}<\/script>`;

  let doc;
  if (/<\/body>/i.test(html)) {
    // Ученик создал полный каркас (Emmet «!»). Используем его как документ:
    // стили вставляем перед </head>, скрипты — перед </body>. Замены через
    // функцию-replacer, чтобы символы $ в коде ребёнка не толковались как $&/$1.
    doc = html;
    if (/<\/head>/i.test(doc)) {
      doc = doc.replace(/<\/head>/i, () => `  ${styleTag}\n</head>`);
    } else {
      doc = styleTag + "\n" + doc;
    }
    doc = doc.replace(/<\/body>/i, () => `  ${scripts}\n</body>`);
  } else {
    // Каркаса нет (фрагмент) — оборачиваем сами, как раньше.
    doc = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    ${styleTag}
  </head>
  <body>
${html}
    ${scripts}
  </body>
</html>`;
  }
  return doc;
}

// Сохранить готовый документ для вкладки просмотра (preview.html подхватит его
// по событию storage). Ошибки storage (приватный режим) — молча игнорируем.
function savePreviewDoc(doc) {
  try {
    localStorage.setItem(PREVIEW_DOC_KEY, doc);
  } catch (e) {
    /* storage недоступен — вкладка просмотра просто не обновится */
  }
}

function updateIframe() {
  clearConsole(); // новый запуск — чистим вывод прошлого
  const doc = buildDocument();
  els.preview.srcdoc = doc;
  savePreviewDoc(doc); // зеркалим в отдельную вкладку (если открыта)
}

// Открыть сайт ученика в отдельной вкладке. Вкладка (preview.html) — живое
// зеркало превью: читает документ из localStorage и обновляется на каждый
// «Запустить» (через событие storage). Именованная цель — повторный клик
// переиспользует ту же вкладку.
function openInNewTab() {
  savePreviewDoc(buildDocument()); // свежий снимок к моменту открытия
  const win = window.open("preview.html", "shopPreview");
  if (!win) {
    showToast(
      "Не удалось открыть вкладку",
      "Разреши всплывающие окна (popups) для этой страницы и нажми кнопку снова."
    );
    return;
  }
  win.focus();
}

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

// ============================================================
// Сброс к шаблону
// ============================================================
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
  renderLesson(); // перерисовать карточки шагов (кнопки снова активны)
  updateIframe();
}

// ============================================================
// Скачивание проекта одним ZIP-архивом (без внешних библиотек)
// ============================================================

// CRC32 (полином 0xEDB88320), без предвычисленной таблицы
function crc32(bytes) {
  let crc = ~0;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (~crc) >>> 0;
}

// Сборка ZIP-архива методом "store" (без сжатия).
// files: [{ name, content }] → Blob
function buildZip(files) {
  const encoder = new TextEncoder();
  const u16 = (n) => new Uint8Array([n & 0xff, (n >>> 8) & 0xff]);
  const u32 = (n) =>
    new Uint8Array([
      n & 0xff,
      (n >>> 8) & 0xff,
      (n >>> 16) & 0xff,
      (n >>> 24) & 0xff,
    ]);

  const localParts = []; // локальные заголовки + данные
  const centralParts = []; // записи центрального каталога
  let offset = 0; // смещение очередного локального заголовка
  let centralSize = 0;

  for (const f of files) {
    const nameBytes = encoder.encode(f.name);
    const data = encoder.encode(f.content);
    const crc = crc32(data);
    const size = data.length;

    // Локальный заголовок файла
    const local = [
      u32(0x04034b50), // сигнатура
      u16(20), // версия для распаковки
      u16(0x0800), // флаги: имена в UTF-8
      u16(0), // метод: store
      u16(0), // время
      u16(0), // дата
      u32(crc),
      u32(size), // сжатый размер
      u32(size), // исходный размер
      u16(nameBytes.length),
      u16(0), // длина extra
      nameBytes,
      data,
    ];
    const localOffset = offset;
    for (const part of local) {
      localParts.push(part);
      offset += part.length;
    }

    // Запись центрального каталога
    const central = [
      u32(0x02014b50), // сигнатура
      u16(20), // версия создателя
      u16(20), // версия для распаковки
      u16(0x0800), // флаги UTF-8
      u16(0), // метод store
      u16(0), // время
      u16(0), // дата
      u32(crc),
      u32(size),
      u32(size),
      u16(nameBytes.length),
      u16(0), // extra
      u16(0), // comment
      u16(0), // номер диска
      u16(0), // внутренние атрибуты
      u32(0), // внешние атрибуты
      u32(localOffset),
      nameBytes,
    ];
    for (const part of central) {
      centralParts.push(part);
      centralSize += part.length;
    }
  }

  const centralOffset = offset;

  // Конец центрального каталога (EOCD)
  const eocd = [
    u32(0x06054b50),
    u16(0), // номер диска
    u16(0), // диск, где начинается каталог
    u16(files.length),
    u16(files.length),
    u32(centralSize),
    u32(centralOffset),
    u16(0), // длина комментария
  ];

  return new Blob([...localParts, ...centralParts, ...eocd], {
    type: "application/zip",
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadProject() {
  const zip = buildZip([
    { name: "index.html", content: els.htmlEditor.value },
    { name: "style.css", content: els.cssEditor.value },
    { name: "main.js", content: els.jsEditor.value },
  ]);
  downloadBlob(zip, "project.zip");
}

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
}

// ============================================================
// Инициализация
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
  switchTab("task.md");
  els.editors.forEach(updateHighlight); // первичная отрисовка подсветки
  clearConsole(); // плейсхолдер в консоли
  updateIframe();

  // ---- Обработчики ----
  els.runBtn.addEventListener("click", updateIframe);
  els.openTabBtn.addEventListener("click", openInNewTab);
  els.resetBtn.addEventListener("click", resetToTemplate);
  els.hintBtn.addEventListener("click", showHint);
  els.downloadBtn.addEventListener("click", downloadProject);
  els.consoleClearBtn.addEventListener("click", clearConsole);

  // Сообщения из iframe (console.* и ошибки) → встроенная консоль
  window.addEventListener("message", handleConsoleMessage);

  els.editors.forEach((ta) => {
    // Ввод → пересобрать подсветку, сохранить прогресс, обновить Emmet-превью
    ta.addEventListener("input", () => {
      updateHighlight(ta);
      autosave();
      updateEmmetPreview(ta);
    });
    // Прокрутка textarea → двигаем слой подсветки и переставляем превью
    ta.addEventListener("scroll", () => {
      syncScroll(ta);
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
      if (e.key === "Tab" && !e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        hideEmmetPreview();
        if (!e.shiftKey && tryExpandEmmet(ta)) return;
        insertTab(ta);
      }
    });
  });

  // Клики по вкладкам
  els.tabs.forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });
}

document.addEventListener("DOMContentLoaded", init);
