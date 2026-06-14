// ============================================================
// Урок 2 «Этичный хакер» — отдельный набор данных (подключается из index2.html
// ВМЕСТО js/lesson-data.js). Стартовый код — ВШИТЫЙ эталонный уязвимый сайт
// «МегаМагазин» (тот, что ребёнок строил в уроке 1). Так у всех детей одинаковая
// отправная точка, независимо от того, что они реально доделали в уроке 1.
//
// Цикл по КАЖДОЙ уязвимости: 🔴 Найди/сломай → 🟢 Почини (правит код + ▶ Запустить)
// → ✅ Проверь (эксплойт больше не срабатывает). Все шаги «ручные» (manual:true):
// ребёнок исследует/правит сам и жмёт «✓ Я выполнил этот шаг».
//
// Уязвимости намеренные (см. docs/LESSON_REDESIGN.md, разделы 4–5):
//   1) Stored XSS в комментариях (comments.innerHTML += text) — демонстрируемо.
//   2) Небезопасный вход: пароль захардкожен в коде + в HTML-комментарии; обход
//      аутентификации через localStorage в консоли.
//   3) Повышение прав: localStorage.is_admin === "true" открывает «админ-панель»
//      с секретом (контроль доступа на клиенте).
//   4) Отражённый XSS (приветствие из innerHTML / location.hash) — в песочнице
//      srcdoc URL-хеш не доставить, поэтому разбираем концептуально и чиним тем
//      же приёмом innerHTML→textContent.
//   + CTF-бонус: спрятанные «флаги» (HTML-комментарий, JS-переменная, localStorage).
// ============================================================

// ---- Стартовый уязвимый сайт (одинаковый для всех) ----
const VULN_HTML = `<!DOCTYPE html>
<html lang="ru">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>МегаМагазин</title>
</head>
<body>
	<!-- Шапка магазина -->
	<header class="site-header" id="home">
		<div class="logo">🛍️ МегаМагазин</div>
		<nav class="menu">
			<a href="#home">Главная</a>
			<a href="#products">Товары</a>
			<a href="#contacts">Контакты</a>
		</nav>
		<div class="cart">🛒 Корзина: <span id="cart-count">0</span></div>
	</header>

	<!-- Баннер -->
	<section class="banner">
		<h1>Скидки до 50% на технику!</h1>
		<p>Только до конца недели — успей купить!</p>
		<button class="banner-btn">Купить сейчас</button>
	</section>

	<!-- Товары -->
	<section class="products" id="products">
		<div class="card">
			<div class="card-img">📱</div>
			<h3 class="card-title">Смартфон</h3>
			<p class="card-price">19990 ₽</p>
			<button class="add-to-cart">В корзину</button>
		</div>
		<div class="card">
			<div class="card-img">🎧</div>
			<h3 class="card-title">Наушники</h3>
			<p class="card-price">2490 ₽</p>
			<button class="add-to-cart">В корзину</button>
		</div>
		<div class="card">
			<div class="card-img">💻</div>
			<h3 class="card-title">Ноутбук</h3>
			<p class="card-price">45990 ₽</p>
			<button class="add-to-cart">В корзину</button>
		</div>
	</section>

	<!-- Личный кабинет: форма входа -->
	<section class="login" id="login">
		<h2>Личный кабинет</h2>
		<!-- TODO для входа в админку: логин admin, пароль megapass123 -->
		<input id="login-name" placeholder="Логин">
		<input id="login-pass" type="password" placeholder="Пароль">
		<button id="login-btn">Войти</button>
		<p id="login-hello" class="login-hello" hidden></p>
		<div id="admin-panel" class="admin-panel" hidden>
			🛠 Админ-панель. Секретный код магазина: <b>MEGA-2026-ADMIN</b>
		</div>
	</section>

	<!-- Комментарии посетителей -->
	<section class="comments" id="comments-section">
		<h2>Комментарии посетителей</h2>
		<input id="comment-input" placeholder="Напиши комментарий…">
		<button id="comment-btn">Отправить</button>
		<div id="comments"></div>
	</section>

	<!-- Подвал -->
	<footer class="site-footer" id="contacts">
		<p>📞 Телефон: 8-800-555-35-35</p>
		<p>✉️ Почта: shop@megamagazin.ru</p>
		<p>© 2026 МегаМагазин. Все права защищены.</p>
		<!-- FLAG{секрет_спрятан_в_html_комментарии} -->
	</footer>
</body>
</html>`;

const VULN_CSS = `body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; margin: 0; color: #222; }

/* Шапка */
.site-header {
	display: flex; align-items: center; justify-content: space-between;
	background: #5b3df5; color: #fff; padding: 16px 24px;
}
.logo { font-size: 24px; font-weight: bold; }
.menu a { color: #fff; margin-left: 16px; text-decoration: none; }
.menu a:hover { text-decoration: underline; }
.cart { font-weight: bold; }

/* Баннер */
.banner { text-align: center; padding: 60px 20px; background: linear-gradient(135deg, #ffd86b, #ff8a5b); color: #3a2a00; }
.banner h1 { font-size: 44px; margin: 0 0 10px; }
.banner-btn { background: #ff5722; color: #fff; border: none; padding: 14px 28px; font-size: 18px; border-radius: 8px; cursor: pointer; }

/* Товары */
.products { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; padding: 24px; }
.card { border: 1px solid #e0e0e0; border-radius: 12px; padding: 16px; text-align: center; background: #fff; }
.card-img { font-size: 64px; }
.card-title { margin: 10px 0 4px; font-size: 18px; }
.card-price { color: #5b3df5; font-weight: bold; font-size: 18px; margin: 0 0 12px; }
.add-to-cart { background: #5b3df5; color: #fff; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer; width: 100%; }

/* Личный кабинет */
.login { max-width: 360px; margin: 24px auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; text-align: center; }
.login h2 { color: #5b3df5; }
.login input { display: block; width: 100%; box-sizing: border-box; margin: 8px 0; padding: 10px; border: 1px solid #ccc; border-radius: 6px; }
.login button { background: #5b3df5; color: #fff; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; }
.login-hello { font-weight: bold; color: #2e7d32; }
.admin-panel { margin-top: 12px; padding: 12px; background: #fff3cd; border-radius: 8px; }

/* Комментарии */
.comments { max-width: 600px; margin: 24px auto; padding: 0 24px; text-align: center; }
.comments h2 { color: #5b3df5; }
#comment-input { width: 70%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; }
#comment-btn { padding: 10px 16px; background: #5b3df5; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
.cmt { background: #f5f3ff; border-radius: 8px; padding: 10px; margin: 8px 0; text-align: left; }

/* Подвал */
.site-footer { background: #2b2b3a; color: #cfcfe0; text-align: center; padding: 24px; margin-top: 20px; }
.site-footer p { margin: 4px 0; }`;

const VULN_JS = `// ===== Корзина =====
let count = 0;
const counter = document.getElementById("cart-count");
const cartButtons = document.querySelectorAll(".add-to-cart");
cartButtons.forEach(function (button) {
	button.addEventListener("click", function () {
		count = count + 1;
		counter.textContent = count;
		console.log("Товар добавлен в корзину!");
	});
});

// ===== Вход в личный кабинет =====
const ADMIN_LOGIN = "admin";
const ADMIN_PASS = "megapass123";          // ⚠ пароль прямо в коде
const loginBtn = document.getElementById("login-btn");
const helloBox = document.getElementById("login-hello");

loginBtn.addEventListener("click", function () {
	const name = document.getElementById("login-name").value;
	const pass = document.getElementById("login-pass").value;
	if (name === ADMIN_LOGIN && pass === ADMIN_PASS) {
		localStorage.setItem("isLoggedIn", "true");
		localStorage.setItem("currentUser", name);
		helloBox.hidden = false;
		helloBox.innerHTML = "Привет, " + name + "!";   // ⚠ innerHTML
	} else {
		helloBox.hidden = false;
		helloBox.textContent = "Неверный логин или пароль";
	}
});

// Если уже входили раньше — сразу здороваемся
if (localStorage.getItem("isLoggedIn") === "true") {
	const saved = localStorage.getItem("currentUser") || "гость";
	helloBox.hidden = false;
	helloBox.innerHTML = "Привет, " + saved + "!";       // ⚠ innerHTML
}

// Приветствие из адреса (после # в ссылке) — ⚠ отражённый XSS
if (location.hash) {
	const fromUrl = decodeURIComponent(location.hash.slice(1));
	helloBox.hidden = false;
	helloBox.innerHTML = "Привет, " + fromUrl + "!";     // ⚠ innerHTML
}

// Секретная админ-панель — если в localStorage is_admin === "true"
if (localStorage.getItem("is_admin") === "true") {
	document.getElementById("admin-panel").hidden = false;
}

// ===== Комментарии =====
const commentBtn = document.getElementById("comment-btn");
const commentsBox = document.getElementById("comments");
commentsBox.innerHTML = localStorage.getItem("comments") || "";   // ⚠ innerHTML
commentBtn.addEventListener("click", function () {
	const text = document.getElementById("comment-input").value;
	commentsBox.innerHTML += '<div class="cmt">' + text + '</div>'; // ⚠ XSS
	localStorage.setItem("comments", commentsBox.innerHTML);
});

// CTF-бонус: спрятанные флаги
var hiddenFlag = "FLAG{секрет_в_коде_джаваскрипт}";
localStorage.setItem("secret_flag", "FLAG{секрет_в_local_storage}");`;

// ---- Данные урока 2 ----
const lesson = {
  title: "Урок 2: Этичный хакер 🕵️",

  introMd: `# 🕵️ Этичный хакер: найди дыры в своём сайте

На прошлом уроке ты собрал магазин **МегаМагазин**. Сегодня ты — **этичный
(«белый») хакер**: тот, кто ищет уязвимости, чтобы их **починить**, а не навредить.

⚠️ **Золотое правило:** мы ломаем **только свой собственный** сайт, чтобы научиться
защищать. Ломать чужие сайты — незаконно и подло. Белый хакер всегда действует с
разрешения.

## Как мы работаем с каждой дырой

1. 🔴 **Найди / сломай** — используем уязвимость, как настоящий злоумышленник.
2. 🟢 **Почини** — правим код сайта прямо в редакторах и жмём **▶ Запустить**.
3. ✅ **Проверь** — повторяем атаку и убеждаемся: больше **не работает**!

Слева уже загружен твой уязвимый сайт. Поехали искать дыры! 👇`,

  outroMd: `# 🏆 Поздравляем, ты прошёл путь разработчик → этичный хакер!

Ты научился находить и **чинить** настоящие уязвимости:

- 💉 **XSS** — чужой код через \`innerHTML\`; чинится выводом через \`textContent\`.
- 🔑 **Секреты на клиенте** — пароли и «флаги» в коде/HTML/localStorage любой может
  прочитать. Настоящая проверка пароля и прав — **только на сервере**.
- 🛂 **Контроль доступа** — нельзя доверять флагам вроде \`is_admin\` в браузере.

## Куда расти дальше

- Учи **HTML/CSS/JS** глубже — ты уже умеешь больше многих новичков.
- Почитай про **OWASP Top-10** (список самых частых уязвимостей) — есть версии
  «для начинающих».
- Тренируйся на легальных площадках (CTF для детей, «hack the box» для обучения).

Главное — оставайся **белым** хакером: знания дают силу, а сила требует честности. 🔐`,

  hint: "Каждую дыру проходи по циклу: 🔴 найди/сломай → 🟢 почини код в редакторе и нажми ▶ Запустить → ✅ повтори атаку и убедись, что не работает. Инструменты: встроенная консоль 🖥 внизу и F12 (DevTools) — вкладки Elements, Console, Application → Local Storage. Когда выполнил шаг — жми «✓ Я выполнил этот шаг».",

  // Стартовый код = вшитый уязвимый сайт (одинаковый у всех)
  initialHTML: VULN_HTML,
  initialCSS: VULN_CSS,
  initialJS: VULN_JS,

  steps: [
    {
      // ----- S0: Введение + инструменты -----
      manual: true,
      title: "Инструменты этичного хакера",
      time: "10 мин",
      goalMd:
        "**Цель:** познакомиться с инструментами и убедиться, что сайт работает.\n\n**Главное правило:** ломаем **только свой** сайт — чтобы научиться защищать.",
      actionMd:
        "Просто осмотрись. Кнопок-вставок тут нет — в конце нажми **✓ Я выполнил этот шаг**.",
      taskMd: `🔧 **Осмотрись и подготовь инструменты.**

**1.** Нажми **▶ Запустить** — справа появится твой магазин «МегаМагазин» (шапка,
товары, вход, комментарии).

**2.** Загляни во **встроенную консоль** 🖥 внизу справа — туда сайт пишет сообщения
(например, когда жмёшь «В корзину»).

**3.** Открой **DevTools браузера**: клавиша **F12** (или ПКМ → «Просмотреть код»).
Там есть вкладки, которые нам понадобятся:
- **Elements** — HTML-структура страницы;
- **Console** — можно выполнять JavaScript прямо на странице;
- **Application → Local Storage** — данные, которые сайт хранит в браузере.

**4.** Просто пощёлкай по этим вкладкам, осмотрись. Готов? Жми **✓ Я выполнил этот шаг**.`,
      hintMd:
        "F12 открывает/закрывает DevTools. Если не сработало — ПКМ по странице → «Просмотреть код» / «Inspect». Встроенная консоль платформы (🖥) и Console в DevTools — это разные окна, но обе показывают сообщения сайта.",
      doneMd:
        "✅ **Готово, когда** сайт запущен, а ты нашёл вкладки Elements, Console и Application в DevTools.",
    },
    {
      // ----- S1: Stored XSS в комментариях -----
      manual: true,
      title: "💉 Дыра №1: XSS в комментариях",
      time: "32 мин",
      goalMd:
        "**Цель:** научиться уязвимости **XSS** (Cross-Site Scripting) — когда злоумышленник заставляет сайт выполнить **чужой код**.\n\n**Где дыра:** комментарии добавляются через `innerHTML` — браузер исполняет вставленный HTML.",
      actionMd:
        "Сначала сломай (🔴), потом почини код в **main.js** (🟢) и проверь (✅).",
      taskMd: `🔧 **🔴 НАЙДИ / СЛОМАЙ.**

**1.** Запусти сайт. В поле комментария вставь это и нажми «Отправить»:
\`<img src=x onerror="alert('XSS')">\`
Выскочило окошко \`alert\`?! Ты заставил **чужой код** выполниться на странице — это
и есть **XSS**. 😈

**2.** Теперь покажем, что XSS умеет **красть данные**. Сначала войди в кабинет
(логин **admin**, пароль **megapass123**), потом оставь комментарий:
\`<img src=x onerror="alert(localStorage.getItem('currentUser'))">\`
Видишь — код вытащил имя пользователя из хранилища. Так крадут и пароли, и токены.

**3.** 🤔 Почему \`<script>alert(1)</script>\` через \`innerHTML\` **не** сработал бы, а
\`<img onerror>\` сработал? Потому что браузер не запускает \`<script>\`, добавленный
через \`innerHTML\`, но \`onerror\` у картинки — запускает. Хакеры это знают.

---

🔧 **🟢 ПОЧИНИ (main.js).** Найди блок \`// ===== Комментарии =====\` и **замени его
целиком** на безопасную версию (выводим текст через \`textContent\`, а не \`innerHTML\`):

\`\`\`
// ===== Комментарии (безопасно) =====
const commentBtn = document.getElementById("comment-btn");
const commentsBox = document.getElementById("comments");

function renderComment(text) {
	const div = document.createElement("div");
	div.className = "cmt";
	div.textContent = text;            // безопасно: это ТЕКСТ, а не HTML
	commentsBox.appendChild(div);
}

let commentList = JSON.parse(localStorage.getItem("commentsSafe") || "[]");
commentList.forEach(renderComment);

commentBtn.addEventListener("click", function () {
	const text = document.getElementById("comment-input").value;
	renderComment(text);
	commentList.push(text);
	localStorage.setItem("commentsSafe", JSON.stringify(commentList));
});
\`\`\`

Нажми **▶ Запустить**.

---

🔧 **✅ ПРОВЕРЬ.** Снова вставь \`<img src=x onerror="alert('XSS')">\` и «Отправить».
Теперь это **показывается как обычный текст**, окошко не выскакивает. Дыра закрыта! 🛡️`,
      hintMd:
        "Старый блок начинается с `// ===== Комментарии =====` и заканчивается перед `// CTF-бонус`. Выдели его и замени на безопасную версию из задания (можно скопировать целиком). `textContent` вставляет текст как текст — браузер его не исполняет.",
      doneMd:
        "✅ **Готово, когда** payload `<img src=x onerror=…>` после починки показывается как **текст** и `alert` больше не выскакивает.",
    },
    {
      // ----- S2: Небезопасный вход (пароль в коде + обход) -----
      manual: true,
      title: "🔑 Дыра №2: пароль прямо в коде",
      time: "25 мин",
      goalMd:
        "**Цель:** понять, почему **секреты нельзя хранить на клиенте** и почему вход надо проверять на **сервере**.\n\n**Где дыра:** логин и пароль захардкожены в `main.js` и даже подсказаны в HTML-комментарии.",
      actionMd:
        "Найди пароль (🔴), обойди вход без него, потом убери секрет из кода (🟢) и проверь (✅).",
      taskMd: `🔧 **🔴 НАЙДИ / СЛОМАЙ.**

**1.** Открой **main.js** и найди строки:
\`const ADMIN_LOGIN = "admin";\` и \`const ADMIN_PASS = "megapass123";\`
Вот он, пароль — лежит прямо в коде, который видит **любой** посетитель! Открой ещё
**index.html** — там в HTML-комментарии тоже написан пароль (\`<!-- TODO … megapass123 -->\`).

**2.** Войди этим паролем (логин **admin**, пароль **megapass123**) — пускает.

**3.** А теперь **обойди вход вообще без пароля**. Открой консоль (встроенную 🖥 или
F12 → Console) и выполни:
\`localStorage.setItem('isLoggedIn', 'true')\`
Нажми **▶ Запустить** (перезагрузка сайта) — сайт думает, что ты уже вошёл, и
здоровается с тобой. Проверка входа на клиенте **обходится в одну строку**. 😈

---

🔧 **🟢 ПОЧИНИ.** Секрет не должен лежать на клиенте. Сделай так:

**а)** В **index.html** удали строку-подсказку \`<!-- TODO … megapass123 -->\`.

**б)** В **main.js** удали строку \`const ADMIN_PASS = "megapass123";\`, а проверку
пароля замени на честное сообщение (пароль на клиенте проверять нельзя):
\`\`\`
loginBtn.addEventListener("click", function () {
	helloBox.hidden = false;
	helloBox.textContent = "Вход проверяется на сервере (в учебном проекте сервера нет)";
});
\`\`\`
Нажми **▶ Запустить**.

💡 **Запомни:** настоящие сайты проверяют пароль **на сервере**. Всё, что лежит в
браузере (код, HTML, localStorage), пользователь может прочитать и изменить.

---

🔧 **✅ ПРОВЕРЬ.** Поищи слово \`megapass123\` в index.html и main.js (Ctrl+F) —
его больше **нет**. Секрет убран с клиента. 🛡️`,
      hintMd:
        "Ctrl+F ищет по коду. Удаляй строки целиком. После починки «настоящего» входа не будет — это нормально: суть урока в том, что безопасный вход без сервера сделать нельзя.",
      doneMd:
        "✅ **Готово, когда** пароля `megapass123` больше нет ни в index.html, ни в main.js.",
    },
    {
      // ----- S3: Повышение прав через is_admin -----
      manual: true,
      title: "🛂 Дыра №3: фальшивый «админ»",
      time: "22 мин",
      goalMd:
        "**Цель:** понять **контроль доступа** — почему нельзя доверять флагам вроде `is_admin` в браузере.\n\n**Где дыра:** сайт показывает секретную админ-панель, если в localStorage `is_admin === \"true\"`. Но это значение задаёт **сам пользователь**.",
      actionMd:
        "Стань «админом» подменой localStorage (🔴), потом убери секрет с клиента (🟢) и проверь (✅).",
      taskMd: `🔧 **🔴 НАЙДИ / СЛОМАЙ.**

**1.** Открой **F12 → Application → Local Storage** (выбери адрес страницы слева).
Это хранилище браузера — туда сайт кладёт данные.

**2.** Добавь новую запись: ключ \`is_admin\`, значение \`true\`. (Или в Console
выполни: \`localStorage.setItem('is_admin', 'true')\`.)

**3.** Нажми **▶ Запустить**. На странице во входе появилась **🛠 Админ-панель** с
секретным кодом \`MEGA-2026-ADMIN\`! Ты «повысил себе права», ничего не взламывая —
просто подменил значение, которому сайт **зря доверяет**.

---

🔧 **🟢 ПОЧИНИ.** Раз клиенту нельзя доверять — **секрета не должно быть на клиенте
вообще**. Открой **index.html**, найди блок \`<div id="admin-panel" …>\` и удали из
него секрет (или весь блок):
\`\`\`
<div id="admin-panel" class="admin-panel" hidden></div>
\`\`\`
Нажми **▶ Запустить**.

💡 **Запомни:** показывать ли админ-панель — должен решать **сервер** после проверки
прав. Секретные данные нельзя класть в код, который скачивает браузер.

---

🔧 **✅ ПРОВЕРЬ.** Значение \`is_admin\` всё ещё \`true\` в Local Storage — но после
▶ Запустить **секретного кода больше нет** (его нет на клиенте). Подмена флага
больше ничего не открывает. 🛡️`,
      hintMd:
        "В Application → Local Storage запись добавляется двойным кликом по пустой строке (Key / Value). Если не получается — используй консоль: `localStorage.setItem('is_admin','true')`. Секрет `MEGA-2026-ADMIN` нужно убрать из index.html.",
      doneMd:
        "✅ **Готово, когда** даже при `is_admin = true` секретный код `MEGA-2026-ADMIN` на странице больше не появляется.",
    },
    {
      // ----- S4: CTF-бонус — собери флаги -----
      manual: true,
      title: "🚩 Бонус: собери спрятанные флаги",
      time: "15 мин",
      goalMd:
        "**Цель:** потренировать «насмотренность» хакера — секреты прячут в разных местах клиента, и все они находятся.\n\n**Флаг** — это строка вида `FLAG{...}`. На твоём сайте их спрятали **три**.",
      actionMd:
        "Найди все три флага, пользуясь DevTools и кодом. В конце — **✓ Я выполнил этот шаг**.",
      taskMd: `🔧 **Найди три флага \`FLAG{…}\`. Все они уже лежат в твоём сайте.**

**Флаг 1 — в HTML-комментарии.** Открой **index.html** (или F12 → Elements) и
поищи комментарий \`<!-- FLAG{…} -->\` рядом с подвалом.

**Флаг 2 — в коде JavaScript.** Открой **main.js** и найди переменную с флагом
(\`var hiddenFlag = "FLAG{…}"\`).

**Флаг 3 — в Local Storage.** Открой **F12 → Application → Local Storage** и найди
ключ \`secret_flag\` — в нём третий флаг. (Или в консоли:
\`localStorage.getItem('secret_flag')\`.)

🏁 Нашёл все три? Ты понял главное: **всё, что попало в браузер, можно найти** —
поэтому секретам там не место. Жми **✓ Я выполнил этот шаг**.`,
      hintMd:
        "Ctrl+F по коду ищет слово `FLAG`. В Local Storage флаг лежит под ключом `secret_flag`. Эти флаги — учебные: они показывают, что localStorage, HTML-комментарии и JS-код доступны любому посетителю.",
      doneMd:
        "✅ **Готово, когда** ты нашёл все три флага: в HTML-комментарии, в переменной JS и в Local Storage.",
    },
    {
      // ----- S5: Финал -----
      manual: true,
      title: "🏁 Финал",
      time: "5 мин",
      goalMd:
        "**Цель:** подвести итог и понять, куда расти дальше.",
      actionMd: "Прочитай итог под шагами (он раскроется) и нажми **✓ Я выполнил этот шаг**.",
      taskMd: `🔧 **Ты справился!** Ты прошёл путь от **разработчика** (собрал сайт) до
**этичного хакера** (нашёл и починил в нём дыры).

Что ты теперь умеешь:
- объяснять и чинить **XSS** (\`innerHTML\` → \`textContent\`);
- понимать, почему **секреты и проверку прав** нельзя держать на клиенте;
- пользоваться **DevTools** (Elements / Console / Application).

Прокрути вниз — там итог урока и идеи, куда двигаться дальше. Жми **✓ Я выполнил этот шаг**! 🎉`,
      hintMd:
        "Это последний шаг. После него раскроется финальное поздравление с идеями для дальнейшего обучения.",
      doneMd:
        "✅ **Готово!** Ты — этичный хакер. Не забывай: ломаем только своё и только с разрешения. 🔐",
    },
  ],
};

// Урок 2 хранит прогресс/историю ОТДЕЛЬНО от урока 1 (свой суффикс ключей).
const STORAGE_KEY = "savedLessonCodeSecurity";
const PREVIEW_DOC_KEY = "previewDoc"; // вкладку просмотра делим — preview.html читает этот ключ
const LESSON_KEY_SUFFIX = "Security";
