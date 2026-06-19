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

/* Кнопка-бургер (три полоски). На широком экране её не видно. */
.burger {
	display: none;
	flex-direction: column;
	justify-content: space-between;
	width: 30px;
	height: 22px;
	padding: 0;
	border: none;
	background: none;
	cursor: pointer;
}
.burger span {
	display: block;
	width: 100%;
	height: 3px;
	background: #fff;
	border-radius: 2px;
	transition: transform 0.3s ease, opacity 0.3s ease;
}

/* 📱 Телефоны: красивое бургер-меню с анимацией + компактный баннер */
@media (max-width: 600px) {
	.site-header { flex-wrap: wrap; padding: 12px 16px; }
	.logo { order: 1; }
	.burger { display: flex; order: 2; margin-left: auto; }
	.menu {
		order: 3;
		flex-basis: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		overflow: hidden;
		max-height: 0;
		opacity: 0;
		transition: max-height 0.35s ease, opacity 0.35s ease;
	}
	.menu a { margin: 8px 0; }
	.header-right { order: 4; flex-basis: 100%; justify-content: center; margin-top: 8px; }
	.site-header.menu-open .menu { max-height: 220px; opacity: 1; }
	.site-header.menu-open .burger span:nth-child(1) { transform: translateY(9px) rotate(45deg); }
	.site-header.menu-open .burger span:nth-child(2) { opacity: 0; }
	.site-header.menu-open .burger span:nth-child(3) { transform: translateY(-9px) rotate(-45deg); }
	.banner { padding: 32px 16px; }
	.banner h1 { font-size: 28px; }
}

/* 📱 Телефоны: товары и отзывы в один столбик, формы во всю ширину */
@media (max-width: 600px) {
	.products,
	.review-list {
		grid-template-columns: 1fr;
	}
	.about { padding: 0 16px; }
	.auth,
	.product-detail {
		max-width: none;
		margin: 16px;
	}
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

// Показать страницу по текущему адресу (часть после #). Хэш сам пишется в историю
// браузера, поэтому работают встроенные кнопки «Назад» и «Вперёд».
function applyRoute() {
	const h = location.hash.slice(1);
	if (h.indexOf("product-") === 0) {
		const id = h.slice("product-".length);
		try {
			if (typeof openProduct === "function") { openProduct(id); return; }
		} catch (e) { /* код товара ещё не загрузился */ }
	}
	showPage(PAGES[h] ? h : "home");
}
window.addEventListener("hashchange", applyRoute);

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
			location.hash = "home";
		} else {
			location.hash = dest;   // меняем адрес → запись в истории браузера
		}
		return;
	}
	const card = e.target.closest("[data-product]");
	if (card) {
		location.hash = "product-" + card.getAttribute("data-product");
	}
});

// ===== Бургер-меню для телефонов =====
const burgerHeader = document.querySelector(".site-header");
const burgerMenu = burgerHeader ? burgerHeader.querySelector(".menu") : null;
if (burgerHeader && burgerMenu && !burgerHeader.querySelector(".burger")) {
	const burger = document.createElement("button");
	burger.className = "burger";
	burger.type = "button";
	burger.setAttribute("aria-label", "Меню");
	burger.innerHTML = "<span></span><span></span><span></span>";
	const logo = burgerHeader.querySelector(".logo");
	if (logo) logo.after(burger);
	else burgerHeader.appendChild(burger);
	burger.addEventListener("click", function () {
		burgerHeader.classList.toggle("menu-open");
	});
	burgerMenu.addEventListener("click", function (e) {
		if (e.target.closest("a")) burgerHeader.classList.remove("menu-open");
	});
}

// Подвал — в самый конец <body>, чтобы он был ниже любой открытой страницы
const footerEl = document.getElementById("contacts");
if (footerEl) document.body.appendChild(footerEl);

// Оборачиваем все страницы-секции в <main> (всё, кроме шапки и подвала)
let mainEl = document.getElementById("main-content");
if (!mainEl) {
	mainEl = document.createElement("main");
	mainEl.id = "main-content";
	const headerEl = document.querySelector(".site-header");
	if (headerEl) headerEl.after(mainEl);
	else document.body.insertBefore(mainEl, document.body.firstChild);
}
ALL_SECTIONS.forEach(function (id) {
	const el = document.getElementById(id);
	if (el && el.parentNode !== mainEl) mainEl.appendChild(el);
});

// Раскладка: шапка сверху, подвал снизу, контент по центру при нехватке высоты
document.body.style.display = "flex";
document.body.style.flexDirection = "column";
document.body.style.minHeight = "100vh";
mainEl.style.flex = "1";
mainEl.style.display = "flex";
mainEl.style.flexDirection = "column";
mainEl.style.justifyContent = "center";

renderUserBox();
applyRoute(); // при загрузке показываем страницу по текущему адресу

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
  const parts = [];
  ["html", "css", "js"].forEach(function (lang) {
    if (f[lang] != null) { parts.push({ lang: lang, code: f[lang] }); return; }
    if (step.snippets && step.snippets[lang] != null) {
      parts.push({ lang: lang, code: fillCode(step.snippets[lang], f, lang) });
    }
  });
  return parts;
}

// Вставить HTML-часть так же, как обычная кнопка: внутрь каркаса перед </body>.
function adminInsertHtml(title, code) {
  const ed = els.htmlEditor;
  const v = ed.value;
  const m = /([ \t]*)<\/body>/i.exec(v);
  if (!m) { ed.value = code; return; } // каркаса ещё нет — это и есть скелет
  const indent = (m[1] || "") + "\t";
  const block = wrapBlock("html", title, code);
  const hasPrev = /НАЧАЛО:/.test(v);
  const text =
    (hasPrev ? "\n" : "") +
    block.split("\n").map(function (l) { return l ? indent + l : l; }).join("\n") +
    "\n";
  ed.value = v.slice(0, m.index) + text + v.slice(m.index);
}

// Дописать CSS/JS-часть в конец соответствующего файла.
function adminAppend(lang, title, code) {
  const ed = lang === "css" ? els.cssEditor : els.jsEditor;
  const block = wrapBlock(lang, title, code);
  const trimmed = ed.value.replace(/\s+$/, "");
  ed.value = trimmed ? trimmed + "\n\n" + block : block;
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
      if (p.lang === "html") adminInsertHtml(step.title, p.code);
      else adminAppend(p.lang, step.title, p.code);
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
