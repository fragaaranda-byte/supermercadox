function crearPagina() {
    const page = document.createElement("div");
    page.className = "page";

    // Estilos básicos para que la página se vea
    page.style.width = "794px";
    page.style.height = "1123px";
    page.style.padding = "56px"; // margen interno
    page.style.background = "#fff";
    page.style.position = "relative";
    page.style.boxSizing = "border-box";
    page.style.marginBottom = "20px"; // separación entre páginas
    page.style.overflow = "hidden";

    const header = document.createElement("div");
    header.className = "page-header";
    header.contentEditable = false;

    const content = document.createElement("div");
    content.className = "page-content";
    content.contentEditable = true;

    const footer = document.createElement("div");
    footer.className = "page-footer";
    footer.contentEditable = false;

    page.appendChild(header);
    page.appendChild(content);
    page.appendChild(footer);

    // Mantener overflow original
    content.addEventListener("input", verificarOverflow);

    return page;
}
