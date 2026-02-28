// archivo.js

document.addEventListener("DOMContentLoaded", () => {

  const docContent = document.getElementById("doc-content");

  // === Función para crear documento nuevo ===
  function nuevoDocumento() {
    docContent.innerHTML = "";
  }

  // === Función para abrir documento ===
  function abrirDocumento(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      docContent.innerHTML = e.target.result;
    };
    reader.readAsText(file);
  }

  // === Función para guardar documento ===
  function guardarDocumento(formato = "mpd") {
    let contenido = docContent.innerHTML;
    let blob;
    let nombreArchivo = "documento." + formato;

    if (formato === "mpd") {
      blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
    } else if (formato === "docx") {
      // Exportar como DOCX (simplificado: HTML dentro de un blob)
      blob = new Blob([contenido], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    } else if (formato === "pdf") {
      // Exportar como PDF (simplificado: HTML dentro de un blob)
      blob = new Blob([contenido], { type: "application/pdf" });
    }

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = nombreArchivo;
    link.click();
  }

  // === Función para imprimir documento ===
  function imprimirDocumento() {
    const ventana = window.open("", "_blank");
    ventana.document.write("<html><head><title>Imprimir</title></head><body>");
    ventana.document.write(docContent.innerHTML);
    ventana.document.write("</body></html>");
    ventana.document.close();
    ventana.print();
  }

  // === Función para configurar página ===
  function configurarPagina(opciones) {
    const page = document.querySelector(".page");

    // Orientación
    if (opciones.orientacion === "Horizontal") {
      page.style.width = "297mm";
      page.style.height = "210mm";
    } else {
      page.style.width = "210mm";
      page.style.height = "297mm";
    }

    // Márgenes
    docContent.style.paddingTop = opciones.superior + "mm";
    docContent.style.paddingBottom = opciones.inferior + "mm";
    docContent.style.paddingLeft = opciones.izquierdo + "mm";
    docContent.style.paddingRight = opciones.derecho + "mm";
  }

  // === Eventos de botones ===
  // Nuevo
  document.querySelector("#modal-nuevo button:nth-child(2)").onclick = () => {
    nuevoDocumento();
    document.getElementById("modal-nuevo").style.display = "none";
  };

  // Abrir
  document.querySelector("#modal-abrir button:nth-child(2)").onclick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".mpd,.docx,.pdf";
    input.onchange = e => abrirDocumento(e.target.files[0]);
    input.click();
    document.getElementById("modal-abrir").style.display = "none";
  };

  // Guardar
  document.querySelector("#modal-guardar button:first-child").onclick = () => {
    guardarDocumento("mpd");
    document.getElementById("modal-guardar").style.display = "none";
  };

  // Guardar Como
  document.querySelector("#modal-guardar-como button:first-child").onclick = () => {
    const formato = document.querySelector("#modal-guardar-como select").value.replace(".", "");
    guardarDocumento(formato);
    document.getElementById("modal-guardar-como").style.display = "none";
  };

  // Imprimir
  document.querySelector("#modal-imprimir button:first-child").onclick = () => {
    imprimirDocumento();
    document.getElementById("modal-imprimir").style.display = "none";
  };

  // Página
  document.querySelector("#modal-pagina button:first-child").onclick = () => {
    const selects = document.querySelectorAll("#modal-pagina select");
    const opciones = {
      orientacion: selects[0].value,
      papel: selects[1].value,
      derecho: selects[2].value,
      izquierdo: selects[3].value,
      superior: selects[4].value,
      inferior: selects[5].value
    };
    configurarPagina(opciones);
    document.getElementById("modal-pagina").style.display = "none";
  };

});
