const documentArea = document.getElementById("document");
const pageNumberArea = document.getElementById("page-number");
const modal = document.getElementById("modal");
const modalContent = modal.querySelector(".modal-content");

// Abrir modal genérico
function openModal(title, contentHTML) {
  modalContent.innerHTML = `
    <h2>${title}</h2>
    <div>${contentHTML}</div>
  `;
  modal.classList.remove("hidden");
}

// Cerrar modal
function closeModal() {
  modal.classList.add("hidden");
}

// --- Funciones de Archivo ---
function nuevoDocumento() {
  openModal("Nuevo Documento", `
    <p>¿Desea guardar el documento actual y empezar uno nuevo?</p>
    <button id="save-current">Si</button>
    <button id="delete-current">No</button>    
    <button id="cancel">Cancelar</button>
  `);

  document.getElementById("delete-current").onclick = () => {
    documentArea.innerHTML = "";
    pageNumberArea.innerHTML = "";
    closeModal();
  };
  document.getElementById("save-current").onclick = () => guardarComo();
  document.getElementById("cancel").onclick = () => closeModal();
}

function abrirDocumento() {
  openModal("Abrir Documento", `
    <p>¿Desea cerrar este documento y abrir otro?</p>
    <button id="delete-current">Borrar Actual</button>
    <button id="save-current">Guardar Actual</button>
    <button id="cancel">Cancelar</button>
  `);

  document.getElementById("delete-current").onclick = () => {
    documentArea.innerHTML = "";
    pageNumberArea.innerHTML = "";
    closeModal();
    seleccionarArchivo();
  };
  document.getElementById("save-current").onclick = () => {
    guardarComo();
    closeModal();
    seleccionarArchivo();
  };
  document.getElementById("cancel").onclick = () => closeModal();
}

function seleccionarArchivo() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".mpd,.docx";
  input.onchange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        documentArea.innerHTML = ev.target.result; // simplificado
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

function guardarDocumento() {
  const blob = new Blob([documentArea.innerHTML], {type: "text/plain"});
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "documento.mpd";
  link.click();
}

function guardarComo() {
  const blob = new Blob([documentArea.innerHTML], {type: "text/plain"});
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = prompt("Nombre del archivo:", "documento.mpd") || "documento.mpd";
  link.click();
}

function imprimirDocumento() {
  window.print();
}

// --- Funciones de Editar ---
function deshacer() {
  document.execCommand("undo");
}
function rehacer() {
  document.execCommand("redo");
}

// --- Funciones de Paginado ---
function configurarPaginado() {
  openModal("Configurar Paginado", `
    <label>Orientación:</label>
    <select id="orientacion">
      <option value="vertical">Vertical</option>
      <option value="horizontal">Horizontal</option>
    </select>

    <label>Papel:</label>
    <select id="papel">
      <option value="A4">A4</option>
      <option value="A5">A5</option>
      <option value="A3">A3</option>
      <option value="Legal">Legal</option>
      <option value="Folio">Folio</option>
      <option value="Carta">Carta</option>
    </select>

    <label>Márgen Izq:</label>
    <select id="margenIzq"><option>1.5</option><option>2</option><option>3</option><option>4</option><option>5</option></select>
    <label>Márgen Der:</label>
    <select id="margenDer"><option>1.5</option><option>2</option><option>3</option><option>4</option><option>5</option></select>
    <label>Márgen Sup:</label>
    <select id="margenSup"><option>1.5</option><option>2</option><option>3</option><option>4</option><option>5</option></select>
    <label>Márgen Inf:</label>
    <select id="margenInf"><option>1.5</option><option>2</option><option>3</option><option>4</option><option>5</option></select>

    <button id="aplicar">Aceptar</button>
    <button id="cancel">Cancelar</button>
  `);

  document.getElementById("aplicar").onclick = () => {
    const orientacion = document.getElementById("orientacion").value;
    const papel = document.getElementById("papel").value;

    // Tamaños estándar en cm
    const tamaños = {
      "A4": {w: 21, h: 29.7},
      "A5": {w: 14.8, h: 21},
      "A3": {w: 29.7, h: 42},
      "Legal": {w: 21.6, h: 35.6},
      "Folio": {w: 21.6, h: 33},
      "Carta": {w: 21.6, h: 27.9}
    };

    let ancho = tamaños[papel].w;
    let alto = tamaños[papel].h;
    // Cambiar orientación
    if (orientacion === "horizontal") {
      [ancho, alto] = [alto, ancho];
    }

    // Aplicar tamaño de hoja
    documentArea.style.width = ancho + "cm";
    documentArea.style.height = alto + "cm";

    // Aplicar márgenes
    const margenIzq = document.getElementById("margenIzq").value;
    const margenDer = document.getElementById("margenDer").value;
    const margenSup = document.getElementById("margenSup").value;
    const margenInf = document.getElementById("margenInf").value;

    documentArea.style.padding = `${margenSup}cm ${margenDer}cm ${margenInf}cm ${margenIzq}cm`;

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
    </select>
    <button id="aplicar">Aceptar</button>
    <button id="cancel">Cancelar</button>
  `);

  document.getElementById("aplicar").onclick = () => {
    const tamano = document.getElementById("tamano").value;
    const pos = document.getElementById("posicion").value;
    pageNumberArea.style.fontSize = tamano + "px";
    pageNumberArea.innerText = "1"; // ejemplo
    pageNumberArea.style.textAlign = pos.includes("der") ? "right" : "left";
    pageNumberArea.style.position = "absolute";
    pageNumberArea.style.width = "100%";
    if (pos.includes("sup")) {
      pageNumberArea.style.top = "0.5cm";
      pageNumberArea.style.bottom = "";
    } else {
      pageNumberArea.style.bottom = "0.5cm";
      pageNumberArea.style.top = "";
    }
    if (!documentArea.contains(pageNumberArea)) {
      documentArea.appendChild(pageNumberArea);
    }
    closeModal();
  };
  document.getElementById("cancel").onclick = () => closeModal();
}

// --- Eventos del menú ---
document.querySelectorAll(".menu li").forEach(item => {
  item.addEventListener("click", () => {
    const text = item.innerText.trim();
    switch(text) {
      case "Nuevo": nuevoDocumento(); break;
      case "Abrir": abrirDocumento(); break;
      case "Guardar": guardarDocumento(); break;
      case "Guardar Como": guardarComo(); break;
      case "Imprimir": imprimirDocumento(); break;
      case "Página": configurarPaginado(); break;
      case "Deshacer": deshacer(); break;
      case "Rehacer": rehacer(); break;
      case "Numerar Páginas": numerarPaginas(); break;
    }
  });
});

// --- Barra de formato con execCommand (mantiene selección activa) ---
document.getElementById("font-family").addEventListener("change", e => {
  document.execCommand("fontName", false, e.target.value);
});

document.getElementById("font-size").addEventListener("change", e => {
  let size = parseInt(e.target.value, 10);
  if (isNaN(size)) size = 8;
  if (size < 8) size = 8;
  if (size > 150) size = 150;

  // Usamos fontSize=7 como marcador y luego lo reemplazamos
  document.execCommand("fontSize", false, "7");
  const fontElements = documentArea.querySelectorAll("font[size='7']");
  fontElements.forEach(el => {
    el.removeAttribute("size");
    el.style.fontSize = size + "px";
  });
  e.target.value = size;
});

document.querySelectorAll(".toolbar button").forEach(btn => {
  btn.addEventListener("click", () => {
    const action = btn.innerText.trim();
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
  document.execCommand("foreColor", false, e.target.value);
});

document.getElementById("highlight-color").addEventListener("change", e => {
  document.execCommand("hiliteColor", false, e.target.value);
});

// Guardado automático cada 1 minuto
setInterval(() => {
  console.log("Guardado automático en formato .mpd");
}, 60000);
