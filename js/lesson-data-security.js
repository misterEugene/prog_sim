// ============================================================
// Урок 2 «Этичный хакер» - отдельный набор данных (подключается из урок_2.html
// ВМЕСТО js/lesson-data.js). Стартовый код - ВШИТЫЙ эталонный уязвимый сайт
// «МегаМагазин»: тот самый МНОГОСТРАНИЧНЫЙ магазин, что ребёнок строил в уроке 1
// (роутер, регистрация/вход, страницы товара, комментарии по товару, уголок
// пользователя, бургер-меню). У всех детей одинаковая отправная точка.
//
// ВАЖНО: VULN_HTML/CSS/JS НЕ редактируются руками - они СГЕНЕРИРОВАНЫ из урока 1
// скриптами scripts/build_vuln_site.py + scripts/build_lesson2.py (эталонный
// «ответ» урока 1). Любые правки делай в уроке 1 и пересобирай, иначе сайт
// «дрейфует» от того, что реально строит ребёнок.
//
// Цикл по КАЖДОЙ уязвимости: 🔴 Найди/сломай → 🟢 Почини (правит код + ▶ Запустить)
// → ✅ Проверь. Все шаги «ручные» (manual:true).
//
// Намеренные уязвимости (см. docs/ARCHITECTURE.md, docs/LESSON_REDESIGN.md):
//   1) Stored XSS в комментариях товара (innerHTML: текст + имя автора) и в
//      уголке пользователя / приветствии - innerHTML→textContent.
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
		<p>Только до конца недели - успей купить!</p>
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
				<p class="review-text">«Заказал смартфон - привезли на следующий день. Всё работает отлично!»</p>
				<p class="review-author">- Артём</p>
			</div>
			<div class="review">
				<p class="review-text">«Купила наушники, звук супер. Спасибо за быструю доставку!»</p>
				<p class="review-author">- Мария</p>
			</div>
			<div class="review">
				<p class="review-text">«Очень доволен ноутбуком, цена ниже, чем везде.»</p>
				<p class="review-author">- Иван</p>
			</div>
			<div class="review">
				<p class="review-text">«Лучший магазин техники, рекомендую!»</p>
				<p class="review-author">- Олег</p>
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

	/* Меню - на всю ширину, плавно раскрывается под шапкой */
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

	/* Меню открыто (класс menu-open на шапке) - плавно показываем */
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

// CTF-бонус: спрятанные «флаги» (намеренно - пригодятся на уроке 2 «Этичный хакер»)
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

// Показать страницу по текущему адресу (часть после # - это «адрес» страницы).
// Хэш меняется при навигации и сам пишется в историю браузера, поэтому работают
// встроенные кнопки браузера «Назад» и «Вперёд».
// Приветствие из адреса: ссылка вида #welcome=Имя показывает «С возвращением».
// ⚠ имя берётся из адреса и вставляется через innerHTML - отражённый XSS (урок 2).
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
		} catch (e) { /* код товара ещё не загрузился - покажем Главную */ }
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
	// Ссылка-якорь (например, «Купить сейчас») - плавно прокрутить к секции
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
		e.preventDefault();   // карточка - это тоже ссылка href="#"
		location.hash = "product-" + card.getAttribute("data-product");
	}
});

// Подвал добавили РАНЬШЕ страниц входа/товара, поэтому в коде он стоит выше них.
// Перенесём его в самый конец <body> - тогда он всегда ниже любой открытой страницы.
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

// Раскладка: шапка сверху, подвал снизу, а контент в <main> - по центру по
// вертикали, когда его не хватает на весь экран (отступы сверху и снизу равны).
document.body.style.display = "flex";
document.body.style.flexDirection = "column";
document.body.style.minHeight = "100vh";
mainEl.style.flex = "1";
mainEl.style.display = "flex";
mainEl.style.flexDirection = "column";
mainEl.style.justifyContent = "center";

renderUserBox();
applyRoute(); // при загрузке показываем страницу по текущему адресу (по умолчанию - Главную)

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

// Если уже входили раньше - обновим уголок пользователя
if (localStorage.getItem("isLoggedIn") === "true") {
	if (typeof renderUserBox === "function") renderUserBox();
}

// Секретная админ-панель - если в localStorage is_admin === "true"
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

	// Клик по бургеру - открыть/закрыть меню (класс menu-open включает анимацию)
	burger.addEventListener("click", function () {
		burgerHeader.classList.toggle("menu-open");
	});

	// Выбрали пункт меню - меню само закрывается
	burgerMenu.addEventListener("click", function (e) {
		if (e.target.closest("a")) burgerHeader.classList.remove("menu-open");
	});
}`;


// ---- Данные урока 2 ----
const lesson = {
  title: `Урок 2: Этичный хакер 🕵️`,

  introMd: `# 🕵️ Этичный хакер: найди дыры в своём магазине

На прошлом уроке ты был **программистом** и собрал целый магазин «МегаМагазин» -
с регистрацией, входом, страницами товаров и комментариями. Сегодня у тебя новая
профессия - **этичный хакер** (его ещё называют «белый хакер»).

## 🦸 Кто такой этичный хакер?

Это «добрый взломщик». Звучит странно, но это **настоящая работа**, и за неё
хорошо платят! Большие компании (банки, игры, соцсети) специально нанимают белых
хакеров, чтобы те **первыми** нашли дыры в их программных продуктах (сайтах, играх, приложениях и др.) - раньше, чем это сделают
злые хакеры. Белый хакер ломает не для того, чтобы навредить, а чтобы **починить**
и защитить людей.

⚠️ **Золотое правило хакера:** мы ломаем **только свой собственный** программный продукт (сайт, игру, приложение). Ломать
чужие сайты без разрешения хозяина - это преступление, за которое наказывают
по-настоящему. Белый хакер всегда действует только с разрешения. Сегодня мы ломаем
**твой** магазин - значит, всё честно. 👍

## 🗺️ Сначала осмотрись: что у тебя на экране

Экран разделён на **три части (их называют «колонки»)** - слева направо:

**1. 📖 Урок** - это колонка слева, в ней ты читаешь прямо сейчас. Здесь будут все
шаги и зелёные кнопки **«✓ Я выполнил этот шаг»**.

**2. Код** - колонка посередине. Это код твоего сайта. Сверху у неё три **вкладки**:
\`index.html\`, \`style.css\`, \`main.js\` - это три файла, из которых собран сайт.
Чтобы открыть нужный файл, надо щёлкнуть по его вкладке - впервые понадобится на
шаге 4, там всё расписано по шагам.

**3. Результат** - колонка справа. Здесь «живёт» твой сайт. А под ним есть тёмное
окошко **🖥 Консоль**, куда сайт пишет сообщения.

Над всеми колонками, в самом верху, есть синяя кнопка **▶ Запустить**. Она
пересобирает сайт после того, как ты изменил код. Запомни её - нажимать будем
часто!

## ↩ Если что-то напортил в коде

Справа в ряду вкладок (\`index.html style.css main.js\`) есть стрелки **↩** и **↪**:
↩ отменяет последнее действие, ↪ возвращает его назад. С клавиатуры - **Ctrl+Z**
и **Ctrl+Shift+Z**. На **Mac** это **⌘+Z** / **⌘+Shift+Z**, а если ⌘+Z в браузере
работает странно (страница закрывается или уезжает назад) - жми **Ctrl+U**
(отмена) и **Ctrl+Shift+U** (возврат). Стрелки **↩ ↪** работают всегда.

## 🔁 Как мы работаем с каждой дырой

С каждой уязвимостью (дырой) мы делаем три действия:

**1. 🔴 Найди / сломай** - пользуемся дырой, как настоящий злоумышленник, чтобы
увидеть опасность своими глазами.

**2. 🟢 Почини** - правим код сайта и жмём **▶ Запустить**.

**3. ✅ Проверь** - повторяем ту же атаку и убеждаемся: теперь она **не работает**!

## 🔎 Как платформа проверяет твою работу

На шагах, где что-то чинится в коде (🟢), под заданием есть список
**«🔎 Платформа проверит»**. Пока пункт не выполнен, рядом стоит ⬜, а зелёная
кнопка **«✓ Я выполнил этот шаг»** закрыта на замок 🔒. Платформа смотрит на сам
код: ушла ли уязвимая строка и появилась ли безопасная. Как только починишь -
⬜ превратится в ✅.

На шагах, где мы только **ломаем** (🔴), проверок нет: там ничего не меняется в
коде, и кнопка активна сразу.

В колонке «Результат» уже загружен твой уязвимый магазин - тот самый, что ты
собрал на прошлом уроке. Поехали искать дыры! 👇`,

  outroMd: `# 🏆 Поздравляем, ты прошёл путь разработчик → этичный хакер!

Ты научился находить и **чинить** настоящие уязвимости:

- 💉 **XSS** - чужой код через \`innerHTML\` (комментарии, имя автора, уголок
  пользователя, приветствие из ссылки); чинится выводом через \`textContent\`.
- 🔑 **Секреты на клиенте** - пароли и «флаги» в коде, в HTML и в localStorage
  любой может прочитать. Настоящая проверка пароля и прав - **только на сервере**.
- 🗄️ **Пароли в открытом виде** - их нужно хранить в виде «хэша» на сервере.
- 🔓 **Слабые пароли** - короткий пароль перебирается за миллисекунды; защита -
  длинные сложные пароли и ограничение числа попыток на сервере.
- 🛂 **Контроль доступа** - нельзя доверять флагам вроде \`is_admin\` в браузере.

## Куда расти дальше

- Учи **HTML/CSS/JS** глубже - ты уже умеешь больше многих новичков.
- Почитай про **OWASP Top-10** (список самых частых уязвимостей) - есть версии
  «для начинающих».
- Тренируйся на легальных площадках (CTF для детей, обучающие лаборатории).

Главное - оставайся **белым** хакером: знания дают силу, а сила требует
честности. 🔐`,

  hint: `Каждую дыру проходи по циклу: 🔴 найди/сломай → 🟢 почини код в редакторе и нажми ▶ Запустить → ✅ повтори атаку и убедись, что не работает. Инструменты: встроенная консоль 🖥 внизу и F12 (DevTools) - вкладки Elements, Console, Application → Local Storage. Кнопка «✓ Я выполнил этот шаг» на 🟢-шагах закрыта 🔒, пока список «🔎 Платформа проверит» под заданием не станет весь зелёным: платформа смотрит на КОД в редакторах - ушла ли уязвимая строка и появилась ли безопасная. Галочки обновляются сами, пока ты печатаешь. На 🔴-шагах (где мы только ломаем) проверок нет - кнопка активна сразу.`,

  // Стартовый код = вшитый уязвимый сайт (одинаковый у всех)
  initialHTML: VULN_HTML,
  initialCSS: VULN_CSS,
  initialJS: VULN_JS,

  steps: [
    {
      manual: true,
      title: `🧰 Инструменты (1/2): магазин, ▶ Запустить и консоль`,
      goalMd: `**Цель:** запусти магазин, освойся в нём и найди встроенную консоль. Не спеши - это основа.`,
      actionMd: `Ничего ломать не нужно - просто всё запусти и осмотрись.`,
      taskMd: `📋 **Пункты действия** (что сделать в этом шаге):
1. Нажми ▶ Запустить - справа появится магазин.
2. Погуляй по меню: Главная → Вход → карточка товара.
3. Найди под сайтом тёмное окошко 🖥 Консоль.
4. Нажми «В корзину» и посмотри сообщение в консоли.

---

🔧 **Осмотрись и подготовь инструменты. Делай по пунктам, не торопись.**

**1. Посмотри на магазин и найди кнопку «Запустить».** Справа, в колонке «Результат»,
уже открыт твой магазин «МегаМагазин» 🎉 - тот самый, что ты собрал на прошлом уроке.
Теперь вверху экрана, над колонками, найди синюю кнопку **▶ Запустить**. Наведи на неё
курсор мыши и нажми **левую кнопку мыши** один раз - она **пересобирает** сайт после
того, как ты изменишь код. Запомни эту кнопку: чинить дыры мы будем именно так -
поправил код и нажал ▶ Запустить.

**2. Погуляй по магазину.** Вверху сайта есть меню со словами **Главная**, **Вход**,
**Регистрация**. Наведи курсор на слово **Вход** и нажми **левую кнопку мыши** -
откроется страница входа. Теперь так же щёлкни левой кнопкой по слову **Главная** -
вернёшься назад. Потом наведи курсор на любую **карточку товара** (например, на
картинку смартфона) и щёлкни левой кнопкой - откроется отдельная страница этого
товара. Видишь? Страниц много, а файл всего один - это **многостраничный** сайт.

**3. Найди встроенную консоль.** Под сайтом, в той же правой колонке, есть тёмное
окошко с подписью **🖥 Консоль**. Сюда сайт пишет свои сообщения. Если его не видно -
покрути колёсико мыши вниз внутри правой колонки. Теперь на сайте наведи курсор на
любую кнопку **«В корзину»** и щёлкни левой кнопкой мыши. В консоли появится строчка
«Товар добавлен в корзину!». Так консоль показывает, что сайт делает «изнутри».

**4. 🎭 Побудь обычным посетителем - тем, кого потом будешь защищать.** Прежде чем
ломать, пройди сайт как самый обычный человек, чтобы запомнить, «как должно быть»:
- вверху щёлкни **Регистрация**, заведи аккаунт (логин \`test\`, пароль \`12345678\`, пароль повтори) и нажми **Зарегистрироваться**;
- щёлкни **Вход**, войди под \`test\` / \`12345678\` - в правом верхнем углу появится «👤 test»;
- открой любой товар, напиши в комментарии что-нибудь доброе, например \`хороший магазин\`, и нажми **Отправить** - твой комментарий появился с твоим именем;
- нажми **Выйти** в правом верхнем углу.

Всё это - **честная** работа сайта, ради которой он и сделан. А дальше начинается
интересное: тот же самый сайт мы посмотрим **глазами хакера** и увидим, что почти
каждую из этих мелочей можно повернуть против пользователя. Твоя задача на уроке - не
просто ломать, а **находить дыры и чинить их**, как настоящий специалист по
безопасности.`,
      hintMd: `Окошко 🖥 Консоль в правой колонке только ПОКАЗЫВАЕТ сообщения сайта. Кнопка ▶ Запустить вверху пересобирает сайт после правок кода - мы будем жать её часто.`,
      doneMd: `✅ **Готово, когда** магазин запущен (нажал ▶ Запустить), страницы Главная/Вход переключаются и ты нашёл окошко 🖥 Консоль.`,
    },
    {
      manual: true,
      title: `🧰 Инструменты (2/2): открой DevTools (F12)`,
      goalMd: `**Цель:** открой DevTools - главный инструмент хакера - и найди три нужные вкладки.`,
      actionMd: `Снова ничего не ломаем - только находим и запоминаем, где что лежит.`,
      taskMd: `📋 **Пункты действия** (что сделать в этом шаге):
1. Нажми F12 (или ПКМ по сайту → «Просмотреть код»).
2. Найди вкладку Elements (HTML страницы).
3. Найди вкладку Console - туда можно печатать команды.
4. Открой Application → Local Storage («кладовка» браузера).

---

🔧 **Открой инструменты разработчика (DevTools).**

**1. Открой DevTools - главный инструмент хакера.** DevTools (читается «дев-тулз»,
по-русски «инструменты разработчика») встроены в каждый браузер. Нажми на клавиатуре
клавишу **F12** (она в самом верхнем ряду). Сбоку или снизу откроется панель с кучей
надписей - **не пугайся!** Если по F12 ничего не открылось - наведи курсор на сайт,
нажми **правую кнопку мыши** и в появившемся меню выбери пункт **«Просмотреть код»**
(или **«Inspect»**).

**2. Найди в DevTools три нужные вкладки.** Вверху панели DevTools есть ряд слов -
это вкладки. Нам нужны только три. Наводи курсор и щёлкай по ним левой кнопкой, чтобы
запомнить, где они:
- **Elements** (по-русски «Элементы») - показывает HTML, из которого собрана страница.
- **Console** («Консоль») - сюда можно **печатать команды** и выполнять их прямо на сайте. Это другая консоль, не та, что 🖥 на платформе, но тоже про твой сайт.
- **Application** («Приложение») - щёлкни по ней, и слева появится список; найди в нём **Local Storage** и щёлкни по нему. Это «кладовка» браузера: тут сайт хранит, кто вошёл, список пользователей, комментарии. Скоро мы туда залезем.

Ничего страшного, если пока непонятно - будем пользоваться этим по ходу урока, я
каждый раз буду подсказывать, куда нажимать.

**3. Готово!** Вернись в колонку **📖 Урок** (слева), прокрути эту карточку до конца
и нажми зелёную кнопку **✓ Я выполнил этот шаг**.`,
      hintMd: `Клавиша F12 открывает И закрывает DevTools (нажми ещё раз - спрячется). Если F12 не сработала - правая кнопка мыши по сайту → «Просмотреть код» / «Inspect». Встроенная консоль платформы (🖥 в правой колонке) и вкладка Console в DevTools - это два разных окошка, но оба показывают сообщения твоего сайта; можно пользоваться любым.`,
      doneMd: `✅ **Готово, когда** DevTools открыты (F12), и ты нашёл вкладки Elements, Console и Application → Local Storage.`,
    },
    {
      manual: true,
      title: `💉 XSS: чужой код через innerHTML - найди, почини, проверь`,
      goalMd: `**Цель:** разобрать самую частую веб-дыру - **XSS** (Cross-Site Scripting), когда злоумышленник заставляет сайт выполнить **чужой код**.

**Где дыра:** сайт показывает чужой текст (комментарии, имя автора, имя пользователя) через \`innerHTML\` - и браузер исполняет вставленный HTML как настоящий код. В этом одном шаге мы пройдём полный цикл: 🔴 **найдём** дыру, 🟢 **починим** её во всех местах сразу и ✅ **проверим**, что она закрыта.`,
      actionMd: `Весь цикл в одном шаге: 🔴 сломай → 🟢 почини → ✅ проверь.`,
      taskMd: `📋 **Пункты действия** (что сделать в этом шаге):
1. 🔴 Зарегистрируйся, войди и отправь в комментарий ловушку \`<img src=x onerror="alert('XSS')">\`.
2. 🔴 Убедись, что та же дыра прячется и в имени пользователя.
3. 🟢 Почини в main.js три места вывода (innerHTML → безопасный текст).
4. ✅ Повтори атаку - окошко больше не выскакивает.

---

🔧 **🔴 НАЙДИ / СЛОМАЙ.**

**1. Заведи аккаунт и войди.** Вверху сайта щёлкни **Регистрация**, впиши логин
\`vasya\` и пароль \`12345678\` (пароль повтори в третьем поле), нажми
**Зарегистрироваться**. Потом щёлкни **Вход**, впиши те же \`vasya\` / \`12345678\`,
нажми **Войти** - в правом верхнем углу появится «👤 vasya».

**2. Атака через комментарий.** Щёлкни **Главная**, открой любую **карточку товара**,
прокрути вниз до поля комментария. Щёлкни по нему и напечатай (или скопируй) **ровно
эту строку**:
\`<img src=x onerror="alert('XSS')">\`
Нажми **Отправить**. 💥 Выскочило окошко «XSS»? Ты только что заставил сайт выполнить
**чужой код** - это и есть уязвимость **XSS**. Нажми **OK**.

**3. XSS умеет красть данные.** Снова щёлкни по полю комментария и отправь другую
строку:
\`<img src=x onerror="alert(localStorage.getItem('currentUser'))">\`
Теперь в окошке - **твоё имя пользователя**: код сам вытащил его из памяти браузера.
Точно так же крадут логины, токены, данные. Нажми **OK**.

💡 И это опасно **для всех**, а не только для тебя: сайт **сохранил** твой вредный
комментарий прямо у этого товара, поэтому окошко выскочит у **каждого**, кто откроет
эту страницу. Такой XSS называют **хранимым** - ловушку оставляют один раз, а
попадаются в неё все посетители.

**4. Та же дыра - в имени пользователя.** XSS живёт не только в комментариях. Выйди
(**Выйти** в правом углу), открой **Регистрация** и **вместо логина** впиши ловушку:
\`<img src=x onerror="alert('XSS в профиле')">\`
Пароль - любой (\`12345678\`, повтори). Нажми **Зарегистрироваться**, потом войди этим
же «логином»-ловушкой. 💥 Окошко выскакивает снова - теперь код спрятался прямо в
**имени**, которое сайт показывает в уголке «👤 …» и в приветствии «Привет, …». Закрой
окошки кнопкой **OK**.

🤔 **Заметил главное?** Причина всюду одна: сайт вставляет чужой текст через
\`innerHTML\`, и браузер исполняет его как код. Значит, чинить надо **везде, где чужой
текст выводится через \`innerHTML\`** - и комментарий, и имя автора, и имя пользователя.

---

🔧 **🟢 ПОЧИНИ - все три места сразу.** Приём один и тот же: вместо \`innerHTML\` (вставь
как HTML) выводим текст безопасно, как **обычный текст**. Открой вкладку **main.js**.

**а) Комментарии и имя автора.** Скопируй код из рамки ниже (выдели мышкой и нажми
**Ctrl+C** - делай это **до** удаления старого). Затем нажми **Ctrl+F**, напечатай
\`function renderComments\` и жми **Enter**, пока подсветка не перепрыгнет в код. Выдели
всю функцию (щелчок в начало строки \`function renderComments(id) {\`, затем Shift+щелчок
после её закрывающей \`}\`), нажми **Delete** и сразу **Ctrl+V**:

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
		author.textContent = c.author + ":";  // безопасно: имя автора как ТЕКСТ
		div.appendChild(author);
		div.appendChild(document.createTextNode(" " + c.text)); // безопасно: это ТЕКСТ
		box.appendChild(div);
	});
}
\`\`\`

**б) Уголок пользователя.** Скопируй код из рамки ниже (**Ctrl+C**). Нажми **Ctrl+F**,
напечатай \`renderUserBox\`, жми **Enter** до перепрыгивания в код. Выдели всю функцию
(щелчок в начало \`function renderUserBox() {\`, Shift+щелчок после её \`}\`), **Delete**,
затем **Ctrl+V**:

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

**в) Приветствие после входа.** Тут меняется всего **одно слово**. Нажми **Ctrl+F**,
напечатай \`loginMsg.innerHTML\`, жми **Enter** до перепрыгивания в код. Найдёшь строку:
\`loginMsg.innerHTML = "Привет, " + name + "!";\`
Дважды быстро щёлкни по слову \`innerHTML\` (выделится целиком) и напечатай
\`textContent\`. Должно получиться:
\`loginMsg.textContent = "Привет, " + name + "!";\`

Теперь нажми **▶ Запустить**.

---

🔧 **✅ ПРОВЕРЬ, что дыра закрыта.** Выйди из аккаунта. Открой **Регистрация** и снова
заведи «вредный» логин \`<img src=x onerror="alert('XSS в профиле')">\` (пароль
\`12345678\`), войди им, открой любой товар и отправь в комментарий ту же ловушку
\`<img src=x onerror="alert('XSS')">\`. Теперь **ни одно окошко не выскакивает** - и
комментарий, и имя автора, и имя в уголке показываются как обычный **текст** с
кавычками и скобками. 🛡️ XSS закрыт во всех местах - отличная работа!`,
      hintMd: `Один и тот же приём: чужой текст выводим через \`textContent\`, а не \`innerHTML\`. Мест три - комментарий с автором (\`renderComments\`), уголок (\`renderUserBox\`) и приветствие (\`loginMsg\`). Ловушку \`<img src=x onerror=…>\` вставляй в поле комментария или ВМЕСТО логина при регистрации. Ctrl+F по коду: жми Enter, пока подсветка не перепрыгнет с текста урока на строку в редакторе.`,
      doneMd: `✅ **Готово, когда** после починки ловушка \`<img src=x onerror=…>\` в комментарии, в имени автора и в имени пользователя показывается как **текст**, а окошко \`alert\` больше не выскакивает.`,
    },
    {
      manual: true,
      title: `🔑 Дыра №2: пароль прямо в коде + обход входа - 🔴 сломай`,
      goalMd: `**Цель:** понять, почему **секреты нельзя хранить на клиенте** и почему вход надо проверять на **сервере**.

**Где дыра:** служебный логин/пароль захардкожены в \`main.js\` и подсказаны в HTML-комментарии; а флаг входа лежит в localStorage и подделывается.`,
      actionMd: `Сейчас только ломаем (🔴): найди пароль и обойди вход. Чинить - на следующем шаге.`,
      taskMd: `📋 **Пункты действия** (что сделать в этом шаге):
1. В main.js найди \`ADMIN_PASS\` - пароль написан прямо в коде.
2. Проверь, что тот же пароль подсказан в index.html.
3. Войди под admin / megapass123.
4. В F12 → Console выполни \`localStorage.setItem('isLoggedIn', 'true')\` и обойди вход без пароля.

---

🔧 **🔴 НАЙДИ / СЛОМАЙ.**

**1. Найди пароль прямо в коде.** В средней колонке щёлкни левой кнопкой по вкладке
**main.js**. Нажми **Ctrl+F**, напечатай \`ADMIN_PASS\`, нажми **Enter**. (Это
сочетание встречается в тексте урока несколько раз, поэтому нажимай **Enter** до тех
пор, пока подсветка не перепрыгнет с текста задания на нужную строку в коде.) Браузер
подсветит строки:
\`const ADMIN_LOGIN = "admin";\` и \`const ADMIN_PASS = "megapass123";\`
Вот так дела - служебный логин \`admin\` и пароль \`megapass123\` написаны **прямо в
коде**, который видит любой посетитель! Теперь щёлкни вкладку **index.html**, нажми
**Ctrl+F**, напечатай \`megapass123\`. (Это сочетание встречается в тексте урока
несколько раз, поэтому нажимай **Enter** до тех пор, пока подсветка не перепрыгнет
с текста задания на нужную строку в коде.) Этот же пароль ещё и подсказан в
комментарии.

**2. Зайди по найденному паролю.** Нажми **▶ Запустить**. На сайте щёлкни **Вход**,
впиши логин \`admin\` и пароль \`megapass123\`, нажми кнопку **Войти**. Пускает! Хотя
такого пользователя никто не регистрировал - он «зашит» в код.

**3. А теперь обойди вход вообще без пароля.** Для этого выполним команду. Нажми
**F12**, вверху панели щёлкни вкладку **Console**. В самом низу там есть пустая строка
с мигающим курсором - щёлкни по ней левой кнопкой мыши, напечатай команду и нажми
**Enter**:
\`localStorage.setItem('isLoggedIn', 'true')\`
Теперь нажми **▶ Запустить**. В правом верхнем углу сайт уже считает тебя вошедшим -
а ведь ты не ввёл ни логина, ни пароля! Проверка входа, которая живёт в браузере,
**обходится одной строчкой**. 😈

ℹ️ **Запомни разницу:** окошко **🖥 Консоль** в правой колонке только **показывает**
сообщения сайта - печатать туда нельзя. А чтобы **вводить команды**, нужна вкладка
**Console** в DevTools (открывается по F12) - вот там внизу есть строка для ввода.

**4. 🧪 Сколько ещё «служебных» отметок в браузере?** Обход входа сработал потому,
что сайт верит записи \`isLoggedIn\` в браузере. Посмотрим, чему он верит ещё. Открой
**F12 → Application → Local Storage**, щёлкни адрес сайта и посмотри на список ключей.
Найди там \`currentUser\` - это имя, которое сайт показывает как «твоё». Теперь на
вкладке **Console** выполни:
\`localStorage.setItem('currentUser', 'Сам Директор')\`
нажми **▶ Запустить** и посмотри в правый верхний угол - сайт «поверил» и показывает
чужое имя. 😈

🤔 **Подумай:** почему так вышло? 👉 Потому что сайт хранит «кто вошёл» **в браузере
у самого посетителя**, а браузер целиком в его руках. По-настоящему решать, кто вошёл,
должен **сервер** - отдельный компьютер, до которого у посетителя нет доступа. Это
главный урок: **нельзя доверять тому, что лежит в браузере пользователя.**`,
      hintMd: `Окошко 🖥 на платформе только показывает вывод - команды вводят в F12 → Console. Пароль, написанный в коде, видит любой посетитель.`,
      doneMd: `✅ **Готово, когда** ты нашёл пароль \`megapass123\` в коде, вошёл под \`admin\` и обошёл вход командой \`isLoggedIn\`.`,
    },
    {
      manual: true,
      title: `🔑 Дыра №2: пароль прямо в коде + обход входа - 🟢 почини`,
      goalMd: `**Цель:** убрать секретный пароль и «чёрный ход» из кода. Настоящая проверка входа - на сервере.`,
      actionMd: `Почини (🟢) и проверь (✅).`,
      taskMd: `📋 **Пункты действия** (что сделать в этом шаге):
1. В index.html удали строку-комментарий с \`megapass123\`.
2. В main.js удали строки \`const ADMIN_LOGIN\` и \`const ADMIN_PASS\`.
3. Замени обработчик входа \`loginBtn\` на чистую версию из задания.
4. Нажми ▶ Запустить и проверь, что \`megapass123\` в коде больше не находится.

---

🔧 **🟢 ПОЧИНИ.**

**а) Убери пароль из index.html.** Щёлкни вкладку **index.html**, нажми **Ctrl+F**,
найди \`megapass123\` (это сочетание встречается в тексте урока несколько раз, поэтому
нажимай **Enter** до тех пор, пока подсветка не перепрыгнет с текста задания на нужную
строку в коде) - это строка-комментарий вида \`<!-- TODO … megapass123 -->\`.
Удали её целиком: щёлкни мышкой **перед** символом \`<\` в самом начале строки, затем
с зажатым **Shift** щёлкни **после** \`-->\` в её конце - вся строка выделится синим.
Отпусти Shift и нажми **Delete**.

**б) Убери пароль и «чёрный ход» из main.js.** Щёлкни вкладку **main.js**. Так же
выдели и удали две строки \`const ADMIN_LOGIN = …\` и \`const ADMIN_PASS = …\`: щёлкни
**перед** \`const\` в начале первой из них, затем с зажатым **Shift** щёлкни в **самом
конце** второй строки (после комментария \`⚠ …\`) - обе строки выделятся - и нажми
**Delete**.

**в) Замени функцию входа на чистую.** Теперь вход будет работать только для тех, кто
реально зарегистрировался.

**Действие 1. Скопируй новый код.** Ниже в рамке - чистая версия обработчика входа.
Выдели её мышкой целиком и нажми **Ctrl+C**. Делай это **до** удаления старой: пока
старый код на месте, его легко найти.

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

**Действие 2. Найди старую функцию входа.** Нажми **Ctrl+F**, напечатай
\`loginBtn.addEventListener\` и жми **Enter** до тех пор, пока подсветка не перепрыгнет
с текста задания на нужную строку в коде.

**Действие 3. Выдели её целиком и удали.** Щелчок в начало строки
\`loginBtn.addEventListener(…\`, затем с зажатым **Shift** щелчок после её закрывающей
\`}\` - весь обработчик подсветится синим. Нажми **Delete**.

**Действие 4. Вставь скопированное.** Курсор уже стоит на нужном месте - нажми
**Ctrl+V**, затем **▶ Запустить**.

💡 **Запомни:** настоящие большие сайты проверяют логин и пароль **на сервере** - на
отдельном защищённом компьютере, куда обычный посетитель залезть не может. Всё, что
лежит в браузере (код, HTML, память localStorage), пользователь может прочитать и
поменять. Поэтому до конца защититься от подмены \`isLoggedIn\` прямо в браузере
нельзя - это работа сервера. Но пароль из кода мы убрали, и это уже очень важно.

---

🔧 **✅ ПРОВЕРЬ.**

**1. Сначала «выйди по-настоящему».** На прошлом шаге ты подделал вход, и сайт до сих
пор показывает в правом верхнем углу чужое имя («👤 Сам Директор»). Это не значит, что
починка не сработала - просто фальшивая отметка осталась в браузере. Убери её: нажми
**Выйти** в правом верхнем углу (или выполни в **F12 → Console** команду
\`localStorage.removeItem('isLoggedIn')\` и нажми **▶ Запустить**).

**2. Проверь, что пароля в коде больше нет.** Щёлкни вкладку **index.html**, нажми **Ctrl+F**, поищи
\`megapass123\`. (Внимание: это сочетание всё ещё встречается в самом тексте урока -
это нормально, не пугайся. Жми **Enter** и смотри: подсветка будет прыгать только по
тексту задания и **больше не перепрыгнет** в код, потому что в коде этого слова уже
**нет**.) То же проверь на вкладке **main.js**.

**3. Попробуй войти «чёрным ходом».** Открой на сайте страницу **Вход**, впиши
\`admin\` / \`megapass123\` и нажми **Войти** - теперь сайт отвечает «Неверный логин или
пароль». Чёрного хода больше нет. 🛡️`,
      hintMd: `Ctrl+F ищет по коду. Удаляй строки целиком. После починки служебного входа \`admin\` не будет - это нормально. Обход через \`isLoggedIn\` на клиенте до конца не чинится (нужен сервер) - это и есть урок.`,
      doneMd: `✅ **Готово, когда** пароля \`megapass123\` нет ни в index.html, ни в main.js, и вход под \`admin\`/\`megapass123\` больше не срабатывает.`,
    },
    {
      manual: true,
      title: `🗄️ Дыра №3: пароли хранятся открытым текстом - 🔴 сломай`,
      goalMd: `**Цель:** увидеть, что пароли лежат в localStorage **открытым текстом**.`,
      actionMd: `Только смотрим (🔴): прочитай чужие пароли из хранилища.`,
      taskMd: `📋 **Пункты действия** (что сделать в этом шаге):
1. Заведи пару аккаунтов (masha/qwerty123, petya/superkot).
2. Открой F12 → Application → Local Storage.
3. Найди ключ \`users\` и посмотри логины и пароли как есть.

---

🔧 **🔴 НАЙДИ / СЛОМАЙ.**

**1. Заведи пару аккаунтов.** Нажми **▶ Запустить**. На сайте щёлкни **Регистрация**
и создай два разных аккаунта - например, логин \`masha\` с паролем \`qwerty123\`, потом
логин \`petya\` с паролем \`superkot\`. Каждый раз заполняй три поля и жми кнопку
**Зарегистрироваться**.

**2. Загляни в «кладовку» браузера.** Нажми **F12**, вверху панели щёлкни вкладку
**Application**. Слева в списке найди **Local Storage** и щёлкни по строчке с адресом
сайта под ним. Справа появится таблица с данными. Найди строку с ключом \`users\` и
щёлкни по ней левой кнопкой. 😱 Ты видишь **все логины и пароли - прямо как есть**,
открытым текстом! Если бы такую настоящую базу украли, у вора сразу оказались бы все
пароли.

**3.** 🤔 Подумай: многие используют **один и тот же пароль** на разных сайтах. Утёк
пароль здесь - и злоумышленник зайдёт в их почту, игры и соцсети. Вот почему хранить
пароли «как есть» очень опасно.`,
      hintMd: `Массив \`users\` лежит в Local Storage под ключом \`users\`. Многие используют один пароль на разных сайтах - поэтому такая утечка особенно опасна.`,
      doneMd: `✅ **Готово, когда** ты увидел в \`users\` логины и пароли открытым текстом.`,
    },
    {
      manual: true,
      title: `🗄️ Дыра №3: спрячь пароли за хэшем - 🟢 почини`,
      goalMd: `**Цель:** понять, почему пароли пользователей **нельзя хранить как есть**, что такое «хэш», и спрятать пароли за хэшем.

**Где дыра:** при регистрации логин и пароль кладутся в localStorage в массив \`users\` **открытым текстом**.`,
      actionMd: `Спрячь пароли за хэшем (🟢) и проверь (✅).`,
      taskMd: `📋 **Пункты действия** (что сделать в этом шаге):
1. В main.js добавь функцию \`hashPassword\` рядом с \`getUsers\`.
2. Замени обработчик \`regBtn\` - сохраняй ХЭШ пароля, а не сам пароль.
3. Замени обработчик \`loginBtn\` - сверяй вход по хэшу.
4. Нажми ▶ Запустить и проверь: в \`users\` теперь хэш, а вход работает.

---

🔧 **🟢 ПОЧИНИ - спрячем пароли за «хэшем».** Хэш - это «отпечаток» пароля: из пароля
его легко посчитать, а обратно из отпечатка пароль **не восстановить**. Будем хранить
не сам пароль, а только его хэш. Тогда даже если базу украдут - настоящих паролей там
нет. В браузере для этого есть **настоящий** инструмент \`crypto.subtle\` - тот же
алгоритм **SHA-256**, что используют взрослые сайты.

**а) Добавь функцию-хэшер.**

**Действие 1. Скопируй новый код.** Ниже в рамке - функция, которая считает хэш.
Выдели её мышкой целиком и нажми **Ctrl+C**.

\`\`\`
async function hashPassword(str) {
	const data = new TextEncoder().encode(str);              // текст → байты
	const buf = await crypto.subtle.digest("SHA-256", data); // настоящий SHA-256 в браузере
	return Array.from(new Uint8Array(buf))
		.map(function (b) { return b.toString(16).padStart(2, "0"); })
		.join("");                                           // байты → строка из 64 знаков
}
\`\`\`

**Действие 2. Найди место для неё.** Щёлкни вкладку **main.js**, нажми **Ctrl+F**,
напечатай \`function getUsers\` (нажимай **Enter**, пока подсветка не перепрыгнет с
текста задания на нужную строку в коде).

**Действие 3. Вставь скопированное.** Щёлкни левой кнопкой мыши **в самом конце**
строки с закрывающей скобкой \`}\` этой функции, нажми **Enter** (появится пустая
строка) и нажми **Ctrl+V**.

**б) Сохраняй при регистрации ХЭШ, а не пароль.**

**Действие 1. Скопируй новый код.** Ниже в рамке - новая версия обработчика
регистрации: она сохраняет в \`users\` хэш пароля, а не сам пароль. Выдели её мышкой
целиком и нажми **Ctrl+C**. Делай это **до** удаления старой: пока старый код на месте,
его легко найти.

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

**Действие 2. Найди старый обработчик регистрации.** Нажми **Ctrl+F**, напечатай
\`regBtn.addEventListener\` и жми **Enter**, пока подсветка не перепрыгнет в код.

**Действие 3. Выдели его целиком и удали.** Щёлкни в начало строки
\`regBtn.addEventListener(…\`, зажми **Shift** и щёлкни сразу после закрывающих \`});\` -
это самая последняя строка обработчика, сразу под строкой
\`msg.textContent = "Готово! Теперь войди…";\`. Нажми **Delete**.

**Действие 4. Вставь скопированное.** Курсор уже на нужном месте - нажми **Ctrl+V**.

**в) Проверяй вход тоже по хэшу.** Раз пароли теперь лежат в виде хэша, то и при входе
надо сравнивать хэш с хэшем.

**Действие 1. Скопируй новый код.** Ниже в рамке - новая версия обработчика входа.
Выдели её мышкой целиком и нажми **Ctrl+C** - снова **до** того, как что-то удалять.

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

**Действие 2. Найди старый обработчик входа.** Нажми **Ctrl+F**, напечатай
\`loginBtn.addEventListener\` и жми **Enter**, пока подсветка не перепрыгнет в код.

**Действие 3. Выдели его целиком и удали.** Щёлкни **перед** \`loginBtn\` в начале этой
строки, затем с зажатым **Shift** щёлкни **после** закрывающих \`});\` - это самая
последняя строка обработчика, сразу под строкой \`}\`, которая идёт под строкой
\`loginMsg.textContent = "Неверный логин или пароль";\`. Весь блок выделится синим.
Нажми **Delete**.

**Действие 4. Вставь скопированное.** Курсор уже на нужном месте - нажми **Ctrl+V**,
затем **▶ Запустить**.

💡 **Запомни:** мы посчитали хэш **прямо в браузере** - это уже куда лучше, чем хранить
пароль как есть. Но по-настоящему это делают **на сервере**: туда пароль приходит по
защищённому соединению, превращается в хэш специальным «медленным» способом (например,
**bcrypt**) и обязательно с «солью» - случайной добавкой, чтобы одинаковые пароли давали
разные хэши. Сам пароль не должен видеть никто, даже сотрудники сайта.

---

🔧 **✅ ПРОВЕРЬ.** На сайте щёлкни **Регистрация** и заведи новый аккаунт с паролем
подлиннее - например, логин \`dasha\` и пароль \`solnyshko12\` (не короче 8 символов).
Теперь снова загляни в «кладовку»: **F12 → Application → Local Storage** → строка с
адресом сайта → ключ \`users\`. 🎉 На месте пароля теперь длинная строка из 64 непонятных
символов - это **хэш**, по нему настоящий пароль не узнать! А войти под \`dasha\` /
\`solnyshko12\` по-прежнему получается. 🛡️

---

🔧 **ℹ️ Бонус: перенеси старые пароли в хэш.** Аккаунты, которые ты завёл **до** этой
починки, всё ещё лежат с открытым паролем - и под новый вход (он теперь сверяет хэши)
они не подойдут. Чтобы не регистрировать их заново, перехэшируем их **один раз**. Так
делают и на настоящих сайтах, когда переходят на хранение хэшей. Открой консоль
(**F12 → Console**), вставь этот код и нажми **Enter**:

\`\`\`
(async function () {
	const users = JSON.parse(localStorage.getItem("users") || "[]");
	async function hashPassword(str) {
		const data = new TextEncoder().encode(str);
		const buf = await crypto.subtle.digest("SHA-256", data);
		return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
	}
	let changed = 0;
	for (const u of users) {
		if (u.password !== undefined && u.passwordHash === undefined) {
			u.passwordHash = await hashPassword(u.password);   // считаем хэш
			delete u.password;                                  // убираем открытый пароль
			changed++;
		}
	}
	localStorage.setItem("users", JSON.stringify(users));
	console.log("Перехэшировано паролей:", changed);
})();
\`\`\`

В консоли появится, сколько паролей перенесли. Теперь старые аккаунты тоже входят, а
открытых паролей в \`users\` не осталось совсем. 🛡️`,
      hintMd: `Функцию \`hashPassword\` добавь ОДИН раз (рядом с \`getUsers\`), а обработчики \`regBtn\` и \`loginBtn\` замени целиком на async-версии. \`crypto.subtle\` работает только на http(s) или localhost - открывай сайт через \`python3 -m http.server\`, а не как файл с диска. Старые аккаунты, заведённые ДО починки, остаются с открытым паролем - их можно разом перехэшировать бонус-командой в конце шага.`,
      doneMd: `✅ **Готово, когда** при регистрации в \`users\` сохраняется ХЭШ (длинная строка), а не сам пароль, и вход по-прежнему работает.`,
    },
    {
      manual: true,
      title: `🔓 Дыра №4: слабый пароль ломается перебором - 🔴 сломай`,
      goalMd: `**Цель:** своими глазами увидеть **брутфорс** (перебор) и понять, почему пароль должен быть **длинным и сложным**.

**Брутфорс** - это когда злоумышленник перебирает все возможные пароли подряд, пока не угадает.`,
      actionMd: `Только ломаем (🔴): заведи трёх пользователей с паролями в 3, 5 и 6 цифр и подбери их перебором - сравни, насколько дольше идёт перебор с каждой лишней цифрой.`,
      taskMd: `📋 **Пункты действия** (что сделать в этом шаге):
1. Открой F12 → Console.
2. Заведи через форму регистрации трёх пользователей: \`user1\` (пароль 3 цифры), \`user2\` (5 цифр), \`user3\` (6 цифр).
3. Вставь код перебора и подбери пароль \`user1\` - это мгновенно.
4. Поменяй в коде \`login\` и \`maxLen\`, подбери \`user2\`, потом \`user3\`, и сравни, насколько дольше идёт перебор с каждой лишней цифрой.

---

🔧 **🔴 НАЙДИ / СЛОМАЙ.**

В этом шаге мы будем **выполнять команды в консоли** - это вкладка **Console** в
DevTools. Открой её: нажми **F12**, вверху щёлкни **Console**. В самом низу есть
строка для ввода - туда и будем вставлять код.

💡 **Команды длинные - печатать вручную не надо.** Выдели команду мышкой прямо здесь,
в задании, нажми **Ctrl+C** (копировать), затем щёлкни в строку ввода консоли, нажми
**Ctrl+V** (вставить) и **Enter**. Если консоль попросит набрать «allow pasting» -
напечатай эти два слова, нажми Enter и вставляй снова.

**1. Заведём трёх «жертв» с паролями РАЗНОЙ длины.** Сделай это через обычную форму.
Сначала убедись, что хэширование из прошлого шага включено и сайт пересобран (кнопка
**▶ Запустить**) - иначе пароли сохранятся без хэша и перебор их не найдёт. Затем на
сайте щёлкни **Регистрация** и заведи **по очереди трёх пользователей** (каждый раз
заполняй все три поля - логин, пароль и повтор пароля - и жми **Зарегистрироваться**):

- логин \`user1\`, пароль \`481\` - **3 цифры** (самый короткий);
- логин \`user2\`, пароль \`48127\` - **5 цифр**;
- логин \`user3\`, пароль \`100729\` - **6 цифр** (самый длинный).

Логины пиши **ровно** так - \`user1\`, \`user2\`, \`user3\`: по этим именам их дальше будет
искать код перебора. Представь, что паролей ты **не знаешь** и хочешь их подобрать - и
заодно проверить, на какой из них у перебора уйдёт больше времени.

**2. Начнём с \`user1\` - у него самый короткий пароль (3 цифры).** Представь, что у нас
есть только форма входа, которая отвечает «да» или «нет». Пароли теперь хранятся **в
виде хэша**, поэтому на каждую догадку «сервер» считает её хэш и сравнивает с сохранённым.
Код ниже перебирает пароли по порядку - сперва все из 3 цифр, потом из 4, и так далее -
пока не угадает.

💡 **Для \`user1\` в коде менять ничего не нужно** - в самой первой строке уже стоит
\`const login = "user1";\`, а перебор начинается с 3 цифр. Просто вставь этот код в консоль
и нажми **Enter**:

\`\`\`
const login = "user1";
const minLen = 3;
const maxLen = 4;

async function hashPassword(str) {
	const data = new TextEncoder().encode(str);
	const buf = await crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
}

async function tryLogin(who, guess) {
	const users = JSON.parse(localStorage.getItem("users") || "[]");
	const hash = await hashPassword(guess);
	return users.some(function (u) { return u.login === who && u.passwordHash === hash; });
}

(async function () {
	const users = JSON.parse(localStorage.getItem("users") || "[]");
	if (!users.some(function (u) { return u.login === login; })) {
		console.log("Нет пользователя с логином:", login, "— проверь имя (есть:", users.map(function (u) { return u.login; }).join(", ") || "никого", ")");
		return;
	}
	const t0 = performance.now();
	let found = null;
	let tries = 0;
	let lastLog = t0;
	for (let len = minLen; len <= maxLen; len++) {
		for (let i = 0; i < Math.pow(10, len); i++) {
			const guess = String(i).padStart(len, "0");
			tries++;
			const now = performance.now();
			if (now - lastLog >= 1000) {
				console.log("Перебор идёт... прошло:", ((now - t0) / 1000).toFixed(0), "сек | попыток:", tries, "| сейчас проверяю:", guess);
				lastLog = now;
			}
			if (await tryLogin(login, guess)) { found = guess; break; }
		}
		if (found) break;
	}
	if (found) {
		console.log("Пароль подобран:", found, "за", (performance.now() - t0).toFixed(0), "мс");
	} else {
		console.log("Пароль НЕ подобран за", (performance.now() - t0).toFixed(0), "мс — он длиннее", maxLen, "цифр или содержит не только цифры. Значит длинный/сложный пароль защищает!");
	}
})();
\`\`\`

😱 Готово почти мгновенно! Пароль из 3 цифр - это всего 1000 вариантов, компьютер щёлкает
их за доли секунды. А теперь самое интересное - прогоним **тот же код** на паролях
**подлиннее** (\`user2\` и \`user3\`) и сравним время. Для этого надо поменять в коде всего
**две настройки**, и они - в **самых первых строках** вставленного кода.

**🔎 Как найти эти настройки и поменять их (по шагам):**
1. Вставь код перебора в консоль ещё раз, но **Enter пока не нажимай**.
2. Курсор сейчас в самом низу длинного кода. Прокрути колёсиком мыши **вверх** (или
   нажимай стрелку **↑**), пока не увидишь самую первую строку: \`const login = "user1";\`.
3. **Дважды щёлкни** по слову \`user1\` - оно выделится синим. Не трогая кавычки \`"\`,
   сразу напечатай новое имя. Например, для \`user2\` строка станет \`const login = "user2";\`.
4. Спустись на строку \`const maxLen = 4;\`. У чисел кавычек нет: щёлкни мышкой сразу
   **после** цифры \`4\`, сотри её клавишей **Backspace** и впиши нужную длину (для \`user2\`
   это \`5\`). Строка станет \`const maxLen = 5;\`.
5. Проверь, что поменял именно эти две строки (\`login\` и \`maxLen\`), и нажми **Enter**.

⚠️ Если консоль ругается ошибкой (например «missing /») - значит при правке случайно
задел лишний символ. Не страшно: нажми в консоли **Ctrl+A**, потом **Delete**, вставь код
заново и поменяй **только** эти два значения.

**а) \`user2\` (5 цифр).** По шагам выше поменяй \`login\` на \`"user2"\`, а \`maxLen\` - на \`5\`,
нажми **Enter**. Теперь перебор идёт уже **несколько секунд** - 5 цифр это до 100 000
вариантов; в консоли даже успевают мелькнуть строчки «Перебор идёт… попыток…». Но пароль
всё равно находится.

**б) \`user3\` (6 цифр).** Снова вставь код, поменяй те же две строки: \`login\` на \`"user3"\`,
а \`maxLen\` - на \`6\`, и нажми **Enter**. Теперь перебор тянется **заметно дольше** - до
пары десятков секунд, и строчек «Перебор идёт…» куда больше: 6 цифр - это уже **миллион**
вариантов.

🤔 **Заметил закономерность?** \`user1\` (3 цифры) - мгновенно, \`user2\` (5 цифр) - несколько
секунд, \`user3\` (6 цифр) - десятки секунд. **Каждая лишняя цифра увеличивает время
примерно в 10 раз.** Вот почему короткий пароль - беда: до длинного перебор так и не
доберётся.

**3.** А сколько вариантов перебирает компьютер за миг? Проверим миллион:

\`\`\`
const t1 = performance.now();
let n = 0;
for (let i = 0; i < 1000000; i++) { n++; }
console.log("1 000 000 попыток заняли", (performance.now() - t1).toFixed(0), "мс");
\`\`\`

Даже миллион - доли секунды. Вот почему короткий пароль не защищает.

**4. 🧪 А теперь посчитаем, когда перебор становится безнадёжным.** Дело не в самом
переборе, а в **числе вариантов**. Выполни в консоли этот код - он посчитает, сколько
вариантов у паролей разной длины и из разных наборов символов:

\`\`\`
function variants(alphabet, len) { return Math.pow(alphabet, len); }
console.log("3 цифры:            ", variants(10, 3).toLocaleString());
console.log("4 цифры:            ", variants(10, 4).toLocaleString());
console.log("6 цифр:             ", variants(10, 6).toLocaleString());
console.log("6 букв+цифр (a-z0-9):", variants(36, 6).toLocaleString());
console.log("8 букв+цифр+ЗАГЛАВНЫЕ:", variants(62, 8).toLocaleString());
\`\`\`

Смотри на числа: 3 цифры - это 1000 вариантов (миг), а 8 символов из букв, ЗАГЛАВНЫХ
букв и цифр - это уже **218 триллионов**. Даже быстрый компьютер будет перебирать их
годами.

🤔 **Сделай вывод сам:** что надёжнее защищает пароль - добавить ему **длины** или
добавить **разных символов** (заглавные, цифры, знаки)? 👉 И то, и другое, но длина
работает сильнее: каждый лишний символ **умножает** число вариантов. Поэтому \`123\`
взламывается мгновенно, а \`Zx7-Кот-Луна-92\` - практически никогда. Вот зачем сайты
требуют длинный и сложный пароль, а сервер ещё и ограничивает число попыток входа.`,
      hintMd: `Команды выполняй в DevTools: нажми F12 → вкладка Console → строка ввода внизу → Enter. (Окошко 🖥 на платформе только ПОКАЗЫВАЕТ вывод - печатать в него нельзя.) Заведи через форму трёх пользователей: \`user1\` (3 цифры), \`user2\` (5 цифр), \`user3\` (6 цифр) - имена пиши ровно так. Чтобы перебрать другого пользователя, вставь код заново, прокрути к первой строке и поменяй \`login\` (имя в кавычках) и \`maxLen\` (число длины): для \`user2\` - \`5\`, для \`user3\` - \`6\`. Браузер легко держит перебор даже в миллион вариантов.`,
      doneMd: `✅ **Готово, когда** ты подобрал перебором пароли \`user1\` (3 цифры), \`user2\` (5 цифр) и \`user3\` (6 цифр) и своими глазами увидел, что с каждой лишней цифрой перебор идёт заметно дольше.`,
    },
    {
      manual: true,
      title: `🔓 Дыра №4: запрети короткие пароли - 🟢 почини`,
      goalMd: `**Цель:** запретить короткие пароли - чтобы слабый пароль, как у «жертвы», вообще нельзя было завести.`,
      actionMd: `Почини (🟢) и оцени силу длинного пароля (✅).`,
      taskMd: `📋 **Пункты действия** (что сделать в этом шаге):
1. В main.js найди строку со словами \`Пароли не совпадают\`.
2. Сразу под ней добавь проверку длины пароля (минимум 8 символов).
3. Нажми ▶ Запустить.
4. Попробуй завести 3-значный пароль - сайт теперь не пустит.

---

🔧 **🟢 ПОЧИНИ.** Защита от перебора - **длинный и сложный пароль** плюс ограничение
числа попыток на сервере (например, после 5 ошибок вход на время блокируется).
Длинную часть сделаем прямо сейчас: **запретим короткие пароли** при регистрации -
тогда трёхзначный пароль, как у «жертвы», вообще нельзя будет завести.

Щёлкни вкладку **main.js**, нажми **Ctrl+F** и найди строку со словами
\`Пароли не совпадают\`. (Это сочетание встречается в тексте урока несколько раз, поэтому
нажимай **Enter** до тех пор, пока подсветка не перепрыгнет с текста задания на нужную
строку в коде.) Щёлкни левой кнопкой мыши **в самом конце** этой строки, нажми
**Enter** (появится новая пустая строка) и вставь в неё:

\`\`\`
if (pass.length < 8) {
	msg.textContent = "Пароль слишком короткий - минимум 8 символов";
	return;
}
\`\`\`

Нажми **▶ Запустить**.

---

🔧 **✅ ПРОВЕРЬ / ПОСЧИТАЙ.** Открой **Регистрация** и попробуй завести пароль из 3
цифр (как у «жертвы») - сайт теперь **не пустит**. Значит, такой слабый пароль вообще
не появится. А теперь посмотри, как сильно длина и набор символов меняют скорость
взлома.

**Наш перебор в браузере** делает примерно **8 000 догадок в секунду - это около
500 000 за минуту.** Вот что он успеет сломать всего за **одну минуту**:

\`\`\`
АЛФАВИТ                       ЧТО СЛОМАЕМ ЗА 1 МИНУТУ
--------------------------    -----------------------
только цифры (0-9)            пароль из 5 цифр (6 - за пару минут)
только буквы (a-z)            пароль из 4 букв
буквы + цифры                 пароль из 3-4 знаков
буквы + ЗАГЛАВНЫЕ + цифры     пароль из 3 знаков
\`\`\`

Видишь: коротким паролям конец даже на нашем «игрушечном» переборе в браузере.

А теперь - **сложный пароль из полного набора** (~95 знаков: буквы, ЗАГЛАВНЫЕ, цифры и
знаки \`# ; % : _ - ! ?\` и т.д.). Представь СУПЕР-взломщика с тысячами видеокарт -
**триллион (1 000 000 000 000) догадок в секунду.** Даже ему придётся ломать столько:

\`\`\`
ДЛИНА ПАРОЛЯ    ВРЕМЯ ВЗЛОМА (даже у супер-взломщика)
------------    -------------------------------------
8 символов      ~2 часа
16 символов     ~1 400 000 000 000 лет (в ~100 раз дольше Вселенной)
24 символа      ~10^28 лет (1 с 28 нулями)
32 символа      ~10^44 лет (1 с 44 нулями - за гранью воображения)
\`\`\`

🤯 Заметил? Пароль стал длиннее всего **в 2 раза** (8 → 16 символов), а время взлома
выросло не в 2 раза, а в **миллиарды раз**! В этом и сила: **каждый новый символ
умножает сложность**.

🔒 Поэтому пароль должен быть **длинным** (от 12–16 символов) и **из разных символов**
(буквы, ЗАГЛАВНЫЕ, цифры, знаки), а сервер - ещё и ограничивать число попыток входа.`,
      hintMd: `Правку добавляем в main.js. Ctrl+F по словам \`Пароли не совпадают\` (жми Enter, пока подсветка не перепрыгнет с текста задания на строку в коде), щёлкни в самый конец этой строки, нажми Enter и вставь блок с проверкой \`if (pass.length < 8) { … return; }\`. После ▶ Запустить сайт перестанет пускать короткие пароли. Настоящая защита от перебора - длинный сложный пароль плюс ограничение числа попыток входа на сервере.`,
      doneMd: `✅ **Готово, когда** после правки при регистрации нельзя завести пароль короче 8 символов (сайт показывает «Пароль слишком короткий»), а пароль подлиннее проходит.`,
    },
    {
      manual: true,
      title: `🛂 Дыра №5: фальшивый «админ» - 🔴 сломай`,
      goalMd: `**Цель:** понять **контроль доступа** - почему нельзя доверять флагам вроде \`is_admin\` в браузере.

**Где дыра:** сайт показывает секретную админ-панель, если в localStorage \`is_admin === "true"\`. Но это значение задаёт **сам пользователь**.`,
      actionMd: `Только ломаем (🔴): стань «админом» подменой отметки в браузере.`,
      taskMd: `📋 **Пункты действия** (что сделать в этом шаге):
1. Открой F12 → Application → Local Storage.
2. На вкладке Console выполни \`localStorage.setItem('is_admin', 'true')\`.
3. Нажми ▶ Запустить и открой страницу Вход.
4. Посмотри на открывшуюся 🛠 Админ-панель с секретным кодом.

---

🔧 **🔴 НАЙДИ / СЛОМАЙ.**

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
«админом», ничего не взламывая - просто поменял отметку в браузере, которой сайт
**зря поверил**.

**4. 🧪 Проверь обратное - и убедись, что дело именно в отметке.** На вкладке
**Console** выполни \`localStorage.setItem('is_admin', 'false')\`, нажми **▶ Запустить**
и снова открой **Вход** - панель **исчезла**. Потом верни
\`localStorage.setItem('is_admin', 'true')\`, **▶ Запустить** - панель опять на месте. Ты
своими руками включаешь и выключаешь «права админа», хотя настоящий хозяин сайта об
этом даже не знает.

🤔 **Подумай:** как сайт должен был решать, показывать панель или нет, чтобы этот трюк
не работал? 👉 Проверку «ты админ?» должен делать **сервер** после настоящего входа, а
секретного кода вообще не должно быть в коде, который скачивает браузер. Это мы и
починим на следующем шаге.`,
      hintMd: `Проще всего поставить отметку командой: F12 → вкладка Console → \`localStorage.setItem('is_admin','true')\` → Enter. (Можно и вручную: Application → Local Storage, двойной клик по пустой строке Key/Value.) Секрет \`MEGA-2026-ADMIN\` нужно убрать из index.html.`,
      doneMd: `✅ **Готово, когда** после подмены \`is_admin\` на странице Вход появилась 🛠 Админ-панель с кодом \`MEGA-2026-ADMIN\`.`,
    },
    {
      manual: true,
      title: `🛂 Дыра №5: убери секрет с клиента - 🟢 почини`,
      goalMd: `**Цель:** убрать секрет из кода, который скачивает браузер. Решать, кто админ, должен сервер.`,
      actionMd: `Почини (🟢) и проверь (✅).`,
      taskMd: `📋 **Пункты действия** (что сделать в этом шаге):
1. В index.html найди блок \`admin-panel\`.
2. Замени его на пустой \`<div id="admin-panel" class="admin-panel" hidden></div>\`.
3. Нажми ▶ Запустить.
4. Зайди на Вход - секретного кода больше нет, даже при \`is_admin = true\`.

---

🔧 **🟢 ПОЧИНИ.** Раз браузеру доверять нельзя - **секрета вообще не должно быть в
коде, который скачивает браузер**. Уберём его.

**Действие 1. Скопируй новый код.** Ниже в рамке - пустая версия админ-панели, секрета
внутри у неё уже нет. Выдели эту строку мышкой целиком и нажми **Ctrl+C**. Делай это
**до** удаления старого блока: пока старый код на месте, его легко найти.

\`\`\`
<div id="admin-panel" class="admin-panel" hidden></div>
\`\`\`

**Действие 2. Найди старый блок.** Щёлкни вкладку **index.html**, нажми **Ctrl+F**,
найди \`admin-panel\`. (Это сочетание встречается в тексте урока несколько раз, поэтому
нажимай **Enter** до тех пор, пока подсветка не перепрыгнет с текста задания на нужную
строку в коде.) Ты увидишь блок из трёх строк: открытие
\`<div id="admin-panel" class="admin-panel" hidden>\`, строку с секретом
\`MEGA-2026-ADMIN\` и закрытие \`</div>\`.

**Действие 3. Выдели его целиком и удали.** Щёлкни в начало строки с
\`<div id="admin-panel"\`, зажми **Shift** и щёлкни сразу после \`</div>\` - весь блок
подсветится синим. Нажми **Delete**.

**Действие 4. Вставь скопированное.** Курсор уже на нужном месте - нажми **Ctrl+V**,
затем **▶ Запустить**.

💡 **Запомни:** решать, показывать админ-панель или нет, должен **сервер** - после
настоящей проверки прав. Секретные данные нельзя класть в код, который скачивает
браузер: кто угодно может его открыть и прочитать.

---

🔧 **✅ ПРОВЕРЬ.** Отметка \`is_admin\` всё ещё \`true\` (мы её не убирали) - но зайди на
страницу **Вход**: секретного кода \`MEGA-2026-ADMIN\` там больше **нет**, потому что
его вообще не осталось в коде. Подмена отметки теперь ничего не открывает. 🛡️`,
      hintMd: `Секрет \`MEGA-2026-ADMIN\` нужно убрать из index.html: если его нет в коде - показывать нечего, и подмена отметки бесполезна.`,
      doneMd: `✅ **Готово, когда** даже при \`is_admin = true\` секретный код \`MEGA-2026-ADMIN\` на странице больше не появляется.`,
    },
    {
      manual: true,
      title: `🔗 Отражённый XSS из ссылки - найди, почини, проверь`,
      goalMd: `**Цель:** разобрать **отражённый XSS** - когда вредоносный код приходит прямо из **адреса ссылки** (а не хранится на сайте).

**Где дыра:** приветствие из ссылки вида \`#welcome=Имя\` показывается на главной через \`innerHTML\`. Пройдём полный цикл: 🔴 найди → 🟢 почини → ✅ проверь.`,
      actionMd: `Весь цикл в одном шаге: 🔴 сломай → 🟢 почини → ✅ проверь.`,
      taskMd: `📋 **Пункты действия** (что сделать в этом шаге):
1. 🔴 Открой сайт в отдельной вкладке и допиши в адрес \`#welcome=<img src=x onerror=alert('Взлом!')>\`.
2. 🟢 Почини в main.js функцию \`showWelcome\` (innerHTML → textContent).
3. ✅ Повтори - окошко больше не выскакивает, а обычное имя приветствует.

---

🔧 **🔴 НАЙДИ / СЛОМАЙ.**

Иногда вредный код прячут **прямо в ссылке**. Наш сайт показывает приветствие из
адреса: если после \`#\` написать \`welcome=Имя\`, на главной появится «С возвращением,
Имя!». Беда в том, что это имя сайт вставляет через \`innerHTML\`.

**1. Открой сайт в отдельной вкладке.** В жизни злоумышленник прислал бы жертве
готовую ссылку. Сделаем так же: вверху, над колонками, щёлкни кнопку **🔗 Открыть в
новой вкладке** - сайт откроется отдельной вкладкой, во весь экран.

**2. Допиши вредную «ссылку» в адрес.** Перейди в эту вкладку, щёлкни по **адресной
строке**, нажми **End** (курсор встанет в конец) и допиши в самый конец:
\`#welcome=<img src=x onerror=alert('Взлом!')>\`
Нажми **Enter**. 💥 Выскочило окошко «Взлом!» - код пришёл **прямо из адреса** и
выполнился. Представь: злоумышленник кидает такую ссылку в чат, жертва просто щёлкает
по ней - и его код уже работает на сайте от её имени. Нажми **OK**.

ℹ️ **Мелочи, которые важно знать.** После Enter браузер сам заменит \`<\`, \`>\` и
пробелы на «коды» вида \`%3C\`, \`%3E\`, \`%20\` - это нормально. И вписывать надо именно в
адрес **этой отдельной вкладки**: к адресу платформы (\`урок_2.html\`, где три колонки)
дописывать бесполезно - там сайт в защищённой песочнице.

**Запасной способ - через консоль.** Если со вкладкой возиться не хочется, ту же
«ссылку» доставит команда: **F12** → вкладка **Console** → строка ввода внизу
(Ctrl+V → Enter):
\`document.querySelector("iframe").contentWindow.location.hash = "welcome=<img src=x onerror=alert('Взлом!')>"\`

⚠️ Команда длинная не просто так. Консоль DevTools выполняет команды в той странице,
где ты её открыл, - то есть **в платформе** (три колонки), а твой сайт живёт **внутри**
неё, в отдельном окошке. Короткое \`location.hash = …\` поменяло бы адрес платформы, и
ничего бы не произошло. Начало команды \`document.querySelector("iframe").contentWindow\`
как раз означает «возьми окошко с сайтом» - и уже ему меняет адрес.

---

🔧 **🟢 ПОЧИНИ (main.js).** Снова лечится сменой \`innerHTML\` на \`textContent\`.
Скопируй код из рамки ниже (**Ctrl+C** - до удаления старого). Нажми **Ctrl+F**,
напечатай \`showWelcome\`, жми **Enter**, пока подсветка не перепрыгнет в код. Выдели
функцию **вместе с двумя строчками-комментариями над ней** (щелчок в начало строки
\`// Приветствие из адреса…\`, Shift+щелчок после закрывающей \`}\` функции), нажми
**Delete** и сразу **Ctrl+V**:

\`\`\`
// Приветствие из адреса: ссылка вида #welcome=Имя показывает «С возвращением».
// ✅ имя выводится как ТЕКСТ - код из адреса больше не исполняется.
function showWelcome(name) {
	const box = document.getElementById("welcome-box");
	if (!box) return;
	box.hidden = false;
	box.textContent = "С возвращением, " + name + "!";   // безопасно
}
\`\`\`

💡 Комментарии (строчки, которые начинаются с \`//\`) браузер не выполняет - это заметки
для человека. Мы меняем их вместе с кодом, чтобы старая заметка «вставляется через
innerHTML - отражённый XSS» не пугала того, кто откроет файл после починки.

Нажми **▶ Запустить**.

---

🔧 **✅ ПРОВЕРЬ.** Снова открой ту вкладку с сайтом и допиши в адрес ту же ловушку
\`#welcome=<img src=x onerror=alert('Взлом!')>\` (или выполни в консоли ту же длинную
команду \`document.querySelector("iframe").contentWindow.location.hash = …\`).
Теперь окошко **не выскакивает** - код показывается как текст. А обычное имя
(\`#welcome=Аня\`) по-прежнему приветствует. Дыра закрыта! 🛡️`,
      hintMd: `Сломать: «🔗 Открыть в новой вкладке» → в адрес ТОЙ вкладки допиши в конец \`#welcome=<img src=x onerror=alert('Взлом!')>\` → Enter (браузер закодирует символы - это норма). Запасной способ - через F12 → Console, но обязательно с началом \`document.querySelector("iframe").contentWindow.\`: консоль работает в платформе, а сайт - в окошке внутри неё. Починить: функцию \`showWelcome\` - \`innerHTML\` → \`textContent\`.`,
      doneMd: `✅ **Готово, когда** ловушка \`#welcome=<img …>\` (в адресе отдельной вкладки или командой в консоли) до починки вызывала \`alert\`, а после починки показывается как текст; обычное имя \`#welcome=Аня\` приветствует.`,
    },
    {
      manual: true,
      title: `🚩 Бонус: собери спрятанные флаги`,
      goalMd: `**Цель:** потренировать «насмотренность» хакера - секреты прячут в разных местах клиента, и все они находятся.

**Флаг** - это строка вида \`FLAG{...}\`. На твоём сайте их спрятали **три**.`,
      actionMd: `Найди все три флага, пользуясь DevTools и кодом. В конце - **✓ Я выполнил этот шаг**.`,
      taskMd: `📋 **Пункты действия** (что сделать в этом шаге):
1. Флаг 1 - Ctrl+F по \`FLAG\` в index.html (комментарий у подвала).
2. Флаг 2 - Ctrl+F по \`FLAG\` в main.js (\`var hiddenFlag\`).
3. Флаг 3 - F12 → Application → Local Storage, ключ \`secret_flag\`.

---

🔧 **Найди три флага** - это секретные строчки вида \`FLAG{...}\`. Все три уже спрятаны
в твоём сайте, в разных местах. Так хакеры тренируют свою «насмотренность».

**🚩 Флаг 1 - в комментарии HTML.** Щёлкни вкладку **index.html**, нажми **Ctrl+F**,
напечатай \`FLAG\`, нажми **Enter**. (Это сочетание встречается в тексте урока несколько
раз - к тому же поиск не различает большие и маленькие буквы, - поэтому нажимай **Enter**
до тех пор, пока подсветка не перепрыгнет с текста задания на нужную строку в коде.)
Браузер подсветит строку-комментарий
\`<!-- FLAG{…} -->\` рядом с подвалом сайта (\`<footer>\`). Вот первый!

**🚩 Флаг 2 - в коде JavaScript.** Щёлкни вкладку **main.js**, нажми **Ctrl+F**, снова
напечатай \`FLAG\`. (Это сочетание снова встречается в тексте урока несколько раз,
поэтому нажимай **Enter** до тех пор, пока подсветка не перепрыгнет с текста задания
на нужную строку в коде.) Найдёшь строку \`var hiddenFlag = "FLAG{…}"\`. Второй!

**🚩 Флаг 3 - в «кладовке» браузера.** Нажми **F12**, щёлкни вкладку **Application**,
слева выбери **Local Storage**, щёлкни адрес сайта. В таблице найди ключ
\`secret_flag\` - рядом будет третий флаг. (Можно и командой: на вкладке **Console**
выполни \`localStorage.getItem('secret_flag')\`.)

**🚩 А есть ли четвёртый?** Проверь себя как настоящий охотник за флагами. Открой
**F12 → Console** и выполни команду, которая выведет **имена всех** ключей «кладовки»:
\`console.log(Object.keys(localStorage).join("\\n"))\`
Пробеги глазами список: нет ли там ещё какого-нибудь подозрительного имени со словом
\`flag\`, \`secret\`, \`token\` или \`admin\`?

ℹ️ Несколько имён в списке - не от сайта, а от **самой платформы** (например,
\`undoHistory\` - история твоих отмен Ctrl+Z, \`previewDoc\` - копия страницы для вкладки
просмотра, \`savedLessonCodeSecurity\` - твой код урока). Они делят «кладовку» с сайтом,
потому что живут в одном браузере. Хакер на настоящем сайте увидел бы только ключи
самого сайта. Кстати, содержимое любого ключа смотрят так:
\`localStorage.getItem("secret_flag")\`.

В нашем учебном сайте флагов ровно три, но
этой командой хакеры первым делом «просвечивают» любой сайт - вдруг разработчик
случайно оставил там что-то ещё.

🏁 Нашёл все три (а лишнего не нашёл)? Тогда ты понял самое главное: **всё, что попало
в браузер - код, комментарии, память - может прочитать кто угодно**. Поэтому секретам
там не место. Жми **✓ Я выполнил этот шаг**.`,
      hintMd: `Ctrl+F по коду ищет слово \`FLAG\`. В Local Storage флаг лежит под ключом \`secret_flag\`. Эти флаги учебные - они показывают, что localStorage, HTML-комментарии и JS-код доступны любому посетителю.`,
      doneMd: `✅ **Готово, когда** ты нашёл все три флага: в HTML-комментарии, в переменной JS и в Local Storage.`,
    },
    {
      manual: true,
      title: `🏁 Финал`,
      goalMd: `**Цель:** подвести итог и понять, куда расти дальше.`,
      actionMd: `Прочитай итог под шагами (он раскроется) и нажми **✓ Я выполнил этот шаг**.`,
      taskMd: `📋 **Пункты действия** (что сделать в этом шаге):
1. Прочитай список, что ты теперь умеешь.
2. Прокрути вниз - там итог урока и идеи, куда расти.
3. Нажми ✓ Я выполнил этот шаг.

---

🔧 **Ты справился!** Ты прошёл путь от **разработчика** (собрал многостраничный
магазин) до **этичного хакера** (нашёл и починил в нём дыры).

Что ты теперь умеешь:
- объяснять и чинить **XSS** (\`innerHTML\` → \`textContent\`) в комментариях, именах и
  ссылках;
- понимать, почему **секреты, пароли и проверку прав** нельзя держать на клиенте;
- объяснять, зачем пароли **хэшируют** и почему они должны быть длинными;
- показывать **брутфорс** слабого пароля;
- пользоваться **DevTools** (Elements / Console / Application).

Прокрути вниз - там итог урока и идеи, куда двигаться дальше. Жми
**✓ Я выполнил этот шаг**! 🎉`,
      hintMd: `Это последний шаг. После него раскроется финальное поздравление с идеями для дальнейшего обучения.`,
      doneMd: `✅ **Готово!** Ты - этичный хакер. Не забывай: ломаем только своё и только с разрешения. 🔐`,
    },
  ],
};

// Урок 2 хранит прогресс/историю ОТДЕЛЬНО от урока 1 (свой суффикс ключей).
const STORAGE_KEY = "savedLessonCodeSecurity";
const PREVIEW_DOC_KEY = "previewDoc"; // вкладку просмотра делим - preview.html читает этот ключ
const LESSON_KEY_SUFFIX = "Security";


// ============================================================
// АДМИН-РЕЖИМ урока 2: пройти любой шаг одной кнопкой.
// Урок 2 не вставляет новые блоки, а ПРАВИТ стартовый (уязвимый) код, поэтому для
// каждого шага храним список правок. «Заполнить по шаг N» = стартовый код + правки
// шагов 1..N. Движок и кнопка - в dev-cheat.js (общий модуль с уроком 1).
// ============================================================
// Промежуточная версия (шаг 3): текст комментария уже безопасен, имя автора пока
// через innerHTML - его чинит шаг 7 (replaceStr innerHTML→textContent).
const FIX_RENDER_COMMENTS_TEXT = `function renderComments(id) {
	const box = document.getElementById("pd-comments");
	const list = loadComments(id);
	box.innerHTML = "";                       // очистили
	list.forEach(function (c) {
		const div = document.createElement("div");
		div.className = "cmt";
		const author = document.createElement("span");
		author.className = "cmt-author";
		author.textContent = c.author + ":";  // безопасно: имя автора как ТЕКСТ
		div.appendChild(author);
		div.appendChild(document.createTextNode(" " + c.text)); // безопасно: это ТЕКСТ
		box.appendChild(div);
	});
}`;

const FIX_RENDER_USERBOX = `function renderUserBox() {
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
}`;

const FIX_LOGIN_CLEAN = `loginBtn.addEventListener("click", function () {
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
}`;

const FIX_GETUSERS_HASH = `function getUsers() {
	return JSON.parse(localStorage.getItem("users") || "[]");
}

async function hashPassword(str) {
	const data = new TextEncoder().encode(str);
	const buf = await crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(buf))
		.map(function (b) { return b.toString(16).padStart(2, "0"); })
		.join("");
}`;

const FIX_REG_HASH = `regBtn.addEventListener("click", async function () {
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
	users.push({ login: name, passwordHash: await hashPassword(pass) });
	localStorage.setItem("users", JSON.stringify(users));
	msg.textContent = "Готово! Теперь войди на странице «Вход».";
}`;

const FIX_REG_HASH_LEN = `regBtn.addEventListener("click", async function () {
	const name = document.getElementById("reg-name").value;
	const pass = document.getElementById("reg-pass").value;
	const pass2 = document.getElementById("reg-pass2").value;
	const msg = document.getElementById("reg-msg");
	if (!name || !pass) { msg.textContent = "Заполни логин и пароль"; return; }
	if (pass !== pass2) { msg.textContent = "Пароли не совпадают"; return; }
	if (pass.length < 8) {
		msg.textContent = "Пароль слишком короткий - минимум 8 символов";
		return;
	}
	const users = getUsers();
	if (users.some(function (u) { return u.login === name; })) {
		msg.textContent = "Такой логин уже занят"; return;
	}
	users.push({ login: name, passwordHash: await hashPassword(pass) });
	localStorage.setItem("users", JSON.stringify(users));
	msg.textContent = "Готово! Теперь войди на странице «Вход».";
}`;

const FIX_LOGIN_HASH = `loginBtn.addEventListener("click", async function () {
	const name = document.getElementById("login-name").value;
	const pass = document.getElementById("login-pass").value;
	const hash = await hashPassword(pass);
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
}`;

const FIX_SHOWWELCOME = `function showWelcome(name) {
	const box = document.getElementById("welcome-box");
	if (!box) return;
	box.hidden = false;
	box.textContent = "С возвращением, " + name + "!";
}`;

// Правки привязаны к НОВЫМ (раздроблённым) шагам: каждая - к своему 🟢-шагу.
// «Пройти по шаг N» применяет стартовый код + правки шагов 0..N кумулятивно.
lesson.adminFixMode = true;
lesson.stepFixes = [
	/*  0. Инструменты 1/2                 */ [],
	/*  1. Инструменты 2/2 (DevTools)      */ [],
	/*  2. XSS (коммент+автор+имя) 🔴🟢✅   */ [
		{ file: "js", op: "replaceBlock", anchor: "function renderComments(", code: FIX_RENDER_COMMENTS_TEXT },
		{ file: "js", op: "replaceBlock", anchor: "function renderUserBox(", code: FIX_RENDER_USERBOX },
		{ file: "js", op: "replaceStr", find: 'loginMsg.innerHTML = "Привет, " + name + "!";', replace: 'loginMsg.textContent = "Привет, " + name + "!";' },
	],
	/*  3. Дыра №2 пароль+обход 🔴          */ [],
	/*  4. Дыра №2 пароль+обход 🟢          */ [
		{ file: "html", op: "removeLine", find: "TODO для входа в админку" },
		{ file: "js", op: "removeLine", find: 'const ADMIN_LOGIN = "admin";' },
		{ file: "js", op: "removeLine", find: 'const ADMIN_PASS = "megapass123";' },
		{ file: "js", op: "replaceBlock", anchor: 'loginBtn.addEventListener("click"', code: FIX_LOGIN_CLEAN },
	],
	/*  5. Дыра №3 открытый текст 🔴        */ [],
	/*  6. Дыра №3 хэширование 🟢           */ [
		{ file: "js", op: "replaceBlock", anchor: "function getUsers(", code: FIX_GETUSERS_HASH },
		{ file: "js", op: "replaceBlock", anchor: 'regBtn.addEventListener("click"', code: FIX_REG_HASH },
		{ file: "js", op: "replaceBlock", anchor: 'loginBtn.addEventListener("click"', code: FIX_LOGIN_HASH },
	],
	/*  7. Дыра №4 брутфорс 🔴              */ [],
	/*  8. Дыра №4 длина пароля 🟢          */ [
		{ file: "js", op: "replaceBlock", anchor: 'regBtn.addEventListener("click"', code: FIX_REG_HASH_LEN },
	],
	/*  9. Дыра №5 фальшивый админ 🔴       */ [],
	/* 10. Дыра №5 убрать секрет 🟢         */ [
		{ file: "html", op: "replaceTag", anchor: '<div id="admin-panel"', code: '<div id="admin-panel" class="admin-panel" hidden></div>' },
	],
	/* 11. Отражённый XSS 🔴🟢✅            */ [
		{ file: "js", op: "replaceStr",
		  find: "// ⚠ имя берётся из адреса и вставляется через innerHTML - отражённый XSS (урок 2).",
		  replace: "// ✅ имя выводится как ТЕКСТ - код из адреса больше не исполняется." },
		{ file: "js", op: "replaceBlock", anchor: "function showWelcome(", code: FIX_SHOWWELCOME },
	],
	/* 12. Флаги                           */ [],
	/* 13. Финал                           */ [],
];


// ============================================================
// АВТО-ПРОВЕРКА ШАГОВ УРОКА 2 (движок - js/lesson-render.js, lesson.stepChecks).
//
// Найдено при прохождении урока «глазами восьмиклассника» (2026-08-19): все 14
// шагов ручные, поэтому урок проходился 14 кликами по зелёной кнопке - ни одна
// дыра не была закрыта, а финальное поздравление всё равно показывалось.
// Теперь у 🟢-шагов (где что-то чинится в коде) есть проверки: кнопка «✓ Я
// выполнил этот шаг» ждёт, пока уязвимая строка не исчезнет из кода, а
// безопасная - не появится. Шаги-инструменты и 🔴-шаги (там только ломаем,
// в коде ничего не меняется) проверок не имеют - кнопка активна сразу.
//
// Проверки «мягкие»: смотрим на суть (пропала ли опасная строка, появился ли
// безопасный вывод), а не на совпадение символ-в-символ - ребёнок может писать
// код немного по-своему.
// ============================================================

function t2norm(s) {
  return String(s || "").replace(/\s+/g, " ");
}

function t2has(file, sub) {
  return function (code) { return t2norm(code[file]).indexOf(t2norm(sub)) !== -1; };
}

function t2hasNo(file, sub) {
  return function (code) { return t2norm(code[file]).indexOf(t2norm(sub)) === -1; };
}

function t2all() {
  const tests = Array.prototype.slice.call(arguments);
  return function (code) { return tests.every(function (t) { return t(code); }); };
}

function t2any() {
  const tests = Array.prototype.slice.call(arguments);
  return function (code) { return tests.some(function (t) { return t(code); }); };
}

lesson.stepChecks = [
	/*  0. Инструменты 1/2            */ [],
	/*  1. Инструменты 2/2 (DevTools) */ [],
	/*  2. XSS: коммент + автор + имя */ [
		{ label: "комментарии больше не собираются строкой HTML (ушла сборка '<div class=\"cmt\">' + c.author)",
		  test: t2hasNo("js", "'<div class=\"cmt\"><span class=\"cmt-author\">' + c.author") },
		{ label: "текст комментария и имя автора выводятся как ТЕКСТ (textContent / createTextNode)",
		  test: t2all(t2has("js", "author.textContent"), t2has("js", "createTextNode")) },
		{ label: "имя в уголке пользователя больше не вставляется через innerHTML",
		  test: t2hasNo("js", 'box.innerHTML = "👤 " + userName') },
		{ label: "приветствие после входа выводится через textContent",
		  test: t2all(t2has("js", "loginMsg.textContent"), t2hasNo("js", "loginMsg.innerHTML")) },
	],
	/*  3. Дыра №2 пароль в коде 🔴   */ [],
	/*  4. Дыра №2 пароль в коде 🟢   */ [
		{ label: "мастер-пароль убран из main.js (нет ADMIN_PASS = \"megapass123\")",
		  test: t2all(t2hasNo("js", 'const ADMIN_PASS = "megapass123"'), t2hasNo("js", "megapass123")) },
		{ label: "вход больше не пускает по логину/паролю из кода (нет проверки ADMIN_LOGIN)",
		  test: t2hasNo("js", "ADMIN_LOGIN") },
		{ label: "подсказка с паролем убрана из index.html",
		  test: t2hasNo("html", "TODO для входа в админку") },
	],
	/*  5. Дыра №3 открытые пароли 🔴 */ [],
	/*  6. Дыра №3 хэширование 🟢     */ [
		{ label: "появилась функция хэширования пароля (hashPassword)",
		  test: t2has("js", "hashPassword") },
		{ label: "при регистрации сохраняется хэш, а не сам пароль (passwordHash)",
		  test: t2all(t2has("js", "passwordHash"), t2hasNo("js", "users.push({ login: name, password: pass })")) },
		{ label: "вход сравнивает хэши, а не пароли",
		  test: t2any(t2has("js", "u.passwordHash === hash"), t2has("js", "u.passwordHash == hash")) },
	],
	/*  7. Дыра №4 брутфорс 🔴        */ [],
	/*  8. Дыра №4 длина пароля 🟢    */ [
		{ label: "при регистрации короткие пароли отклоняются (pass.length < 8)",
		  test: t2any(t2has("js", "pass.length < 8"), t2has("js", "pass.length >= 8")) },
	],
	/*  9. Дыра №5 фальшивый админ 🔴 */ [],
	/* 10. Дыра №5 убрать секрет 🟢   */ [
		{ label: "секретный код админа убран из index.html (нет MEGA-2026-ADMIN)",
		  test: t2hasNo("html", "MEGA-2026-ADMIN") },
	],
	/* 11. Отражённый XSS 🔴🟢✅      */ [
		{ label: "приветствие из адреса выводится как текст (нет box.innerHTML = \"С возвращением\")",
		  test: t2hasNo("js", 'box.innerHTML = "С возвращением, "') },
		{ label: "в showWelcome используется textContent",
		  test: t2has("js", 'box.textContent = "С возвращением, "') },
	],
	/* 12. Флаги                      */ [],
	/* 13. Финал                      */ [],
];
