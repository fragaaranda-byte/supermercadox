// Selección de elementos clave
const documentArea = document.getElementById("document");
const modal = document.getElementById("modal");
const modalContent = modal.querySelector(".modal-content");

// Función para abrir modal con contenido dinámico
function openModal(title, contentHTML) {
  modalContent.innerHTML = `
    <h2>${title}</h2>
    <div>${contentHTML}</div>
    <div class="modal-buttons">
      <button id="modal-accept">Aceptar</button>
      <button id="modal-cancel">Cancelar</button>
    </div>
  `;
  modal.classList.remove("hidden");

  // Botones del modal
  document.getElementById("modal-cancel").onclick = () => closeModal();
  document.getElementById("modal-accept").onclick = () => closeModal();
}

// Función para cerrar modal
function closeModal() {
  modal.classList.add("hidden");
}

// Menús principales
document.querySelectorAll(".menu li").forEach(item => {
  item.addEventListener("click", () => {
    const text = item.innerText.trim();

    switch(text) {
      case "Nuevo":
        openModal("Nuevo Documento", `
          <p>¿Desea guardar el documento actual y empezar uno nuevo?</p>
          <button id="delete-current">Borrar Actual</button>
          <button id="save-current">Guardar Actual</button>
        `);
        break;

      case "Abrir":
        openModal("Abrir Documento", `
          <p>Seleccione un archivo (.myd o .docx)</p>
          <input type="file" accept=".myd,.docx">
        `);
        break;

      case "Guardar":
        openModal("Guardar Documento", `
          <p>Guardando documento actual...</p>
        `);
        break;

      case "Guardar Como":
        openModal("Guardar Como", `
          <p>Seleccione carpeta y formato:</p>
          <input type="text" placeholder="Nombre del archivo">
          <select>
            <option value="myd">.myd</option>
            <option value="docx">.docx</option>
          </select>
        `);
        break;

      case "Imprimir":
        openModal("Imprimir Documento", `
          <label>Destino:</label>
          <select><option>Guardar como PDF</option></select>
          <label>Páginas:</label>
          <input type="text" placeholder="Ej: 1-5,7,9">
          <label>Cantidad:</label>
          <input type="number" min="1" max="99" value="1">
        `);
        break;

      case "Paginado":
        openModal("Configurar Paginado", `
          <label>Orientación:</label>
          <select><option>Vertical</option><option>Horizontal</option></select>
          <label>Papel:</label>
          <select>
            <option>A4</option><option>A5</option><option>A3</option>
            <option>Legal</option><option>Folio</option><option>Carta</option>
          </select>
          <label>Márgen Izq:</label><input type="number" step="0.1" value="1.5">
          <label>Márgen Der:</label><input type="number" step="0.1" value="1.5">
          <label>Márgen Sup:</label><input type="number" step="0.1" value="1.5">
          <label>Márgen Inf:</label><input type="number" step="0.1" value="1.5">
        `);
        break;
    }
  });
});

// Barra de formato
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

// Guardado automático cada 1 minuto (simulado)
setInterval(() => {
  console.log("Guardado automático en formato .myd");
  // Aquí luego implementaremos la lógica real de guardado en JSON
}, 60000);
