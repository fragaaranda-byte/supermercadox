// formato.js

document.addEventListener("DOMContentLoaded", () => {
  const docContent = document.getElementById("doc-content");

  // === Función auxiliar: aplicar comando de formato ===
  function aplicarFormato(comando, valor = null) {
    document.execCommand(comando, false, valor);
    docContent.focus();
  }

  // === Fuente ===
  const fuenteSelect = document.getElementById("fuente-select");
  fuenteSelect.addEventListener("change", () => {
    aplicarFormato("fontName", fuenteSelect.value);
  });

  // === Tamaño ===
  const tamanoSelect = document.getElementById("tamano-select");
  tamanoSelect.addEventListener("change", () => {
    aplicarFormato("fontSize", tamanoSelect.selectedIndex + 1); 
    // Nota: execCommand fontSize usa valores 1-7, luego ajustaremos con CSS
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const span = document.createElement("span");
      span.style.fontSize = tamanoSelect.value + "px";
      range.surroundContents(span);
    }
  });

  // === Negrita ===
  document.getElementById("btn-negrita").addEventListener("click", () => {
    aplicarFormato("bold");
  });

  // === Cursiva ===
  document.getElementById("btn-cursiva").addEventListener("click", () => {
    aplicarFormato("italic");
  });

  // === Subrayado ===
  document.getElementById("btn-subrayado").addEventListener("click", () => {
    aplicarFormato("underline");
  });

  // === Color de fuente ===
  const colorFuente = document.getElementById("color-fuente");
  colorFuente.addEventListener("input", () => {
    aplicarFormato("foreColor", colorFuente.value);
  });

  // === Color de resaltado ===
  const colorResaltado = document.getElementById("color-resaltado");
  colorResaltado.addEventListener("input", () => {
    aplicarFormato("hiliteColor", colorResaltado.value);
  });

  // === Alineación izquierda ===
  document.getElementById("align-left").addEventListener("click", () => {
    aplicarFormato("justifyLeft");
  });

  // === Alineación centro ===
  document.getElementById("align-center").addEventListener("click", () => {
    aplicarFormato("justifyCenter");
  });

  // === Alineación derecha ===
  document.getElementById("align-right").addEventListener("click", () => {
    aplicarFormato("justifyRight");
  });
});
