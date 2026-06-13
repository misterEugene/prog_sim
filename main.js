// ============================================================
// Урок программирования — единственный предустановленный урок.
// Локально, без сервера и без внешних библиотек.
// ============================================================

// ---- Данные урока (источник истины) ----
// Многошаговый урок: расширяем объект `lesson` массивом `steps[]`. Каждый шаг —
// учебная цель + готовые сниппеты, которые кнопка «Вставить блок» дописывает в
// нужные редакторы. Картинки товаров — эмодзи (полностью локально, без CDN).
const lesson = {
  title: "Урок: Собери магазин «МегаМагазин»",

  introMd: `# 🛍️ Собери магазин «МегаМагазин»

Сегодня ты — **веб-разработчик**! Шаг за шагом ты соберёшь интернет-магазин
техники **МегаМагазин**: с шапкой, баннером, товарами, отзывами и работающей
корзиной. Делай всё **точно по инструкции** — тогда магазин получится правильным.

## Шаг 0 — создай каркас сайта (один раз)

Открой вкладку **index.html**, напечатай **!** и нажми клавишу **Tab** — появится
основа страницы (теги \`html\`, \`head\`, \`body\`). Все блоки вставляются **внутрь** неё.

📌 **Тег** — это слово в угловых скобках, например \`<header>\`. Из тегов собран
любой сайт.

## На каждом шаге делай 5 действий по порядку

- 1️⃣ **Вставь блок** кнопками: **HTML** уходит в index.html, **CSS** — в style.css.
- 2️⃣ Открой код и найди жёлтые метки **[ВПИШИ …]** — и в HTML, и в CSS.
- 3️⃣ **Замени каждую метку точно так, как написано в задании** (стирай метку
  целиком, вместе со скобками **[** и **]**).
- 4️⃣ **Добавь тег через Emmet:** найди строку с комментарием \`<!-- 👇 EMMET … -->\`,
  щёлкни на пустую строку под ним, **впиши код из задания и нажми Tab**.
- 5️⃣ Нажми **▶ Запустить** — и увидишь, как магазин растёт!

💡 Если после запуска на сайте видна надпись **[ВПИШИ …]** — значит, там ты ещё не
вписал текст. Ошибся? Нажми **Ctrl+Z** — действие отменится. Поехали! 👇`,

  outroMd: `# 🎉 Поздравляем, ты собрал «МегаМагазин»!

Ты побывал настоящим **веб-разработчиком** и научился:

- добавлять разметку **HTML** (шапка, баннер, карточки, отзывы, подвал);
- вписывать теги через **Emmet** (короткий код + Tab);
- настраивать **CSS** (цвета, размеры, скругления);
- оживлять страницу на **JavaScript** (рабочая кнопка «В корзину»).

Нажми **⬇ Скачать проект** вверху — и твой магазин сохранится в файл. Покажи друзьям!`,

  hint: "Делай по порядку: вставь блок кнопками (HTML, CSS) → впиши значения вместо ВСЕХ жёлтых меток [ВПИШИ …] точно как в задании (и в HTML, и в CSS) → добавь тег через Emmet (впиши код и нажми Tab) → нажми ▶ Запустить.",

  initialHTML: ``, // пусто — сайт «вырастает» из вставляемых блоков
  initialCSS: ``,
  initialJS: ``,

  steps: [
    {
      // ----- Шаг 1: Шапка -----
      title: "Шапка магазина",
      time: "10 мин",
      goalMd:
        "**Цель:** добавить верхнюю часть сайта — *шапку*.\n\n**Новый термин:** `<header>` — это HTML-тег для «шапки» страницы, где живут логотип и меню.",
      actionMd:
        "Нажми обе кнопки: **HTML** добавит разметку шапки, **CSS** — её стили.",
      snippets: {
        html: `<!-- Шапка магазина: логотип, меню и корзина -->
<header class="site-header" id="home">
	<div class="logo">🛍️ [ВПИШИ НАЗВАНИЕ МАГАЗИНА]</div>
	<nav class="menu">
		<a href="#home">Главная</a>
		<a href="#products">Товары</a>
		<a href="#contacts">Контакты</a>
	</nav>
	<div class="cart">🛒 Корзина: <span id="cart-count">0</span></div>
	<!-- 👇 EMMET: щёлкни на пустую строку ниже, впиши код из задания и нажми Tab -->
	
</header>`,
        css: `/* Стили шапки */
.site-header {
	display: flex;                 /* всё в одну строку */
	align-items: center;
	justify-content: space-between;
	background: [ВПИШИ ЦВЕТ];      /* цвет фона шапки */
	color: #fff;
	padding: 16px 24px;
}
.logo { font-size: [ВПИШИ РАЗМЕР]; font-weight: bold; }
.menu a { color: #fff; margin-left: 16px; text-decoration: none; }
.menu a:hover { text-decoration: underline; }
.cart { font-weight: bold; }
.promo { margin: 0; font-size: 14px; }`,
      },
      taskMd: `🔧 **Сделай по порядку.**

**1. Название магазина (index.html).** Найди строку:
\`<div class="logo">🛍️ [ВПИШИ НАЗВАНИЕ МАГАЗИНА]</div>\`
и замени \`[ВПИШИ НАЗВАНИЕ МАГАЗИНА]\` на текст: **МегаМагазин**

**2. Цвет шапки (style.css).** Найди строку \`background: [ВПИШИ ЦВЕТ];\`
и замени \`[ВПИШИ ЦВЕТ]\` на: **#5b3df5**

**3. Размер логотипа (style.css).** Найди строку \`.logo { font-size: [ВПИШИ РАЗМЕР]; ... }\`
и замени \`[ВПИШИ РАЗМЕР]\` на: **24px**

**4. Добавь тег через Emmet (index.html).** Найди строку \`<!-- 👇 EMMET … -->\`,
щёлкни на пустую строку под ним, впиши этот код и нажми **Tab**:
\`p.promo{🔥 Бесплатная доставка от 1000 рублей}\``,
      hintMd:
        "Метку стирай полностью, вместе со скобками `[` и `]`. Цвет вписывай ровно как в задании: `#5b3df5`. Размер — `24px` (число и буквы px без пробела).",
      doneMd:
        "✅ **Готово, когда** после ▶ Запустить вверху виден логотип «🛍️ МегаМагазин», меню, «🛒 Корзина: 0» и строчка про бесплатную доставку (нигде нет [ВПИШИ …]).",
    },
    {
      // ----- Шаг 2: Баннер -----
      title: "Баннер со скидкой",
      time: "10 мин",
      goalMd:
        "**Цель:** добавить большой яркий баннер с заголовком и кнопкой.\n\n**Новый термин:** `<button>` — это кнопка, на которую можно нажимать.",
      actionMd:
        "Нажми обе кнопки: **HTML** добавит баннер, **CSS** — его стили.",
      snippets: {
        html: `<!-- Баннер: главный заголовок и кнопка -->
<section class="banner">
	<h1>[ВПИШИ ЗАГОЛОВОК СКИДКИ]</h1>
	<p>[ВПИШИ ПОДЗАГОЛОВОК]</p>
	<button class="banner-btn">[ВПИШИ ТЕКСТ КНОПКИ]</button>
	<!-- 👇 EMMET: щёлкни на пустую строку ниже, впиши код из задания и нажми Tab -->
	
</section>`,
        css: `/* Стили баннера */
.banner {
	text-align: center;
	padding: 60px 20px;
	background: linear-gradient(135deg, #ffd86b, #ff8a5b);
	color: #3a2a00;
}
.banner h1 { font-size: [ВПИШИ РАЗМЕР]; margin: 0 0 10px; }
.banner-btn {
	background: [ВПИШИ ЦВЕТ]; color: #fff; border: none;
	padding: 14px 28px; font-size: 18px; border-radius: 8px; cursor: pointer;
}
.banner-btn:hover { opacity: 0.9; }
.banner-note { margin: 12px 0 0; font-weight: bold; }`,
      },
      taskMd: `🔧 **Сделай по порядку.**

**1. Заголовок (index.html).** Замени \`[ВПИШИ ЗАГОЛОВОК СКИДКИ]\` на: **Скидки до 50% на технику!**

**2. Подзаголовок (index.html).** Замени \`[ВПИШИ ПОДЗАГОЛОВОК]\` на: **Только до конца недели — успей купить!**

**3. Текст кнопки (index.html).** Замени \`[ВПИШИ ТЕКСТ КНОПКИ]\` на: **Купить сейчас**

**4. Размер заголовка (style.css).** Замени \`[ВПИШИ РАЗМЕР]\` на: **44px**

**5. Цвет кнопки (style.css).** Замени \`[ВПИШИ ЦВЕТ]\` на: **#ff5722**

**6. Emmet (index.html).** На пустую строку под \`<!-- 👇 EMMET … -->\` впиши и нажми **Tab**:
\`p.banner-note{⏰ Успей купить — осталось мало времени!}\``,
      hintMd:
        "Заголовок — между `<h1>` и `</h1>`; текст кнопки — между `<button …>` и `</button>`. Цвет и размер вписывай точно: `#ff5722`, `44px`.",
      doneMd:
        "✅ **Готово, когда** виден баннер с заголовком «Скидки до 50% на технику!», подзаголовком, оранжевой кнопкой «Купить сейчас» и строчкой ⏰.",
    },
    {
      // ----- Шаг 3: Карточки товаров -----
      title: "Карточки товаров",
      time: "20 мин",
      goalMd:
        "**Цель:** показать товары сеткой — *каждый товар в своей карточке*.\n\n**Новый термин:** `class` — «ярлык» элемента, по которому CSS его украшает. У всех карточек класс `card`.",
      actionMd:
        "Нажми обе кнопки: **HTML** добавит четыре карточки, **CSS** — их стили.",
      snippets: {
        html: `<!-- Сетка товаров: четыре карточки -->
<section class="products" id="products">
	<div class="card">
		<div class="card-img">[ВПИШИ ЭМОДЗИ]</div>
		<h3 class="card-title">[ВПИШИ НАЗВАНИЕ]</h3>
		<p class="card-price">[ВПИШИ ЦЕНУ] ₽</p>
		<button class="add-to-cart">В корзину</button>
	</div>
	<div class="card">
		<div class="card-img">[ВПИШИ ЭМОДЗИ]</div>
		<h3 class="card-title">[ВПИШИ НАЗВАНИЕ]</h3>
		<p class="card-price">[ВПИШИ ЦЕНУ] ₽</p>
		<button class="add-to-cart">В корзину</button>
	</div>
	<div class="card">
		<div class="card-img">[ВПИШИ ЭМОДЗИ]</div>
		<h3 class="card-title">[ВПИШИ НАЗВАНИЕ]</h3>
		<p class="card-price">[ВПИШИ ЦЕНУ] ₽</p>
		<button class="add-to-cart">В корзину</button>
	</div>
	<div class="card">
		<div class="card-img">[ВПИШИ ЭМОДЗИ]</div>
		<h3 class="card-title">[ВПИШИ НАЗВАНИЕ]</h3>
		<p class="card-price">[ВПИШИ ЦЕНУ] ₽</p>
		<button class="add-to-cart">В корзину</button>
	</div>
	<!-- 👇 EMMET: щёлкни на пустую строку ниже, впиши код из задания и нажми Tab -->
	
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
	border-radius: [ВПИШИ РАЗМЕР];
	padding: 16px;
	text-align: center;
	background: #fff;
}
.card-img { font-size: 64px; }
.card-title { margin: 10px 0 4px; font-size: 18px; }
.card-price { color: [ВПИШИ ЦВЕТ]; font-weight: bold; font-size: 18px; margin: 0 0 12px; }
.add-to-cart {
	background: #5b3df5; color: #fff; border: none;
	padding: 10px 16px; border-radius: 6px; cursor: pointer; width: 100%;
}
.add-to-cart:hover { background: #4a2fd0; }`,
      },
      taskMd: `🔧 **Заполни 4 карточки точно так** (в каждой — эмодзи, название, цена):

- Карточка 1: эмодзи **📱**, название **Смартфон**, цена **19990**
- Карточка 2: эмодзи **🎧**, название **Наушники**, цена **2490**
- Карточка 3: эмодзи **⌚**, название **Умные часы**, цена **5990**
- Карточка 4: эмодзи **💻**, название **Ноутбук**, цена **45990**

В каждой карточке: \`[ВПИШИ ЭМОДЗИ]\` → эмодзи, \`[ВПИШИ НАЗВАНИЕ]\` → название,
\`[ВПИШИ ЦЕНУ]\` → число (значок \`₽\` уже стоит справа, его не трогай).

**Цвет цены (style.css).** Замени \`[ВПИШИ ЦВЕТ]\` на: **#5b3df5**

**Скругление карточек (style.css).** Замени \`[ВПИШИ РАЗМЕР]\` на: **12px**

**Emmet — добавь 5-ю карточку (index.html).** На пустую строку под
\`<!-- 👇 EMMET … -->\` скопируй этот код и нажми **Tab**:
\`.card>.card-img{🎮}+h3.card-title{Геймпад}+p.card-price{2990 ₽}+button.add-to-cart{В корзину}\``,
      hintMd:
        "Цену пиши только числом (например `19990`) — `₽` уже стоит справа. Эмодзи скопируй из задания (Ctrl+C → Ctrl+V). Emmet-код длинный — проще скопировать его целиком.",
      doneMd:
        "✅ **Готово, когда** видны пять карточек (📱🎧⌚💻🎮) с названиями, ценами и кнопками «В корзину».",
    },
    {
      // ----- Шаг 4: Блок «О нас» -----
      title: "Блок «О нас»",
      time: "10 мин",
      goalMd:
        "**Цель:** рассказать покупателям о магазине.\n\n**Новый термин:** `<section>` — «раздел» страницы. Делаем раздел с рассказом.",
      actionMd:
        "Нажми обе кнопки: **HTML** добавит блок «О нас», **CSS** — его стили.",
      snippets: {
        html: `<!-- Блок "О нас": рассказ о магазине -->
<section class="about" id="about">
	<h2>[ВПИШИ ЗАГОЛОВОК]</h2>
	<p>[ВПИШИ РАССКАЗ О МАГАЗИНЕ]</p>
	<!-- 👇 EMMET: щёлкни на пустую строку ниже, впиши код из задания и нажми Tab -->
	
</section>`,
        css: `/* Стили блока "О нас" */
.about {
	max-width: 700px;
	margin: 24px auto;
	padding: 0 24px;
	text-align: center;
}
.about h2 { font-size: 28px; color: [ВПИШИ ЦВЕТ]; }
.about p { font-size: 17px; line-height: 1.6; color: #333; }
.about-extra { font-weight: bold; color: #2e7d32; }`,
      },
      taskMd: `🔧 **Сделай по порядку.**

**1. Заголовок (index.html).** Замени \`[ВПИШИ ЗАГОЛОВОК]\` на: **О нас**

**2. Рассказ (index.html).** Замени \`[ВПИШИ РАССКАЗ О МАГАЗИНЕ]\` на текст:
**МегаМагазин работает с 2020 года. Мы продаём только проверенную технику и доставляем заказы по всей России за 1–3 дня.**

**3. Цвет заголовка (style.css).** Замени \`[ВПИШИ ЦВЕТ]\` на: **#5b3df5**

**4. Emmet (index.html).** На пустую строку под \`<!-- 👇 EMMET … -->\` впиши и нажми **Tab**:
\`p.about-extra{✅ Гарантия 2 года на все товары}\``,
      hintMd:
        "Текст рассказа скопируй из задания целиком. Тире «—» уже есть в тексте, ничего лишнего не добавляй.",
      doneMd:
        "✅ **Готово, когда** появился раздел «О нас» с рассказом и строчкой про гарантию.",
    },
    {
      // ----- Шаг 5: Отзывы покупателей -----
      title: "Отзывы покупателей",
      time: "12 мин",
      goalMd:
        "**Цель:** добавить отзывы покупателей.\n\n**Повторяем термин:** у каждого отзыва класс `review` — CSS красит их одинаково.",
      actionMd:
        "Нажми обе кнопки: **HTML** добавит три отзыва, **CSS** — их стили.",
      snippets: {
        html: `<!-- Отзывы покупателей -->
<section class="reviews">
	<h2>Отзывы покупателей</h2>
	<div class="review-list">
		<div class="review">
			<p class="review-text">«[ВПИШИ ТЕКСТ ОТЗЫВА]»</p>
			<p class="review-author">— [ВПИШИ ИМЯ]</p>
		</div>
		<div class="review">
			<p class="review-text">«[ВПИШИ ТЕКСТ ОТЗЫВА]»</p>
			<p class="review-author">— [ВПИШИ ИМЯ]</p>
		</div>
		<div class="review">
			<p class="review-text">«[ВПИШИ ТЕКСТ ОТЗЫВА]»</p>
			<p class="review-author">— [ВПИШИ ИМЯ]</p>
		</div>
		<!-- 👇 EMMET: щёлкни на пустую строку ниже, впиши код из задания и нажми Tab -->
		
	</div>
</section>`,
        css: `/* Стили отзывов */
.reviews { padding: 24px; text-align: center; }
.reviews h2 { font-size: 28px; color: #5b3df5; margin-bottom: 16px; }
.review-list {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	gap: 16px;
}
.review {
	background: [ВПИШИ ЦВЕТ];
	border-radius: 10px;
	padding: 16px;
	text-align: left;
}
.review-text { font-style: italic; color: #333; margin: 0; }
.review-author { font-weight: bold; color: #5b3df5; margin: 8px 0 0; }`,
      },
      taskMd: `🔧 **Впиши три отзыва точно так** (текст и имя):

- Отзыв 1: текст **Заказал смартфон — привезли на следующий день. Всё работает отлично!**, имя **Артём**
- Отзыв 2: текст **Купила наушники, звук супер. Спасибо за быструю доставку!**, имя **Мария**
- Отзыв 3: текст **Очень доволен ноутбуком, цена ниже, чем везде.**, имя **Иван**

\`[ВПИШИ ТЕКСТ ОТЗЫВА]\` → текст (кавычки «» уже стоят), \`[ВПИШИ ИМЯ]\` → имя.

**Цвет фона отзывов (style.css).** Замени \`[ВПИШИ ЦВЕТ]\` на: **#f5f3ff**

**Emmet — добавь 4-й отзыв (index.html).** На пустую строку под \`<!-- 👇 EMMET … -->\`
скопируй и нажми **Tab**:
\`.review>p.review-text{«Лучший магазин техники, рекомендую!»}+p.review-author{— Олег}\``,
      hintMd:
        "Кавычки-«ёлочки» и тире уже стоят — вписывай только текст внутри меток. Имена: Артём, Мария, Иван.",
      doneMd:
        "✅ **Готово, когда** видны четыре отзыва с текстами и именами (Артём, Мария, Иван, Олег).",
    },
    {
      // ----- Шаг 6: Подвал -----
      title: "Подвал с контактами",
      time: "10 мин",
      goalMd:
        "**Цель:** добавить подвал с контактами.\n\n**Новый термин:** `<footer>` — «подвал» страницы, где пишут контакты и копирайт.",
      actionMd:
        "Нажми обе кнопки: **HTML** добавит подвал, **CSS** — его стили.",
      snippets: {
        html: `<!-- Подвал сайта: контакты и копирайт -->
<footer class="site-footer" id="contacts">
	<p>📞 Телефон: [ВПИШИ ТЕЛЕФОН]</p>
	<p>✉️ Почта: [ВПИШИ ПОЧТУ]</p>
	<p>📍 Адрес: [ВПИШИ АДРЕС]</p>
	<p>© 2026 [ВПИШИ НАЗВАНИЕ МАГАЗИНА]. Все права защищены.</p>
	<!-- 👇 EMMET: щёлкни на пустую строку ниже, впиши код из задания и нажми Tab -->
	
</footer>`,
        css: `/* Стили подвала */
.site-footer {
	background: [ВПИШИ ЦВЕТ];
	color: #cfcfe0;
	text-align: center;
	padding: 24px;
	margin-top: 20px;
}
.site-footer p { margin: 4px 0; }
.footer-note { opacity: 0.7; }`,
      },
      taskMd: `🔧 **Впиши контакты точно так.**

**1.** \`[ВПИШИ ТЕЛЕФОН]\` → **8-800-555-35-35**
**2.** \`[ВПИШИ ПОЧТУ]\` → **shop@megamagazin.ru**
**3.** \`[ВПИШИ АДРЕС]\` → **г. Москва, ул. Цифровая, 7**
**4.** \`[ВПИШИ НАЗВАНИЕ МАГАЗИНА]\` (в копирайте) → **МегаМагазин**

**5. Цвет фона подвала (style.css).** Замени \`[ВПИШИ ЦВЕТ]\` на: **#2b2b3a**

**6. Emmet (index.html).** На пустую строку под \`<!-- 👇 EMMET … -->\` впиши и нажми **Tab**:
\`p.footer-note{Сделано с любовью на уроке программирования}\``,
      hintMd:
        "Значки 📞 ✉️ 📍 и слова «Телефон:», «Почта:» не трогай — меняй только текст внутри меток.",
      doneMd:
        "✅ **Готово, когда** внизу виден тёмный подвал с телефоном, почтой, адресом, копирайтом «МегаМагазин» и строчкой «Сделано с любовью…».",
    },
    {
      // ----- Шаг 7: Интерактив на JS -----
      title: "Оживляем кнопку «В корзину»",
      time: "12 мин",
      goalMd:
        "**Цель:** сделать так, чтобы кнопка «В корзину» работала и считала товары.\n\n**Новый термин:** `addEventListener('click', …)` — это «слушатель»: он говорит кнопке, что делать по нажатию.",
      actionMd: "Нажми кнопку **JS** — код уйдёт в **main.js** и оживит все кнопки «В корзину».",
      snippets: {
        js: `// Заставляем кнопки "В корзину" работать
let count = 0;
const counter = document.getElementById("cart-count");
const buttons = document.querySelectorAll(".add-to-cart");

buttons.forEach(function (button) {
	button.addEventListener("click", function () {
		count = count + 1;            // увеличиваем счётчик
		counter.textContent = count;  // показываем число в корзине
		console.log("[ВПИШИ СООБЩЕНИЕ]");
	});
});`,
      },
      taskMd: `🔧 **Впиши сообщение (main.js).** Найди строку:
\`console.log("[ВПИШИ СООБЩЕНИЕ]");\`
и замени \`[ВПИШИ СООБЩЕНИЕ]\` на текст: **Товар добавлен в корзину!**
(кавычки \`"\` НЕ стирай — меняй только текст между ними).

Потом нажми ▶ Запустить и понажимай «В корзину»: число у 🛒 будет расти, а в
консоли 🖥 внизу появятся твои сообщения.`,
      hintMd:
        "Не стирай кавычки `\"` вокруг сообщения. Счётчик в шапке — это `<span id=\"cart-count\">`.",
      doneMd:
        "✅ **Готово, когда** клик по «В корзину» увеличивает число у «🛒 Корзина», а в консоли появляется «Товар добавлен в корзину!».",
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
    ta._gutterEl = wrap.querySelector(".gutter");
    ta._swatchLayer = wrap.querySelector(".swatch-layer");
  });
  // Кнопки
  els.runBtn = document.getElementById("run-btn");
  els.openTabBtn = document.getElementById("open-tab-btn");
  els.resetBtn = document.getElementById("reset-btn");
  els.hintBtn = document.getElementById("hint-btn");
  els.downloadBtn = document.getElementById("download-btn");
  // Раскладка: колонки и разделители (перетаскивание ширины, сворачивание)
  els.layout = document.getElementById("layout");
  els.colTask = document.getElementById("col-task");
  els.colEditors = document.getElementById("col-editors");
  els.colPreview = document.getElementById("col-preview");
  els.split1 = document.getElementById("split-1");
  els.split2 = document.getElementById("split-2");
  // Консоль
  els.consoleOutput = document.getElementById("console-output");
  els.consoleClearBtn = document.getElementById("console-clear");
  // Emmet-превью (всплывающая подсказка у курсора)
  els.emmetPreview = document.getElementById("emmet-preview");
  els.emmetPreviewCode = els.emmetPreview.querySelector("code");
  // Нативный выбор цвета (палитра + пипетка) для hex-цветов в коде
  els.colorInput = document.getElementById("color-input");
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

// Умный Enter (как в VS Code): сохраняет отступ строки, углубляет его после
// открывающего тега/скобки, а если курсор стоит МЕЖДУ открытым и закрытым
// (`<p>|</p>`, `{|}`, `(|)`, `[|]`) — раскрывает на три строки: открытие на
// месте, курсор на средней строке с отступом на уровень глубже, закрытие на
// своей строке на исходном уровне. Возвращает true, если Enter обработан сам.
function smartEnter(editor) {
  const v = editor.value;
  const s = editor.selectionStart;
  if (s !== editor.selectionEnd) return false; // есть выделение → обычный Enter

  const lineStart = v.lastIndexOf("\n", s - 1) + 1;
  const indent = v.slice(lineStart, s).match(/^[ \t]*/)[0]; // отступ текущей строки
  const unit = "\t"; // один уровень (редактор отбивает табами)
  const before = v[s - 1];
  const isHtml = editor.dataset.lang === "html";

  // Курсор между парой «открыли — сразу закрыли»?
  const tagPair = isHtml && before === ">" && v.slice(s, s + 2) === "</";
  const bracePair =
    (before === "{" && v[s] === "}") ||
    (before === "(" && v[s] === ")") ||
    (before === "[" && v[s] === "]");

  if (tagPair || bracePair) {
    const mid = "\n" + indent + unit;     // средняя строка (курсор тут)
    insertAsUserInput(editor, s, s, mid + "\n" + indent);
    const caret = s + mid.length;
    editor.setSelectionRange(caret, caret);
    return true;
  }

  // Иначе — перенос с сохранением отступа (+уровень после открывающего)
  const opensBlock =
    before === "{" ||
    before === "(" ||
    before === "[" ||
    (isHtml && before === ">" && endsWithOpenTag(v, s));
  const newIndent = opensBlock ? indent + unit : indent;
  insertAsUserInput(editor, s, s, "\n" + newIndent);
  return true;
}

// Перед позицией `s` стоит «>» — это конец ОТКРЫВАЮЩЕГО тега (не закрывающего,
// не самозакрывающегося, не комментария/доктайпа)?
function endsWithOpenTag(v, s) {
  const open = v.lastIndexOf("<", s - 1);
  if (open < 0) return false;
  const tag = v.slice(open, s); // например "<p>", "</p>", "<br/>", "<!-- ... >"
  if (tag.length < 2) return false;
  if (tag[1] === "/" || tag[1] === "!") return false; // закрывающий / коммент-доктайп
  if (tag[tag.length - 2] === "/") return false;      // самозакрывающийся <br/>
  return true;
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

// Метка-пропуск [ВПИШИ …] — место, куда ученик вписывает свой текст.
// Ставим её первой во всех наборах, чтобы она подсвечивалась ярко и заметно.
const TODO_PATTERN = { cls: "todo", re: /\[ВПИШИ[^\]]*\]/y };

const HTML_PATTERNS = [
  TODO_PATTERN,
  { cls: "comment", re: /<!--[\s\S]*?-->/y },
  { cls: "keyword", re: /<!doctype[^>]*>/iy },
  { cls: "tag", re: /<\/?[a-zA-Z][\w-]*|\/?>/y }, // < / имя тега и закрывающая >
  { cls: "attr", re: /\s[a-zA-Z_:][\w:.-]*(?=\s*=)/y }, // имя атрибута перед =
  { cls: "string", re: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/y },
];

const CSS_PATTERNS = [
  TODO_PATTERN,
  { cls: "comment", re: /\/\*[\s\S]*?\*\//y },
  { cls: "string", re: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/y },
  { cls: "keyword", re: /@[\w-]+/y }, // @media, @import …
  { cls: "number", re: /#[0-9a-fA-F]{3,8}\b/y }, // hex-цвет
  { cls: "number", re: /-?\b\d*\.?\d+(?:[a-z%]+)?\b/y }, // число с единицей
  { cls: "property", re: /[a-zA-Z-]+(?=\s*:)/y }, // свойство перед двоеточием
  { cls: "punct", re: /[{}:;,]/y },
];

const JS_PATTERNS = [
  TODO_PATTERN,
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
  updateGutter(editor);
  syncScroll(editor);
  refreshSwatches(editor);
}

// ---- Цветовые чипы у hex-цветов (#rgb / #rrggbb) ----
// У hex-цвета рисуем кликабельный цветной квадрат; клик открывает нативную
// палитру (с пипеткой ОС), выбранный цвет подставляется в код.
// Чип показываем, пока введено 3–6 hex-цифр (валидные/набираемые цвета); при
// 7+ цифрах он исчезает. Перед «#» держим место под чип (см. ensureColorSpacing).
const COLOR_RE = /#[0-9a-fA-F]+/g; // «#» + любое число hex-цифр (длину считаем сами)
const CHIP_MIN = 3; // минимум цифр, при котором показываем чип
const CHIP_MAX = 6; // максимум цифр (больше — это уже не похоже на цвет)
const SWATCH_SIZE = 13;
let pickerTarget = null; // {editor, start, len} — что заменяем выбранным цветом

// ---- Перенос строк (Alt+Z, как в VS Code) ----
const WORD_WRAP_KEY = "wordWrap";
let wordWrap = false;

// Включить/выключить перенос длинных строк во всех редакторах.
function setWordWrap(on) {
  wordWrap = !!on;
  document.body.classList.toggle("word-wrap", wordWrap);
  els.editors.forEach((ta) => {
    ta.wrap = wordWrap ? "soft" : "off"; // textarea сам тоже должен переносить
    updateHighlight(ta); // перенос изменил раскладку → пересчитать слои/чипы
  });
  try {
    localStorage.setItem(WORD_WRAP_KEY, wordWrap ? "1" : "0");
  } catch (e) {
    /* storage недоступен — настройка просто не сохранится */
  }
}

// ============================================================
// Своя история отмены/повтора (переживает перезагрузку страницы)
// ============================================================
// Нативная история textarea стирается при перезагрузке (контент грузится через
// value=). Поэтому ведём свой стек снимков на каждый редактор и храним его в
// localStorage; Ctrl+Z/Ctrl+Shift+Z (Ctrl+Y) работают и после перезагрузки.
const HISTORY_KEY = "undoHistory";
const HIST_MAX = 80;        // максимум шагов на редактор
const COALESCE_MS = 400;    // быстрый набор внутри строки = один шаг отмены
let restoring = false;      // идёт восстановление снимка → не записываем в историю
let saveHistTimer = null;

function countNL(s) {
  let n = 0;
  for (let i = 0; i < s.length; i++) if (s[i] === "\n") n++;
  return n;
}

// Завести историю редактору с текущим значением как базой.
function histInit(ta) {
  ta._hist = [{ v: ta.value, s: ta.value.length, e: ta.value.length }];
  ta._histIdx = 0;
  ta._histTime = 0;
}

// Записать текущее состояние редактора как шаг истории (с коалесингом набора).
function histRecord(ta) {
  if (restoring || !ta._hist) return;
  const h = ta._hist;
  const prev = h[ta._histIdx];
  if (ta.value === prev.v) return; // без изменений
  // Срезаем «redo»-ветку при новой правке после отмены
  if (ta._histIdx < h.length - 1) h.splice(ta._histIdx + 1);
  const snap = { v: ta.value, s: ta.selectionStart, e: ta.selectionEnd };
  const now = Date.now();
  const sameLines = countNL(ta.value) === countNL(prev.v);
  if (now - ta._histTime < COALESCE_MS && sameLines && ta._histIdx >= 1) {
    h[ta._histIdx] = snap; // сливаем быстрый набор в текущий шаг
  } else {
    h.push(snap);
    if (h.length > HIST_MAX) h.shift();
    ta._histIdx = h.length - 1;
  }
  ta._histTime = now;
  saveHistorySoon();
}

function histApply(ta, snap) {
  restoring = true;
  ta.value = snap.v;
  ta.setSelectionRange(snap.s, snap.e);
  restoring = false;
  ta._histTime = 0; // следующая правка — отдельный шаг (без коалесинга)
  updateHighlight(ta);
  autosave();
  // Прокрутить к курсору, чтобы было видно, что откатилось
  if (ta.offsetParent !== null) {
    const c = caretCoords(ta, snap.e);
    ta.scrollTop = Math.max(0, c.top - ta.clientHeight / 2);
    syncScroll(ta);
  }
  saveHistorySoon();
}

function histUndo(ta) {
  if (!ta._hist || ta._histIdx <= 0) return;
  ta._histIdx--;
  histApply(ta, ta._hist[ta._histIdx]);
}

function histRedo(ta) {
  if (!ta._hist || ta._histIdx >= ta._hist.length - 1) return;
  ta._histIdx++;
  histApply(ta, ta._hist[ta._histIdx]);
}

// Сохранение истории в localStorage (с дебаунсом и обрезкой при переполнении).
function saveHistorySoon() {
  clearTimeout(saveHistTimer);
  saveHistTimer = setTimeout(saveHistoryNow, 250);
}

function saveHistoryNow() {
  clearTimeout(saveHistTimer);
  const data = {};
  els.editors.forEach((ta) => {
    if (ta._hist) data[ta.id] = { stack: ta._hist, idx: ta._histIdx };
  });
  let json = JSON.stringify(data);
  try {
    localStorage.setItem(HISTORY_KEY, json);
  } catch (e) {
    // Переполнение квоты → ужимаем стеки вдвое и пробуем ещё раз
    els.editors.forEach((ta) => {
      if (ta._hist && ta._hist.length > 8) {
        const drop = ta._hist.length >> 1;
        ta._hist.splice(0, drop);
        ta._histIdx = Math.max(0, ta._histIdx - drop);
      }
    });
    try {
      const d2 = {};
      els.editors.forEach((ta) => {
        if (ta._hist) d2[ta.id] = { stack: ta._hist, idx: ta._histIdx };
      });
      localStorage.setItem(HISTORY_KEY, JSON.stringify(d2));
    } catch (e2) {
      /* всё равно не влезает — оставляем только в памяти */
    }
  }
}

// Загрузить историю из localStorage (после reload). Возвращает true, если для
// редактора нашёлся валидный стек (тогда значение берём из него).
function histLoad(ta) {
  let data = null;
  try {
    data = JSON.parse(localStorage.getItem(HISTORY_KEY) || "null");
  } catch (e) {
    data = null;
  }
  const rec = data && data[ta.id];
  if (
    !rec ||
    !Array.isArray(rec.stack) ||
    rec.stack.length === 0 ||
    typeof rec.idx !== "number"
  ) {
    return false;
  }
  ta._hist = rec.stack;
  ta._histIdx = Math.min(Math.max(0, rec.idx), rec.stack.length - 1);
  ta._histTime = 0;
  ta.value = ta._hist[ta._histIdx].v; // показываем состояние на указателе истории
  return true;
}

// Любой hex (3/4/5/6 цифр) → валидный #rrggbb для нативного input и фона чипа.
function normalizeHex(hex) {
  const s = hex.slice(1).toLowerCase();
  if (s.length >= 6) return "#" + s.slice(0, 6);
  if (s.length >= 3) return "#" + s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
  return "#000000";
}

// Это hex-цвет (а не ID-селектор)? ID-селектор обычно в начале строки —
// такие «#» пропускаем; цвет стоит внутри значения, после отступа.
function isColorHash(val, hashPos) {
  let sp = 0;
  while (hashPos - 1 - sp >= 0 && val[hashPos - 1 - sp] === " ") sp++;
  const before = hashPos - sp - 1;
  return before >= 0 && val[before] !== "\n";
}

// Пересобрать чипы (только CSS). Чип — СЛЕВА от «#», на пробелах перед ним
// (ensureColorSpacing держит там 2 пробела, пока чип показан), поэтому он не
// закрывает «:» и текст. Рисуем только при 3–6 hex-цифрах.
function refreshSwatches(editor) {
  const layer = editor._swatchLayer;
  if (!layer) return;
  layer.textContent = "";
  if (editor.dataset.lang !== "css") return; // цвета меняем только в CSS
  // Скрытый/несфокусированный редактор имеет нулевые метрики — координаты
  // посчитаем при показе вкладки (switchTab вызывает refreshSwatches снова).
  if (editor.offsetParent === null) return;

  const val = editor.value;
  const viewH = editor.clientHeight;
  const viewW = editor.clientWidth;
  COLOR_RE.lastIndex = 0;
  let m;
  while ((m = COLOR_RE.exec(val))) {
    const start = m.index;
    const hex = m[0];
    const digits = hex.length - 1;
    if (digits < CHIP_MIN || digits > CHIP_MAX) continue; // только 3–6 цифр
    if (!isColorHash(val, start)) continue;

    const c = caretCoords(editor, start);
    const top = c.top - editor.scrollTop + (c.lineHeight - SWATCH_SIZE) / 2;
    const left = c.left - editor.scrollLeft - SWATCH_SIZE - 2; // на пробелах слева от «#»
    // За пределами видимой области (overflow:hidden обрежет, но не рисуем зря)
    if (top < -SWATCH_SIZE || top > viewH || left < -SWATCH_SIZE || left > viewW) continue;

    const sw = document.createElement("button");
    sw.type = "button";
    sw.className = "color-swatch";
    sw.style.top = top + "px";
    sw.style.left = left + "px";
    sw.style.background = normalizeHex(hex);
    sw.title = "Выбрать цвет (" + hex + ")";
    sw.addEventListener("mousedown", (e) => e.preventDefault()); // не сбивать фокус/каретку
    sw.addEventListener("click", () => openColorPicker(editor, start, hex, sw));
    layer.appendChild(sw);
  }
}

// Держать перед «#hex» в CSS нужное число пробелов: 2 пока показан чип (3–6
// цифр) — место под квадрат, иначе 1. Так лишний пробел появляется ВМЕСТЕ с
// чипом и убирается, когда чип исчезает (>6 цифр). Правки — через execCommand
// (сохраняют Undo); повторный вход через событие input гасим флагом.
let adjustingSpacing = false;

function ensureColorSpacing(editor) {
  if (adjustingSpacing) return;
  if (editor.dataset.lang !== "css") return;

  const val = editor.value;
  COLOR_RE.lastIndex = 0;
  let m, fix = null;
  while ((m = COLOR_RE.exec(val))) {
    const hashPos = m.index;
    const digits = m[0].length - 1;
    if (!isColorHash(val, hashPos)) continue;
    let spaces = 0;
    while (hashPos - 1 - spaces >= 0 && val[hashPos - 1 - spaces] === " ") spaces++;
    const target = digits >= CHIP_MIN && digits <= CHIP_MAX ? 2 : 1;
    if (spaces !== target) {
      fix = { runStart: hashPos - spaces, runLen: spaces, target };
      break;
    }
  }
  if (!fix) return;

  applyGap(editor, fix.runStart, fix.runLen, fix.target);
  ensureColorSpacing(editor); // следующие цвета в этом же файле
}

// Привести длину пробельного «зазора» (начинается на runStart, длиной runLen)
// к target: дописать или удалить пробелы, сохранив позицию каретки.
function applyGap(editor, runStart, runLen, target) {
  const delta = target - runLen; // >0 — добавить, <0 — убрать
  if (delta === 0) return;
  const caret = editor.selectionStart;
  const caretEnd = editor.selectionEnd;
  const val = editor.value;
  adjustingSpacing = true;
  editor.focus();

  if (delta > 0) {
    editor.setSelectionRange(runStart, runStart);
    const ok =
      typeof document.execCommand === "function" &&
      document.execCommand("insertText", false, " ".repeat(delta));
    if (!ok) {
      editor.value = val.slice(0, runStart) + " ".repeat(delta) + val.slice(runStart);
      editor.dispatchEvent(new Event("input", { bubbles: true }));
    }
  } else {
    const remEnd = runStart - delta; // удаляем (-delta) пробелов от начала зазора
    editor.setSelectionRange(runStart, remEnd);
    const ok =
      typeof document.execCommand === "function" &&
      document.execCommand("delete");
    if (!ok) {
      editor.value = val.slice(0, runStart) + val.slice(remEnd);
      editor.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  // Сдвиг каретки относительно изменённого зазора
  const shift = (p) => {
    if (delta > 0) return p >= runStart ? p + delta : p;
    const remEnd = runStart - delta;
    if (p >= remEnd) return p + delta;
    return p > runStart ? runStart : p;
  };
  editor.setSelectionRange(shift(caret), shift(caretEnd));
  adjustingSpacing = false;
}

// Открыть нативную палитру у чипа и запомнить, какой фрагмент кода заменить.
function openColorPicker(editor, start, hex, swatch) {
  const input = els.colorInput;
  if (!input) return;
  input.value = normalizeHex(hex);
  pickerTarget = { editor, start, len: hex.length };
  // Ставим скрытый input у чипа — диалог ОС откроется рядом
  const r = swatch.getBoundingClientRect();
  input.style.left = r.left + "px";
  input.style.top = r.bottom + "px";
  input.click();
}

// Применить выбранный цвет: заменить hex в коде как пользовательский ввод
// (Ctrl+Z отменяет, подсветка/автосохранение обновляются сами).
function applyPickedColor() {
  if (!pickerTarget) return;
  const { editor, start, len } = pickerTarget;
  pickerTarget = null;
  insertAsUserInput(editor, start, start + len, els.colorInput.value);
}

// Перерисовать колонку с номерами строк. Без переноса — по одному номеру на
// строку. С переносом (Alt+Z) логическая строка может занимать несколько
// визуальных: номер ставим у первой визуальной строки, а на строки-продолжения
// добавляем ПУСТЫЕ записи — так номера остаются вровень с кодом.
function updateGutter(editor) {
  const gutter = editor._gutterEl;
  if (!gutter) return;
  const lines = editor.value.split("\n");
  const rows = wordWrap ? wrappedRowCounts(editor, lines) : null;
  if (!rows) {
    let out = "1";
    for (let i = 2; i <= lines.length; i++) out += "\n" + i;
    gutter.textContent = out;
    return;
  }
  const parts = [];
  for (let i = 0; i < lines.length; i++) {
    parts.push(String(i + 1));
    for (let r = 1; r < rows[i]; r++) parts.push(""); // безномерные продолжения
  }
  gutter.textContent = parts.join("\n");
}

// Сколько визуальных строк занимает каждая логическая строка при переносе.
// Меряем «зеркалом» (по одному div на строку, ширина = текстовая область
// редактора). null → измерить нельзя (редактор скрыт) → обычная нумерация.
let wrapMirror = null;
function wrappedRowCounts(editor, lines) {
  if (editor.offsetParent === null) return null;
  // Меряем по слою подсветки <pre> — именно он показывает перенесённый код,
  // рядом с которым стоят номера (у него те же метрики, что у textarea).
  const target = editor._preEl || editor;
  const cs = getComputedStyle(target);
  const padL = parseFloat(cs.paddingLeft) || 0;
  const padR = parseFloat(cs.paddingRight) || 0;
  const contentW = target.clientWidth - padL - padR;
  if (contentW <= 0) return null;
  const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5;

  if (!wrapMirror) {
    wrapMirror = document.createElement("div");
    wrapMirror.setAttribute("aria-hidden", "true");
    wrapMirror.style.position = "absolute";
    wrapMirror.style.visibility = "hidden";
    wrapMirror.style.top = "-9999px";
    wrapMirror.style.left = "0";
    wrapMirror.style.whiteSpace = "pre-wrap"; // наследуется детьми
    wrapMirror.style.overflowWrap = "anywhere";
    document.body.appendChild(wrapMirror);
  }
  const m = wrapMirror;
  m.style.width = contentW + "px";
  m.style.fontFamily = cs.fontFamily;
  m.style.fontSize = cs.fontSize;
  m.style.lineHeight = cs.lineHeight;
  m.style.fontWeight = cs.fontWeight;
  m.style.letterSpacing = cs.letterSpacing;
  m.style.tabSize = cs.tabSize;
  m.style.MozTabSize = cs.tabSize;

  // Один div на строку (переиспользуем) → один пересчёт раскладки на все строки
  while (m.children.length < lines.length) m.appendChild(document.createElement("div"));
  while (m.children.length > lines.length) m.removeChild(m.lastChild);
  for (let i = 0; i < lines.length; i++) {
    m.children[i].textContent = lines[i].length ? lines[i] : "​";
  }
  const rows = new Array(lines.length);
  for (let i = 0; i < lines.length; i++) {
    rows[i] = Math.max(1, Math.round(m.children[i].offsetHeight / lh));
  }
  return rows;
}

function syncScroll(editor) {
  const pre = editor._preEl;
  if (pre) {
    pre.scrollTop = editor.scrollTop;
    pre.scrollLeft = editor.scrollLeft;
  }
  // Номера строк двигаются только по вертикали (по горизонтали стоят на месте).
  if (editor._gutterEl) editor._gutterEl.scrollTop = editor.scrollTop;
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
  // В режиме переноса (Alt+Z) зеркало тоже должно переносить строки по ширине,
  // иначе координаты курсора/чипов разойдутся с реальной раскладкой.
  div.style.whiteSpace = wordWrap ? "pre-wrap" : "pre";
  div.style.overflowWrap = wordWrap ? "anywhere" : "normal";
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
  els.editors.forEach(histInit); // история начинается заново с чистого шаблона
  saveHistoryNow();
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
  // Гаттер (число визуальных строк при переносе) и чипы цветов считаются по
  // пиксельным метрикам — у скрытого редактора их нет; пересчитываем для
  // показанного теперь редактора.
  const shown = els.editors.find((ta) => ta.id === tabId);
  if (shown) {
    updateGutter(shown);
    refreshSwatches(shown);
  }
}

// Пересчитать перенос (нумерацию строк-продолжений и чипы) для видимого
// редактора — после изменения его ширины (ресайз колонок/окна).
function refreshWrapForVisible() {
  if (!wordWrap) return;
  const ta = els.editors.find((e) => e.offsetParent !== null);
  if (ta) {
    updateGutter(ta);
    refreshSwatches(ta);
    syncScroll(ta);
  }
}

// ============================================================
// Раскладка: перетаскивание ширины колонок и сворачивание каждой колонки
// ============================================================
const LAYOUT_KEY = "layoutPrefs";
const COL_MIN_PX = 140;        // минимальная ширина колонки при перетаскивании

// Делает разделитель `splitter` перетаскиваемым: перенос ширины между
// соседними колонками `left`/`right`. Доля каждой колонки — её flex-grow при
// flex-basis:0, поэтому grow ≡ ширина; перетаскивание перераспределяет grow
// только между двумя соседями (как в VS Code), остальные колонки не трогаем.
function makeResizable(splitter, left, right) {
  let startX = 0, startLeft = 0, total = 0, combinedGrow = 0, active = false;

  splitter.addEventListener("pointerdown", (e) => {
    startLeft = left.getBoundingClientRect().width;
    total = startLeft + right.getBoundingClientRect().width;
    combinedGrow =
      parseFloat(getComputedStyle(left).flexGrow) +
      parseFloat(getComputedStyle(right).flexGrow);
    startX = e.clientX;
    active = true;
    splitter.setPointerCapture(e.pointerId);
    splitter.classList.add("dragging");
    document.body.classList.add("resizing"); // гасим выделение и мышь в iframe
    e.preventDefault();
  });

  splitter.addEventListener("pointermove", (e) => {
    if (!active) return;
    // новая ширина левой колонки = исходная + смещение мыши, в пределах [min, total-min]
    let leftPx = startLeft + (e.clientX - startX);
    leftPx = Math.max(COL_MIN_PX, Math.min(total - COL_MIN_PX, leftPx));
    const lg = (combinedGrow * leftPx) / total;
    left.style.flexGrow = lg.toFixed(4);
    right.style.flexGrow = (combinedGrow - lg).toFixed(4);
  });

  const end = (e) => {
    if (!active) return;
    active = false;
    if (splitter.hasPointerCapture(e.pointerId))
      splitter.releasePointerCapture(e.pointerId);
    splitter.classList.remove("dragging");
    document.body.classList.remove("resizing");
    saveLayout();
    refreshWrapForVisible(); // ширина редактора изменилась → пересчитать перенос
  };
  splitter.addEventListener("pointerup", end);
  splitter.addEventListener("pointercancel", end);
}

// Доля колонки (flex-grow). У свёрнутой колонки inline-grow обнулён, поэтому
// её «настоящую» долю помним в `_savedGrow` (для восстановления при развороте).
function growOf(col) {
  if (col.classList.contains("collapsed")) return col._savedGrow || "1";
  return col.style.flexGrow || "";
}

// Свернуть/развернуть колонку. Свёрнутая → тонкая полоса (flex:0 0 auto,
// ширина в CSS); её доля запоминается и восстанавливается при развороте.
// Остальные колонки сохраняют свои пропорции и заполняют освободившееся место.
function setCollapsed(col, collapsed) {
  if (collapsed) {
    if (!col.classList.contains("collapsed")) col._savedGrow = col.style.flexGrow || "1";
    col.classList.add("collapsed");
    col.style.flex = "0 0 auto";
  } else {
    col.classList.remove("collapsed");
    col.style.flex = "";
    col.style.flexGrow = col._savedGrow || "1";
  }
}

// Разделитель между колонками A|B бесполезен, если одна из них свёрнута в полосу.
function updateSplitters() {
  const t = els.colTask.classList.contains("collapsed");
  const e = els.colEditors.classList.contains("collapsed");
  const p = els.colPreview.classList.contains("collapsed");
  els.split1.style.display = t || e ? "none" : "";
  els.split2.style.display = e || p ? "none" : "";
}

function toggleCol(col, collapsed) {
  // Не даём свернуть последнюю развёрнутую колонку — иначе экран пуст.
  if (collapsed) {
    const expanded = [els.colTask, els.colEditors, els.colPreview].filter(
      (c) => !c.classList.contains("collapsed")
    );
    if (expanded.length <= 1) return;
  }
  setCollapsed(col, collapsed);
  updateSplitters();
  saveLayout();
  // Развернули редактор → его чипы цветов считались при скрытой колонке (нулевые
  // координаты), пересчитываем для снова видимого редактора.
  if (!collapsed && col === els.colEditors) {
    const shown = els.editors.find((ta) => ta.offsetParent !== null);
    if (shown) refreshSwatches(shown);
  }
}

function saveLayout() {
  try {
    localStorage.setItem(
      LAYOUT_KEY,
      JSON.stringify({
        grows: [growOf(els.colTask), growOf(els.colEditors), growOf(els.colPreview)],
        collapsed: {
          task: els.colTask.classList.contains("collapsed"),
          editors: els.colEditors.classList.contains("collapsed"),
          preview: els.colPreview.classList.contains("collapsed"),
        },
      })
    );
  } catch (e) {
    /* приватный режим / storage недоступен — раскладка просто не сохранится */
  }
}

function loadLayout() {
  let p = null;
  try {
    p = JSON.parse(localStorage.getItem(LAYOUT_KEY) || "null");
  } catch (e) {
    p = null;
  }
  if (!p) return;
  const cols = [els.colTask, els.colEditors, els.colPreview];
  if (Array.isArray(p.grows)) {
    cols.forEach((col, i) => {
      const g = p.grows[i];
      if (g) {
        col.style.flexGrow = g;
        col._savedGrow = g; // чтобы свёрнутая колонка помнила долю
      }
    });
  }
  if (p.collapsed) {
    if (p.collapsed.task) setCollapsed(els.colTask, true);
    if (p.collapsed.editors) setCollapsed(els.colEditors, true);
    if (p.collapsed.preview) setCollapsed(els.colPreview, true);
  }
}

function initLayout() {
  loadLayout();
  updateSplitters();
  makeResizable(els.split1, els.colTask, els.colEditors);
  makeResizable(els.split2, els.colEditors, els.colPreview);
  [els.colTask, els.colEditors, els.colPreview].forEach((col) => {
    const collapseBtn = col.querySelector(".col-collapse");
    const reopenBtn = col.querySelector(".col-reopen");
    if (collapseBtn) collapseBtn.addEventListener("click", () => toggleCol(col, true));
    if (reopenBtn) reopenBtn.addEventListener("click", () => toggleCol(col, false));
  });
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
  ensureColorSpacing(els.cssEditor); // ≥2 пробела перед #hex для цветных чипов
  // История отмены: восстановить из localStorage (переживает перезагрузку),
  // иначе завести с текущим значением как базой.
  els.editors.forEach((ta) => {
    if (!histLoad(ta)) histInit(ta);
  });

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
  initLayout();                  // ширины колонок, разделители, сворачивание задания
  switchTab("index.html");       // активная вкладка редактора (задание — отдельная колонка)
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
  // Выбор цвета в нативной палитре → подставить в код (change = по подтверждению)
  els.colorInput.addEventListener("change", applyPickedColor);

  // Сообщения из iframe (console.* и ошибки) → встроенная консоль
  window.addEventListener("message", handleConsoleMessage);

  // Перед закрытием/перезагрузкой — дописать историю отмены (вдруг дебаунс не успел)
  window.addEventListener("beforeunload", saveHistoryNow);

  // Изменение размера окна меняет ширину редактора → пересчитать перенос строк
  window.addEventListener("resize", refreshWrapForVisible);

  els.editors.forEach((ta) => {
    // Ввод → пересобрать подсветку, сохранить прогресс, обновить Emmet-превью
    ta.addEventListener("input", () => {
      ensureColorSpacing(ta); // ≥2 пробела перед #hex (для цветных чипов в CSS)
      updateHighlight(ta);
      autosave();
      updateEmmetPreview(ta);
      histRecord(ta); // запомнить шаг для своей отмены (переживает перезагрузку)
    });
    // Прокрутка textarea → двигаем слой подсветки, чипы цветов и превью
    ta.addEventListener("scroll", () => {
      syncScroll(ta);
      refreshSwatches(ta);
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
      // Alt+Z — переключить перенос строк (как в VS Code)
      if (e.altKey && e.code === "KeyZ" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setWordWrap(!wordWrap);
        return;
      }
      // Своя отмена/повтор (работает и после перезагрузки): Ctrl+Z / Ctrl+Shift+Z,
      // Ctrl+Y. Перехватываем до нативной, чтобы источник истины — наш стек.
      const mod = e.ctrlKey || e.metaKey;
      if (mod && !e.altKey && e.code === "KeyZ") {
        e.preventDefault();
        if (e.shiftKey) histRedo(ta);
        else histUndo(ta);
        return;
      }
      if (mod && !e.altKey && !e.shiftKey && e.code === "KeyY") {
        e.preventDefault();
        histRedo(ta);
        return;
      }
      if (e.key === "Tab" && !e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        hideEmmetPreview();
        if (!e.shiftKey && tryExpandEmmet(ta)) return;
        insertTab(ta);
        return;
      }
      // Enter — умный отступ (как в VS Code): сохраняет уровень, раскрывает пары
      if (e.key === "Enter" && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
        hideEmmetPreview();
        if (smartEnter(ta)) e.preventDefault();
      }
    });
  });

  // Клики по вкладкам
  els.tabs.forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  // Восстановить сохранённый режим переноса строк (Alt+Z)
  let wrapPref = "0";
  try { wrapPref = localStorage.getItem(WORD_WRAP_KEY) || "0"; } catch (e) {}
  if (wrapPref === "1") setWordWrap(true);
}

document.addEventListener("DOMContentLoaded", init);
