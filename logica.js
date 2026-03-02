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
        colorTexto: "#ff8800",
        colorFondo: "#ffffff",
        fontSize: 8,
        fontName: "Arial"
    };

    let configPagina = {
        tamaño: "A4",
        orientacion: "Vertical",
        margen: { top: 20, bottom: 20, left: 20, right: 20 }
    };

    const tamañosPredefinidos = {
        A3: { width: 1123, height: 1587 },
        A4: { width: 794, height: 1123 },
        A5: { width: 559, height: 794 },
        Carta: { width: 816, height: 1056 }
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
    window.crearPagina = function() {
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
        page.style.display = "flex";
        page.style.flexDirection = "column";

        const header = document.createElement("div");
        header.className = "page-header";
        header.contentEditable = false;

        const content = document.createElement("div");
        content.className = "page-content";
        content.contentEditable = true;
        content.style.flex = "1";
        content.style.outline = "none";
        content.style.minHeight = tamaño.height - configPagina.margen.top - configPagina.margen.bottom - 80 + "px";

        const footer = document.createElement("div");
        footer.className = "page-footer";
        footer.contentEditable = false;

        page.appendChild(header);
        page.appendChild(content);
        page.appendChild(footer);

        content.addEventListener("input", verificarOverflow);

        return page;
    };

    editor.innerHTML = "";
    editor.appendChild(window.crearPagina());

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
                    nuevaPagina = window.crearPagina();
                    editor.appendChild(nuevaPagina);
                }
                nuevaPagina.querySelector(".page-content").prepend(content.lastChild);
            }
        });
        if (window.aplicarNumeracion) window.aplicarNumeracion();
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

    // BOTONES DE FORMATO
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
    // TABLAS
    // =====================
    document.querySelectorAll(".grid-tabla div").forEach((cell, index) => {
        cell.onclick = () => {
            const cols = (index % 10) + 1;
            const rows = Math.floor(index / 10) + 1;
            insertarTabla(rows, cols);
        };
    });

    function insertarTabla(filas, columnas) {
        restaurarCursor();
        const table = document.createElement("table");
        table.style.borderCollapse = "collapse";
        table.style.tableLayout = "fixed";
        table.style.width = "100%";

        for (let i = 0; i < filas; i++) {
            const tr = document.createElement("tr");
            for (let j = 0; j < columnas; j++) {
                const td = document.createElement("td");
                td.style.minWidth = "50px";
                td.style.height = "30px";
                td.style.padding = "2px";
                td.style.border = "1px solid #000";
                td.style.overflow = "hidden";
                td.contentEditable = true;
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }

        document.execCommand("insertHTML", false, table.outerHTML + "<br>");
    }

    // =====================
    // ÍNDICES
    // =====================
    document.querySelectorAll("[id^='btnIndice']").forEach(btn => {
        btn.onclick = () => {
            indiceActivo = btn.id;
            contadorIndice = 1;
        };
    });

    editor.addEventListener("keydown", e => {
        if (!indiceActivo) return;
        if (e.key === "Enter") {
            e.preventDefault();
            restaurarCursor();
            let formato = "";
            if (indiceActivo.includes("1)")) formato = `${contadorIndice}) `;
            if (indiceActivo.includes("1.")) formato = `${contadorIndice}. `;
            if (indiceActivo.includes("A)")) formato = String.fromCharCode(64 + contadorIndice) + ") ";
            if (indiceActivo.includes("a)")) formato = String.fromCharCode(96 + contadorIndice) + ") ";
            if (indiceActivo.includes("A.")) formato = String.fromCharCode(64 + contadorIndice) + ". ";
            if (indiceActivo.includes("a.")) formato = String.fromCharCode(96 + contadorIndice) + ". ";
            document.execCommand("insertHTML", false, `<br>${formato}`);
            contadorIndice++;
        }
    });

    // =====================
    // DESHACER / REHACER
    // =====================
    btnDeshacer.onclick = () => { restaurarCursor(); document.execCommand("undo"); };
    btnRehacer.onclick = () => { restaurarCursor(); document.execCommand("redo"); };

    // =====================
    // NUMERACIÓN
    // =====================
    window.aplicarNumeracion = function() {
        document.querySelectorAll(".numero-pagina").forEach(n => n.remove());
        if (!configNumeracion) return;

        document.querySelectorAll(".page").forEach((page, index) => {
            const num = document.createElement("div");
            num.className = "numero-pagina";
            num.textContent = index + 1;
            num.style.position = "absolute";
            num.style.fontSize = "20px";

            let target = page.querySelector(".page-footer");
            if (configNumeracion.includes("superior")) target = page.querySelector(".page-header");

            if (configNumeracion.includes("izquierda")) num.style.left = "20px";
            if (configNumeracion.includes("derecha")) num.style.right = "20px";

            target.appendChild(num);
        });
    };

});
