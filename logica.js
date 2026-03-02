document.addEventListener("DOMContentLoaded", () => {

    const editor = document.getElementById("editor");

    // =====================
    // ESTADO GENERAL
    // =====================
    let archivoActual = null;
    let configNumeracion = null;
    let rangoGuardado = null;
    let indiceActivo = null;
    let contadorIndiceGlobal = 1; // Numeración global
    let indicesActivos = []; // Lista de todos los indices en el documento

    let formatoActual = {
        colorTexto: "#000000",
        colorFondo: "#ffffff",
        fontSize: 8,
        fontName: "Arial"
    };

    let configPagina = {
        tamaño: "A4",
        margen: { top: 0, bottom: 0, left: 20, right: 20 } // eliminamos margenes top/bottom
    };

    const tamañosPredefinidos = {
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
            }
        }
    });

    function restaurarCursor() {
        if (!rangoGuardado) return;
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(rangoGuardado);
    }

    // Restaurar cursor al interactuar con controles
    document.querySelectorAll("button, select, input, img").forEach(el => {
        el.addEventListener("mousedown", restaurarCursor);
    });

    // =====================
    // CREAR PÁGINA
    // =====================
    function crearPagina() {
        const page = document.createElement("div");
        page.className = "page";

        const tamaño = tamañosPredefinidos[configPagina.tamaño];
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

        const content = document.createElement("div");
        content.className = "page-content";
        content.contentEditable = true;
        content.style.flex = "1";
        content.style.outline = "none";
        content.style.minHeight = tamaño.height - configPagina.margen.top - configPagina.margen.bottom + "px";
        content.addEventListener("input", verificarOverflow);

        page.appendChild(content);
        return page;
    }

    // Inicializar editor con una página
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
// TABLAS REDIMENSIONABLES
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
    table.style.width = "auto"; // ancho automático según contenido

    for (let i = 0; i < filas; i++) {
        const tr = document.createElement("tr");
        for (let j = 0; j < columnas; j++) {
            const td = document.createElement("td");
            td.style.minWidth = "50px";
            td.style.height = "30px";
            td.style.padding = "2px";
            td.style.border = "1px solid #000";
            td.style.overflow = "hidden";
            td.style.position = "relative";
            td.contentEditable = true;
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    range.insertNode(table);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);

    agregarRedimensionTabla(table);
}

function agregarRedimensionTabla(table) {
    const tds = table.querySelectorAll("td");
    tds.forEach(td => {
        // Right handle
        const handle = document.createElement("div");
        handle.style.width = "6px";
        handle.style.height = "100%";
        handle.style.position = "absolute";
        handle.style.top = 0;
        handle.style.right = 0;
        handle.style.cursor = "col-resize";
        td.appendChild(handle);
        handle.addEventListener("mousedown", e => {
            e.preventDefault();
            startResize(e, td, "col");
        });

        // Bottom handle
        const handleB = document.createElement("div");
        handleB.style.height = "6px";
        handleB.style.width = "100%";
        handleB.style.position = "absolute";
        handleB.style.bottom = 0;
        handleB.style.left = 0;
        handleB.style.cursor = "row-resize";
        td.appendChild(handleB);
        handleB.addEventListener("mousedown", e => {
            e.preventDefault();
            startResize(e, td, "row");
        });
    });
}

let resizing = false, resizeTd, resizeType, startX, startY, startWidth, startHeight;

function startResize(e, td, type) {
    resizing = true;
    resizeTd = td;
    resizeType = type;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = td.offsetWidth;
    startHeight = td.offsetHeight;
    document.addEventListener("mousemove", doResize);
    document.addEventListener("mouseup", stopResize);
}

function doResize(e) {
    if (!resizing) return;
    if (resizeType === "col") {
        let nuevaWidth = startWidth + (e.clientX - startX);
        if (nuevaWidth > 30) resizeTd.style.width = nuevaWidth + "px";
    } else if (resizeType === "row") {
        let nuevaHeight = startHeight + (e.clientY - startY);
        if (nuevaHeight > 20) resizeTd.style.height = nuevaHeight + "px";
    }
}

function stopResize() {
    resizing = false;
    resizeTd = null;
    document.removeEventListener("mousemove", doResize);
    document.removeEventListener("mouseup", stopResize);
}

    // =====================
// INSERTAR IMAGEN REDIMENSIONABLE
// =====================
btnInsertarImagen.onclick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            restaurarCursor();
            const wrapper = document.createElement("div");
            wrapper.style.display = "inline-block";
            wrapper.style.position = "relative";
            wrapper.style.minWidth = "50px";
            wrapper.style.minHeight = "50px";

            const img = document.createElement("img");
            img.src = e.target.result;
            img.style.maxWidth = "300px";
            img.style.height = "auto";
            img.style.cursor = "move";
            img.style.display = "block";

            wrapper.appendChild(img);
            makeImageResizableAndDraggable(wrapper);

            const sel = window.getSelection();
            if (!sel.rangeCount) return;
            sel.getRangeAt(0).insertNode(wrapper);
        };
        reader.readAsDataURL(file);
    };
    input.click();
};

function makeImageResizableAndDraggable(wrapper) {
    const img = wrapper.querySelector("img");
    let offsetX, offsetY, dragging = false, resizing = false, startX, startY, startWidth, startHeight;
    
    // Crear handle de esquina inferior derecha
    const handle = document.createElement("div");
    handle.style.width = "10px";
    handle.style.height = "10px";
    handle.style.position = "absolute";
    handle.style.right = "0";
    handle.style.bottom = "0";
    handle.style.cursor = "se-resize";
    handle.style.background = "#FA932D";
    wrapper.appendChild(handle);

    // Arrastre
    img.addEventListener("mousedown", e => {
        if (e.target === handle) return; // ignorar si se arrastra desde el handle
        dragging = true;
        offsetX = e.offsetX;
        offsetY = e.offsetY;
        wrapper.style.zIndex = 1000;
    });

    // Redimension
    handle.addEventListener("mousedown", e => {
        e.stopPropagation();
        resizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = img.offsetWidth;
        startHeight = img.offsetHeight;
    });

    document.addEventListener("mousemove", e => {
        if (dragging) {
            wrapper.style.position = "absolute";
            wrapper.style.left = e.pageX - offsetX + "px";
            wrapper.style.top = e.pageY - offsetY + "px";
        } else if (resizing) {
            let newWidth = startWidth + (e.clientX - startX);
            let newHeight = startHeight + (e.clientY - startY);
            if (newWidth > 20) img.style.width = newWidth + "px";
            if (newHeight > 20) img.style.height = newHeight + "px";
        }
    });

    document.addEventListener("mouseup", e => {
        dragging = false;
        resizing = false;
    });
}

    // =====================
// INDICES GLOBALES
// =====================
let contadorIndiceGlobal = 1;
let indiceActivo = null;

document.querySelectorAll("[id^='btnIndice']").forEach(btn => {
    btn.onclick = () => {
        indiceActivo = btn.id;
        resetBtnIndice();
        btn.style.backgroundColor = "#FA932D"; // resaltar botón activo
    };
});

editor.addEventListener("keydown", e => {
    if (!indiceActivo) return;

    if (e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) {
            // Shift+Enter: salto de página real y desactivar índice
            insertarSaltoPagina();
            indiceActivo = null;
            resetBtnIndice();
            return;
        }
        restaurarCursor();
        insertarIndice(indiceActivo);
    }
});

function insertarIndice(tipo) {
    // Determinar formato
    let formato = "";
    if (tipo.includes("1)")) formato = `${contadorIndiceGlobal}) `;
    else if (tipo.includes("1.")) formato = `${contadorIndiceGlobal}. `;
    else if (tipo.includes("A)")) formato = String.fromCharCode(64 + contadorIndiceGlobal) + ") ";
    else if (tipo.includes("a)")) formato = String.fromCharCode(96 + contadorIndiceGlobal) + ") ";
    else if (tipo.includes("A.")) formato = String.fromCharCode(64 + contadorIndiceGlobal) + ". ";
    else if (tipo.includes("a.")) formato = String.fromCharCode(96 + contadorIndiceGlobal) + ". ";

    const span = document.createElement("span");
    span.className = "indice";
    span.textContent = formato;
    span.contentEditable = false;
    span.style.userSelect = "none";
    span.style.cursor = "default";

    // Reiniciar numeración por clic derecho
    span.oncontextmenu = e => {
        e.preventDefault();
        contadorIndiceGlobal = 1;
        span.textContent = formato;
    };

    const br = document.createElement("br");

    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);

    range.insertNode(br); // Insertar salto de línea antes
    range.insertNode(span);
    range.setStartAfter(span);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);

    contadorIndiceGlobal++;
}

function resetBtnIndice() {
    document.querySelectorAll("[id^='btnIndice']").forEach(btn => btn.style.backgroundColor = "#F78719");
}

// =====================
// SALTO DE PÁGINA
// =====================
function insertarSaltoPagina() {
    const page = crearPagina();
    editor.appendChild(page);
}

    // =====================
    // NUEVO DOCUMENTO
    // =====================
    btnNuevo.onclick = () => {
        const modal = document.getElementById("modalNuevo");
        const overlay = document.getElementById("overlay");
        modal.classList.remove("oculto");
        overlay.classList.remove("oculto");

        document.getElementById("nuevoSi").onclick = () => {
            editor.innerHTML = "";
            editor.appendChild(crearPagina());
            contadorIndiceGlobal = 1;
            indiceActivo = null;
            resetBtnIndice();
            modal.classList.add("oculto");
            overlay.classList.add("oculto");
        };
        document.getElementById("nuevoNo").onclick = () => {
            modal.classList.add("oculto");
            overlay.classList.add("oculto");
        };
    };

});
