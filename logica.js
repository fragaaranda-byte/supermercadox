document.addEventListener("DOMContentLoaded", () => {

    const editor = document.getElementById("editor");

    // =====================
    // ESTADO GENERAL
    // =====================
    let archivoActual = null;
    let configNumeracion = null;
    let rangoGuardado = null;
    let indiceActivo = null;
    let contadorIndice = 1;

    let formatoActual = {
        colorTexto: "#000000",
        colorFondo: "#ffffff",
        fontSize: 8,
        fontName: "Arial"
    };

    let configPagina = {
        tamaño: "A4",
        margen: { top: 20, bottom: 20, left: 20, right: 20 },
        orientacion: "Vertical"
    };

    const tamañosPredefinidos = {
        A3: { width: 1123, height: 1587 },
        A4: { width: 794, height: 1123 },
        A5: { width: 559, height: 794 },
        Carta: { width: 816, height: 1056 },
        Legal: { width: 816, height: 1344 }
    };

    // =====================
    // CURSOR
    // =====================
    document.addEventListener("selectionchange", () => {
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            if (editor.contains(range.startContainer)) {
                rangoGuardado = range.cloneRange();
                const parent = range.startContainer.parentElement;
                if (parent) {
                    const size = parseInt(window.getComputedStyle(parent).fontSize);
                    if (!isNaN(size) && typeof sizeSelect !== "undefined") sizeSelect.value = size;
                }
            }
        }
    });

    function restaurarCursor() {
        if (!rangoGuardado) return;
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(rangoGuardado);
    }

    document.querySelectorAll("button, select, input, img").forEach(el => {
        el.addEventListener("mousedown", restaurarCursor);
    });

    // =====================
    // CREAR PÁGINA
    // =====================
    function crearPagina() {
        const page = document.createElement("div");
        page.className = "page";

        let tamaño = tamañosPredefinidos[configPagina.tamaño];
        if (configPagina.orientacion === "Horizontal") {
            tamaño = { width: tamaño.height, height: tamaño.width };
        }

        page.style.width = tamaño.width + "px";
        page.style.height = tamaño.height + "px";
        page.style.paddingTop = configPagina.margen.top + "px";
        page.style.paddingBottom = configPagina.margen.bottom + "px";
        page.style.paddingLeft = configPagina.margen.left + "px";
        page.style.paddingRight = configPagina.margen.right + "px";

        page.style.background = "#fff";
        page.style.position = "relative";
        page.style.boxSizing = "border-box";
        page.style.margin = "20px auto";
        page.style.boxShadow = "0 0 5px rgba(0,0,0,0.3)";

        const header = document.createElement("div");
        header.className = "page-header";
        header.contentEditable = false;
        header.style.height = "40px";

        const content = document.createElement("div");
        content.className = "page-content";
        content.contentEditable = true;
        content.style.flex = "1";
        content.style.outline = "none";
        content.style.minHeight = tamaño.height - configPagina.margen.top - configPagina.margen.bottom - 80 + "px";

        const footer = document.createElement("div");
        footer.className = "page-footer";
        footer.contentEditable = false;
        footer.style.height = "40px";

        page.appendChild(header);
        page.appendChild(content);
        page.appendChild(footer);

        content.addEventListener("input", verificarOverflow);

        return page;
    }

    editor.innerHTML = "";
    editor.appendChild(crearPagina());

    // =====================
    // OVERFLOW
    // =====================
    function verificarOverflow() {
        const pages = document.querySelectorAll(".page");
        pages.forEach((page, index) => {
            const content = page.querySelector(".page-content");
            while (content.scrollHeight > content.clientHeight) {
                let nuevaPagina = pages[index + 1];
                if (!nuevaPagina) {
                    nuevaPagina = crearPagina();
                    editor.appendChild(nuevaPagina);
                }
                nuevaPagina.querySelector(".page-content").prepend(content.lastChild);
            }
        });
        if (configNumeracion) aplicarNumeracion(configNumeracion);
    }

    // =====================
    // FORMATO
    // =====================
    editor.addEventListener("keyup", aplicarFormatoActual);
    editor.addEventListener("click", aplicarFormatoActual);

    function aplicarFormatoActual() {
        restaurarCursor();
        document.execCommand("fontName", false, formatoActual.fontName);
        document.execCommand("foreColor", false, formatoActual.colorTexto);
        document.execCommand("hiliteColor", false, formatoActual.colorFondo);
    }

    // =====================
    // BOTONES DE FORMATO
    // =====================
    btnNegrita.onclick = () => { restaurarCursor(); document.execCommand("bold"); };
    btnCursiva.onclick = () => { restaurarCursor(); document.execCommand("italic"); };
    btnSubrayado.onclick = () => { restaurarCursor(); document.execCommand("underline"); };

    fuenteSelect.onchange = e => {
        formatoActual.fontName = e.target.value;
        restaurarCursor();
        document.execCommand("fontName", false, formatoActual.fontName);
    };

    sizeSelect.value = "8";
    sizeSelect.onchange = e => {
        formatoActual.fontSize = e.target.value;
        restaurarCursor();
        const sel = window.getSelection();
        if (!sel.rangeCount) return;
        const range = sel.getRangeAt(0);
        if (!range.collapsed) {
            const span = document.createElement("span");
            span.style.fontSize = formatoActual.fontSize + "px";
            span.appendChild(range.extractContents());
            range.insertNode(span);
        } else {
            const span = document.createElement("span");
            span.style.fontSize = formatoActual.fontSize + "px";
            span.appendChild(document.createTextNode("\u200B"));
            range.insertNode(span);
            const newRange = document.createRange();
            newRange.setStart(span.firstChild, 1);
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);
            rangoGuardado = newRange.cloneRange();
        }
    };

    colorTexto.onchange = e => {
        formatoActual.colorTexto = e.target.value;
        restaurarCursor();
        document.execCommand("foreColor", false, formatoActual.colorTexto);
    };

    colorFondo.onchange = e => {
        formatoActual.colorFondo = e.target.value;
        restaurarCursor();
        document.execCommand("hiliteColor", false, formatoActual.colorFondo);
    };

    btnIzq.onclick = () => { restaurarCursor(); document.execCommand("justifyLeft"); };
    btnCentro.onclick = () => { restaurarCursor(); document.execCommand("justifyCenter"); };
    btnDer.onclick = () => { restaurarCursor(); document.execCommand("justifyRight"); };

    // =====================
    // APLICAR NUMERACIÓN
    // =====================
    function aplicarNumeracion(config) {
        document.querySelectorAll(".numero-pagina").forEach(n => n.remove());
        if (!config) return;

        document.querySelectorAll(".page").forEach((page, index) => {
            const num = document.createElement("div");
            num.className = "numero-pagina";
            num.textContent = index + 1;

            num.style.position = "absolute";
            num.style.fontSize = config.tamano + "px";
            if (config.estilo.negrita) num.style.fontWeight = "bold";
            if (config.estilo.cursiva) num.style.fontStyle = "italic";
            if (config.estilo.subrayado) num.style.textDecoration = "underline";

            let target = page.querySelector(".page-footer");
            if (config.posicion.includes("superior")) target = page.querySelector(".page-header");

            if (config.posicion.includes("izquierda")) num.style.left = "20px";
            if (config.posicion.includes("derecha")) num.style.right = "20px";

            target.appendChild(num);
        });
    }

    // =====================
    // APLICAR CONFIGURACIÓN DE PÁGINAS
    // =====================
    function aplicarConfigPaginas(configPaginasData) {
        if (!configPaginasData) return;

        configPagina.tamaño = configPaginasData.hoja;
        configPagina.orientacion = configPaginasData.orientacion;
        configPagina.margen.top = configPaginasData.margenes.supIzq * 10;
        configPagina.margen.left = configPaginasData.margenes.supIzq * 10;
        configPagina.margen.right = configPaginasData.margenes.supDer * 10;
        configPagina.margen.bottom = configPaginasData.margenes.infDer * 10;

        document.querySelectorAll(".page").forEach(page => {
            let tamaño = tamañosPredefinidos[configPagina.tamaño];
            if (configPagina.orientacion === "Horizontal") tamaño = { width: tamaño.height, height: tamaño.width };

            page.style.width = tamaño.width + "px";
            page.style.height = tamaño.height + "px";
            page.style.paddingTop = configPagina.margen.top + "px";
            page.style.paddingBottom = configPagina.margen.bottom + "px";
            page.style.paddingLeft = configPagina.margen.left + "px";
            page.style.paddingRight = configPagina.margen.right + "px";

            const content = page.querySelector(".page-content");
            content.style.minHeight = tamaño.height - configPagina.margen.top - configPagina.margen.bottom - 80 + "px";
        });

        verificarOverflow();
    }

    window.aplicarNumeracion = aplicarNumeracion;
    window.aplicarConfigPaginas = aplicarConfigPaginas;

});
