// archivo.js

document.addEventListener("DOMContentLoaded", () => {

  // Referencias a los modales
  const modalNuevo = document.getElementById("modal-nuevo");
  const modalAbrir = document.getElementById("modal-abrir");
  const modalGuardar = document.getElementById("modal-guardar");
  const modalGuardarComo = document.getElementById("modal-guardar-como");
  const modalImprimir = document.getElementById("modal-imprimir");
  const modalPagina = document.getElementById("modal-pagina");

  const docContent = document.getElementById("doc-content");

  // Funciones para abrir/cerrar modales
  function abrirModal(modal) {
    modal.style.display = "flex";
    docContent.setAttribute("contenteditable", "false");
  }

  function cerrarModal(modal) {
    modal.style.display = "none";
    docContent.setAttribute("contenteditable", "true");
  }

  // === Archivo > Nuevo ===
  document.getElementById("nuevo").addEventListener("click", () => {
    abrirModal(modalNuevo);
    const botones = modalNuevo.querySelectorAll("button");
    botones[0].onclick = () => {
      // Guardar documento actual (exportar en .mpd/.docx/.pdf)
      alert("Exportar documento actual (pendiente de implementar)");
      cerrarModal(modalNuevo);
      docContent.innerHTML = ""; // crear documento vacío
    };
    botones[1].onclick = () => {
      // No guardar, simplemente crear documento nuevo
      docContent.innerHTML = "";
      cerrarModal(modalNuevo);
    };
  });

  // === Archivo > Abrir ===
  document.getElementById("abrir").addEventListener("click", () => {
    abrirModal(modalAbrir);
    const botones = modalAbrir.querySelectorAll("button");
    botones[0].onclick = () => {
      alert("Guardar documento actual antes de abrir otro (pendiente de implementar)");
      cerrarModal(modalAbrir);
      alert("Abrir documento seleccionado (pendiente de implementar)");
    };
    botones[1].onclick = () => {
      // No guardar, abrir documento nuevo
      cerrarModal(modalAbrir);
      alert("Abrir documento seleccionado (pendiente de implementar)");
    };
  });

  // === Archivo > Guardar ===
  document.getElementById("guardar").addEventListener("click", () => {
    abrirModal(modalGuardar);
    const botones = modalGuardar.querySelectorAll("button");
    botones[0].onclick = () => {
      alert("Guardar documento en formato .mpd (pendiente de implementar)");
      cerrarModal(modalGuardar);
    };
    botones[1].onclick = () => cerrarModal(modalGuardar);
  });

  // === Archivo > Guardar Como ===
  document.getElementById("guardar-como").addEventListener("click", () => {
    abrirModal(modalGuardarComo);
    const botones = modalGuardarComo.querySelectorAll("button");
    botones[0].onclick = () => {
      const formato = modalGuardarComo.querySelector("select").value;
      alert("Guardar documento como " + formato + " (pendiente de implementar)");
      cerrarModal(modalGuardarComo);
    };
    botones[1].onclick = () => cerrarModal(modalGuardarComo);
  });

  // === Archivo > Imprimir ===
  document.getElementById("imprimir").addEventListener("click", () => {
    abrirModal(modalImprimir);
    const botones = modalImprimir.querySelectorAll("button");
    botones[0].onclick = () => {
      const paginas = modalImprimir.querySelector("input[type=text]").value;
      const copias = modalImprimir.querySelector("input[type=number]").value;
      alert("Imprimir páginas: " + paginas + " | Copias: " + copias + " (pendiente de implementar)");
      cerrarModal(modalImprimir);
    };
    botones[1].onclick = () => cerrarModal(modalImprimir);
  });

  // === Archivo > Página ===
  document.getElementById("pagina").addEventListener("click", () => {
    abrirModal(modalPagina);
    const botones = modalPagina.querySelectorAll("button");
    botones[0].onclick = () => {
      const orientacion = modalPagina.querySelectorAll("select")[0].value;
      const papel = modalPagina.querySelectorAll("select")[1].value;
      const margenes = {
        derecho: modalPagina.querySelectorAll("select")[2].value,
        izquierdo: modalPagina.querySelectorAll("select")[3].value,
        superior: modalPagina.querySelectorAll("select")[4].value,
        inferior: modalPagina.querySelectorAll("select")[5].value
      };
      alert("Aplicar configuración: " + orientacion + ", " + papel + ", márgenes: " + JSON.stringify(margenes));
      cerrarModal(modalPagina);
    };
    botones[1].onclick = () => cerrarModal(modalPagina);
  });

});
