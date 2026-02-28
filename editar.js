// editar.js

document.addEventListener("DOMContentLoaded", () => {
  const docContent = document.getElementById("doc-content");

  // === Función auxiliar: aplicar comando ===
  function aplicarComando(comando) {
    document.execCommand(comando, false, null);
    docContent.focus();
  }

  // === Botón Deshacer ===
  const btnDeshacer = document.querySelector("#toolbar img[alt='Deshacer']").parentElement;
  btnDeshacer.addEventListener("click", () => {
    aplicarComando("undo");
  });

  // === Botón Rehacer ===
  const btnRehacer = document.querySelector("#toolbar img[alt='Rehacer']").parentElement;
  btnRehacer.addEventListener("click", () => {
    aplicarComando("redo");
  });
});
