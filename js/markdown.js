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
  let paragraph = null; // накапливаем строки текущего абзаца
  let codeLines = null; // строки внутри блока ```…``` (или null вне блока)

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

  if (codeLines !== null) {
    html.push('<pre class="code-block"><code>' + codeLines.join("\n") + "</code></pre>");
  }
  flushParagraph();
  flushList();
  return html.join("\n");
}
