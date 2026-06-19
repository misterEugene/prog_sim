// ============================================================
// dev-cheat.js — ЧИТ ДЛЯ РАЗРАБОТЧИКА (не для ученика).
//
// Мгновенно загружает ГОТОВЫЙ собранный многостраничный «МегаМагазин» в три
// редактора, отмечает все шаги выполненными, сохраняет прогресс и запускает
// превью — чтобы не пересобирать сайт по шагам каждый раз при разработке/тесте.
//
// Как вызвать:
//   • горячие клавиши  Ctrl+Alt+D  (D = Demo), или
//   • из консоли браузера:  loadDemoShop()
//
// DEV_HTML/CSS/JS — это итог прохождения урока 1: все сниппеты с заполненными
// метками [ВПИШИ …] и добавленными через Emmet элементами (5-я карточка, 4-й
// отзыв). Подключается ТОЛЬКО в index.html. Уязвимости намеренно сохранены
// (как и в уроке) — это тестовый сайт для урока 2.
// ============================================================

const DEV_HTML = `<!DOCTYPE html>
<html lang="ru">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>МегаМагазин</title>
</head>
<body>
	<!-- Шапка магазина: логотип, меню, корзина и уголок пользователя -->
	<header class="site-header" id="home">
		<div class="logo">🛍️ МегаМагазин</div>
		<nav class="menu">
			<a href="#" data-link="home">Главная</a>
			<a href="#" data-link="login">Вход</a>
			<a href="#" data-link="register">Регистрация</a>
		</nav>
		<div class="header-right">
			<div class="cart">🛒 Корзина: <span id="cart-count">0</span></div>
			<div id="user-box" class="user-box"></div>
		</div>
	</header>

	<!-- Баннер (страница «Главная») -->
	<section class="banner" id="banner">
		<h1>Скидки до 50% на технику!</h1>
		<p>Только до конца недели — успей купить!</p>
		<button class="banner-btn">Купить сейчас</button>
	</section>

	<!-- Сетка товаров: карточки кликабельны (страница «Главная») -->
	<section class="products" id="products">
		<div class="card">
			<a href="#" class="card-link" data-product="0">
				<div class="card-img">📱</div>
				<h3 class="card-title">Смартфон</h3>
			</a>
			<p class="card-price">19990 ₽</p>
			<button class="add-to-cart">В корзину</button>
		</div>
		<div class="card">
			<a href="#" class="card-link" data-product="1">
				<div class="card-img">🎧</div>
				<h3 class="card-title">Наушники</h3>
			</a>
			<p class="card-price">2490 ₽</p>
			<button class="add-to-cart">В корзину</button>
		</div>
		<div class="card">
			<a href="#" class="card-link" data-product="2">
				<div class="card-img">⌚</div>
				<h3 class="card-title">Умные часы</h3>
			</a>
			<p class="card-price">5990 ₽</p>
			<button class="add-to-cart">В корзину</button>
		</div>
		<div class="card">
			<a href="#" class="card-link" data-product="3">
				<div class="card-img">💻</div>
				<h3 class="card-title">Ноутбук</h3>
			</a>
			<p class="card-price">45990 ₽</p>
			<button class="add-to-cart">В корзину</button>
		</div>
		<div class="card">
			<a href="#" class="card-link" data-product="4">
				<div class="card-img">🎮</div>
				<h3 class="card-title">Геймпад</h3>
			</a>
			<p class="card-price">2990 ₽</p>
			<button class="add-to-cart">В корзину</button>
		</div>
	</section>

	<!-- Блок "О нас" (страница «Главная») -->
	<section class="about" id="about">
		<h2>О нас</h2>
		<p>МегаМагазин работает с 2020 года. Мы продаём только проверенную технику и доставляем заказы по всей России за 1–3 дня.</p>
	</section>

	<!-- Отзывы покупателей (страница «Главная») -->
	<section class="reviews" id="reviews">
		<h2>Отзывы покупателей</h2>
		<div class="review-list">
			<div class="review">
				<p class="review-text">«Заказал смартфон — привезли на следующий день. Всё работает отлично!»</p>
				<p class="review-author">— Артём</p>
			</div>
			<div class="review">
				<p class="review-text">«Купила наушники, звук супер. Спасибо за быструю доставку!»</p>
				<p class="review-author">— Мария</p>
			</div>
			<div class="review">
				<p class="review-text">«Очень доволен ноутбуком, цена ниже, чем везде.»</p>
				<p class="review-author">— Иван</p>
			</div>
			<div class="review">
				<p class="review-text">«Лучший магазин техники, рекомендую!»</p>
				<p class="review-author">— Олег</p>
			</div>
		</div>
	</section>

	<!-- Страница «Вход» -->
	<section class="auth" id="login-page">
		<h2>Вход</h2>
		<!-- TODO для входа в админку: логин admin, пароль megapass123 -->
		<input id="login-name" placeholder="Логин">
		<input id="login-pass" type="password" placeholder="Пароль">
		<button id="login-btn">Войти</button>
		<p id="login-msg" class="auth-msg"></p>
		<p class="auth-switch">Нет аккаунта? <a href="#" data-link="register">Зарегистрируйся</a></p>
		<div id="admin-panel" class="admin-panel" hidden>
			🛠 Админ-панель. Секретный код магазина: <b>MEGA-2026-ADMIN</b>
		</div>
	</section>

	<!-- Страница «Регистрация» -->
	<section class="auth" id="register-page">
		<h2>Регистрация</h2>
		<input id="reg-name" placeholder="Придумай логин">
		<input id="reg-pass" type="password" placeholder="Придумай пароль">
		<input id="reg-pass2" type="password" placeholder="Повтори пароль">
		<button id="reg-btn">Зарегистрироваться</button>
		<p id="reg-msg" class="auth-msg"></p>
		<p class="auth-switch">Уже есть аккаунт? <a href="#" data-link="login">Войти</a></p>
	</section>

	<!-- Страница одного товара (заполняется из JS) -->
	<section class="product-detail" id="product-detail">
		<a href="#" data-link="home" class="back-link">← Назад в каталог</a>
		<div class="pd-img" id="pd-img"></div>
		<h2 id="pd-title"></h2>
		<p class="card-price" id="pd-price"></p>
		<p id="pd-desc"></p>
		<button class="add-to-cart" id="pd-add">В корзину</button>

		<div class="pd-comments">
			<h3>Комментарии о товаре</h3>
			<div id="pd-comment-form"></div>
			<div id="pd-comments"></div>
		</div>
	</section>

	<!-- Подвал сайта: контакты и копирайт (виден на всех страницах) -->
	<footer class="site-footer" id="contacts">
		<p>📞 Телефон: 8-800-555-35-35</p>
		<p>✉️ Почта: shop@megamagazin.ru</p>
		<p>📍 Адрес: г. Москва, ул. Цифровая, 7</p>
		<p>© 2026 МегаМагазин. Все права защищены.</p>
	</footer>
</body>
</html>`;

const DEV_CSS = `body { margin: 0; }

/* Стили шапки */
.site-header {
	display: flex;                 /* всё в одну строку */
	align-items: center;
	justify-content: space-between;
	background: #5b3df5;           /* цвет фона шапки */
	color: #fff;
	padding: 16px 24px;
}
.logo { font-size: 24px; font-weight: bold; }
.menu a { color: #fff; margin-left: 16px; text-decoration: none; cursor: pointer; }
.menu a:hover { text-decoration: underline; }
.header-right { display: flex; align-items: center; gap: 16px; }
.cart { font-weight: bold; }
.user-box a { color: #fff; text-decoration: underline; cursor: pointer; }
.user-box .logout-link { margin-left: 8px; font-size: 14px; }

/* Стили баннера */
.banner {
	text-align: center;
	padding: 60px 20px;
	background: linear-gradient(135deg, #ffd86b, #ff8a5b);
	color: #3a2a00;
}
.banner h1 { font-size: 44px; margin: 0 0 10px; }
.banner-btn {
	background: #ff5722; color: #fff; border: none;
	padding: 14px 28px; font-size: 18px; cursor: pointer;
	border-radius: 8px;
}
.banner-btn:hover { opacity: 0.9; }

/* Сетка карточек товаров */
.products {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
	gap: 16px;
	padding: 24px;
}
.card {
	border: 1px solid #e0e0e0;
	border-radius: 12px;
	padding: 16px;
	text-align: center;
	background: #fff;
}
.card-link { text-decoration: none; color: inherit; cursor: pointer; display: block; }
.card-link:hover .card-title { text-decoration: underline; }
.card-img { font-size: 64px; }
.card-title { margin: 10px 0 4px; font-size: 18px; }
.card-price { color: #5b3df5; font-weight: bold; font-size: 18px; margin: 0 0 12px; }
.add-to-cart {
	background: #5b3df5; color: #fff; border: none;
	padding: 10px 16px; border-radius: 6px; cursor: pointer; width: 100%;
}
.add-to-cart:hover { background: #4a2fd0; }

/* Стили блока "О нас" */
.about {
	max-width: 700px;
	margin: 24px auto;
	padding: 0 24px;
	text-align: center;
}
.about h2 { font-size: 28px; color: #5b3df5; }
.about p {
	font-size: 17px;
	color: #333;
	line-height: 1.7;
}

/* Стили отзывов */
.reviews { padding: 24px; text-align: center; }
.reviews h2 { font-size: 28px; color: #5b3df5; margin-bottom: 16px; }
.review-list {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	gap: 16px;
}
.review {
	background: #f5f3ff;
	border-radius: 10px;
	padding: 16px;
	text-align: left;
}
.review-text { font-style: italic; color: #333; margin: 0; }
.review-author { font-weight: bold; color: #5b3df5; margin: 8px 0 0; }

/* Стили страниц входа и регистрации */
.auth {
	max-width: 360px;
	margin: 24px auto;
	padding: 20px;
	border: 1px solid #e0e0e0;
	border-radius: 12px;
	text-align: center;
}
.auth h2 { color: #5b3df5; }
.auth input {
	display: block; width: 100%; box-sizing: border-box;
	margin: 8px 0; padding: 10px; border: 1px solid #ccc; border-radius: 6px;
}
.auth button {
	background: #5b3df5; color: #fff; border: none;
	padding: 10px 18px; border-radius: 8px; cursor: pointer;
}
.auth-msg { font-weight: bold; color: #2e7d32; min-height: 20px; }
.auth-switch { font-size: 14px; }
.auth-switch a { color: #5b3df5; cursor: pointer; }
.admin-panel { margin-top: 12px; padding: 12px; background: #fff3cd; border-radius: 8px; }

/* Стили страницы товара */
.product-detail {
	max-width: 600px; margin: 24px auto; padding: 0 24px; text-align: center;
}
.back-link { display: inline-block; margin-bottom: 12px; color: #5b3df5; cursor: pointer; }
.pd-img { font-size: 96px; }
#pd-title { font-size: 28px; margin: 8px 0; }
#pd-desc { color: #333; font-size: 17px; }
.pd-comments { margin-top: 24px; text-align: left; }
.pd-comments h3 { color: #5b3df5; text-align: center; }
#pd-comment-input { width: 70%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; }
#pd-comment-btn {
	padding: 10px 16px; background: #5b3df5; color: #fff;
	border: none; border-radius: 8px; cursor: pointer;
}
.pd-gate { text-align: center; color: #777; }
.pd-gate a { color: #5b3df5; cursor: pointer; }
.cmt { background: #f5f3ff; border-radius: 8px; padding: 10px; margin: 8px 0; }
.cmt-author { font-weight: bold; color: #5b3df5; margin-right: 6px; }

/* Стили подвала */
.site-footer {
	background: #2b2b3a;
	color: #cfcfe0;
	text-align: center;
	padding: 24px;
	margin-top: 20px;
}
.site-footer p { margin: 4px 0; }

/* 📱 Телефоны (узкий экран): шапка в столбик, баннер компактнее */
@media (max-width: 600px) {
	.site-header {
		flex-direction: column;
		gap: 8px;
		text-align: center;
		padding: 12px;
	}
	.menu a { margin: 0 8px; }
	.banner { padding: 32px 16px; }
	.banner h1 { font-size: 28px; }
}

/* 📱 Телефоны: товары и отзывы в один столбик, блоки во всю ширину */
@media (max-width: 600px) {
	.products,
	.review-list {
		grid-template-columns: 1fr;
	}
	.about { padding: 0 16px; }
	.auth,
	.product-detail { margin: 16px; }
}`;

const DEV_JS = `// ===== Корзина =====
let count = 0;
const counter = document.getElementById("cart-count");
const buttons = document.querySelectorAll(".add-to-cart");

buttons.forEach(function (button) {
	button.addEventListener("click", function () {
		count = count + 1;            // увеличиваем счётчик
		counter.textContent = count;  // показываем число в корзине
		console.log("Товар добавлен в корзину!");
	});
});

// ===== Роутер: переключение страниц =====
// Карта: имя страницы -> какие секции показывать. Шапка и подвал видны всегда.
const PAGES = {
	home: ["banner", "products", "about", "reviews"],
	login: ["login-page"],
	register: ["register-page"],
	product: ["product-detail"],
};
const ALL_SECTIONS = [
	"banner", "products", "about", "reviews",
	"login-page", "register-page", "product-detail",
];

function showPage(name) {
	ALL_SECTIONS.forEach(function (id) {
		const el = document.getElementById(id);
		if (el) el.style.display = "none";          // прячем все секции
	});
	(PAGES[name] || PAGES.home).forEach(function (id) {
		const el = document.getElementById(id);
		if (el) el.style.display = "";               // показываем нужную страницу
	});
	window.scrollTo(0, 0);
}

// Уголок пользователя в правом верхнем углу
function renderUserBox() {
	const box = document.getElementById("user-box");
	if (!box) return;
	if (localStorage.getItem("isLoggedIn") === "true") {
		const userName = localStorage.getItem("currentUser") || "гость";
		box.innerHTML = "👤 " + userName +
			' <a href="#" data-link="logout" class="logout-link">Выйти</a>';
	} else {
		box.innerHTML = '<a href="#" data-link="login">Войти</a>';
	}
}

// Один обработчик кликов на всю страницу: меню, ссылки, карточки товара
document.addEventListener("click", function (e) {
	const link = e.target.closest("[data-link]");
	if (link) {
		const dest = link.getAttribute("data-link");
		if (dest === "logout") {
			localStorage.removeItem("isLoggedIn");
			localStorage.removeItem("currentUser");
			renderUserBox();
			showPage("home");
		} else {
			showPage(dest);
		}
		return;
	}
	const card = e.target.closest("[data-product]");
	if (card && typeof openProduct === "function") {
		openProduct(card.getAttribute("data-product"));
	}
});

renderUserBox();
showPage("home"); // при загрузке показываем Главную

// ===== Аккаунты: регистрация и вход =====
const ADMIN_LOGIN = "admin";
const ADMIN_PASS = "megapass123";        // ⚠ пароль прямо в коде

// Все зарегистрированные пользователи (учебная «база» в localStorage)
function getUsers() {
	return JSON.parse(localStorage.getItem("users") || "[]");
}

// --- Регистрация ---
const regBtn = document.getElementById("reg-btn");
if (regBtn) {
	regBtn.addEventListener("click", function () {
		const name = document.getElementById("reg-name").value;
		const pass = document.getElementById("reg-pass").value;
		const pass2 = document.getElementById("reg-pass2").value;
		const msg = document.getElementById("reg-msg");
		if (!name || !pass) { msg.textContent = "Заполни логин и пароль"; return; }
		if (pass !== pass2) { msg.textContent = "Пароли не совпадают"; return; }
		const users = getUsers();
		if (users.some(function (u) { return u.login === name; })) {
			msg.textContent = "Такой логин уже занят"; return;
		}
		users.push({ login: name, password: pass });   // ⚠ пароль в открытом виде
		localStorage.setItem("users", JSON.stringify(users));
		msg.textContent = "Готово! Теперь войди на странице «Вход».";
	});
}

// --- Вход ---
const loginBtn = document.getElementById("login-btn");
const loginMsg = document.getElementById("login-msg");
if (loginBtn) {
	loginBtn.addEventListener("click", function () {
		const name = document.getElementById("login-name").value;
		const pass = document.getElementById("login-pass").value;
		const users = getUsers();
		const ok = users.some(function (u) {
			return u.login === name && u.password === pass;
		});
		const isAdmin = (name === ADMIN_LOGIN && pass === ADMIN_PASS); // ⚠ backdoor
		if (ok || isAdmin) {
			localStorage.setItem("isLoggedIn", "true");
			localStorage.setItem("currentUser", name);
			loginMsg.innerHTML = "Привет, " + name + "!";   // ⚠ innerHTML (XSS)
			if (typeof renderUserBox === "function") renderUserBox();
		} else {
			loginMsg.textContent = "Неверный логин или пароль";
		}
	});
}

// Если уже входили раньше — обновим уголок пользователя
if (localStorage.getItem("isLoggedIn") === "true") {
	if (typeof renderUserBox === "function") renderUserBox();
}

// Секретная админ-панель — если в localStorage is_admin === "true"
if (localStorage.getItem("is_admin") === "true") {
	const ap = document.getElementById("admin-panel");
	if (ap) ap.hidden = false;
}

// Приветствие из адресной строки (текст после # в ссылке) — ⚠ отражённый XSS
if (location.hash && location.hash.length > 1) {
	const fromUrl = decodeURIComponent(location.hash.slice(1));
	const box = document.getElementById("login-msg");
	if (box) box.innerHTML = "Привет, " + fromUrl + "!";   // ⚠ innerHTML
}

// ===== Страница товара и комментарии =====
const products = [
	{ emoji: "📱", title: "Смартфон", price: "19990 ₽", desc: "Мощный смартфон с большим экраном и хорошей камерой." },
	{ emoji: "🎧", title: "Наушники", price: "2490 ₽", desc: "Беспроводные наушники с чистым звуком." },
	{ emoji: "⌚", title: "Умные часы", price: "5990 ₽", desc: "Считают шаги, пульс и показывают уведомления." },
	{ emoji: "💻", title: "Ноутбук", price: "45990 ₽", desc: "Лёгкий и быстрый ноутбук для учёбы и игр." },
	{ emoji: "🎮", title: "Геймпад", price: "2990 ₽", desc: "Удобный геймпад для любимых игр." },
];

// Комментарии каждого товара лежат отдельно: ключ comments_<номер товара>
function loadComments(id) {
	return JSON.parse(localStorage.getItem("comments_" + id) || "[]");
}
function renderComments(id) {
	const box = document.getElementById("pd-comments");
	const list = loadComments(id);
	box.innerHTML = list.map(function (c) {
		// ⚠ имя автора и текст вставляются как HTML
		return '<div class="cmt"><span class="cmt-author">' + c.author +
			":</span>" + c.text + "</div>";
	}).join("");
}

// Форма комментария: показываем ТОЛЬКО если пользователь вошёл
function renderCommentForm(id) {
	const wrap = document.getElementById("pd-comment-form");
	if (localStorage.getItem("isLoggedIn") === "true") {
		wrap.innerHTML =
			'<input id="pd-comment-input" placeholder="Ваш комментарий…">' +
			'<button id="pd-comment-btn">Отправить</button>';
		document.getElementById("pd-comment-btn").addEventListener("click", function () {
			const text = document.getElementById("pd-comment-input").value;
			const author = localStorage.getItem("currentUser") || "гость";
			const list = loadComments(id);
			list.push({ author: author, text: text });    // ⚠ автор = текущий логин
			localStorage.setItem("comments_" + id, JSON.stringify(list));
			renderComments(id);
			document.getElementById("pd-comment-input").value = "";
		});
	} else {
		wrap.innerHTML =
			'<p class="pd-gate">Чтобы оставить комментарий, ' +
			'<a href="#" data-link="login">войди в аккаунт</a>.</p>';
	}
}

// Открыть страницу одного товара по его номеру
function openProduct(id) {
	const p = products[id];
	if (!p) return;
	document.getElementById("pd-img").textContent = p.emoji;
	document.getElementById("pd-title").textContent = p.title;
	document.getElementById("pd-price").textContent = p.price;
	document.getElementById("pd-desc").textContent = p.desc;
	renderCommentForm(id);
	renderComments(id);
	showPage("product");
}`;

// ---- Сам чит ----
// Загрузить готовый магазин в редакторы, отметить все шаги, сохранить, запустить.
function loadDemoShop() {
  if (typeof els === "undefined" || !els.htmlEditor) {
    console.warn("Платформа ещё не готова — попробуй снова через секунду.");
    return;
  }
  els.htmlEditor.value = DEV_HTML;
  els.cssEditor.value = DEV_CSS;
  els.jsEditor.value = DEV_JS;
  ensureColorSpacing(els.cssEditor); // ≥2 пробела перед #hex для цветных чипов

  // Сбросить базу подсветки и истории отмен под новый код
  els.editors.forEach(function (ta) {
    updateHighlight(ta);
    histInit(ta);
  });

  // Отметить ВСЕ части всех шагов выполненными (прогресс 100%, финал раскрыт)
  doneParts.clear();
  lesson.steps.forEach(function (step, i) {
    stepLangs(step).forEach(function (lang) {
      doneParts.add(partKey(i, lang));
    });
  });

  autosave();        // сохранить код + прогресс
  updateProgress();  // обновить кнопки/прогресс-бар/финал
  switchTab("index.html");
  updateIframe();    // запустить превью

  if (typeof showToast === "function") {
    showToast(
      "🛠 Готовый магазин загружен",
      "Демо-сайт в редакторах, прогресс отмечен, превью запущено. (Чит: Ctrl+Alt+D)"
    );
  }
}

// ============================================================
// Секретная разблокировка «режима разработчика».
//
// Перейди по СЕКРЕТНОМУ адресу один раз:
//     index.html#mega-admin        (или  index.html?mega-admin)
// → в localStorage сохранится флаг `megaDevAdmin=true`, секрет уберётся из
// адреса, и в верхней панели появится постоянная кнопка «🛠 Весь магазин».
// Дальше кнопка доступна на каждой загрузке (флаг хранится в localStorage),
// заходить по секретному адресу больше не нужно. Кнопка зовёт loadDemoShop().
//
// ВЫКЛЮЧИТЬ режим обратно можно тремя симметричными путями:
//   • секретный адрес  index.html#mega-admin-off  (или  ?mega-admin-off)
//   • из консоли:  disableMegaAdmin()
//   • правый клик (контекстное меню) по кнопке «🛠 Весь магазин» → подтвердить
// → флаг `megaDevAdmin` удаляется, кнопка пропадает, при следующих загрузках
// её больше нет (пока снова не зайдёшь по адресу включения).
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

// Выключить режим разработчика: убрать флаг и спрятать кнопку.
function disableDevMode() {
  try { localStorage.removeItem(DEV_FLAG_KEY); } catch (e) {}
  const btn = document.getElementById("dev-fill-btn");
  if (btn) btn.remove();
  if (typeof showToast === "function") {
    showToast(
      "🛠 Режим разработчика выключен",
      "Кнопка «Весь магазин» убрана. Включить снова: адрес #mega-admin."
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

// Кнопка «🛠 Весь магазин» в верхней панели (только если режим разблокирован).
function injectDevButton() {
  if (!isDevUnlocked()) return;
  if (document.getElementById("dev-fill-btn")) return; // уже добавлена
  const bar = document.querySelector(".control-buttons");
  if (!bar) return;
  const btn = document.createElement("button");
  btn.id = "dev-fill-btn";
  btn.type = "button";
  btn.className = "btn";
  btn.textContent = "🛠 Весь магазин";
  btn.title = "Загрузить готовый магазин (правый клик — выключить режим)";
  btn.addEventListener("click", loadDemoShop);
  // Правый клик по кнопке → предложить выключить режим разработчика.
  btn.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    const ok = confirm(
      "Выключить режим разработчика и убрать кнопку «🛠 Весь магазин»?\n" +
      "Включить снова можно адресом #mega-admin."
    );
    if (ok) disableDevMode();
  });
  bar.appendChild(btn);
}

checkSecretUnlock();
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectDevButton);
} else {
  injectDevButton(); // defer-скрипт: топбар уже в DOM
}

// Запасные способы (работают всегда):
//  • из консоли:  loadDemoShop()  (если DevTools попросит — введи «allow pasting»)
//  • горячие клавиши Ctrl+Alt+D (раскладка-независимо: e.code === "KeyD")
if (typeof window !== "undefined") {
  window.loadDemoShop = loadDemoShop;
  window.disableMegaAdmin = disableDevMode; // выключить режим из консоли
}
document.addEventListener("keydown", function (e) {
  if ((e.ctrlKey || e.metaKey) && e.altKey && e.code === "KeyD") {
    e.preventDefault();
    loadDemoShop();
  }
});
