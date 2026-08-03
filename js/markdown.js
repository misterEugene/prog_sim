// ============================================================
// Markdown → HTML (минимальный парсер без библиотек)
// Поддержка: # ## ###, списки -/* и нумерованные 1./1), горизонтальная черта ---,
// **жирный**, *курсив*, `код`, абзацы.
// ============================================================
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Инлайн-замены. Порядок важен: код → жирный → курсив. В конце - превращаем
// упоминание «▶ Запустить» в визуальный чип, повторяющий вид настоящей кнопки
// «Запустить» (чтобы ребёнок узнавал её в инструкции). См. .run-chip в markdown.css.
function inlineMarkdown(text) {
  return text
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/▶\s*Запустить/g, '<span class="run-chip">▶ Запустить</span>')
    .replace(
      /🔗\s*Открыть в новой вкладке/g,
      '<span class="open-tab-chip">🔗 Открыть в новой вкладке</span>'
    );
}

function markdownToHtml(md) {
  const lines = escapeHtml(md).split("\n");
  const html = [];
  let listItems = null; // накапливаем пункты текущего списка
  let listTag = "ul";   // ul для -/*, ol для 1./1)
  let listStart = 1;    // с какого номера начинается нумерованный список
  let paragraph = null; // накапливаем строки текущего абзаца
  let codeLines = null; // строки внутри блока ```…``` (или null вне блока)

  const flushList = () => {
    if (listItems) {
      const open =
        listTag === "ol" && listStart !== 1 ? `<ol start="${listStart}">` : `<${listTag}>`;
      html.push(open + listItems.join("") + `</${listTag}>`);
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

    // Ограждённый блок кода ```…``` - строки внутри выводим как есть (уже
    // экранированы), без инлайн-разметки и без сворачивания пробелов/переносов.
    if (line.startsWith("```")) {
      if (codeLines === null) {
        flushParagraph();
        flushList();
        codeLines = [];
      } else {
        html.push('<pre class="code-block"><code>' + codeLines.join("\n") + "</code></pre>");
        codeLines = null;
      }
      continue;
    }
    if (codeLines !== null) {
      codeLines.push(rawLine);
      continue;
    }

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

    // Горизонтальная черта: строка из трёх и более - _ * (разделитель внутри шага)
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(line)) {
      flushParagraph();
      flushList();
      html.push("<hr>");
      continue;
    }

    const listItem = line.match(/^[-*]\s+(.*)$/);
    const numItem = line.match(/^(\d{1,2})[.)]\s+(.*)$/);
    if (listItem || numItem) {
      flushParagraph();
      const tag = listItem ? "ul" : "ol";
      if (listItems && tag !== listTag) flushList(); // сменился вид списка
      if (!listItems) {
        listItems = [];
        listTag = tag;
        listStart = numItem ? parseInt(numItem[1], 10) : 1;
      }
      listItems.push("<li>" + inlineMarkdown(listItem ? listItem[1] : numItem[2]) + "</li>");
      continue;
    }

    // Продолжение длинного пункта списка: строка с отступом сразу под пунктом
    // (списки в уроках переносят длинные пункты на следующую строку).
    if (listItems && /^\s/.test(rawLine)) {
      const last = listItems.pop();
      listItems.push(last.replace(/<\/li>$/, " " + inlineMarkdown(line) + "</li>"));
      continue;
    }

    // Обычная строка абзаца
    flushList();
    if (!paragraph) paragraph = [];
    paragraph.push(line);
  }

  if (codeLines !== null) {
    html.push('<pre class="code-block"><code>' + codeLines.join("\n") + "</code></pre>");
  }
  flushParagraph();
  flushList();
  return html.join("\n");
}
