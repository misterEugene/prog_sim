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

На прошлом уроке ты собрал **многостраничный** магазин «МегаМагазин»: с
регистрацией, входом, страницами товаров и комментариями. Сегодня ты —
**этичный («белый») хакер**: тот, кто ищет уязвимости, чтобы их **починить**, а
не навредить.

⚠️ **Золотое правило:** мы ломаем **только свой собственный** сайт, чтобы
научиться защищать. Ломать чужие сайты — незаконно и подло. Белый хакер всегда
действует с разрешения.

## Как мы работаем с каждой дырой

1. 🔴 **Найди / сломай** — используем уязвимость, как настоящий злоумышленник.
2. 🟢 **Почини** — правим код сайта прямо в редакторах и жмём ▶ Запустить.
3. ✅ **Проверь** — повторяем атаку и убеждаемся: больше **не работает**!

Слева уже загружен твой уязвимый магазин — тот самый, что ты собирал на прошлом
уроке. Поехали искать дыры! 👇`,

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
      title: `Инструменты этичного хакера`,
      time: `10 мин`,
      goalMd: `**Цель:** познакомиться с инструментами и убедиться, что магазин работает.

**Главное правило:** ломаем **только свой** сайт — чтобы научиться защищать.`,
      actionMd: `Просто осмотрись. Кнопок-вставок тут нет — в конце нажми **✓ Я выполнил этот шаг**.`,
      taskMd: `🔧 **Осмотрись и подготовь инструменты.**

**1.** Нажми ▶ Запустить — справа появится твой магазин «МегаМагазин». Пощёлкай по
меню (**Главная / Вход / Регистрация**) и по карточкам товаров — это
**многостраничный** сайт.

**2.** Загляни во **встроенную консоль** 🖥 внизу справа — туда сайт пишет
сообщения (например, когда жмёшь «В корзину»).

**3.** Открой **DevTools браузера**: клавиша **F12** (или ПКМ → «Просмотреть код»).
Нам понадобятся вкладки:
- **Elements** — HTML-структура страницы;
- **Console** — можно выполнять JavaScript прямо на странице;
- **Application → Local Storage** — данные, которые сайт хранит в браузере
  (логин, флаг входа, комментарии, список пользователей).

**4.** Пощёлкай по этим вкладкам, осмотрись. Готов? Жми **✓ Я выполнил этот шаг**.`,
      hintMd: `F12 открывает/закрывает DevTools. Если не сработало — ПКМ по странице → «Просмотреть код» / «Inspect». Встроенная консоль платформы (🖥) и Console в DevTools — это разные окна, но обе показывают сообщения сайта.`,
      doneMd: `✅ **Готово, когда** магазин запущен, страницы переключаются, а ты нашёл вкладки Elements, Console и Application в DevTools.`,
    },
    {
      manual: true,
      title: `💉 Дыра №1: XSS в комментариях`,
      time: `35 мин`,
      goalMd: `**Цель:** научиться уязвимости **XSS** (Cross-Site Scripting) — когда злоумышленник заставляет сайт выполнить **чужой код**.

**Где дыра:** комментарии к товару, имя автора и уголок пользователя выводятся через \`innerHTML\` — браузер исполняет вставленный HTML.`,
      actionMd: `Сначала сломай (🔴), потом почини код в **main.js** (🟢) и проверь (✅).`,
      taskMd: `🔧 **🔴 НАЙДИ / СЛОМАЙ.**

**1.** Запусти сайт. Зарегистрируйся (**Регистрация**) и войди (**Вход**). Открой
любой товар (щёлкни карточку) — внизу появится поле комментария.

**2.** Вместо комментария вставь это и нажми «Отправить»:
\`<img src=x onerror="alert('XSS')">\`
Выскочило окошко \`alert\`?! Ты заставил **чужой код** выполниться на странице — это
и есть **XSS**. 😈

**3.** Теперь покажем, что XSS умеет **красть данные**. Оставь ещё комментарий:
\`<img src=x onerror="alert(localStorage.getItem('currentUser'))">\`
Код вытащил имя пользователя из хранилища. Так крадут логины, токены и пароли.

**4.** 🤔 Почему \`<script>alert(1)</script>\` через \`innerHTML\` **не** сработал бы, а
\`<img onerror>\` сработал? Браузер не запускает \`<script>\`, добавленный через
\`innerHTML\`, но \`onerror\` у картинки — запускает. Хакеры это знают.

---

🔧 **🟢 ПОЧИНИ (main.js).** Найди функцию \`renderComments\` и **замени её целиком**
на безопасную версию (текст и имя автора выводим через \`textContent\`, а не
\`innerHTML\`):

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
		author.textContent = c.author + ":";  // безопасно: это ТЕКСТ
		div.appendChild(author);
		div.appendChild(document.createTextNode(" " + c.text)); // безопасно
		box.appendChild(div);
	});
}
\`\`\`

Нажми ▶ Запустить.

---

🔧 **✅ ПРОВЕРЬ.** Снова оставь комментарий \`<img src=x onerror="alert('XSS')">\`.
Теперь он **показывается как обычный текст**, окошко не выскакивает. Дыра закрыта! 🛡️

---

💪 **Та же дыра живёт ещё в двух местах** — почини и их тем же приёмом
(\`innerHTML\` → \`textContent\`):

**а) Уголок пользователя** (имя в правом верхнем углу). Найди \`renderUserBox\` —
там \`box.innerHTML = "👤 " + userName + …\`. Имя пользователя тоже вставляется как
HTML. Замени функцию на безопасную:

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

**б) Приветствие после входа.** В обработчике входа (\`loginBtn\`) найди строку
\`loginMsg.innerHTML = "Привет, " + name + "!";\` и замени \`innerHTML\` на
\`textContent\`:
\`loginMsg.textContent = "Привет, " + name + "!";\`

Нажми ▶ Запустить. Чтобы проверить — зарегистрируй пользователя с именем
\`<img src=x onerror="alert(1)">\`: теперь такое имя нигде не выполняется. 🛡️`,
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

**1.** Открой **main.js** и найди строки:
\`const ADMIN_LOGIN = "admin";\` и \`const ADMIN_PASS = "megapass123";\`
Вот он, служебный пароль — прямо в коде, который видит **любой** посетитель! Открой
ещё **index.html** — там в комментарии тоже написан пароль
(\`<!-- TODO … megapass123 -->\`).

**2.** Зайди этим «служебным» входом: на странице **Вход** логин **admin**, пароль
**megapass123** — пускает, хотя такого пользователя никто не регистрировал.

**3.** А теперь **обойди вход вообще без пароля**. Открой консоль (🖥 или F12 →
Console) и выполни:
\`localStorage.setItem('isLoggedIn', 'true')\`
Нажми ▶ Запустить — в правом верхнем углу сайт уже считает тебя вошедшим. Проверка
входа на клиенте **обходится в одну строку**. 😈

---

🔧 **🟢 ПОЧИНИ.**

**а)** В **index.html** удали строку-подсказку \`<!-- TODO … megapass123 -->\`.

**б)** В **main.js** удали обе строки \`const ADMIN_LOGIN = …\` и
\`const ADMIN_PASS = …\`, а в обработчике входа убери **бэкдор** — вход должен
работать только для зарегистрированных пользователей:

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

Нажми ▶ Запустить.

💡 **Запомни:** настоящие сайты проверяют вход **на сервере** и хранят там
«сессию». Всё, что лежит в браузере (код, HTML, localStorage), пользователь может
прочитать и изменить — поэтому полностью защититься от подмены \`isLoggedIn\` на
клиенте нельзя, это задача сервера.

---

🔧 **✅ ПРОВЕРЬ.** Поищи \`megapass123\` (Ctrl+F) в index.html и main.js — его больше
**нет**. Войти под \`admin\`/\`megapass123\` больше нельзя. 🛡️`,
      hintMd: `Ctrl+F ищет по коду. Удаляй строки целиком. После починки служебного входа \`admin\` не будет — это нормально. Обход через \`isLoggedIn\` на клиенте до конца не чинится (нужен сервер) — это и есть урок.`,
      doneMd: `✅ **Готово, когда** пароля \`megapass123\` нет ни в index.html, ни в main.js, и вход под \`admin\`/\`megapass123\` больше не срабатывает.`,
    },
    {
      manual: true,
      title: `🗄️ Дыра №3: пароли хранятся открытым текстом`,
      time: `18 мин`,
      goalMd: `**Цель:** понять, почему пароли пользователей **нельзя хранить как есть** и что такое «хэш».

**Где дыра:** при регистрации логин и пароль кладутся в localStorage в массив \`users\` **открытым текстом**.`,
      actionMd: `Прочитай чужой пароль из хранилища (🔴), добавь защиту-подсказку (🟢) и пойми, как чинить по-настоящему (✅).`,
      taskMd: `🔧 **🔴 НАЙДИ / СЛОМАЙ.**

**1.** Зарегистрируй пару аккаунтов (**Регистрация**) с разными логинами и
паролями.

**2.** Открой **F12 → Application → Local Storage** и найди ключ \`users\`. Или
выполни в консоли:
\`JSON.parse(localStorage.getItem('users'))\`
Ты видишь **все логины и пароли открытым текстом**! Если бы это была настоящая база
и она утекла — все пароли сразу у злоумышленника. 😱

**3.** 🤔 А ведь многие используют один пароль на разных сайтах. Утёк пароль здесь —
взломают и почту, и игры.

---

🔧 **🟢 ПОЧИНИ (что можно на клиенте).** По-настоящему пароли защищают **на
сервере**: там хранят не пароль, а его **хэш** (необратимый «отпечаток»), и
сравнивают хэши. В нашем учебном проекте сервера нет, поэтому хотя бы **не дадим
регистрировать слишком короткие пароли** — это уже усложняет жизнь взломщику.

В **main.js** в обработчике регистрации (\`regBtn\`) сразу после проверки
«Пароли не совпадают» добавь:

\`\`\`
if (pass.length < 8) {
	msg.textContent = "Пароль слишком короткий — минимум 8 символов";
	return;
}
\`\`\`

Нажми ▶ Запустить и попробуй зарегистрировать пароль из 3 символов — теперь нельзя.

💡 **Запомни:** на настоящем сайте пароль уходит на сервер, превращается в **хэш**
(например, bcrypt) и только хэш хранится в базе. Даже админ не должен видеть твой
пароль.

---

🔧 **✅ ПРОВЕРЬ.** Короткий пароль (3 символа) зарегистрировать больше не
получается — сайт требует минимум 8 символов. 🛡️`,
      hintMd: `Массив \`users\` лежит в Local Storage под ключом \`users\`. Проверку длины добавляй ВНУТРИ обработчика \`regBtn\`, рядом с другими проверками (\`if (!name || !pass)\`…). Настоящая защита паролей — хэш на сервере, на клиенте её не сделать.`,
      doneMd: `✅ **Готово, когда** ты увидел пароли открытым текстом в \`users\` и добавил проверку минимальной длины пароля при регистрации.`,
    },
    {
      manual: true,
      title: `🔓 Дыра №4: слабый пароль ломается перебором`,
      time: `22 мин`,
      goalMd: `**Цель:** своими глазами увидеть **брутфорс** (перебор) и понять, почему пароль должен быть **длинным и сложным**.

**Брутфорс** — это когда злоумышленник перебирает все возможные пароли подряд, пока не угадает.`,
      actionMd: `Заведи жертву со слабым паролем, перебери его в консоли (🔴), добавь защиту (🟢) и оцени, что даёт длинный пароль (✅).`,
      taskMd: `🔧 **🔴 НАЙДИ / СЛОМАЙ.**

**1.** Заведём «жертву» со слабым паролем прямо через консоль (быстрее, чем через
форму). Открой консоль (🖥 или F12 → Console) и выполни:
\`(function(){var u=JSON.parse(localStorage.getItem('users')||'[]');u.push({login:'victim',password:'739'});localStorage.setItem('users',JSON.stringify(u));})()\`
Готово — есть аккаунт **victim** с паролем из **трёх цифр** (представь, что пароль
ты НЕ знаешь).

**2.** Теперь представь, что у нас есть только форма входа, которая отвечает «да /
нет». Сколько времени уйдёт, чтобы перебрать **все** пароли из 3 цифр (000…999)?
В той же консоли выполни:

\`\`\`
// «сервер» отвечает только да/нет на попытку входа
function tryLogin(login, guess) {
	const users = JSON.parse(localStorage.getItem("users") || "[]");
	return users.some(function (u) { return u.login === login && u.password === guess; });
}

// перебираем ВСЕ пароли из 3 цифр: 000, 001, …, 999
const t0 = performance.now();
let found = null;
for (let i = 0; i <= 999; i++) {
	const guess = String(i).padStart(3, "0");
	if (tryLogin("victim", guess)) { found = guess; break; }
}
console.log("Пароль подобран:", found, "за", (performance.now() - t0).toFixed(1), "мс");
\`\`\`

😱 Пароль подобран почти **мгновенно** — три цифры это всего 1000 вариантов.

**3.** А сколько вариантов перебирает компьютер за миг? Проверим миллион:

\`\`\`
const t1 = performance.now();
let n = 0;
for (let i = 0; i < 1000000; i++) { n++; }
console.log("1 000 000 попыток заняли", (performance.now() - t1).toFixed(0), "мс");
\`\`\`

Даже миллион — доли секунды. Вот почему короткий пароль не защищает.

---

🔧 **🟢 ПОЧИНИ.** Защита от перебора — **длинный и сложный пароль** + ограничение
числа попыток на сервере. Убедись, что в регистрации стоит проверка длины из
прошлого шага (а если ещё не добавил — добавь):

\`\`\`
if (pass.length < 8) {
	msg.textContent = "Пароль слишком короткий — минимум 8 символов";
	return;
}
\`\`\`

Нажми ▶ Запустить.

---

🔧 **✅ ПРОВЕРЬ / ПОСЧИТАЙ.** Прикинь силу длины и сложности:
- 3 цифры → 1 000 вариантов (доли секунды).
- 8 цифр → 100 000 000 (ещё перебираемо).
- 10 символов из букв и цифр → больше **3 000 000 000 000 000** вариантов — даже
  быстрый компьютер будет перебирать **годами**.

🔒 Поэтому пароль должен быть **длинным** (от 10–12 символов) и **из разных
символов** (буквы, цифры, знаки), а сервер — ограничивать число попыток входа.`,
      hintMd: `Сниппеты выполняй во встроенной консоли 🖥 или в F12 → Console. Перебор 1000 и даже 1 000 000 вариантов браузер держит легко — не бойся запускать. Жертву с 3-значным паролем заводим прямо через консоль (первый сниппет), форму регистрации трогать не нужно.`,
      doneMd: `✅ **Готово, когда** ты подобрал 3-значный пароль перебором в консоли (видно время в мс) и вернул проверку длины пароля при регистрации.`,
    },
    {
      manual: true,
      title: `🛂 Дыра №5: фальшивый «админ»`,
      time: `18 мин`,
      goalMd: `**Цель:** понять **контроль доступа** — почему нельзя доверять флагам вроде \`is_admin\` в браузере.

**Где дыра:** сайт показывает секретную админ-панель, если в localStorage \`is_admin === "true"\`. Но это значение задаёт **сам пользователь**.`,
      actionMd: `Стань «админом» подменой localStorage (🔴), убери секрет с клиента (🟢) и проверь (✅).`,
      taskMd: `🔧 **🔴 НАЙДИ / СЛОМАЙ.**

**1.** Открой **F12 → Application → Local Storage** (выбери адрес страницы слева).

**2.** Добавь новую запись: ключ \`is_admin\`, значение \`true\`. (Или в консоли
выполни: \`localStorage.setItem('is_admin', 'true')\`.)

**3.** Перейди на страницу **Вход** и нажми ▶ Запустить. На странице появилась
**🛠 Админ-панель** с секретным кодом \`MEGA-2026-ADMIN\`! Ты «повысил себе права»,
ничего не взламывая — просто подменил значение, которому сайт **зря доверяет**.

---

🔧 **🟢 ПОЧИНИ.** Раз клиенту нельзя доверять — **секрета не должно быть на клиенте
вообще**. Открой **index.html**, найди блок \`<div id="admin-panel" …>\` и удали из
него секрет (оставь пустым):

\`\`\`
<div id="admin-panel" class="admin-panel" hidden></div>
\`\`\`

Нажми ▶ Запустить.

💡 **Запомни:** показывать ли админ-панель — должен решать **сервер** после проверки
прав. Секретные данные нельзя класть в код, который скачивает браузер.

---

🔧 **✅ ПРОВЕРЬ.** Значение \`is_admin\` всё ещё \`true\` — но после ▶ Запустить
**секретного кода больше нет** (его нет на клиенте). Подмена флага больше ничего не
открывает. 🛡️`,
      hintMd: `В Application → Local Storage запись добавляется двойным кликом по пустой строке (Key / Value). Если не получается — используй консоль: \`localStorage.setItem('is_admin','true')\`. Секрет \`MEGA-2026-ADMIN\` нужно убрать из index.html.`,
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

**1.** В **main.js** найди функцию \`showWelcome\` — она берёт имя из адреса (после
\`#welcome=\`) и вставляет его через \`innerHTML\`. Это значит, что **кто угодно может
прислать жертве ссылку** с кодом внутри.

**2.** Сымитируем такую ссылку. Открой консоль (🖥 или F12 → Console) и выполни:
\`location.hash = "welcome=<img src=x onerror=alert('Взлом!')>"\`
На главной странице выскочило окошко \`alert\`! Код пришёл **прямо из адреса** и
выполнился — это и есть **отражённый XSS**. Представь: злоумышленник кидает такую
ссылку в чате, жертва открывает — и его код работает на сайте от её имени. 😈

**3.** Обычное приветствие тоже работает: выполни
\`location.hash = "welcome=Аня"\` — увидишь «С возвращением, Аня!». Уязвима именно
вставка через \`innerHTML\`.

---

🔧 **🟢 ПОЧИНИ (main.js).** В функции \`showWelcome\` замени \`innerHTML\` на
\`textContent\`:

\`\`\`
function showWelcome(name) {
	const box = document.getElementById("welcome-box");
	if (!box) return;
	box.hidden = false;
	box.textContent = "С возвращением, " + name + "!";   // безопасно
}
\`\`\`

Нажми ▶ Запустить.

---

🔧 **✅ ПРОВЕРЬ.** Снова выполни
\`location.hash = "welcome=<img src=x onerror=alert('Взлом!')>"\`
Теперь код **показывается как текст**, окошко не выскакивает. А обычное имя
(\`welcome=Аня\`) по-прежнему приветствует. Дыра закрыта! 🛡️`,
      hintMd: `Команды выполняй в консоли (🖥 или F12 → Console). \`location.hash = …\` подставляет «адрес» страницы — именно так пришла бы вредоносная ссылка. Чинится тем же приёмом, что и обычный XSS: \`innerHTML\` → \`textContent\`.`,
      doneMd: `✅ **Готово, когда** после починки \`location.hash = "welcome=<img …>"\` показывает код как текст и \`alert\` не выскакивает, а обычное имя всё ещё приветствуется.`,
    },
    {
      manual: true,
      title: `🚩 Бонус: собери спрятанные флаги`,
      time: `15 мин`,
      goalMd: `**Цель:** потренировать «насмотренность» хакера — секреты прячут в разных местах клиента, и все они находятся.

**Флаг** — это строка вида \`FLAG{...}\`. На твоём сайте их спрятали **три**.`,
      actionMd: `Найди все три флага, пользуясь DevTools и кодом. В конце — **✓ Я выполнил этот шаг**.`,
      taskMd: `🔧 **Найди три флага \`FLAG{…}\`. Все они уже лежат в твоём сайте.**

**Флаг 1 — в HTML-комментарии.** Открой **index.html** (или F12 → Elements) и
поищи комментарий \`<!-- FLAG{…} -->\` рядом с подвалом (\`<footer>\`).

**Флаг 2 — в коде JavaScript.** Открой **main.js** и найди переменную с флагом
(\`var hiddenFlag = "FLAG{…}"\`).

**Флаг 3 — в Local Storage.** Открой **F12 → Application → Local Storage** и найди
ключ \`secret_flag\` — в нём третий флаг. (Или в консоли:
\`localStorage.getItem('secret_flag')\`.)

🏁 Нашёл все три? Ты понял главное: **всё, что попало в браузер, можно найти** —
поэтому секретам там не место. Жми **✓ Я выполнил этот шаг**.`,
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
