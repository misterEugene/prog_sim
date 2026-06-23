// ===== Корзина =====
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
}