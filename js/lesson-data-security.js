// ============================================================
// Урок 2 «Этичный хакер» — отдельный набор данных (подключается из index2.html
// ВМЕСТО js/lesson-data.js). Стартовый код — ВШИТЫЙ эталонный уязвимый сайт
// «МегаМагазин»: тот самый МНОГОСТРАНИЧНЫЙ магазин, что ребёнок строил в уроке 1
// (роутер, регистрация/вход, страницы товара, комментарии по товару, уголок
// пользователя, бургер-меню). У всех детей одинаковая отправная точка.
//
// ВАЖНО: VULN_HTML/CSS/JS НЕ редактируются руками — они СГЕНЕРИРОВАНЫ из урока 1
// скриптами scripts/build_vuln_site.py + scripts/build_lesson2.py (эталонный
// «ответ» урока 1). Любые правки делай в уроке 1 и пересобирай, иначе сайт
// «дрейфует» от того, что реально строит ребёнок.
//
// Цикл по КАЖДОЙ уязвимости: 🔴 Найди/сломай → 🟢 Почини (правит код + ▶ Запустить)
// → ✅ Проверь. Все шаги «ручные» (manual:true).
//
// Намеренные уязвимости (см. docs/ARCHITECTURE.md, docs/LESSON_REDESIGN.md):
//   1) Stored XSS в комментариях товара (innerHTML: текст + имя автора) и в
//      уголке пользователя / приветствии — innerHTML→textContent.
//   2) Пароль захардкожен в коде + в HTML-комментарии; обход входа через
//      localStorage.isLoggedIn.
//   3) Пароли пользователей в localStorage открытым текстом (массив users).
//   4) Слабые пароли перебираются брутфорсом (демонстрация в консоли).
//   5) Повышение прав: localStorage.is_admin === "true" открывает админ-панель.
//   6) Отражённый XSS: приветствие из #welcome=… через innerHTML (воспроизводимо
//      изнутри iframe: location.hash ставит JS самого сайта).
//   + CTF-бонус: спрятанные флаги (HTML-комментарий, JS-переменная, localStorage).
// ============================================================

// ---- Стартовый уязвимый сайт (сгенерирован из урока 1, не править вручную) ----

const VULN_HTML = `<!DOCTYPE html>
<html lang="ru">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>МегаМагазин</title>
</head>
<body>

	<h1>Добро пожаловать в МегаМагазин</h1>
	<p>Тут будут самые крутые товары!</p>

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

	<!-- Баннер: главный заголовок и кнопка (страница «Главная») -->
	<section class="banner" id="banner">
		<p id="welcome-box" class="welcome-box" hidden></p>
		<h1>Скидки до 50% на технику!</h1>
		<p>Только до конца недели — успей купить!</p>
		<a href="#products" class="banner-btn" data-scroll="products">Купить сейчас</a>
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

	<!-- Блок "О нас": рассказ о магазине (страница «Главная») -->
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

	<!-- Подвал сайта: контакты и копирайт (виден на всех страницах) -->
	<footer class="site-footer" id="contacts">
		<p>📞 Телефон: 8-800-555-35-35</p>
		<p>✉️ Почта: shop@megamagazin.ru</p>
		<p>📍 Адрес: г. Москва, ул. Цифровая, 7</p>
		<p>© 2026 МегаМагазин. Все права защищены.</p>
		<!-- FLAG{секрет_спрятан_в_html_комментарии} -->
	</footer>

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
</body>
</html>`;

const VULN_CSS = `h1 { color: #5b3df5; text-align: center; }

/* Приветствие из шага 2 → тонкая полоска вверху сайта */
body > h1,
body > p {
	margin: 0;
	background: #2b2b3a;
	color: #fff;
	text-align: center;
	font-weight: normal;
	line-height: 1.3;
}
body > h1 { font-size: 15px; padding: 8px 16px 2px; }
body > p  { font-size: 13px; color: #cfcfe0; padding: 0 16px 8px; }

/* Стили шапки */
.site-header {
	display: flex;                 /* всё в одну строку */
	align-items: center;
	justify-content: space-between;
	background: #5b3df5;      /* цвет фона шапки */
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
.welcome-box {
	background: #fff3cd; color: #3a2a00; font-weight: bold;
	max-width: 480px; margin: 0 auto 16px; padding: 10px 16px; border-radius: 8px;
}
.banner h1 { font-size: 44px; margin: 0 0 10px; }
.banner-btn {
	display: inline-block; text-decoration: none;   /* ссылка-якорь выглядит как кнопка */
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

/* Убираем стандартные поля вокруг страницы */
body { margin: 0; }

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

/* Стили подвала */
.site-footer {
	background: #2b2b3a;
	color: #cfcfe0;
	text-align: center;
	padding: 24px;
	margin-top: 20px;
}
.site-footer p { margin: 4px 0; }

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

/* 📱 Телефоны: красивое бургер-меню с анимацией + компактный баннер */

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

@media (max-width: 600px) {
	.site-header { flex-wrap: wrap; padding: 12px 16px; }
	.logo { order: 1; }
	.burger { display: flex; order: 2; margin-left: auto; } /* бургер справа */

	/* Меню — на всю ширину, плавно раскрывается под шапкой */
	.menu {
		order: 3;
		flex-basis: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		overflow: hidden;
		max-height: 0;            /* свёрнуто */
		opacity: 0;
		transition: max-height 0.35s ease, opacity 0.35s ease;
	}
	.menu a { margin: 8px 0; }

	.header-right { order: 4; flex-basis: 100%; justify-content: center; margin-top: 8px; }

	/* Меню открыто (класс menu-open на шапке) — плавно показываем */
	.site-header.menu-open .menu { max-height: 220px; opacity: 1; }

	/* Анимация: три полоски красиво превращаются в крестик ✕ */
	.site-header.menu-open .burger span:nth-child(1) { transform: translateY(9px) rotate(45deg); }
	.site-header.menu-open .burger span:nth-child(2) { opacity: 0; }
	.site-header.menu-open .burger span:nth-child(3) { transform: translateY(-9px) rotate(-45deg); }

	/* Баннер компактнее */
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
	.product-detail {
		max-width: none;   /* во всю ширину телефона */
		margin: 16px;      /* одинаковые отступы по краям */
	}
}`;

const VULN_JS = `// ===== Корзина =====
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

// CTF-бонус: спрятанные «флаги» (намеренно — пригодятся на уроке 2 «Этичный хакер»)
var hiddenFlag = "FLAG{секрет_в_коде_джаваскрипт}";
localStorage.setItem("secret_flag", "FLAG{секрет_в_local_storage}");

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

// Показать страницу по текущему адресу (часть после # — это «адрес» страницы).
// Хэш меняется при навигации и сам пишется в историю браузера, поэтому работают
// встроенные кнопки браузера «Назад» и «Вперёд».
// Приветствие из адреса: ссылка вида #welcome=Имя показывает «С возвращением».
// ⚠ имя берётся из адреса и вставляется через innerHTML — отражённый XSS (урок 2).
function showWelcome(name) {
	const box = document.getElementById("welcome-box");
	if (!box) return;
	box.hidden = false;
	box.innerHTML = "С возвращением, " + name + "!";   // ⚠ innerHTML
}

function applyRoute() {
	const h = location.hash.slice(1);              // например "login" или "product-2"
	if (h.indexOf("product-") === 0) {             // страница конкретного товара
		const id = h.slice("product-".length);
		try {
			if (typeof openProduct === "function") { openProduct(id); return; }
		} catch (e) { /* код товара ещё не загрузился — покажем Главную */ }
	}
	if (h.indexOf("welcome=") === 0) {             // приветствие из ссылки (#welcome=…)
		showPage("home");
		showWelcome(decodeURIComponent(h.slice("welcome=".length)));
		return;
	}
	showPage(PAGES[h] ? h : "home");
}

// «Назад»/«Вперёд» в браузере меняют хэш → перерисовываем страницу
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
	// Ссылка-якорь (например, «Купить сейчас») — плавно прокрутить к секции
	const scrollLink = e.target.closest("[data-scroll]");
	if (scrollLink) {
		e.preventDefault();
		const target = document.getElementById(scrollLink.getAttribute("data-scroll"));
		if (target) target.scrollIntoView({ behavior: "smooth" });
		return;
	}
	const link = e.target.closest("[data-link]");
	if (link) {
		e.preventDefault();   // не даём ссылке href="#" перезагружать страницу
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
		e.preventDefault();   // карточка — это тоже ссылка href="#"
		location.hash = "product-" + card.getAttribute("data-product");
	}
});

// Подвал добавили РАНЬШЕ страниц входа/товара, поэтому в коде он стоит выше них.
// Перенесём его в самый конец <body> — тогда он всегда ниже любой открытой страницы.
const footerEl = document.getElementById("contacts");
if (footerEl) document.body.appendChild(footerEl);

// Оборачиваем все страницы-секции в <main> (всё, кроме шапки и подвала)
let mainEl = document.getElementById("main-content");
if (!mainEl) {
	mainEl = document.createElement("main");
	mainEl.id = "main-content";
	const headerEl = document.querySelector(".site-header");
	if (headerEl) headerEl.after(mainEl);            // <main> сразу после шапки
	else document.body.insertBefore(mainEl, document.body.firstChild);
}
ALL_SECTIONS.forEach(function (id) {
	const el = document.getElementById(id);
	if (el && el.parentNode !== mainEl) mainEl.appendChild(el); // переносим в <main>
});

// Раскладка: шапка сверху, подвал снизу, а контент в <main> — по центру по
// вертикали, когда его не хватает на весь экран (отступы сверху и снизу равны).
document.body.style.display = "flex";
document.body.style.flexDirection = "column";
document.body.style.minHeight = "100vh";
mainEl.style.flex = "1";
mainEl.style.display = "flex";
mainEl.style.flexDirection = "column";
mainEl.style.justifyContent = "center";

renderUserBox();
applyRoute(); // при загрузке показываем страницу по текущему адресу (по умолчанию — Главную)

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
}

// ===== Бургер-меню для телефонов =====
const burgerHeader = document.querySelector(".site-header");
const burgerMenu = burgerHeader ? burgerHeader.querySelector(".menu") : null;

if (burgerHeader && burgerMenu && !burgerHeader.querySelector(".burger")) {
	// Кнопка-бургер из трёх полосок
	const burger = document.createElement("button");
	burger.className = "burger";
	burger.type = "button";
	burger.setAttribute("aria-label", "Меню");
	burger.innerHTML = "<span></span><span></span><span></span>";

	// Ставим бургер сразу после логотипа
	const logo = burgerHeader.querySelector(".logo");
	if (logo) logo.after(burger);
	else burgerHeader.appendChild(burger);

	// Клик по бургеру — открыть/закрыть меню (класс menu-open включает анимацию)
	burger.addEventListener("click", function () {
		burgerHeader.classList.toggle("menu-open");
	});

	// Выбрали пункт меню — меню само закрывается
	burgerMenu.addEventListener("click", function (e) {
		if (e.target.closest("a")) burgerHeader.classList.remove("menu-open");
	});
}`;


// ---- Данные урока 2 ----
const lesson = {
  title: `Урок 2: Этичный хакер 🕵️`,

  introMd: `# 🕵️ Этичный хакер: найди дыры в своём магазине

На прошлом уроке ты был **программистом** и собрал целый магазин «МегаМагазин» —
с регистрацией, входом, страницами товаров и комментариями. Сегодня у тебя новая
профессия — **этичный хакер** (его ещё называют «белый хакер»).

## 🦸 Кто такой этичный хакер?

Это «добрый взломщик». Звучит странно, но это **настоящая работа**, и за неё
хорошо платят! Большие компании (банки, игры, соцсети) специально нанимают белых
хакеров, чтобы те **первыми** нашли дыры в их программных продуктах (сайтах, играх, приложениях и др.) — раньше, чем это сделают
злые хакеры. Белый хакер ломает не для того, чтобы навредить, а чтобы **починить**
и защитить людей.

⚠️ **Золотое правило хакера:** мы ломаем **только свой собственный** программный продукт (сайт, игру, приложение). Ломать
чужие сайты без разрешения хозяина — это преступление, за которое наказывают
по-настоящему. Белый хакер всегда действует только с разрешения. Сегодня мы ломаем
**твой** магазин — значит, всё честно. 👍

## 🗺️ Сначала осмотрись: что у тебя на экране

Экран разделён на **три части (их называют «колонки»)** — слева направо:

**1. 📖 Урок** — это колонка слева, в ней ты читаешь прямо сейчас. Здесь будут все
шаги и зелёные кнопки **«✓ Я выполнил этот шаг»**.

**2. Код** — колонка посередине. Это код твоего сайта. Сверху у неё три **вкладки**:
\`index.html\`, \`style.css\`, \`main.js\` — это три файла, из которых собран сайт.
Чтобы открыть нужный файл, надо щёлкнуть по его вкладке (научимся на шаге 1).

**3. Результат** — колонка справа. Здесь «живёт» твой сайт. А под ним есть тёмное
окошко **🖥 Консоль**, куда сайт пишет сообщения.

Над всеми колонками, в самом верху, есть синяя кнопка **▶ Запустить**. Она
пересобирает сайт после того, как ты изменил код. Запомни её — нажимать будем
часто!

## 🔁 Как мы работаем с каждой дырой

С каждой уязвимостью (дырой) мы делаем три действия:

**1. 🔴 Найди / сломай** — пользуемся дырой, как настоящий злоумышленник, чтобы
увидеть опасность своими глазами.

**2. 🟢 Почини** — правим код сайта и жмём **▶ Запустить**.

**3. ✅ Проверь** — повторяем ту же атаку и убеждаемся: теперь она **не работает**!

В колонке «Результат» уже загружен твой уязвимый магазин — тот самый, что ты
собрал на прошлом уроке. Поехали искать дыры! 👇`,

  outroMd: `# 🏆 Поздравляем, ты прошёл путь разработчик → этичный хакер!

Ты научился находить и **чинить** настоящие уязвимости:

- 💉 **XSS** — чужой код через \`innerHTML\` (комментарии, имя автора, уголок
  пользователя, приветствие из ссылки); чинится выводом через \`textContent\`.
- 🔑 **Секреты на клиенте** — пароли и «флаги» в коде, в HTML и в localStorage
  любой может прочитать. Настоящая проверка пароля и прав — **только на сервере**.
- 🗄️ **Пароли в открытом виде** — их нужно хранить в виде «хэша» на сервере.
- 🔓 **Слабые пароли** — короткий пароль перебирается за миллисекунды; защита —
  длинные сложные пароли и ограничение числа попыток на сервере.
- 🛂 **Контроль доступа** — нельзя доверять флагам вроде \`is_admin\` в браузере.

## Куда расти дальше

- Учи **HTML/CSS/JS** глубже — ты уже умеешь больше многих новичков.
- Почитай про **OWASP Top-10** (список самых частых уязвимостей) — есть версии
  «для начинающих».
- Тренируйся на легальных площадках (CTF для детей, обучающие лаборатории).

Главное — оставайся **белым** хакером: знания дают силу, а сила требует
честности. 🔐`,

  hint: `Каждую дыру проходи по циклу: 🔴 найди/сломай → 🟢 почини код в редакторе и нажми ▶ Запустить → ✅ повтори атаку и убедись, что не работает. Инструменты: встроенная консоль 🖥 внизу и F12 (DevTools) — вкладки Elements, Console, Application → Local Storage. Когда выполнил шаг — жми «✓ Я выполнил этот шаг».`,

  // Стартовый код = вшитый уязвимый сайт (одинаковый у всех)
  initialHTML: VULN_HTML,
  initialCSS: VULN_CSS,
  initialJS: VULN_JS,

  steps: [
    {
      manual: true,
      title: `🧰 Шаг 0. Инструменты этичного хакера`,
      time: `12 мин`,
      goalMd: `**Цель:** осмотреться, запустить магазин и найти инструменты, которыми хакер пользуется. Это самый важный шаг — не спеши.`,
      actionMd: `Здесь ничего ломать не нужно — просто всё найди и осмотрись. В конце нажми зелёную кнопку **✓ Я выполнил этот шаг**.`,
      taskMd: `🔧 **Осмотрись и подготовь инструменты. Делай по пунктам, не торопись.**

**1. Посмотри на магазин и найди кнопку «Запустить».** Справа, в колонке «Результат»,
уже открыт твой магазин «МегаМагазин» 🎉 — тот самый, что ты собрал на прошлом уроке.
Теперь вверху экрана, над колонками, найди синюю кнопку **▶ Запустить**. Наведи на неё
курсор мыши и нажми **левую кнопку мыши** один раз — она **пересобирает** сайт после
того, как ты изменишь код. Запомни эту кнопку: чинить дыры мы будем именно так —
поправил код и нажал ▶ Запустить.

**2. Погуляй по магазину.** Вверху сайта есть меню со словами **Главная**, **Вход**,
**Регистрация**. Наведи курсор на слово **Вход** и нажми **левую кнопку мыши** —
откроется страница входа. Теперь так же щёлкни левой кнопкой по слову **Главная** —
вернёшься назад. Потом наведи курсор на любую **карточку товара** (например, на
картинку смартфона) и щёлкни левой кнопкой — откроется отдельная страница этого
товара. Видишь? Страниц много, а файл всего один — это **многостраничный** сайт.

**3. Найди встроенную консоль.** Под сайтом, в той же правой колонке, есть тёмное
окошко с подписью **🖥 Консоль**. Сюда сайт пишет свои сообщения. Если его не видно —
покрути колёсико мыши вниз внутри правой колонки. Теперь на сайте наведи курсор на
любую кнопку **«В корзину»** и щёлкни левой кнопкой мыши. В консоли появится строчка
«Товар добавлен в корзину!». Так консоль показывает, что сайт делает «изнутри».

**4. Открой DevTools — главный инструмент хакера.** DevTools (читается «дев-тулз»,
по-русски «инструменты разработчика») встроены в каждый браузер. Нажми на клавиатуре
клавишу **F12** (она в самом верхнем ряду). Сбоку или снизу откроется панель с кучей
надписей — **не пугайся!** Если по F12 ничего не открылось — наведи курсор на сайт,
нажми **правую кнопку мыши** и в появившемся меню выбери пункт **«Просмотреть код»**
(или **«Inspect»**).

**5. Найди в DevTools три нужные вкладки.** Вверху панели DevTools есть ряд слов —
это вкладки. Нам нужны только три. Наводи курсор и щёлкай по ним левой кнопкой, чтобы
запомнить, где они:
- **Elements** (по-русски «Элементы») — показывает HTML, из которого собрана страница.
- **Console** («Консоль») — сюда можно **печатать команды** и выполнять их прямо на сайте. Это другая консоль, не та, что 🖥 на платформе, но тоже про твой сайт.
- **Application** («Приложение») — щёлкни по ней, и слева появится список; найди в нём **Local Storage** и щёлкни по нему. Это «кладовка» браузера: тут сайт хранит, кто вошёл, список пользователей, комментарии. Скоро мы туда залезем.

Ничего страшного, если пока непонятно — будем пользоваться этим по ходу урока, я
каждый раз буду подсказывать, куда нажимать.

**6. Готово!** Вернись в колонку **📖 Урок** (слева), прокрути эту карточку до конца
и нажми зелёную кнопку **✓ Я выполнил этот шаг**.`,
      hintMd: `Клавиша F12 открывает И закрывает DevTools (нажми ещё раз — спрячется). Если F12 не сработала — правая кнопка мыши по сайту → «Просмотреть код» / «Inspect». Встроенная консоль платформы (🖥 в правой колонке) и вкладка Console в DevTools — это два разных окошка, но оба показывают сообщения твоего сайта; можно пользоваться любым.`,
      doneMd: `✅ **Готово, когда** магазин запущен (нажал ▶ Запустить), страницы Главная/Вход переключаются, ты нашёл окошко 🖥 Консоль и открыл DevTools (F12), а в нём — вкладки Elements, Console и Application → Local Storage.`,
    },
    {
      manual: true,
      title: `💉 Дыра №1: XSS в комментариях`,
      time: `35 мин`,
      goalMd: `**Цель:** научиться уязвимости **XSS** (Cross-Site Scripting) — когда злоумышленник заставляет сайт выполнить **чужой код**.

**Где дыра:** комментарии к товару, имя автора и уголок пользователя выводятся через \`innerHTML\` — браузер исполняет вставленный HTML.`,
      actionMd: `Сначала сломай (🔴), потом почини код в **main.js** (🟢) и проверь (✅).`,
      taskMd: `🔧 **🔴 НАЙДИ / СЛОМАЙ.**

**1. Заведи себе аккаунт.** На сайте вверху наведи курсор на
слово **Регистрация** и щёлкни левой кнопкой мыши. Появятся поля. Щёлкни левой
кнопкой по полю «Придумай логин» и напечатай любой логин, например \`vasya\`. Щёлкни
по полю «Придумай пароль», напечатай пароль, например \`12345678\`, и повтори его в
третьем поле. Нажми кнопку **Зарегистрироваться**.

**2. Войди.** Вверху щёлкни **Вход**. Впиши тот же логин (\`vasya\`) и пароль
(\`12345678\`), нажми кнопку **Войти**. В правом верхнем углу появится «👤 vasya» —
значит, ты вошёл.

**3. Открой комментарии товара.** Щёлкни **Главная**, потом щёлкни по любой
**карточке товара**. Прокрути страницу товара вниз — там есть поле для комментария
и кнопка «Отправить».

**4. А теперь — атака!** Щёлкни левой кнопкой по полю комментария и **аккуратно
напечатай (или скопируй) ровно это:**
\`<img src=x onerror="alert('XSS')">\`
Нажми кнопку **Отправить**. 💥 Выскочило окошко с надписью «XSS»? Поздравляю — ты
только что заставил сайт выполнить **чужой код**! Это и есть уязвимость **XSS**
(читается «экс-эс-эс»). Нажми **OK**, чтобы закрыть окошко.

**5. XSS умеет красть данные.** Снова щёлкни по полю комментария и напечатай другую
строку:
\`<img src=x onerror="alert(localStorage.getItem('currentUser'))">\`
Нажми **Отправить**. Теперь в окошке появилось **твоё имя пользователя** — код сам
вытащил его из памяти браузера! Точно так же злоумышленники крадут логины и пароли.
Нажми **OK**.

**6. Самое опасное: атака бьёт по ДРУГИМ людям, а не только по тебе.** Твой вредный
комментарий никуда не делся — сайт **сохранил** его прямо у этого товара. А значит,
он сработает у **любого**, кто откроет страницу этого товара. Проверим это так, будто
ты — совсем другой человек. Делай по шагам:

- **Запомни товар.** Посмотри вверху открытой страницы, **какой это товар** (например, «Смартфон»). Позже нужно будет открыть **тот же самый**.
- **Выйди из своего аккаунта.** В правом верхнем углу, рядом с «👤 vasya», есть слово **Выйти**. Наведи на него курсор и щёлкни левой кнопкой мыши. Имя \`vasya\` пропадёт, а на его месте появится слово **Войти** — значит, ты вышел из аккаунта.
- **Заведи НОВЫЙ, другой аккаунт.** Вверху щёлкни **Регистрация**. В поле «Придумай логин» напечатай **другой** логин, например \`petya\`. В поле «Придумай пароль» впиши новый пароль, например \`87654321\`, и повтори его в третьем поле. Нажми **Зарегистрироваться**.
- **Войди под новым аккаунтом.** Вверху щёлкни **Вход**, впиши логин \`petya\` и пароль \`87654321\`, нажми **Войти**. В правом верхнем углу появится «👤 petya» — теперь ты для сайта **совсем другой пользователь**.
- **Открой ТОТ ЖЕ товар, что и раньше.** Вверху щёлкни **Главная**, а затем щёлкни по **той же самой карточке товара**, которую открывал в начале (в примере — «Смартфон»).
- 💥 **Смотри, что происходит.** Как только страница товара открылась, окошки-атаки **выскочили снова** — хотя ты теперь другой человек и сам ничего вредного не писал! Закрой каждое окошко кнопкой **OK**. Обрати внимание: в одном из окошек будет уже **твой новый логин** (\`petya\`). Это значит, что код, который оставил \`vasya\`, только что украл уже **твоё** имя.

Вывод: вредный комментарий хранится **на самом сайте**, поэтому страдает **каждый**,
кто откроет эту страницу. Это самый опасный вид XSS — его называют **хранимым**
(по-английски *stored XSS*): злоумышленник оставляет ловушку **один раз**, а попадаются
в неё **все** будущие посетители.

**7.** 🤔 **Почему так вышло?** Сайт берёт твой комментарий и вставляет его на
страницу через \`innerHTML\`. А \`innerHTML\` означает «вставь это как **настоящий
HTML**», то есть как часть кода страницы — а не как обычный текст. Поэтому картинка
\`<img>\` с ловушкой \`onerror\` сработала.

---

🔧 **🟢 ПОЧИНИ (файл main.js).**

**Сначала открой нужный файл.** В средней колонке «Код» сверху есть три вкладки.
Наведи курсор на вкладку **main.js** (третья) и щёлкни левой кнопкой мыши — откроется
код этого файла.

**Найди нужную функцию с именем \`renderComments\`.** Нажми на клавиатуре **Ctrl+F** (зажми клавишу \`Ctrl\` и, не
отпуская её, нажми букву \`F\`). Откроется строка поиска браузера. Напечатай в ней
\`function renderComments(id)\`. Эта же строка встречается несколько раз здесь, в тексте
урока (в левой колонке), поэтому нажимай **Enter** **до тех пор, пока подсветка не
перепрыгнет** с текста задания на нужную строку в коде, в средней колонке. Так ты
быстро находишь нужное место, не листая вручную.

**Выдели всю функцию целиком.** Функция начинается со строки
\`function renderComments(id) {\` и заканчивается строкой с одной закрывающей скобкой
\`}\` (через несколько строк ниже). Чтобы выделить её всю: наведи курсор и щёлкни левой
кнопкой мыши **в самом начале** строки \`function renderComments(id) {\` (перед буквой
\`f\`). Затем найди её последнюю строку \`}\`, **зажми клавишу Shift** и щёлкни левой
кнопкой мыши **сразу после** этой \`}\`. Все строки функции подсветятся синим. Нажми
клавишу **Delete** (или **Backspace**) — выделенное удалится.

😌 **Не бойся ошибиться:** если что-то пошло не так, нажми **Ctrl+Z** (отмена) — код
вернётся назад, и можно попробовать снова.

**Вставь на её место версию, которая выводит ТЕКСТ комментария безопасно** — через
\`textContent\` (то есть как **обычный текст**, а не как HTML). Имя автора мы пока
**намеренно** оставляем как есть — к нему вернёмся чуть позже. Скопируй и вставь:

\`\`\`
function renderComments(id) {
	const box = document.getElementById("pd-comments");
	const list = loadComments(id);
	box.innerHTML = "";                       // очистили
	list.forEach(function (c) {
		const div = document.createElement("div");
		div.className = "cmt";
		const author = document.createElement("span");
		author.className = "cmt-author";
		author.innerHTML = c.author + ":";    // ⚠ имя автора пока выводим как HTML
		div.appendChild(author);
		div.appendChild(document.createTextNode(" " + c.text)); // безопасно: это ТЕКСТ
		box.appendChild(div);
	});
}
\`\`\`

Теперь нажми синюю кнопку **▶ Запустить** вверху, чтобы сайт пересобрался с новым
кодом.

---

🔧 **✅ ПРОВЕРЬ — получилось ли?** Снова зайди на страницу любого товара, щёлкни по
полю комментария и ещё раз отправь ту же строку
\`<img src=x onerror="alert('XSS')">\`. Теперь окошко **не выскакивает** — комментарий
просто показывается как обычный текст с кавычками и скобками. 🎉 Это значит: дыра
закрыта! 🛡️

---

🔧 **🔴 СНАЧАЛА СЛОМАЙ ПРОФИЛЬ — убедись, что XSS прячется не только в комментариях.**
Тот же трюк работает и с **именем пользователя**: своё имя ты видишь в уголке
«👤 …» в правом верхнем углу, а сайт показывает его там тоже через \`innerHTML\`.
Значит, если вместо обычного логина зарегистрироваться под «вредным» именем — код
снова сработает. Проверим это. Делай по шагам:

- **Выйди из аккаунта**, если ты ещё в нём. В правом верхнем углу, рядом с «👤 …», щёлкни левой кнопкой по слову **Выйти**.
- **Открой регистрацию.** Вверху сайта наведи курсор на слово **Регистрация** и щёлкни левой кнопкой мыши.
- **Вместо логина впиши ловушку.** Щёлкни левой кнопкой по полю «Придумай логин» и аккуратно напечатай (или скопируй) **ровно эту строку**: \`<img src=x onerror="alert('XSS в профиле')">\`
- **Придумай пароль.** Щёлкни по полю «Придумай пароль», напечатай любой пароль, например \`12345678\`, и **повтори тот же пароль** в третьем поле. Нажми кнопку **Зарегистрироваться**.
- **Войди этим аккаунтом.** Вверху щёлкни **Вход**. В поле логина впиши **ту же самую** строку-ловушку \`<img src=x onerror="alert('XSS в профиле')">\`, в поле пароля — \`12345678\`, и нажми кнопку **Войти**.
- 💥 **Окошко выскочило снова!** В этот раз код спрятался не в комментарии, а прямо в **твоём имени** — и сработал, как только сайт показал имя в уголке «👤 …» и в приветствии «Привет, …». Окошко может выскочить **несколько раз подряд** (имя показывается сразу в нескольких местах) — просто закрывай каждое кнопкой **OK**.

Вот и вывод: **XSS** — это не только про комментарии. Дыра появляется в **любом** месте,
где сайт показывает чужой текст через \`innerHTML\`. Поэтому чинить нужно **все** такие
места — этим и займёмся.

---

💪 **Та же дыра прячется ещё в двух местах** — почини и их тем же приёмом
(заменяем \`innerHTML\` на безопасный вывод). Ты уже умеешь — действуй так же.

**а) Уголок пользователя** (имя «👤 …» в правом верхнем углу сайта). На вкладке
**main.js** нажми **Ctrl+F**, напечатай \`renderUserBox\`, нажми **Enter** — найдёшь
эту функцию. (Это сочетание встречается в тексте урока несколько раз, поэтому нажимай
**Enter** до тех пор, пока подсветка не перепрыгнет с текста задания на нужную строку
в коде.) Выдели её целиком тем же способом (щёлкни в начале строки
\`function renderUserBox() {\`, потом с зажатым **Shift** щёлкни после её закрывающей
\`}\`), нажми **Delete** и вставь безопасную версию:

\`\`\`
function renderUserBox() {
	const box = document.getElementById("user-box");
	if (!box) return;
	box.innerHTML = "";
	if (localStorage.getItem("isLoggedIn") === "true") {
		const userName = localStorage.getItem("currentUser") || "гость";
		box.appendChild(document.createTextNode("👤 " + userName + " "));
		const out = document.createElement("a");
		out.href = "#"; out.setAttribute("data-link", "logout");
		out.className = "logout-link"; out.textContent = "Выйти";
		box.appendChild(out);
	} else {
		const a = document.createElement("a");
		a.href = "#"; a.setAttribute("data-link", "login");
		a.textContent = "Войти";
		box.appendChild(a);
	}
}
\`\`\`

**б) Приветствие после входа.** Тут менять надо всего **одно слово** — это просто.
На вкладке **main.js** нажми **Ctrl+F**, напечатай \`loginMsg.innerHTML\` и нажми
**Enter**. (Это сочетание встречается в тексте урока несколько раз, поэтому нажимай
**Enter** до тех пор, пока подсветка не перепрыгнет с текста задания на нужную строку
в коде.) Ты найдёшь строку:
\`loginMsg.innerHTML = "Привет, " + name + "!";\`
В этой строке наведи курсор на слово \`innerHTML\` и **дважды быстро щёлкни** по нему
левой кнопкой мыши — слово выделится целиком. Теперь просто напечатай \`textContent\`
— оно заменит выделенное слово. Должно получиться:
\`loginMsg.textContent = "Привет, " + name + "!";\`

Нажми **▶ Запустить**.

---

🔧 **✅ ПРОВЕРЬ, что места «а» и «б» закрыты.** Выйди (щёлкни «Выйти» в правом углу),
вверху щёлкни **Регистрация** и заведи нового пользователя с «вредным» именем
\`<img src=x onerror="alert('XSS в профиле')">\`: придумай пароль \`12345678\`, повтори его
в третьем поле, нажми **Зарегистрироваться**. Потом щёлкни **Вход**, впиши **ту же
самую** строку-ловушку в логин и пароль \`12345678\`, нажми **Войти**. Раньше при входе
выскакивало бы окошко — а теперь имя в уголке «👤 …» и в приветствии «Привет, …»
показывается как безобидный текст, окошко **не выскакивает**. 🛡️ Два места закрыты!

---

🔧 **🔴 НО ПОДОЖДИ — в комментариях осталась ещё одна, спрятанная дыра.** Помнишь, когда
мы чинили \`renderComments\`, имя автора мы **намеренно** оставили выводиться через
\`innerHTML\`? Сейчас увидишь, чем это опасно. Ты прямо сейчас вошёл под «вредным» логином
\`<img src=x onerror="alert('XSS в профиле')">\` (мы завели его на прошлом шаге). Теперь,
**не выходя из этого аккаунта**:

- Вверху щёлкни **Главная** и открой любую **карточку товара**.
- Прокрути вниз до поля комментария. Щёлкни по нему и напечатай самый **обычный,
  безобидный** комментарий — например, \`классный товар\`. Никакого вредного кода в самом
  комментарии нет!
- Нажми **Отправить**.
- 💥 **Окошко всё равно выскочило!** Хотя комментарий совершенно безобидный — сработал
  твой **ЛОГИН**: сайт показывает имя автора рядом с комментарием и подставляет его как
  HTML, а твой логин и есть ловушка. Нажми **OK**.

Вот почему это коварно: чтобы атаковать, злоумышленнику даже **не нужно писать вредный
комментарий**. Достаточно один раз зарегистрироваться под «вредным» логином — и потом
**любой** его обычный комментарий будет срабатывать у каждого, кто откроет товар.

---

🔧 **🟢 ТЕПЕРЬ ПОЧИНИ И ЭТО.** На вкладке **main.js** нажми **Ctrl+F**, напечатай
\`author.innerHTML\` и нажми **Enter**. (Это сочетание встречается в тексте урока
несколько раз, поэтому нажимай **Enter** до тех пор, пока подсветка не перепрыгнет
с текста задания на нужную строку в коде.) Ты найдёшь строку:
\`author.innerHTML = c.author + ":";\`
Наведи курсор на слово \`innerHTML\` и **дважды быстро щёлкни** по нему левой кнопкой
мыши — слово выделится целиком. Напечатай \`textContent\` — оно заменит выделенное слово.
Должно получиться:
\`author.textContent = c.author + ":";\`

Нажми **▶ Запустить**. Снова открой товар и оставь обычный комментарий тем же «вредным»
логином — теперь имя автора показывается как безобидный текст, и окошко **не выскакивает**.
🛡️ Вот теперь XSS закрыт **во всех местах** — отличная работа!`,
      hintMd: `Функции \`renderComments\` и \`renderUserBox\` целиком замени на версии из задания (можно скопировать). \`textContent\` вставляет строку как текст — браузер её не исполняет. \`createElement\` + \`appendChild\` строят элементы безопасно.`,
      doneMd: `✅ **Готово, когда** payload \`<img src=x onerror=…>\` в комментарии, в имени автора и в уголке пользователя показывается как **текст**, а \`alert\` больше не выскакивает.`,
    },
    {
      manual: true,
      title: `🔑 Дыра №2: пароль прямо в коде + обход входа`,
      time: `25 мин`,
      goalMd: `**Цель:** понять, почему **секреты нельзя хранить на клиенте** и почему вход надо проверять на **сервере**.

**Где дыра:** служебный логин/пароль захардкожены в \`main.js\` и подсказаны в HTML-комментарии; а флаг входа лежит в localStorage и подделывается.`,
      actionMd: `Найди пароль и обойди вход (🔴), потом убери секрет и бэкдор (🟢) и проверь (✅).`,
      taskMd: `🔧 **🔴 НАЙДИ / СЛОМАЙ.**

**1. Найди пароль прямо в коде.** В средней колонке щёлкни левой кнопкой по вкладке
**main.js**. Нажми **Ctrl+F**, напечатай \`ADMIN_PASS\`, нажми **Enter**. (Это
сочетание встречается в тексте урока несколько раз, поэтому нажимай **Enter** до тех
пор, пока подсветка не перепрыгнет с текста задания на нужную строку в коде.) Браузер
подсветит строки:
\`const ADMIN_LOGIN = "admin";\` и \`const ADMIN_PASS = "megapass123";\`
Вот так дела — служебный логин \`admin\` и пароль \`megapass123\` написаны **прямо в
коде**, который видит любой посетитель! Теперь щёлкни вкладку **index.html**, нажми
**Ctrl+F**, напечатай \`megapass123\`. (Это сочетание встречается в тексте урока
несколько раз, поэтому нажимай **Enter** до тех пор, пока подсветка не перепрыгнет
с текста задания на нужную строку в коде.) Этот же пароль ещё и подсказан в
комментарии.

**2. Зайди по найденному паролю.** Нажми **▶ Запустить**. На сайте щёлкни **Вход**,
впиши логин \`admin\` и пароль \`megapass123\`, нажми кнопку **Войти**. Пускает! Хотя
такого пользователя никто не регистрировал — он «зашит» в код.

**3. А теперь обойди вход вообще без пароля.** Для этого выполним команду. Нажми
**F12**, вверху панели щёлкни вкладку **Console**. В самом низу там есть пустая строка
с мигающим курсором — щёлкни по ней левой кнопкой мыши, напечатай команду и нажми
**Enter**:
\`localStorage.setItem('isLoggedIn', 'true')\`
Теперь нажми **▶ Запустить**. В правом верхнем углу сайт уже считает тебя вошедшим —
а ведь ты не ввёл ни логина, ни пароля! Проверка входа, которая живёт в браузере,
**обходится одной строчкой**. 😈

ℹ️ **Запомни разницу:** окошко **🖥 Консоль** в правой колонке только **показывает**
сообщения сайта — печатать туда нельзя. А чтобы **вводить команды**, нужна вкладка
**Console** в DevTools (открывается по F12) — вот там внизу есть строка для ввода.

---

🔧 **🟢 ПОЧИНИ.**

**а) Убери пароль из index.html.** Щёлкни вкладку **index.html**, нажми **Ctrl+F**,
найди \`megapass123\` (это сочетание встречается в тексте урока несколько раз, поэтому
нажимай **Enter** до тех пор, пока подсветка не перепрыгнет с текста задания на нужную
строку в коде) — это строка-комментарий вида \`<!-- TODO … megapass123 -->\`.
Удали её целиком: щёлкни мышкой **перед** символом \`<\` в самом начале строки, затем
с зажатым **Shift** щёлкни **после** \`-->\` в её конце — вся строка выделится синим.
Отпусти Shift и нажми **Delete**.

**б) Убери пароль и «чёрный ход» из main.js.** Щёлкни вкладку **main.js**. Так же
выдели и удали две строки \`const ADMIN_LOGIN = …\` и \`const ADMIN_PASS = …\`: щёлкни
**перед** \`const\` в начале первой из них, затем с зажатым **Shift** щёлкни в **самом
конце** второй строки (после комментария \`⚠ …\`) — обе строки выделятся — и нажми
**Delete**. Затем найди функцию входа
(**Ctrl+F** → \`loginBtn.addEventListener\`; это сочетание встречается в тексте урока
несколько раз, поэтому нажимай **Enter** до тех пор, пока подсветка не перепрыгнет на
нужную строку в коде), выдели её целиком (щелчок в начало,
Shift+щелчок после её закрывающей \`}\`), удали и вставь чистую версию — теперь вход
работает только для тех, кто реально зарегистрировался:

\`\`\`
loginBtn.addEventListener("click", function () {
	const name = document.getElementById("login-name").value;
	const pass = document.getElementById("login-pass").value;
	const users = getUsers();
	const ok = users.some(function (u) {
		return u.login === name && u.password === pass;
	});
	if (ok) {
		localStorage.setItem("isLoggedIn", "true");
		localStorage.setItem("currentUser", name);
		loginMsg.textContent = "Привет, " + name + "!";
		if (typeof renderUserBox === "function") renderUserBox();
	} else {
		loginMsg.textContent = "Неверный логин или пароль";
	}
});
\`\`\`

Нажми **▶ Запустить**.

💡 **Запомни:** настоящие большие сайты проверяют логин и пароль **на сервере** — на
отдельном защищённом компьютере, куда обычный посетитель залезть не может. Всё, что
лежит в браузере (код, HTML, память localStorage), пользователь может прочитать и
поменять. Поэтому до конца защититься от подмены \`isLoggedIn\` прямо в браузере
нельзя — это работа сервера. Но пароль из кода мы убрали, и это уже очень важно.

---

🔧 **✅ ПРОВЕРЬ.** Щёлкни вкладку **index.html**, нажми **Ctrl+F**, поищи
\`megapass123\`. (Внимание: это сочетание всё ещё встречается в самом тексте урока —
это нормально, не пугайся. Жми **Enter** и смотри: подсветка будет прыгать только по
тексту задания и **больше не перепрыгнет** в код, потому что в коде этого слова уже
**нет**.) То же проверь на вкладке **main.js**. И войти
под \`admin\`/\`megapass123\` теперь не получится. 🛡️`,
      hintMd: `Ctrl+F ищет по коду. Удаляй строки целиком. После починки служебного входа \`admin\` не будет — это нормально. Обход через \`isLoggedIn\` на клиенте до конца не чинится (нужен сервер) — это и есть урок.`,
      doneMd: `✅ **Готово, когда** пароля \`megapass123\` нет ни в index.html, ни в main.js, и вход под \`admin\`/\`megapass123\` больше не срабатывает.`,
    },
    {
      manual: true,
      title: `🗄️ Дыра №3: пароли хранятся открытым текстом`,
      time: `25 мин`,
      goalMd: `**Цель:** понять, почему пароли пользователей **нельзя хранить как есть**, что такое «хэш», и спрятать пароли за хэшем.

**Где дыра:** при регистрации логин и пароль кладутся в localStorage в массив \`users\` **открытым текстом**.`,
      actionMd: `Прочитай чужой пароль из хранилища (🔴), спрячь пароли за хэшем (🟢) и убедись, что их больше не видно (✅).`,
      taskMd: `🔧 **🔴 НАЙДИ / СЛОМАЙ.**

**1. Заведи пару аккаунтов.** Нажми **▶ Запустить**. На сайте щёлкни **Регистрация**
и создай два разных аккаунта — например, логин \`masha\` с паролем \`qwerty123\`, потом
логин \`petya\` с паролем \`superkot\`. Каждый раз заполняй три поля и жми кнопку
**Зарегистрироваться**.

**2. Загляни в «кладовку» браузера.** Нажми **F12**, вверху панели щёлкни вкладку
**Application**. Слева в списке найди **Local Storage** и щёлкни по строчке с адресом
сайта под ним. Справа появится таблица с данными. Найди строку с ключом \`users\` и
щёлкни по ней левой кнопкой. 😱 Ты видишь **все логины и пароли — прямо как есть**,
открытым текстом! Если бы такую настоящую базу украли, у вора сразу оказались бы все
пароли.

**3.** 🤔 Подумай: многие используют **один и тот же пароль** на разных сайтах. Утёк
пароль здесь — и злоумышленник зайдёт в их почту, игры и соцсети. Вот почему хранить
пароли «как есть» очень опасно.

---

🔧 **🟢 ПОЧИНИ — спрячем пароли за «хэшем».** Хэш — это «отпечаток» пароля: из пароля
его легко посчитать, а обратно из отпечатка пароль **не восстановить**. Будем хранить
не сам пароль, а только его хэш. Тогда даже если базу украдут — настоящих паролей там
нет. В браузере для этого есть **настоящий** инструмент \`crypto.subtle\` — тот же
алгоритм **SHA-256**, что используют взрослые сайты.

**а) Добавь функцию-хэшер.** Щёлкни вкладку **main.js**, нажми **Ctrl+F**, напечатай
\`function getUsers\` (нажимай **Enter**, пока подсветка не перепрыгнет с текста задания
на нужную строку в коде). Щёлкни левой кнопкой мыши **в самом конце** строки с
закрывающей скобкой \`}\` этой функции, нажми **Enter** (появится пустая строка) и вставь:

\`\`\`
async function hashPassword(str) {
	const data = new TextEncoder().encode(str);              // текст → байты
	const buf = await crypto.subtle.digest("SHA-256", data); // настоящий SHA-256 в браузере
	return Array.from(new Uint8Array(buf))
		.map(function (b) { return b.toString(16).padStart(2, "0"); })
		.join("");                                           // байты → строка из 64 знаков
}
\`\`\`

**б) Сохраняй при регистрации ХЭШ, а не пароль.** Нажми **Ctrl+F**, напечатай
\`regBtn.addEventListener\` (жми **Enter**, пока подсветка не перепрыгнет в код). Выдели
весь обработчик целиком: щёлкни в начало строки \`regBtn.addEventListener(…\`, зажми
**Shift** и щёлкни сразу после его закрывающей \`});\`. Нажми **Delete** и вставь новую
версию (теперь она сохраняет в \`users\` хэш пароля, а не сам пароль):

\`\`\`
regBtn.addEventListener("click", async function () {
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
	users.push({ login: name, passwordHash: await hashPassword(pass) });  // храним только ХЭШ
	localStorage.setItem("users", JSON.stringify(users));
	msg.textContent = "Готово! Теперь войди на странице «Вход».";
});
\`\`\`

**в) Проверяй вход тоже по хэшу.** Раз пароли теперь лежат в виде хэша, то и при входе
надо сравнивать хэш с хэшем. Нажми **Ctrl+F**, напечатай \`loginBtn.addEventListener\`
(жми **Enter**, пока подсветка не перепрыгнет в код), выдели обработчик целиком (как в
пункте «б») и замени на:

\`\`\`
loginBtn.addEventListener("click", async function () {
	const name = document.getElementById("login-name").value;
	const pass = document.getElementById("login-pass").value;
	const hash = await hashPassword(pass);          // тот же хэш, что сохранили при регистрации
	const users = getUsers();
	const ok = users.some(function (u) {
		return u.login === name && u.passwordHash === hash;
	});
	if (ok) {
		localStorage.setItem("isLoggedIn", "true");
		localStorage.setItem("currentUser", name);
		loginMsg.textContent = "Привет, " + name + "!";
		if (typeof renderUserBox === "function") renderUserBox();
	} else {
		loginMsg.textContent = "Неверный логин или пароль";
	}
});
\`\`\`

Нажми **▶ Запустить**.

💡 **Запомни:** мы посчитали хэш **прямо в браузере** — это уже куда лучше, чем хранить
пароль как есть. Но по-настоящему это делают **на сервере**: туда пароль приходит по
защищённому соединению, превращается в хэш специальным «медленным» способом (например,
**bcrypt**) и обязательно с «солью» — случайной добавкой, чтобы одинаковые пароли давали
разные хэши. Сам пароль не должен видеть никто, даже сотрудники сайта.

---

🔧 **✅ ПРОВЕРЬ.** На сайте щёлкни **Регистрация** и заведи новый аккаунт с паролем
подлиннее — например, логин \`dasha\` и пароль \`solnyshko12\` (не короче 8 символов).
Теперь снова загляни в «кладовку»: **F12 → Application → Local Storage** → строка с
адресом сайта → ключ \`users\`. 🎉 На месте пароля теперь длинная строка из 64 непонятных
символов — это **хэш**, по нему настоящий пароль не узнать! А войти под \`dasha\` /
\`solnyshko12\` по-прежнему получается. 🛡️`,
      hintMd: `Функцию \`hashPassword\` добавь ОДИН раз (рядом с \`getUsers\`), а обработчики \`regBtn\` и \`loginBtn\` замени целиком на async-версии. \`crypto.subtle\` работает только на http(s) или localhost — открывай сайт через \`python3 -m http.server\`, а не как файл с диска. Старые аккаунты, заведённые ДО починки, остаются с открытым паролем и под новый вход не подойдут — заведи новый.`,
      doneMd: `✅ **Готово, когда** при регистрации в \`users\` сохраняется ХЭШ (длинная строка), а не сам пароль, и вход по-прежнему работает.`,
    },
    {
      manual: true,
      title: `🔓 Дыра №4: слабый пароль ломается перебором`,
      time: `22 мин`,
      goalMd: `**Цель:** своими глазами увидеть **брутфорс** (перебор) и понять, почему пароль должен быть **длинным и сложным**.

**Брутфорс** — это когда злоумышленник перебирает все возможные пароли подряд, пока не угадает.`,
      actionMd: `Заведи жертву со слабым паролем, перебери его в консоли (🔴), добавь защиту (🟢) и оцени, что даёт длинный пароль (✅).`,
      taskMd: `🔧 **🔴 НАЙДИ / СЛОМАЙ.**

В этом шаге мы будем **выполнять команды в консоли** — это вкладка **Console** в
DevTools. Открой её: нажми **F12**, вверху щёлкни **Console**. В самом низу есть
строка для ввода — туда и будем вставлять код.

💡 **Команды длинные — печатать вручную не надо.** Выдели команду мышкой прямо здесь,
в задании, нажми **Ctrl+C** (копировать), затем щёлкни в строку ввода консоли, нажми
**Ctrl+V** (вставить) и **Enter**. Если консоль попросит набрать «allow pasting» —
напечатай эти два слова, нажми Enter и вставляй снова.

**1. Заведём «жертву» со слабым паролем.** Сделай это через обычную форму. На сайте
щёлкни **Регистрация**. В поле «Придумай логин» впиши **ровно** \`victim\` (это имя
дальше будет искать код перебора). В поле «Придумай пароль» впиши **короткий пароль
из одних цифр** — **3 или 4 цифры**, например \`739\`. Повтори его в третьем поле и
нажми **Зарегистрироваться**.

Готово — теперь есть аккаунт **victim** с паролем всего из нескольких цифр. Представь,
что пароль ты **не знаешь** и хочешь его подобрать.

**2. Подберём пароль перебором.** Представь, что у нас есть только форма входа,
которая отвечает «да» или «нет». На каждую догадку «сервер» сравнивает её с тем, что
сохранено: с **хэшем** пароля (если ты уже включил хэширование) или с самим паролем.
Переберём **все** пароли из 3 и 4 цифр. Вставь в консоль этот код и нажми **Enter**:

\`\`\`
// тот же хэш, что считает сайт (SHA-256)
async function hashPassword(str) {
	const data = new TextEncoder().encode(str);
	const buf = await crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
}

// «сервер» отвечает да/нет: сравниваем догадку и с хэшем, и с открытым паролем
async function tryLogin(login, guess) {
	const users = JSON.parse(localStorage.getItem("users") || "[]");
	const hash = await hashPassword(guess);
	return users.some(function (u) {
		return u.login === login && (u.passwordHash === hash || u.password === guess);
	});
}

// перебираем ВСЕ пароли из 3 и 4 цифр: 000…999 и 0000…9999
(async function () {
	const t0 = performance.now();
	let found = null;
	for (const len of [3, 4]) {
		for (let i = 0; i < Math.pow(10, len); i++) {
			const guess = String(i).padStart(len, "0");
			if (await tryLogin("victim", guess)) { found = guess; break; }
		}
		if (found) break;
	}
	console.log("Пароль подобран:", found, "за", (performance.now() - t0).toFixed(0), "мс");
})();
\`\`\`

😱 Пароль всё равно подобрался — цифровой пароль это всего 1000 (для 3 цифр) или
10 000 (для 4) вариантов, их компьютер перебирает быстро.

**3.** А сколько вариантов перебирает компьютер за миг? Проверим миллион:

\`\`\`
const t1 = performance.now();
let n = 0;
for (let i = 0; i < 1000000; i++) { n++; }
console.log("1 000 000 попыток заняли", (performance.now() - t1).toFixed(0), "мс");
\`\`\`

Даже миллион — доли секунды. Вот почему короткий пароль не защищает.

---

🔧 **🟢 ПОЧИНИ.** Защита от перебора — **длинный и сложный пароль** плюс ограничение
числа попыток на сервере (например, после 5 ошибок вход на время блокируется).
Длинную часть сделаем прямо сейчас: **запретим короткие пароли** при регистрации —
тогда трёхзначный пароль, как у «жертвы», вообще нельзя будет завести.

Щёлкни вкладку **main.js**, нажми **Ctrl+F** и найди строку со словами
\`Пароли не совпадают\`. (Это сочетание встречается в тексте урока несколько раз, поэтому
нажимай **Enter** до тех пор, пока подсветка не перепрыгнет с текста задания на нужную
строку в коде.) Щёлкни левой кнопкой мыши **в самом конце** этой строки, нажми
**Enter** (появится новая пустая строка) и вставь в неё:

\`\`\`
if (pass.length < 8) {
	msg.textContent = "Пароль слишком короткий — минимум 8 символов";
	return;
}
\`\`\`

Нажми **▶ Запустить**.

---

🔧 **✅ ПРОВЕРЬ / ПОСЧИТАЙ.** Открой **Регистрация** и попробуй завести пароль из 3
цифр (как у «жертвы») — сайт теперь **не пустит**. Значит, такой слабый пароль вообще
не появится. Теперь прикинь силу длины и сложности:
- 3 цифры → 1 000 вариантов (доли секунды).
- 8 цифр → 100 000 000 (ещё перебираемо).
- 10 символов из букв и цифр → больше **3 000 000 000 000 000** вариантов — даже
  быстрый компьютер будет перебирать **годами**.

🔒 Поэтому пароль должен быть **длинным** (от 10–12 символов) и **из разных
символов** (буквы, цифры, знаки), а сервер — ограничивать число попыток входа.`,
      hintMd: `Команды выполняй в DevTools: нажми F12 → вкладка Console → строка ввода внизу → Enter. (Окошко 🖥 на платформе только ПОКАЗЫВАЕТ вывод — печатать в него нельзя.) Перебор 1000 и даже 1 000 000 вариантов браузер держит легко — не бойся запускать. Жертву заводим через обычную форму регистрации: логин ровно \`victim\`, пароль из 3–4 цифр. Код перебора сам считает хэш каждой догадки (как это делает сайт) и сравнивает с сохранённым.`,
      doneMd: `✅ **Готово, когда** ты подобрал 3-значный пароль перебором в консоли (видно время в мс) и добавил проверку длины пароля при регистрации.`,
    },
    {
      manual: true,
      title: `🛂 Дыра №5: фальшивый «админ»`,
      time: `18 мин`,
      goalMd: `**Цель:** понять **контроль доступа** — почему нельзя доверять флагам вроде \`is_admin\` в браузере.

**Где дыра:** сайт показывает секретную админ-панель, если в localStorage \`is_admin === "true"\`. Но это значение задаёт **сам пользователь**.`,
      actionMd: `Стань «админом» подменой localStorage (🔴), убери секрет с клиента (🟢) и проверь (✅).`,
      taskMd: `🔧 **🔴 НАЙДИ / СЛОМАЙ.**

В магазине есть секретная «админ-панель», которую должен видеть только настоящий
хозяин. Сейчас мы притворимся хозяином, ничего о нём не зная.

**1.** Нажми **F12**, вверху щёлкни вкладку **Application**, слева выбери
**Local Storage** и щёлкни строчку с адресом сайта.

**2. Поставь себе фальшивую отметку «я админ».** Проще всего командой: вверху щёлкни
вкладку **Console**, щёлкни в строку ввода внизу, напечатай (или вставь) и нажми
**Enter**:
\`localStorage.setItem('is_admin', 'true')\`

**3. Смотри, что открылось.** Нажми **▶ Запустить**, на сайте щёлкни **Вход**. На
странице появилась **🛠 Админ-панель** с секретным кодом \`MEGA-2026-ADMIN\`! 😈 Ты стал
«админом», ничего не взламывая — просто поменял отметку в браузере, которой сайт
**зря поверил**.

---

🔧 **🟢 ПОЧИНИ.** Раз браузеру доверять нельзя — **секрета вообще не должно быть в
коде, который скачивает браузер**. Уберём его. Щёлкни вкладку **index.html**, нажми
**Ctrl+F**, найди \`admin-panel\`. (Это сочетание встречается в тексте урока несколько
раз, поэтому нажимай **Enter** до тех пор, пока подсветка не перепрыгнет с текста
задания на нужную строку в коде.) Ты увидишь блок из трёх строк: открытие
\`<div id="admin-panel" class="admin-panel" hidden>\`, строку с секретом
\`MEGA-2026-ADMIN\` и закрытие \`</div>\`. Выдели весь этот блок (щёлкни в начало строки
с \`<div id="admin-panel"\`, зажми **Shift** и щёлкни сразу после \`</div>\`), нажми
**Delete** и вставь пустую версию — без секрета внутри:

\`\`\`
<div id="admin-panel" class="admin-panel" hidden></div>
\`\`\`

Нажми **▶ Запустить**.

💡 **Запомни:** решать, показывать админ-панель или нет, должен **сервер** — после
настоящей проверки прав. Секретные данные нельзя класть в код, который скачивает
браузер: кто угодно может его открыть и прочитать.

---

🔧 **✅ ПРОВЕРЬ.** Отметка \`is_admin\` всё ещё \`true\` (мы её не убирали) — но зайди на
страницу **Вход**: секретного кода \`MEGA-2026-ADMIN\` там больше **нет**, потому что
его вообще не осталось в коде. Подмена отметки теперь ничего не открывает. 🛡️`,
      hintMd: `Проще всего поставить отметку командой: F12 → вкладка Console → \`localStorage.setItem('is_admin','true')\` → Enter. (Можно и вручную: Application → Local Storage, двойной клик по пустой строке Key/Value.) Секрет \`MEGA-2026-ADMIN\` нужно убрать из index.html.`,
      doneMd: `✅ **Готово, когда** даже при \`is_admin = true\` секретный код \`MEGA-2026-ADMIN\` на странице больше не появляется.`,
    },
    {
      manual: true,
      title: `🔗 Дыра №6: отражённый XSS из ссылки`,
      time: `20 мин`,
      goalMd: `**Цель:** разобрать **отражённый XSS** — когда вредоносный код приходит прямо из **адреса ссылки**.

**Где дыра:** приветствие из ссылки вида \`#welcome=Имя\` показывается на главной через \`innerHTML\`.`,
      actionMd: `Доставь полезную нагрузку через адрес (🔴), почини обработчик (🟢) и проверь (✅).`,
      taskMd: `🔧 **🔴 НАЙДИ / СЛОМАЙ.**

Бывает, что вредный код прячут **прямо в ссылке**. Наш сайт умеет показывать
приветствие из адреса: если после \`#\` написать \`welcome=Имя\`, на главной появится
«С возвращением, Имя!». Беда в том, что это имя сайт вставляет через \`innerHTML\`.

**1. Найди уязвимое место.** Щёлкни вкладку **main.js**, нажми **Ctrl+F**, напечатай
\`showWelcome\` (это сочетание встречается в тексте урока несколько раз, поэтому нажимай
**Enter** до тех пор, пока подсветка не перепрыгнет с текста задания на нужную строку
в коде) — это та самая
функция, что берёт имя из адреса.

**2. Сымитируем вредную ссылку.** В жизни злоумышленник прислал бы жертве готовую
ссылку. У нас «адрес» можно задать командой. Нажми **F12**, щёлкни вкладку
**Console**, щёлкни в строку ввода и выполни (Ctrl+V → Enter):
\`location.hash = "welcome=<img src=x onerror=alert('Взлом!')>"\`
💥 На главной выскочило окошко «Взлом!». Код пришёл **прямо из адреса ссылки** и
выполнился — это **отражённый XSS**. Представь: злоумышленник кидает такую ссылку в
чат, жертва щёлкает по ней — и его код работает на сайте от её имени. Нажми **OK**.

**3.** Для сравнения выполни обычное:
\`location.hash = "welcome=Аня"\` — увидишь мирное «С возвращением, Аня!». Значит,
опасна именно вставка через \`innerHTML\`.

---

🔧 **🟢 ПОЧИНИ (main.js).** Это снова лечится сменой \`innerHTML\` на \`textContent\`.
Найди функцию \`showWelcome\` (**Ctrl+F**; это сочетание встречается в тексте урока
несколько раз, поэтому нажимай **Enter** до тех пор, пока подсветка не перепрыгнет на
нужную строку в коде), выдели её целиком (щелчок в начало строки
\`function showWelcome(name) {\`, затем Shift+щелчок после её закрывающей \`}\`), нажми
**Delete** и вставь безопасную версию:

\`\`\`
function showWelcome(name) {
	const box = document.getElementById("welcome-box");
	if (!box) return;
	box.hidden = false;
	box.textContent = "С возвращением, " + name + "!";   // безопасно
}
\`\`\`

Нажми **▶ Запустить**.

---

🔧 **✅ ПРОВЕРЬ.** В консоли (F12 → Console) снова выполни ту же вредную команду:
\`location.hash = "welcome=<img src=x onerror=alert('Взлом!')>"\`
Теперь окошко **не выскакивает** — код просто показывается как текст. А обычное имя
\`location.hash = "welcome=Аня"\` по-прежнему приветствует. Дыра закрыта! 🛡️`,
      hintMd: `Команды выполняй в DevTools: F12 → вкладка Console → строка ввода внизу → Enter. \`location.hash = …\` задаёт «адрес» страницы — именно так пришла бы вредоносная ссылка. Чинится тем же приёмом, что и обычный XSS: \`innerHTML\` → \`textContent\`.`,
      doneMd: `✅ **Готово, когда** после починки \`location.hash = "welcome=<img …>"\` показывает код как текст и \`alert\` не выскакивает, а обычное имя всё ещё приветствуется.`,
    },
    {
      manual: true,
      title: `🚩 Бонус: собери спрятанные флаги`,
      time: `15 мин`,
      goalMd: `**Цель:** потренировать «насмотренность» хакера — секреты прячут в разных местах клиента, и все они находятся.

**Флаг** — это строка вида \`FLAG{...}\`. На твоём сайте их спрятали **три**.`,
      actionMd: `Найди все три флага, пользуясь DevTools и кодом. В конце — **✓ Я выполнил этот шаг**.`,
      taskMd: `🔧 **Найди три флага** — это секретные строчки вида \`FLAG{...}\`. Все три уже спрятаны
в твоём сайте, в разных местах. Так хакеры тренируют свою «насмотренность».

**🚩 Флаг 1 — в комментарии HTML.** Щёлкни вкладку **index.html**, нажми **Ctrl+F**,
напечатай \`FLAG\`, нажми **Enter**. (Это сочетание встречается в тексте урока несколько
раз — к тому же поиск не различает большие и маленькие буквы, — поэтому нажимай **Enter**
до тех пор, пока подсветка не перепрыгнет с текста задания на нужную строку в коде.)
Браузер подсветит строку-комментарий
\`<!-- FLAG{…} -->\` рядом с подвалом сайта (\`<footer>\`). Вот первый!

**🚩 Флаг 2 — в коде JavaScript.** Щёлкни вкладку **main.js**, нажми **Ctrl+F**, снова
напечатай \`FLAG\`. (Это сочетание снова встречается в тексте урока несколько раз,
поэтому нажимай **Enter** до тех пор, пока подсветка не перепрыгнет с текста задания
на нужную строку в коде.) Найдёшь строку \`var hiddenFlag = "FLAG{…}"\`. Второй!

**🚩 Флаг 3 — в «кладовке» браузера.** Нажми **F12**, щёлкни вкладку **Application**,
слева выбери **Local Storage**, щёлкни адрес сайта. В таблице найди ключ
\`secret_flag\` — рядом будет третий флаг. (Можно и командой: на вкладке **Console**
выполни \`localStorage.getItem('secret_flag')\`.)

🏁 Нашёл все три? Тогда ты понял самое главное: **всё, что попало в браузер — код,
комментарии, память — может прочитать кто угодно**. Поэтому секретам там не место.
Жми **✓ Я выполнил этот шаг**.`,
      hintMd: `Ctrl+F по коду ищет слово \`FLAG\`. В Local Storage флаг лежит под ключом \`secret_flag\`. Эти флаги учебные — они показывают, что localStorage, HTML-комментарии и JS-код доступны любому посетителю.`,
      doneMd: `✅ **Готово, когда** ты нашёл все три флага: в HTML-комментарии, в переменной JS и в Local Storage.`,
    },
    {
      manual: true,
      title: `🏁 Финал`,
      time: `5 мин`,
      goalMd: `**Цель:** подвести итог и понять, куда расти дальше.`,
      actionMd: `Прочитай итог под шагами (он раскроется) и нажми **✓ Я выполнил этот шаг**.`,
      taskMd: `🔧 **Ты справился!** Ты прошёл путь от **разработчика** (собрал многостраничный
магазин) до **этичного хакера** (нашёл и починил в нём дыры).

Что ты теперь умеешь:
- объяснять и чинить **XSS** (\`innerHTML\` → \`textContent\`) в комментариях, именах и
  ссылках;
- понимать, почему **секреты, пароли и проверку прав** нельзя держать на клиенте;
- объяснять, зачем пароли **хэшируют** и почему они должны быть длинными;
- показывать **брутфорс** слабого пароля;
- пользоваться **DevTools** (Elements / Console / Application).

Прокрути вниз — там итог урока и идеи, куда двигаться дальше. Жми
**✓ Я выполнил этот шаг**! 🎉`,
      hintMd: `Это последний шаг. После него раскроется финальное поздравление с идеями для дальнейшего обучения.`,
      doneMd: `✅ **Готово!** Ты — этичный хакер. Не забывай: ломаем только своё и только с разрешения. 🔐`,
    },
  ],
};

// Урок 2 хранит прогресс/историю ОТДЕЛЬНО от урока 1 (свой суффикс ключей).
const STORAGE_KEY = "savedLessonCodeSecurity";
const PREVIEW_DOC_KEY = "previewDoc"; // вкладку просмотра делим — preview.html читает этот ключ
const LESSON_KEY_SUFFIX = "Security";
