// ============================================================
// dev-cheat.js — АДМИН-РЕЖИМ ДЛЯ РАЗРАБОТЧИКА (не для ученика).
//
// В дев-режиме на каждом шаге урока появляется кнопка «🗝 Заполнить по этот шаг»
// (её рисует lesson-render по флагу isDevUnlocked). Она подставляет готовый код
// шагов 1…N прямо из сниппетов урока (с заполненными метами, раскрытым Emmet,
// своими свойствами) и стирает остальное — можно мгновенно «дойти» до нужного
// места. «Весь магазин» = заполнить по ПОСЛЕДНИЙ шаг.
//
// Источник кода — сами сниппеты lesson-data.js (а не отдельная копия), поэтому
// версия всегда актуальна. Включение режима — секретным адресом #mega-admin
// (см. ниже). Подключается ТОЛЬКО в index.html.
// ============================================================

// ============================================================
// Админ: «Заполнить ПО ЭТОТ шаг» — на каждом шаге (только в дев-режиме).
//
// Подставляет в редакторы готовый код всех шагов с 1-го по выбранный (с уже
// заполненными метками, раскрытым Emmet и своими свойствами), отмечает их
// выполненными и запускает превью. Это как пройти урок до нужного места одним
// кликом — дальше можно продолжать обычными кнопками.
//
// STEP_FILL — данные для подстановки, по ЗАГОЛОВКУ шага:
//   answers     — { "[ВПИШИ X]": "значение" } (замена меток в сниппете);
//   ownPropCss  — строка-свойство в «своей» пустой строке между 👇 и 👆;
//   emmetHtml   — готовая разметка вместо пустой строки под «👇 EMMET …»;
//   html/css/js — полная замена части (используется для каркаса 1-го шага).
// ============================================================
const FILL_SKELETON =
`<!DOCTYPE html>
<html lang="ru">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>МегаМагазин</title>
</head>
<body>

</body>
</html>`;

const FILL_CARD5 =
`	<div class="card">
		<a href="#" class="card-link" data-product="4">
			<div class="card-img">🎮</div>
			<h3 class="card-title">Геймпад</h3>
		</a>
		<p class="card-price">2990 ₽</p>
		<button class="add-to-cart">В корзину</button>
	</div>`;

const FILL_REVIEW4 =
`		<div class="review">
			<p class="review-text">«Лучший магазин техники, рекомендую!»</p>
			<p class="review-author">— Олег</p>
		</div>`;

const STEP_FILL = {
  "Каркас сайта и название во вкладке": { html: FILL_SKELETON },
  "Первый текст на странице — руками": {
    html: "<h1>Добро пожаловать в МегаМагазин</h1>\n<p>Тут будут самые крутые товары!</p>",
  },
  "Первый стиль — раскрась заголовок": {
    cssRaw: "h1 { color: #5b3df5; text-align: center; }",
  },
  "Шапка магазина и меню навигации": {
    answers: {
      "[ВПИШИ НАЗВАНИЕ МАГАЗИНА]": "МегаМагазин",
      "[ВПИШИ ПУНКТ МЕНЮ HOME]": "Главная",
      "[ВПИШИ ПУНКТ МЕНЮ LOGIN]": "Вход",
      "[ВПИШИ ПУНКТ МЕНЮ REGISTER]": "Регистрация",
      "[ВПИШИ СЛОВО]": "Корзина",
      "[ВПИШИ ЦВЕТ]": "#5b3df5",
      "[ВПИШИ РАЗМЕР]": "24px",
    },
  },
  "Баннер со скидкой": {
    answers: {
      "[ВПИШИ ЗАГОЛОВОК СКИДКИ]": "Скидки до 50% на технику!",
      "[ВПИШИ ПОДЗАГОЛОВОК]": "Только до конца недели — успей купить!",
      "[ВПИШИ ТЕКСТ КНОПКИ]": "Купить сейчас",
      "[ВПИШИ РАЗМЕР]": "44px",
      "[ВПИШИ ЦВЕТ]": "#ff5722",
    },
    ownPropCss: "border-radius: 8px;",
  },
  "Карточки товаров + Emmet": {
    answers: {
      "[ВПИШИ ЭМОДЗИ СМАРТФОНА]": "📱", "[ВПИШИ НАЗВАНИЕ СМАРТФОНА]": "Смартфон", "[ВПИШИ ЦЕНУ СМАРТФОНА]": "19990",
      "[ВПИШИ ЭМОДЗИ НАУШНИКОВ]": "🎧", "[ВПИШИ НАЗВАНИЕ НАУШНИКОВ]": "Наушники", "[ВПИШИ ЦЕНУ НАУШНИКОВ]": "2490",
      "[ВПИШИ ЭМОДЗИ ЧАСОВ]": "⌚", "[ВПИШИ НАЗВАНИЕ ЧАСОВ]": "Умные часы", "[ВПИШИ ЦЕНУ ЧАСОВ]": "5990",
      "[ВПИШИ ЭМОДЗИ НОУТБУКА]": "💻", "[ВПИШИ НАЗВАНИЕ НОУТБУКА]": "Ноутбук", "[ВПИШИ ЦЕНУ НОУТБУКА]": "45990",
      "[ВПИШИ РАЗМЕР]": "12px", "[ВПИШИ ЦВЕТ]": "#5b3df5",
    },
    emmetHtml: FILL_CARD5,
  },
  "Блок «О нас»": {
    answers: {
      "[ВПИШИ ЗАГОЛОВОК]": "О нас",
      "[ВПИШИ РАССКАЗ О МАГАЗИНЕ]": "МегаМагазин работает с 2020 года. Мы продаём только проверенную технику и доставляем заказы по всей России за 1–3 дня.",
      "[ВПИШИ ЦВЕТ]": "#5b3df5",
    },
    ownPropCss: "line-height: 1.7;",
  },
  "Отзывы покупателей": {
    answers: {
      "[ВПИШИ ТЕКСТ ОТЗЫВА 1]": "Заказал смартфон — привезли на следующий день. Всё работает отлично!",
      "[ВПИШИ ИМЯ 1]": "Артём",
      "[ВПИШИ ТЕКСТ ОТЗЫВА 2]": "Купила наушники, звук супер. Спасибо за быструю доставку!",
      "[ВПИШИ ИМЯ 2]": "Мария",
      "[ВПИШИ ТЕКСТ ОТЗЫВА 3]": "Очень доволен ноутбуком, цена ниже, чем везде.",
      "[ВПИШИ ИМЯ 3]": "Иван",
      "[ВПИШИ ЦВЕТ]": "#f5f3ff",
    },
    emmetHtml: FILL_REVIEW4,
  },
  "Подвал с контактами": {
    answers: {
      "[ВПИШИ ТЕЛЕФОН]": "8-800-555-35-35",
      "[ВПИШИ ПОЧТУ]": "shop@megamagazin.ru",
      "[ВПИШИ АДРЕС]": "г. Москва, ул. Цифровая, 7",
      "[ВПИШИ НАЗВАНИЕ МАГАЗИНА]": "МегаМагазин",
      "[ВПИШИ ЦВЕТ]": "#2b2b3a",
    },
  },
  "Оживляем кнопку «В корзину»": {
    answers: { "[ВПИШИ СООБЩЕНИЕ]": "Товар добавлен в корзину!" },
  },
  "Страницы «Вход» и «Регистрация»": {
    answers: {
      "[ВПИШИ ЗАГОЛОВОК ВХОДА]": "Вход",
      "[ВПИШИ ТЕКСТ КНОПКИ ВХОДА]": "Войти",
      "[ВПИШИ ЗАГОЛОВОК РЕГИСТРАЦИИ]": "Регистрация",
      "[ВПИШИ ТЕКСТ КНОПКИ РЕГИСТРАЦИИ]": "Зарегистрироваться",
      "[ВПИШИ ЦВЕТ]": "#5b3df5",
    },
  },
  "Страница товара и комментарии ⚠": {
    answers: {
      "[ВПИШИ ЗАГОЛОВОК]": "Комментарии о товаре",
      "[ВПИШИ ЦВЕТ]": "#5b3df5",
    },
  },
};

// Заполнить сниппет одного шага: метки, своё свойство, Emmet-разметка.
function fillCode(code, f, lang) {
  if (f.answers) {
    Object.keys(f.answers).forEach(function (k) {
      code = code.split(k).join(f.answers[k]);
    });
  }
  if (lang === "css" && f.ownPropCss) {
    code = code.replace(
      /(\/\* 👇[^\n]*\*\/\n)[ \t]*\n([ \t]*\/\* 👆)/,
      "$1\t" + f.ownPropCss + "\n$2"
    );
  }
  if (lang === "html" && f.emmetHtml) {
    code = code.replace(
      /(<!-- 👇 EMMET[^\n]*-->\n)[ \t]*\n/,
      "$1" + f.emmetHtml + "\n"
    );
  }
  return code;
}

// Готовые части шага (в порядке html → css → js).
function solvedParts(step) {
  const f = STEP_FILL[step.title] || {};
  const manual = step.manual === true; // ручной шаг — код «как руками», без границ
  const parts = [];
  // Ручной CSS/HTML, который ребёнок печатает ДО сниппета шага (без комментов).
  if (f.cssRaw) parts.push({ lang: "css", code: f.cssRaw, raw: true });
  ["html", "css", "js"].forEach(function (lang) {
    if (f[lang] != null) { parts.push({ lang: lang, code: f[lang], raw: manual }); return; }
    if (step.snippets && step.snippets[lang] != null) {
      parts.push({ lang: lang, code: fillCode(step.snippets[lang], f, lang), raw: false });
    }
  });
  return parts;
}

// Вставить HTML-часть так же, как обычная кнопка: внутрь каркаса перед </body>.
// raw=true — ручной код (без комментариев-границ), как печатает ребёнок.
function adminInsertHtml(title, code, raw) {
  const ed = els.htmlEditor;
  const v = ed.value;
  const m = /([ \t]*)<\/body>/i.exec(v);
  if (!m) { ed.value = code; return; } // каркаса ещё нет — это и есть скелет
  const indent = (m[1] || "") + "\t";
  const payload = raw ? code : wrapBlock("html", title, code);
  const indented = payload.split("\n").map(function (l) { return l ? indent + l : l; }).join("\n");
  const hasPrev = !raw && /НАЧАЛО:/.test(v);
  const text = (hasPrev ? "\n" : "") + indented + "\n";
  ed.value = v.slice(0, m.index) + text + v.slice(m.index);
}

// Дописать CSS/JS-часть в конец соответствующего файла. raw=true — без границ.
function adminAppend(lang, title, code, raw) {
  const ed = lang === "css" ? els.cssEditor : els.jsEditor;
  const piece = raw ? code : wrapBlock(lang, title, code);
  const trimmed = ed.value.replace(/\s+$/, "");
  ed.value = trimmed ? trimmed + "\n\n" + piece : piece;
}

// Заполнить редакторы кодом шагов 1…targetIndex, отметить их и запустить превью.
function fillUpToStep(targetIndex) {
  if (typeof els === "undefined" || !els.htmlEditor) return;
  els.htmlEditor.value = "";
  els.cssEditor.value = "";
  els.jsEditor.value = "";
  doneParts.clear();
  for (let i = 0; i <= targetIndex; i++) {
    const step = lesson.steps[i];
    solvedParts(step).forEach(function (p) {
      if (p.lang === "html") adminInsertHtml(step.title, p.code, p.raw);
      else adminAppend(p.lang, step.title, p.code, p.raw);
    });
    stepLangs(step).forEach(function (lang) { doneParts.add(partKey(i, lang)); });
  }
  ensureColorSpacing(els.cssEditor);
  els.editors.forEach(function (ta) { updateHighlight(ta); histInit(ta); });
  autosave();
  updateProgress();
  switchTab("index.html");
  updateIframe();
  if (typeof showToast === "function") {
    showToast(
      "🗝 Заполнено по шаг " + (targetIndex + 1),
      "Готовый код шагов 1–" + (targetIndex + 1) + " подставлен, прогресс отмечен, превью запущено."
    );
  }
}
if (typeof window !== "undefined") window.fillUpToStep = fillUpToStep;

// ============================================================
// Секретная разблокировка «режима разработчика».
//
// Перейди по СЕКРЕТНОМУ адресу один раз:
//     index.html#mega-admin        (или  index.html?mega-admin)
// → в localStorage сохранится флаг `megaDevAdmin=true`, секрет уберётся из
// адреса. После перезагрузки на каждом шаге урока появится админ-кнопка
// «🗝 Заполнить по этот шаг». Флаг хранится в localStorage — заходить по
// секретному адресу повторно не нужно.
//
// ВЫКЛЮЧИТЬ режим обратно можно двумя путями:
//   • секретный адрес  index.html#mega-admin-off  (или  ?mega-admin-off)
//   • из консоли:  disableMegaAdmin()
// → флаг `megaDevAdmin` удаляется; после перезагрузки кнопок на шагах больше нет.
// ============================================================
const DEV_SECRET = "mega-admin";
const DEV_SECRET_OFF = "mega-admin-off";   // должен проверяться РАНЬШЕ включения
const DEV_FLAG_KEY = "megaDevAdmin";

function isDevUnlocked() {
  try {
    return localStorage.getItem(DEV_FLAG_KEY) === "true";
  } catch (e) {
    return false;
  }
}

// Выключить режим разработчика: убрать флаг.
function disableDevMode() {
  try { localStorage.removeItem(DEV_FLAG_KEY); } catch (e) {}
  if (typeof showToast === "function") {
    showToast(
      "🛠 Режим разработчика выключен",
      "Перезагрузи страницу, чтобы скрыть админ-кнопки на шагах. Включить снова: адрес #mega-admin."
    );
  }
}

// Заметили секрет в адресе → включили/выключили флаг и почистили адресную строку.
// Сначала проверяем выключение: строка «mega-admin-off» содержит «mega-admin».
function checkSecretUnlock() {
  const where = (location.hash + " " + location.search).toLowerCase();
  if (where.indexOf(DEV_SECRET_OFF) !== -1) {
    try { localStorage.removeItem(DEV_FLAG_KEY); } catch (e) {}
    try { history.replaceState(null, "", location.pathname); } catch (e) {}
  } else if (where.indexOf(DEV_SECRET) !== -1) {
    try { localStorage.setItem(DEV_FLAG_KEY, "true"); } catch (e) {}
    try { history.replaceState(null, "", location.pathname); } catch (e) {}
  }
}

checkSecretUnlock();

// В дев-режиме на каждом шаге урока появляется админ-кнопка «🗝 Заполнить по этот
// шаг» (рисует lesson-render по флагу isDevUnlocked). Отдельной кнопки «весь
// магазин» больше нет: весь магазин = заполнить по ПОСЛЕДНИЙ шаг.
// Выключить режим можно из консоли:  disableMegaAdmin()   (или адрес #mega-admin-off)
if (typeof window !== "undefined") {
  window.disableMegaAdmin = disableDevMode;
}
