// Referencias globales
const pagesContainer = document.getElementById("pages");
const modal = document.getElementById("modal");
const modalContent = modal.querySelector(".modal-content");

// --- Utilidades ---
function openModal(title, contentHTML) {
  modalContent.innerHTML = `<h2>${title}</h2><div>${contentHTML}</div>`;
  modal.classList.remove("hidden");
}
function closeModal() { modal.classList.add("hidden"); }
function focusDoc(content) { content.focus(); }

// --- Crear nueva hoja ---
function crearNuevaHoja() {
  const numPages = pagesContainer.querySelectorAll(".page").length;
  const nuevaHoja = document.createElement("div");
  nuevaHoja.classList.add("page");

  const pageNumber = document.createElement("div");
  pageNumber.classList.add("page-number");
  pageNumber.innerText = `(${numPages+1})`;

  const header = document.createElement("div");
  header.classList.add("header");

  const footer = document.createElement("div");
  footer.classList.add("footer");

  const newContent = document.createElement("div");
  newContent.classList.add("doc-content");
  newContent.contentEditable = "true";
  newContent.addEventListener("input", () => checkOverflow(nuevaHoja));

  nuevaHoja.appendChild(pageNumber);
  nuevaHoja.appendChild(header);
  nuevaHoja.appendChild(footer);
  nuevaHoja.appendChild(newContent);

  pagesContainer.appendChild(nuevaHoja);
}

// --- Chequear overflow ---
function checkOverflow(page) {
  const content = page.querySelector(".doc-content");
  const maxHeight = page.clientHeight - 100; // margen reservado
  if (content.scrollHeight > maxHeight) {
    crearNuevaHoja();
  }
}

// --- Inicializar primera hoja ---
document.querySelector(".doc-content").addEventListener("input", () => {
  const firstPage = document.querySelector(".page");
  checkOverflow(firstPage);
});

// --- Funciones de Editar ---
function deshacer() { document.execCommand("undo"); }
function rehacer() { document.execCommand("redo"); }

// --- Funciones de Paginado ---
function configurarPaginado() {
  openModal("Configurar Paginado", `
    <label>Orientación:</label>
    <select id="orientacion"><option value="vertical">Vertical</option><option value="horizontal">Horizontal</option></select>
    <label>Papel:</label>
    <select id="papel"><option value="A4">A4</option><option value="Carta">Carta</option></select>
    <button id="aplicar">Aceptar</button><button id="cancel">Cancelar</button>
  `);
  document.getElementById("aplicar").onclick = () => {
    const orientacion = document.getElementById("orientacion").value;
    const papel = document.getElementById("papel").value;
    const tamaños = { "A4":{w:21,h:29.7},"Carta":{w:21.6,h:27.9}};
    let ancho = tamaños[papel].w, alto = tamaños[papel].h;
    if (orientacion==="horizontal") [ancho,alto]=[alto,ancho];
    document.querySelectorAll(".page").forEach(hoja=>{
      hoja.style.width=ancho+"cm"; hoja.style.height=alto+"cm";
    });
    closeModal();
  };
  document.getElementById("cancel").onclick = () => closeModal();
}

// --- Numerar páginas ---
function numerarPaginas() {
  openModal("Numerar Páginas", `
    <label>Tamaño:</label>
    <select id="tamano">
      ${Array.from({length: 13}, (_, i) => `<option>${i+8}</option>`).join("")}
    </select>
    <label>Posición:</label>
    <select id="posicion">
      <option value="sup-izq">Superior Izquierda</option>
      <option value="sup-der">Superior Derecha</option>
      <option value="inf-izq">Inferior Izquierda</option>
      <option value="inf-der">Inferior Derecha</option>
    </select><br><br>
    <button id="aplicar">Aceptar</button>
    <button id="cancel">Cancelar</button>
  `);

  document.getElementById("aplicar").onclick = () => {
    const tamano = document.getElementById("tamano").value;
    const pos = document.getElementById("posicion").value;

    document.querySelectorAll(".page").forEach((page, index) => {
      const pageNumberArea = page.querySelector(".page-number");
      pageNumberArea.style.fontSize = tamano + "px";
      pageNumberArea.innerText = `(${index+1})`;
      pageNumberArea.style.display = "block";

      pageNumberArea.style.top = "";
      pageNumberArea.style.bottom = "";
      pageNumberArea.style.left = "";
      pageNumberArea.style.right = "";

      const docContent = page.querySelector(".doc-content");
      docContent.style.paddingBottom = "1.5cm";

      if (pos === "sup-izq") {
        pageNumberArea.style.top = "1cm";
        pageNumberArea.style.left = "1.5cm";
      } else if (pos === "sup-der") {
        pageNumberArea.style.top = "1cm";
        pageNumberArea.style.right = "1.5cm";
      } else if (pos === "inf-izq") {
        pageNumberArea.style.bottom = "1cm";
        pageNumberArea.style.left = "1.5cm";
        docContent.style.paddingBottom = "2.5cm";
      } else if (pos === "inf-der") {
        pageNumberArea.style.bottom = "1cm";
        pageNumberArea.style.right = "1.5cm";
        docContent.style.paddingBottom = "2.5cm";
      }
    });

    closeModal();
  };
  document.getElementById("cancel").onclick = () => closeModal();
}

// --- Eventos del menú ---
document.querySelectorAll(".menu li").forEach(item => {
  item.addEventListener("click", () => {
    const text = item.innerText.trim();
    switch(text) {
      case "Nuevo": /* lógica para nuevo */ break;
      case "Abrir": /* lógica para abrir */ break;
      case "Guardar": /* lógica para guardar */ break;
      case "Guardar Como": /* lógica para guardar como */ break;
      case "Imprimir": window.print(); break;
      case "Página": configurarPaginado(); break;
      case "Deshacer": deshacer(); break;
      case "Rehacer": rehacer(); break;
      case "Numerar Páginas": numerarPaginas(); break;
    }
  });
});

// --- Barra de formato ---
document.getElementById("font-family").addEventListener("change", e => {
  focusDoc(document.activeElement);
  document.execCommand("fontName", false, e.target.value);
});

document.getElementById("font-size").addEventListener("change", e => {
  let size = parseInt(e.target.value, 10);
  if (isNaN(size)) size = 8;
  if (size < 8) size = 8;
  if (size > 150) size = 150;

  focusDoc(document.activeElement);
  document.execCommand("fontSize", false, "7");

  const fontElements = document.querySelectorAll("font[size='7']");
  fontElements.forEach(el => {
    el.removeAttribute("size");
    el.style.fontSize = size + "px";
  });

  e.target.value = size;
});

document.querySelectorAll(".toolbar button").forEach(btn => {
  btn.addEventListener("click", () => {
    const action = btn.innerText.trim();
    focusDoc(document.activeElement);
    switch(action) {
      case "N": document.execCommand("bold"); break;
      case "K": document.execCommand("italic"); break;
      case "S": document.execCommand("underline"); break;
      case "Izq": document.execCommand("justifyLeft"); break;
      case "Centro": document.execCommand("justifyCenter"); break;
      case "Der": document.execCommand("justifyRight"); break;
    }
  });
});

document.getElementById("font-color").addEventListener("change", e => {
  focusDoc(document.activeElement);
  document.execCommand("foreColor", false, e.target.value);
});

document.getElementById("highlight-color").addEventListener("change", e => {
  focusDoc(document.activeElement);
  document.execCommand("hiliteColor", false, e.target.value);
});

// Guardado automático cada 1 minuto
setInterval(() => {
  console.log("Guardado automático en formato .mpd");
}, 60000);
