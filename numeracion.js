// numeracion.js

document.addEventListener("DOMContentLoaded", () => {
  const modalNumeracion = document.getElementById("modal-numeracion");
  const btnNumerar = document.getElementById("btn-numerar");
  const docArea = document.getElementById("doc-area");

  let numeracionActiva = false;
  let configNumeracion = {
    tamaño: "12",
    fuente: "Arial",
    negrita: false,
    cursiva: false,
    subrayado: false
  };

  // === Abrir modal ===
  btnNumerar.addEventListener("click", () => {
    modalNumeracion.style.display = "flex";
    docArea.querySelectorAll(".doc-content").forEach(c => c.setAttribute("contenteditable", "false"));
  });

  // === Cerrar modal ===
  function cerrarModal() {
    modalNumeracion.style.display = "none";
    docArea.querySelectorAll(".doc-content").forEach(c => c.setAttribute("contenteditable", "true"));
  }

  modalNumeracion.querySelector(".close-modal").addEventListener("click", () => {
    aplicarNumeracion();
    cerrarModal();
  });

  // === Configuración ===
  const selectTamaño = modalNumeracion.querySelector("select:nth-of-type(1)");
  const selectFuente = modalNumeracion.querySelector("select:nth-of-type(2)");
  const botonesFormato = modalNumeracion.querySelectorAll(".format-buttons button");

  botonesFormato[0].addEventListener("click", () => configNumeracion.negrita = !configNumeracion.negrita);
  botonesFormato[1].addEventListener("click", () => configNumeracion.cursiva = !configNumeracion.cursiva);
  botonesFormato[2].addEventListener("click", () => configNumeracion.subrayado = !configNumeracion.subrayado);

  selectTamaño.addEventListener("change", () => configNumeracion.tamaño = selectTamaño.value);
  selectFuente.addEventListener("change", () => configNumeracion.fuente = selectFuente.value);

  // === Aplicar numeración ===
  function aplicarNumeracion() {
    const paginas = docArea.querySelectorAll(".page");
    paginas.forEach((pagina, index) => {
      let numero = pagina.querySelector(".numero-pagina");
      if (!numero) {
        numero = document.createElement("div");
        numero.className = "numero-pagina";
        pagina.appendChild(numero);
      }
      numero.textContent = numeracionActiva ? (index + 1) : "";

      numero.style.position = "absolute";
      numero.style.bottom = "10px";
      numero.style.right = "10px";
      numero.style.fontSize = configNumeracion.tamaño + "px";
      numero.style.fontFamily = configNumeracion.fuente;
      numero.style.fontWeight = configNumeracion.negrita ? "bold" : "normal";
      numero.style.fontStyle = configNumeracion.cursiva ? "italic" : "normal";
      numero.style.textDecoration = configNumeracion.subrayado ? "underline" : "none";
    });
  }

  // === Toggle numeración ===
  const toggleNumeracion = document.getElementById("page-number-toggle");
  toggleNumeracion.addEventListener("click", () => {
    numeracionActiva = !numeracionActiva;
    aplicarNumeracion();
  });
});
