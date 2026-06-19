#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Собирает эталонный сайт урока 1 (VULN_HTML/CSS/JS для урока 2), извлекая сниппеты
ПРЯМО из js/lesson-data.js и значения меток из js/dev-cheat.js (STEP_FILL).
Не переписываем код руками → сайт не «дрейфует» от того, что строит ребёнок.

Логика повторяет dev-cheat.js (fillCode / solvedParts / adminInsertHtml /
adminAppend / fillUpToStep), но БЕЗ комментариев-границ wrapBlock и с очисткой
авторских маркеров 👇/👆 — чтобы вшитый сайт урока 2 был чистым и читаемым.
"""
import re, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, "js/lesson-data.js"), encoding="utf-8").read()
dev = open(os.path.join(ROOT, "js/dev-cheat.js"), encoding="utf-8").read()

# ---------- helpers ----------
def extract_tl(text, backtick_idx):
    """Содержимое шаблонного литерала, начинающегося в backtick_idx (символ `).
    В сниппетах нет вложенных backtick и ${} — поэтому ищем следующий `."""
    assert text[backtick_idx] == "`", repr(text[backtick_idx:backtick_idx+20])
    end = text.index("`", backtick_idx + 1)
    return text[backtick_idx + 1:end], end

# ---------- 1. Парсим шаги (title + snippets) из lesson-data.js ----------
steps_start = src.index("steps: [")
text = src[steps_start:]

title_re = re.compile(r"\n {6}title:\s*\"([^\"]*)\"")
snip_re  = re.compile(r"\n {8}(html|css|js):\s*`")
task_re  = re.compile(r"\n {6}taskMd:\s*`")   # многострочный TL — пропускаем целиком

steps = []
cur = None
pos = 0
while True:
    mt = title_re.search(text, pos)
    ms = snip_re.search(text, pos)
    mk = task_re.search(text, pos)
    cands = [m for m in (mt, ms, mk) if m]
    if not cands:
        break
    m = min(cands, key=lambda x: x.start())
    if m is mt:
        cur = {"title": mt.group(1), "snippets": {}}
        steps.append(cur)
        pos = mt.end()
    elif m is ms:
        lang = ms.group(1)
        content, end = extract_tl(text, ms.end() - 1)
        cur["snippets"][lang] = content
        pos = end + 1
    else:  # taskMd — пропустить его шаблонный литерал
        _, end = extract_tl(text, mk.end() - 1)
        pos = end + 1

print("Шагов распознано:", len(steps))

# ---------- 2. STEP_FILL из dev-cheat.js ----------
# 2a. FILL_* константы (шаблонные литералы) — извлекаем из dev-cheat.js
def tl_const(name):
    i = dev.index("const %s =" % name)
    bt = dev.index("`", i)
    val, _ = extract_tl(dev, bt)
    return val

FILL = {
    "FILL_SKELETON": tl_const("FILL_SKELETON"),
    "FILL_CARD5": tl_const("FILL_CARD5"),
    "FILL_REVIEW4": tl_const("FILL_REVIEW4"),
}

# 2b. STEP_FILL (транскрипция; ниже сверяется с dev-cheat.js на отсутствие дрейфа)
STEP_FILL = {
  "Каркас сайта и название во вкладке": {"html": FILL["FILL_SKELETON"]},
  "Первый текст на странице — руками": {
    "html": "<h1>Добро пожаловать в МегаМагазин</h1>\n<p>Тут будут самые крутые товары!</p>",
  },
  "Первый стиль — раскрась заголовок": {
    "cssRaw": "h1 { color: #5b3df5; text-align: center; }",
  },
  "Шапка магазина и меню навигации": {"answers": {
      "[ВПИШИ НАЗВАНИЕ МАГАЗИНА]": "МегаМагазин",
      "[ВПИШИ ПУНКТ МЕНЮ HOME]": "Главная",
      "[ВПИШИ ПУНКТ МЕНЮ LOGIN]": "Вход",
      "[ВПИШИ ПУНКТ МЕНЮ REGISTER]": "Регистрация",
      "[ВПИШИ СЛОВО]": "Корзина",
      "[ВПИШИ ЦВЕТ]": "#5b3df5",
      "[ВПИШИ РАЗМЕР]": "24px",
  }},
  "Баннер со скидкой": {
    "answers": {
      "[ВПИШИ ЗАГОЛОВОК СКИДКИ]": "Скидки до 50% на технику!",
      "[ВПИШИ ПОДЗАГОЛОВОК]": "Только до конца недели — успей купить!",
      "[ВПИШИ ТЕКСТ КНОПКИ]": "Купить сейчас",
      "[ВПИШИ РАЗМЕР]": "44px",
      "[ВПИШИ ЦВЕТ]": "#ff5722",
    },
    "ownPropCss": "border-radius: 8px;",
  },
  "Карточки товаров + Emmet": {
    "answers": {
      "[ВПИШИ ЭМОДЗИ СМАРТФОНА]": "📱", "[ВПИШИ НАЗВАНИЕ СМАРТФОНА]": "Смартфон", "[ВПИШИ ЦЕНУ СМАРТФОНА]": "19990",
      "[ВПИШИ ЭМОДЗИ НАУШНИКОВ]": "🎧", "[ВПИШИ НАЗВАНИЕ НАУШНИКОВ]": "Наушники", "[ВПИШИ ЦЕНУ НАУШНИКОВ]": "2490",
      "[ВПИШИ ЭМОДЗИ ЧАСОВ]": "⌚", "[ВПИШИ НАЗВАНИЕ ЧАСОВ]": "Умные часы", "[ВПИШИ ЦЕНУ ЧАСОВ]": "5990",
      "[ВПИШИ ЭМОДЗИ НОУТБУКА]": "💻", "[ВПИШИ НАЗВАНИЕ НОУТБУКА]": "Ноутбук", "[ВПИШИ ЦЕНУ НОУТБУКА]": "45990",
      "[ВПИШИ РАЗМЕР]": "12px", "[ВПИШИ ЦВЕТ]": "#5b3df5",
    },
    "emmetHtml": FILL["FILL_CARD5"],
  },
  "Блок «О нас»": {
    "answers": {
      "[ВПИШИ ЗАГОЛОВОК]": "О нас",
      "[ВПИШИ РАССКАЗ О МАГАЗИНЕ]": "МегаМагазин работает с 2020 года. Мы продаём только проверенную технику и доставляем заказы по всей России за 1–3 дня.",
      "[ВПИШИ ЦВЕТ]": "#5b3df5",
    },
    "ownPropCss": "line-height: 1.7;",
  },
  "Отзывы покупателей": {
    "answers": {
      "[ВПИШИ ТЕКСТ ОТЗЫВА 1]": "Заказал смартфон — привезли на следующий день. Всё работает отлично!",
      "[ВПИШИ ИМЯ 1]": "Артём",
      "[ВПИШИ ТЕКСТ ОТЗЫВА 2]": "Купила наушники, звук супер. Спасибо за быструю доставку!",
      "[ВПИШИ ИМЯ 2]": "Мария",
      "[ВПИШИ ТЕКСТ ОТЗЫВА 3]": "Очень доволен ноутбуком, цена ниже, чем везде.",
      "[ВПИШИ ИМЯ 3]": "Иван",
      "[ВПИШИ ЦВЕТ]": "#f5f3ff",
    },
    "emmetHtml": FILL["FILL_REVIEW4"],
  },
  "Подвал с контактами": {"answers": {
      "[ВПИШИ ТЕЛЕФОН]": "8-800-555-35-35",
      "[ВПИШИ ПОЧТУ]": "shop@megamagazin.ru",
      "[ВПИШИ АДРЕС]": "г. Москва, ул. Цифровая, 7",
      "[ВПИШИ НАЗВАНИЕ МАГАЗИНА]": "МегаМагазин",
      "[ВПИШИ ЦВЕТ]": "#2b2b3a",
  }},
  "Оживляем кнопку «В корзину»": {"answers": {"[ВПИШИ СООБЩЕНИЕ]": "Товар добавлен в корзину!"}},
  "Страницы «Вход» и «Регистрация»": {"answers": {
      "[ВПИШИ ЗАГОЛОВОК ВХОДА]": "Вход",
      "[ВПИШИ ТЕКСТ КНОПКИ ВХОДА]": "Войти",
      "[ВПИШИ ЗАГОЛОВОК РЕГИСТРАЦИИ]": "Регистрация",
      "[ВПИШИ ТЕКСТ КНОПКИ РЕГИСТРАЦИИ]": "Зарегистрироваться",
      "[ВПИШИ ЦВЕТ]": "#5b3df5",
  }},
  "Страница товара и комментарии ⚠": {"answers": {
      "[ВПИШИ ЗАГОЛОВОК]": "Комментарии о товаре",
      "[ВПИШИ ЦВЕТ]": "#5b3df5",
  }},
}

# 2c. Анти-дрейф: каждое транскрибированное значение должно встречаться в dev-cheat.js
drift = []
for title, f in STEP_FILL.items():
    for v in (f.get("answers") or {}).values():
        if v not in dev: drift.append((title, v))
    for k in ("ownPropCss", "cssRaw"):
        if f.get(k) and f[k] not in dev: drift.append((title, f[k]))
if drift:
    print("!!! ДРЕЙФ значений STEP_FILL (нет в dev-cheat.js):")
    for t, v in drift: print("   ", t, "->", repr(v))
    sys.exit(1)
print("STEP_FILL сверен с dev-cheat.js — дрейфа нет.")

# ---------- 3. Сборка (порт dev-cheat.js) ----------
def fillCode(code, f, lang):
    for k, v in (f.get("answers") or {}).items():
        code = code.replace(k, v)
    if lang == "css" and f.get("ownPropCss"):
        code = re.sub(r"(/\* 👇[^\n]*\*/\n)[ \t]*\n([ \t]*/\* 👆)",
                      lambda m: m.group(1) + "\t" + f["ownPropCss"] + "\n" + m.group(2), code)
    if lang == "html" and f.get("emmetHtml"):
        code = re.sub(r"(<!-- 👇 EMMET[^\n]*-->\n)[ \t]*\n",
                      lambda m: m.group(1) + f["emmetHtml"] + "\n", code)
    return code

def solvedParts(step):
    f = STEP_FILL.get(step["title"], {})
    parts = []
    if f.get("cssRaw"):
        parts.append(("css", f["cssRaw"]))
    for lang in ("html", "css", "js"):
        if f.get(lang) is not None:
            parts.append((lang, f[lang]))
        elif step["snippets"].get(lang) is not None:
            parts.append((lang, fillCode(step["snippets"][lang], f, lang)))
    return parts

html_doc = ""
css_doc = ""
js_doc = ""

def insert_html(code):
    global html_doc
    m = re.search(r"([ \t]*)</body>", html_doc, re.I)
    if not m:                      # каркаса ещё нет — это и есть скелет
        html_doc = code
        return
    indent = (m.group(1) or "") + "\t"
    block = "\n".join((indent + l if l else l) for l in code.split("\n"))
    sep = "\n" if html_doc and "НАЧАЛО" not in html_doc else ""  # пустая строка между блоками
    # для чистого сайта просто отбиваем блоки пустой строкой
    insert = "\n" + block + "\n"
    html_doc = html_doc[:m.start()] + insert + html_doc[m.start():]

def append(lang, code):
    global css_doc, js_doc
    if lang == "css":
        css_doc = (css_doc.rstrip() + "\n\n" + code) if css_doc.strip() else code
    else:
        js_doc = (js_doc.rstrip() + "\n\n" + code) if js_doc.strip() else code

for step in steps:
    for lang, code in solvedParts(step):
        if lang == "html":
            insert_html(code)
        else:
            append(lang, code)

# ---------- 4. Очистка авторских маркеров 👇/👆 ----------
def strip_markers(s):
    out = []
    for line in s.split("\n"):
        if "👇" in line or "👆" in line:   # авторские подсказки Emmet/«своё свойство»
            continue
        out.append(line)
    # схлопываем 3+ пустых строк в одну пустую
    res = re.sub(r"\n{3,}", "\n\n", "\n".join(out))
    return res.strip("\n")

html_doc = strip_markers(html_doc)
css_doc = strip_markers(css_doc)
js_doc = strip_markers(js_doc)

# ---------- 5. Валидация ----------
errs = []
for name, doc in (("HTML", html_doc), ("CSS", css_doc), ("JS", js_doc)):
    if "[ВПИШИ" in doc: errs.append("%s: остались метки [ВПИШИ …]" % name)
    if "👇" in doc or "👆" in doc: errs.append("%s: остались маркеры 👇/👆" % name)
if "</body>" not in html_doc: errs.append("HTML: нет </body>")
for need in ("FLAG{секрет_спрятан_в_html_комментарии}",):
    if need not in html_doc: errs.append("HTML: нет флага %s" % need)
for need in ("hiddenFlag", "secret_flag", "showWelcome", "welcome="):
    if need not in js_doc: errs.append("JS: нет %s" % need)
for need in ("welcome-box",):
    if need not in html_doc: errs.append("HTML: нет %s" % need)
# ключевые признаки многостраничности
for need in ("showPage", "getUsers", "openProduct", "comments_", "renderUserBox", "burger"):
    if need not in js_doc: errs.append("JS: нет признака %s" % need)
if errs:
    print("!!! ОШИБКИ ВАЛИДАЦИИ:")
    for e in errs: print("   ", e)
    sys.exit(1)
print("Валидация пройдена.")

# ---------- 6. Вывод ----------
out_dir = os.path.join(ROOT, "scripts", "out")
os.makedirs(out_dir, exist_ok=True)
open(os.path.join(out_dir, "vuln.html"), "w", encoding="utf-8").write(html_doc)
open(os.path.join(out_dir, "vuln.css"), "w", encoding="utf-8").write(css_doc)
open(os.path.join(out_dir, "vuln.js"), "w", encoding="utf-8").write(js_doc)
print("Готово. Файлы: scripts/out/vuln.{html,css,js}")
print("Размеры: HTML=%d CSS=%d JS=%d" % (len(html_doc), len(css_doc), len(js_doc)))
