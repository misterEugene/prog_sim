# Архитектура и решения по реализации

Документ описывает целевую архитектуру платформы, ключевые решения и обоснования.
Дополняй его, когда принимаешь новое нетривиальное решение.

## Концепция

Локальная (без сервера/сборки/библиотек) платформа для обучения детей коду.
**Один** предустановленный урок, зашитый в `main.js` (объект `lesson`).
Создание новых уроков через UI **не предусмотрено** — это намеренное упрощение.

Ребёнок: читает задачу (`task.md`), правит HTML/CSS/JS, жмёт «Запустить», видит
результат в iframe. Прогресс автосохраняется в `localStorage`, восстанавливается
после перезагрузки. Есть сброс к шаблону, подсказка (тост) и скачивание файлов.

## Данные урока (источник истины — объект `lesson` в main.js)

| Поле            | Значение |
|-----------------|----------|
| `title`         | «Измени цвет текста» (в UI: «Урок 1: Измени цвет текста») |
| `descriptionMd` | Markdown-описание (заголовок, задача, подсказка про `color`) |
| `initialHTML`   | `<p>Привет, я учусь программировать!</p>` |
| `initialCSS`    | `''` (пусто) |
| `initialJS`     | `''` (пусто) |
| `hint`          | «Напиши в CSS: p { color: blue; }» |

## Раскладка интерфейса

```
┌───────────────────────────────┬───────────────────────────────┐
│ ЛЕВАЯ ПАНЕЛЬ (50%)            │ ПРАВАЯ ПАНЕЛЬ (50%)           │
│                               │                               │
│ [Заголовок урока]            │  ┌─────────────────────────┐  │
│ [Запустить][Сброс][Подсказка]│  │                         │  │
│ [Сохр HTML][CSS][JS]         │  │      <iframe srcdoc>    │  │
│ [task.md][index.html]        │  │   sandbox: allow-same-  │  │
│ [style.css][main.js]  ← табы │  │   origin allow-scripts  │  │
│ ┌───────────────────────────┐│  │   allow-popups          │  │
│ │ контейнер: markdown ИЛИ   ││  │   allow-forms           │  │
│ │ один из textarea          ││  │                         │  │
│ └───────────────────────────┘│  └─────────────────────────┘  │
└───────────────────────────────┴───────────────────────────────┘
```

Адаптив: при ширине `<800px` колонки выстраиваются в столбец.

## Функции main.js и связи между ними

- `markdownToHtml(md)` — мини-парсер Markdown (без библиотек).
- `renderDescription()` — кладёт `markdownToHtml(lesson.descriptionMd)` в `.markdown-body`.
- `loadFromLocalStorage()` → `{html,css,js}` | `null`.
- `saveToLocalStorage(html,css,js)` — пишет один ключ `savedLessonCode` (JSON).
- `updateIframe()` — собирает полный HTML-документ и кладёт в `iframe.srcdoc`.
- `resetToTemplate()` — заполняет редакторы `initial*`, чистит localStorage, зовёт `updateIframe()`.
- `crc32(bytes)` / `buildZip(files)` — ручная сборка ZIP-архива (метод store, без библиотек).
- `downloadBlob(blob, filename)` — `<a download>` + клик + revokeObjectURL.
- `downloadProject()` — собирает три файла в ZIP и скачивает `project.zip`.
- `showHint()` — показывает тост `lesson.hint`, прячет через 5 с.
- `switchTab(tabId)` — переключает активную вкладку и видимый блок.

Поток данных:
```
input в textarea ──> saveToLocalStorage()         (iframe НЕ трогаем)
кнопка «Запустить» ──> updateIframe()             (читает текущие textarea)
загрузка страницы ──> loadFromLocalStorage() || initial* ──> renderDescription() ──> updateIframe()
```

## Ключевые решения

### Сборка документа для iframe
`updateIframe()` формирует строку:
```html
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>/*CSS*/</style></head>
<body>/*HTML*/<script>/*JS*/</script></body></html>
```
и присваивает её `iframe.srcdoc`. **`srcdoc`, а не `document.write`** — см. PITFALLS.

### localStorage
Один ключ `savedLessonCode` со значением `JSON.stringify({html,css,js})`.
Чтение обёрнуто в `try/catch` (повреждённый/устаревший JSON → ведём себя как «нет данных»).
Сброс — `localStorage.removeItem('savedLessonCode')`.

### Вкладки
4 вкладки: `task.md` (рендер Markdown в `.markdown-body`), `index.html`, `style.css`,
`main.js` (textarea). Переключение **только показывает/прячет** блоки — textarea
не пересоздаются, поэтому содержимое не теряется. Источник истины для кода — сами textarea
(+ зеркало в localStorage), а не переменные.

### Markdown-парсер
Поддержка: `# ## ###`, списки `-`/`*` (без вложенности), `**жирный**`, `*курсив*`,
`` `код` ``, абзацы (разделение пустыми строками). Порядок обработки важен —
см. PITFALLS (экранирование HTML, code → bold → italic, списки построчно).

### Редактор кода: подсветка синтаксиса + перехват Tab

Подсветка в `<textarea>` напрямую невозможна, поэтому используется классический
приём **«оверлей»**: внутри обёртки `.editor-wrap` (position: relative) лежат два
слоя с идентичными метриками шрифта/отступов:

```
.editor-wrap (relative, overflow:hidden)
├─ <pre class="highlight"><code>…</code></pre>   ← z-index 1, раскрашенный код
└─ <textarea class="editor">                     ← z-index 2, color:transparent,
                                                     caret-color виден, ввод сюда
```

- Textarea сверху, текст прозрачный (`color: transparent`), виден только курсор
  (`caret-color`) и выделение (`::selection` с полупрозрачным фоном — цветной код
  под ним просвечивает).
- При `input` пересобираем `<code>.innerHTML` через `highlight(value, lang)`.
- При `scroll` синхронизируем `pre.scrollTop/scrollLeft = textarea.scrollTop/Left`
  (`syncScroll`). У `pre` `overflow:hidden`, прокрутка только программная.

Подсветка — собственный токенайзер `tokenize(code, patterns)` (без библиотек):
бежим по строке, на каждой позиции пробуем **липкие** регэкспы (флаг `/y`) по
порядку; совпало — оборачиваем в `<span class="tok-…">` с `escapeHtml`, иначе
экранируем один символ. Наборы правил: `HTML_PATTERNS`, `CSS_PATTERNS`,
`JS_PATTERNS` (язык берётся из `data-lang` у textarea). Цвета — классы `.tok-*`
в `style.css`. Подсветка контекстно-свободная (упрощённая), для учебного кода
достаточно.

**Tab вставляет символ табуляции** (`\t`), а не уводит фокус: `keydown` →
`preventDefault()` → `insertTab()`. Внутри — `document.execCommand('insertText',
false, '\t')`: сохраняет нативную историю отмены (Ctrl+Z) и сам диспатчит `input`
(→ подсветка + автосохранение). Фолбэк на ручную вставку с эмуляцией `input`,
если `execCommand` недоступен. Размер таба — `tab-size: 4` (одинаково у обоих слоёв).

## Отклонения от исходного ТЗ (deepseek) и обоснования

1. **`srcdoc` вместо `document.write`.** document.write в iframe требует доступа к
   `contentDocument` и при пустом `src` даёт нестабильное поведение/гонки; `srcdoc`
   декларативен и дружит с `sandbox`.
2. **Экранирование HTML в `markdownToHtml`.** В ТЗ не упомянуто, но без него текст
   вроде `<p>` или `&` в описании сломает разметку. Экранируем `& < >` до парсинга.
3. **Явный MIME у `downloadFile`.** Передаём третий аргумент (`text/html`, `text/css`,
   `application/javascript`), а не угадываем по расширению.
4. **`try/catch` вокруг чтения localStorage.** Защита от повреждённых данных и
   режимов приватности, где доступ к storage кидает исключение.
5. **iframe обновляется только по «Запустить».** В ТЗ это так и задумано (ручной
   запуск). На `input` — только автосохранение, без перерисовки превью.
6. **Добавлен `allow-modals` в `sandbox`.** Без него `alert/confirm/prompt` из
   кода ребёнка молча блокируются. ТЗ этот флаг не указывал.

## Чего НЕ делаем (вне scope)

- Нет создания/выбора уроков, нет роутинга, нет бэкенда.
- Нет внешних библиотек, шрифтов с CDN, сборщиков.
- Нет автоматической проверки «правильно ли решена задача» (ТЗ не требует).
