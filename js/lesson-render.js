// ============================================================
// Рендер урока: вступление + карточки шагов + финал, вставка частей блока.
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

// Реальные языки сниппетов шага в порядке вставки (html → css → js).
function stepRealLangs(step) {
  return PART_ORDER.filter((lang) => step.snippets && step.snippets[lang]);
}

// «Ручной» шаг — без сниппетов (ребёнок печатает код руками). Завершается
// кнопкой «✓ Я выполнил этот шаг»; его единственная «часть» — псевдо-язык "done".
function isManualStep(step) {
  return step.manual === true || stepRealLangs(step).length === 0;
}

// «Части», из которых складывается готовность шага: для обычного шага — реальные
// языки сниппетов, для ручного — единственная псевдо-часть "done".
function stepLangs(step) {
  return isManualStep(step) ? ["done"] : stepRealLangs(step);
}

// Шаг выполнен, когда отмечены ВСЕ его части.
function isStepDone(index) {
  return stepLangs(lesson.steps[index]).every((lang) =>
    doneParts.has(partKey(index, lang))
  );
}

// Первый ещё не вставленный реальный язык шага (для поочерёдной разблокировки
// html → css → js ВНУТРИ шага). undefined — если все части уже вставлены.
function firstUndonePartOfStep(index) {
  return stepRealLangs(lesson.steps[index]).find(
    (lang) => !doneParts.has(partKey(index, lang))
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

  if (isManualStep(step)) {
    // Ручной шаг: сначала инструкция, под ней — одна кнопка «✓ Я сделал».
    const task = document.createElement("div");
    task.className = "step-task";
    task.innerHTML = markdownToHtml(step.taskMd);
    card.appendChild(task);

    const buttons = document.createElement("div");
    buttons.className = "step-buttons";
    buttons.appendChild(makeManualDoneButton(index));
    card.appendChild(buttons);
  } else {
    // Шаг с кнопками: кнопки вставки идут ВНУТРИ инструкции, по местам меток
    // [[btn:html|css|js]] — сначала кнопка нужной части, потом её кусок задания.
    appendTaskWithInlineButtons(card, step, index);
  }

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

// Кнопка вставки части блока (HTML/CSS/JS). Состоянием управляет updateProgress.
function makeInsertButton(index, lang) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn-insert";
  btn.dataset.insert = String(index);
  btn.dataset.lang = lang;
  btn.addEventListener("click", () => insertPart(index, lang));
  return btn;
}

// Кнопка «✓ Я выполнил этот шаг» для ручного шага.
function makeManualDoneButton(index) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn-insert btn-manual-done";
  btn.dataset.insert = String(index);
  btn.dataset.lang = "done";
  btn.addEventListener("click", () => markManualDone(index));
  return btn;
}

// Разложить инструкцию шага, чередуя её куски с кнопками вставки по местам меток
// [[btn:html]] / [[btn:css]] / [[btn:js]]. Если меток нет (шаг ещё не размечен) —
// откатываемся к старому виду: вся инструкция, под ней все кнопки разом.
function appendTaskWithInlineButtons(card, step, index) {
  const taskMd = String(step.taskMd || "");
  const parts = taskMd.split(/\[\[btn:(html|css|js)\]\]/);

  if (parts.length === 1) {
    const task = document.createElement("div");
    task.className = "step-task";
    task.innerHTML = markdownToHtml(taskMd);
    card.appendChild(task);

    const buttons = document.createElement("div");
    buttons.className = "step-buttons";
    stepRealLangs(step).forEach((lang) =>
      buttons.appendChild(makeInsertButton(index, lang))
    );
    card.appendChild(buttons);
    return;
  }

  // split с группой даёт [текст, lang, текст, lang, текст, …].
  parts.forEach((chunk, k) => {
    if (k % 2 === 1) {
      const buttons = document.createElement("div");
      buttons.className = "step-buttons";
      buttons.appendChild(makeInsertButton(index, chunk));
      card.appendChild(buttons);
    } else if (chunk.trim()) {
      const task = document.createElement("div");
      task.className = "step-task";
      task.innerHTML = markdownToHtml(chunk);
      card.appendChild(task);
    }
  });
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
    const lang = btn.dataset.lang;
    btn.classList.remove("done", "locked");
    btn.title = "";

    // Ручной шаг: кнопка «✓ Я выполнил этот шаг».
    if (lang === "done") {
      if (doneParts.has(partKey(i, "done"))) {
        btn.disabled = true;
        btn.classList.add("done");
        btn.textContent = "✓ Шаг выполнен";
      } else if (i === next) {
        btn.disabled = false;
        btn.textContent = "✓ Я выполнил этот шаг";
      } else {
        btn.disabled = true;
        btn.classList.add("locked");
        btn.textContent = "🔒 Я выполнил этот шаг";
        btn.title = `Сначала выполни шаг ${next + 1}`;
      }
      return;
    }

    const info = PART_INFO[lang];
    if (doneParts.has(partKey(i, lang))) {
      // Уже добавленную часть можно вставить повторно (если ребёнок удалил код)
      btn.disabled = false;
      btn.classList.add("done");
      btn.textContent = `↻ Вставить ${info.label} снова`;
    } else if (i === next && lang === firstUndonePartOfStep(i)) {
      // Активна только СЛЕДУЮЩАЯ невставленная часть текущего шага (html→css→js)
      btn.disabled = false;
      btn.textContent = `➕ Вставить ${info.label} → ${info.file}`;
    } else {
      btn.disabled = true;
      btn.classList.add("locked");
      btn.textContent = `🔒 Вставить ${info.label}`;
      if (i === next) {
        // Шаг текущий, но раньше идёт другая часть (например, сначала HTML)
        const need = firstUndonePartOfStep(i);
        btn.title = need
          ? `Сначала вставь ${PART_INFO[need].label}`
          : `Сначала собери блок ${next + 1}`;
      } else {
        btn.title = `Сначала собери блок ${next + 1}`;
      }
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

// Вставить ОДНУ часть блока (html/css/js) в её файл: открыть нужную вкладку,
// вставить код как пользовательский ввод (Ctrl+Z работает), отметить часть
// готовой, сохранить прогресс и подсказать следующий шаг.
function insertPart(index, lang) {
  const key = partKey(index, lang);
  const isReinsert = doneParts.has(key);
  // Новые части вставляем только в текущем блоке и только по порядку html→css→js;
  // добавленную — повторно в любой момент.
  if (!isReinsert) {
    if (index !== firstUndoneStep()) return;
    if (lang !== firstUndonePartOfStep(index)) return;
  }

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

// Отметить «ручной» шаг (без сниппетов) выполненным по кнопке «✓ Я сделал»:
// добавить псевдо-часть "done", сохранить прогресс, разблокировать следующий шаг.
function markManualDone(index) {
  const key = partKey(index, "done");
  if (doneParts.has(key)) return; // уже отмечен
  if (index !== firstUndoneStep()) return; // соблюдаем порядок шагов

  doneParts.add(key);
  autosave();
  updateProgress();

  const step = lesson.steps[index];
  if (doneStepCount() === lesson.steps.length) {
    showToast(
      "🎉 Все шаги выполнены!",
      "Отличная работа! Можешь скачать проект кнопкой ⬇ Скачать."
    );
  } else {
    showToast(
      `Шаг «${step.title}» выполнен!`,
      "Молодец! Переходи к следующему шагу 👇"
    );
  }
}
