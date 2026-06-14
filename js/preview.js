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
