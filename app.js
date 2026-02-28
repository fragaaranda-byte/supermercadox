const documentArea = document.getElementById("document");
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
    <button id="delete-current">Borrar Actual</button>
    <button id="save-current">Guardar Actual</button>
    <button id="cancel">Cancelar</button>
  `);

  document.getElementById("delete-current").onclick = () => {
    documentArea.innerHTML = "";
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
  input.accept = ".myd,.docx";
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
  link.download = "documento.myd";
  link.click();
}

function guardarComo() {
  const blob = new Blob([documentArea.innerHTML], {type: "text/plain"});
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = prompt("Nombre del archivo:", "documento.myd") || "documento.myd";
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
    <select id="orientacion"><option>Vertical</option><option>Horizontal</option></select>
    <label>Papel:</label>
    <select id="papel">
      <option>A4</option><option>A5</option><option>A3</option>
      <option>Legal</option><option>Folio</option><option>Carta</option>
    </select>
    <label>Márgen Izq:</label><input id="margenIzq" type="number" step="0.1" value="1.5">
    <label>Márgen Der:</label><input id="margenDer" type="number" step="0.1" value="1.5">
    <label>Márgen Sup:</label><input id="margenSup" type="number" step="0.1" value="1.5">
    <label>Márgen Inf:</label><input id="margenInf" type="number" step="0.1" value="1.5">
    <button id="aplicar">Aceptar</button>
    <button id="cancel">Cancelar</button>
  `);

  document.getElementById("aplicar").onclick = () => {
    documentArea.style.padding = `${document.getElementById("margenSup").value}cm ${document.getElementById("margenDer").value}cm ${document.getElementById("margenInf").value}cm ${document.getElementById("margenIzq").value}cm`;
    closeModal();
  };
  document.getElementById("cancel").onclick = () => closeModal();
}

// --- Encabezado y Pié ---
function encabezadoPie() {
  openModal("Encabezado y Pié", `
    <label>Encabezado:</label><input id="encabezado" type="text">
    <label>Pié:</label><input id="pie" type="text">
    <button id="aplicar">Aceptar</button>
    <button id="cancel">Cancelar</button>
  `);

  document.getElementById("aplicar").onclick = () => {
    documentArea.innerHTML = `<header>${document.getElementById("encabezado").value}</header>` + documentArea.innerHTML + `<footer>${document.getElementById("pie").value}</footer>`;
    closeModal();
  };
  document.getElementById("cancel").onclick = () => closeModal();
}

// --- Numerar páginas ---
function numerarPaginas() {
  openModal("Numerar Páginas", `
    <label>Tamaño:</label><input id="tamano" type="number" min="8" max="30">
    <label>Posición:</label>
    <select id="posicion">
      <option>Superior Izquierda</option>
      <option>Superior Derecha</option>
      <option>Inferior Izquierda</option>
      <option>Inferior Derecha</option>
    </select>
    <button id="aplicar">Aceptar</button>
    <button id="cancel">Cancelar</button>
  `);

  document.getElementById("aplicar").onclick = () => {
    const tamano = document.getElementById("tamano").value;
    const pos = document.getElementById("posicion").value;
    if (!tamano || !pos) {
      alert("Debe elegir tamaño y lugar de numeración");
      return;
    }
    documentArea.innerHTML += `<div style="font-size:${tamano}px; text-align:${pos.includes("Derecha")?"right":"left"};">1</div>`;
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
      case "Paginado": configurarPaginado(); break;
      case "Deshacer": deshacer(); break;
      case "Rehacer": rehacer(); break;
      case "Encabezado y Pié": encabezadoPie(); break;
      case "Numerar Páginas": numerarPaginas(); break;
    }
  });
});

// --- Barra de formato ---
document.getElementById("font-family").addEventListener("change", e => {
  document.execCommand("fontName", false, e.target.value);
});
document.getElementById("font-size").addEventListener("change", e => {
  document.execCommand("fontSize", false, e.target.value);
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
  console.log("Guardado automático en formato .myd");
  // Aquí luego implementaremos la lógica real de guardado en JSON
}, 60000);
