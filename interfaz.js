// interfaz.js

// Esperamos a que cargue el DOM
document.addEventListener("DOMContentLoaded", () => {
  
  // === Menú Archivo desplegable ===
  const btnArchivo = document.getElementById("btn-archivo");
  const archivoMenu = document.getElementById("archivo-menu");

  btnArchivo.addEventListener("click", () => {
    archivoMenu.style.display = archivoMenu.style.display === "block" ? "none" : "block";
  });

  // Cerrar menú si se hace clic fuera
  document.addEventListener("click", (e) => {
    if (!btnArchivo.contains(e.target) && !archivoMenu.contains(e.target)) {
      archivoMenu.style.display = "none";
    }
  });

  // === Modales ===
  const modales = {
    numeracion: document.getElementById("modal-numeracion"),
    nuevo: document.getElementById("modal-nuevo"),
    abrir: document.getElementById("modal-abrir"),
    guardar: document.getElementById("modal-guardar"),
    guardarComo: document.getElementById("modal-guardar-como"),
    imprimir: document.getElementById("modal-imprimir"),
    pagina: document.getElementById("modal-pagina")
  };

  // Función para abrir modal
  function abrirModal(modal) {
    modal.style.display = "flex"; // usamos flex para centrar
    document.getElementById("doc-content").setAttribute("contenteditable", "false"); // bloquea edición
  }

  // Función para cerrar modal
  function cerrarModal(modal) {
    modal.style.display = "none";
    document.getElementById("doc-content").setAttribute("contenteditable", "true"); // desbloquea edición
  }

  // === Botón Numerar páginas ===
  const btnNumerar = document.getElementById("btn-numerar");
  btnNumerar.addEventListener("click", () => abrirModal(modales.numeracion));

  // === Opciones del menú Archivo ===
  document.getElementById("nuevo").addEventListener("click", () => abrirModal(modales.nuevo));
  document.getElementById("abrir").addEventListener("click", () => abrirModal(modales.abrir));
  document.getElementById("guardar").addEventListener("click", () => abrirModal(modales.guardar));
  document.getElementById("guardar-como").addEventListener("click", () => abrirModal(modales.guardarComo));
  document.getElementById("imprimir").addEventListener("click", () => abrirModal(modales.imprimir));
  document.getElementById("pagina").addEventListener("click", () => abrirModal(modales.pagina));

  // === Botones de cierre en cada modal ===
  document.querySelectorAll(".close-modal").forEach(btn => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal");
      cerrarModal(modal);
    });
  });

  // Cerrar modal si se hace clic fuera del contenido
  Object.values(modales).forEach(modal => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        cerrarModal(modal);
      }
    });
  });

});
