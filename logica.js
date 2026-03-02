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
        margen: { top: 15, bottom: 15, left: 15, right: 15 }
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
                // Actualizar select de tamaño en tiempo real
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

        const header = document.createElement("div");
        header.className = "page-header";
        header.contentEditable = false;
        header.style.height = "40px";

        const content = document.createElement("div");
        content.className = "page-content";
        content.contentEditable = true;
        content.style.flex = "1";
        content.style.outline = "none";
        content.style.minHeight = tamaño.height - configPagina.margen.top - configPagina.margen.bottom - 80 + "px"; // header + footer

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
        aplicarNumeracion();
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
// TABLAS REDIMENSIONABLES (HORIZONTAL + VERTICAL)
// =====================
let celdaRedim = null;
let startX, startY, startWidth, startHeight;
let redimDirection = null; // 'h' o 'v' o 'hv'

function iniciarRedimension(e) {
    const td = e.target;
    const rect = td.getBoundingClientRect();
    const margen = 8; // área de resizer

    const sobreDerecha = e.clientX > rect.right - margen;
    const sobreInferior = e.clientY > rect.bottom - margen;

    if (sobreDerecha && sobreInferior) redimDirection = 'hv';
    else if (sobreDerecha) redimDirection = 'h';
    else if (sobreInferior) redimDirection = 'v';
    else return;

    celdaRedim = td;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = td.offsetWidth;
    startHeight = td.offsetHeight;

    document.addEventListener("mousemove", redimensionar);
    document.addEventListener("mouseup", detenerRedimension);
    e.preventDefault();
}

function redimensionar(e) {
    if (!celdaRedim) return;
    if (redimDirection.includes('h')) {
        let nuevaAncho = startWidth + (e.clientX - startX);
        if (nuevaAncho > 30) celdaRedim.style.width = nuevaAncho + "px";
    }
    if (redimDirection.includes('v')) {
        let nuevaAltura = startHeight + (e.clientY - startY);
        if (nuevaAltura > 20) celdaRedim.style.height = nuevaAltura + "px";
    }
}

function detenerRedimension() {
    celdaRedim = null;
    redimDirection = null;
    document.removeEventListener("mousemove", redimensionar);
    document.removeEventListener("mouseup", detenerRedimension);
}

// Asignar evento a celdas nuevas
function asignarResizer(td) {
    td.style.position = "relative";
    td.addEventListener("mousedown", iniciarRedimension);
}

// Modificar función de inserción de tabla para usar asignarResizer
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
            asignarResizer(td);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

    document.execCommand("insertHTML", false, table.outerHTML + "<br>");
}

// =====================
// ÍNDICES CORRECTOS
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
        else if (indiceActivo.includes("1.")) formato = `${contadorIndice}. `;
        else if (indiceActivo.includes("A)")) formato = String.fromCharCode(64 + contadorIndice) + ") ";
        else if (indiceActivo.includes("a)")) formato = String.fromCharCode(96 + contadorIndice) + ") ";
        else if (indiceActivo.includes("A.")) formato = String.fromCharCode(64 + contadorIndice) + ". ";
        else if (indiceActivo.includes("a.")) formato = String.fromCharCode(96 + contadorIndice) + ". ";

        const sel = window.getSelection();
        if (!sel.rangeCount) return;
        const range = sel.getRangeAt(0);

        const br = document.createElement("br");
        const span = document.createElement("span");
        span.textContent = formato;

        range.deleteContents();
        range.insertNode(br);
        range.collapse(false);
        range.insertNode(span);

        // Mover cursor al final del índice
        const newRange = document.createRange();
        newRange.setStartAfter(span);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
        rangoGuardado = newRange.cloneRange();

        contadorIndice++;
    }
});

    // =====================
    // SÍMBOLOS
    // =====================
    document.querySelectorAll(".simbolos button").forEach(btn => {
        btn.onclick = () => {
            restaurarCursor();
            document.execCommand("insertText", false, btn.innerText);
        };
    });

    // =====================
    // INSERTAR IMAGEN
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
                document.execCommand("insertHTML", false, `<img src="${e.target.result}" style="max-width:300px;">`);
            };
            reader.readAsDataURL(file);
        };
        input.click();
    };

    // =====================
// TABLAS REDIMENSIONABLES (HORIZONTAL + VERTICAL)
// =====================
let celdaRedim = null;
let startX, startY, startWidth, startHeight;
let redimDirection = null; // 'h' o 'v' o 'hv'

function iniciarRedimension(e) {
    const td = e.target;
    const rect = td.getBoundingClientRect();
    const margen = 8; // área de resizer

    const sobreDerecha = e.clientX > rect.right - margen;
    const sobreInferior = e.clientY > rect.bottom - margen;

    if (sobreDerecha && sobreInferior) redimDirection = 'hv';
    else if (sobreDerecha) redimDirection = 'h';
    else if (sobreInferior) redimDirection = 'v';
    else return;

    celdaRedim = td;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = td.offsetWidth;
    startHeight = td.offsetHeight;

    document.addEventListener("mousemove", redimensionar);
    document.addEventListener("mouseup", detenerRedimension);
    e.preventDefault();
}

function redimensionar(e) {
    if (!celdaRedim) return;
    if (redimDirection.includes('h')) {
        let nuevaAncho = startWidth + (e.clientX - startX);
        if (nuevaAncho > 30) celdaRedim.style.width = nuevaAncho + "px";
    }
    if (redimDirection.includes('v')) {
        let nuevaAltura = startHeight + (e.clientY - startY);
        if (nuevaAltura > 20) celdaRedim.style.height = nuevaAltura + "px";
    }
}

function detenerRedimension() {
    celdaRedim = null;
    redimDirection = null;
    document.removeEventListener("mousemove", redimensionar);
    document.removeEventListener("mouseup", detenerRedimension);
}

// Asignar evento a celdas nuevas
function asignarResizer(td) {
    td.style.position = "relative";
    td.addEventListener("mousedown", iniciarRedimension);
}

// Modificar función de inserción de tabla para usar asignarResizer
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
            asignarResizer(td);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

    document.execCommand("insertHTML", false, table.outerHTML + "<br>");
}

    // =====================
    // DESHACER / REHACER
    // =====================
    btnDeshacer.onclick = () => { restaurarCursor(); document.execCommand("undo"); };
    btnRehacer.onclick = () => { restaurarCursor(); document.execCommand("redo"); };

    // =====================
    // NUMERACIÓN
    // =====================
    btnNumerar.onclick = abrirModalNumeracion;

    function abrirModalNumeracion() {
        const modal = document.getElementById("modalNumeracion");
        const overlay = document.getElementById("overlay");

        modal.classList.remove("oculto");
        overlay.classList.remove("oculto");

        let seleccion = null;

        document.getElementById("posicionNumeracion").onchange = e => seleccion = e.target.value;

        document.getElementById("aceptarNumeracion").onclick = () => {
            if (seleccion) {
                configNumeracion = seleccion;
                aplicarNumeracion();
            }
            cerrarModal();
        };
        document.getElementById("cancelarNumeracion").onclick = cerrarModal;

        function cerrarModal() {
            modal.classList.add("oculto");
            overlay.classList.add("oculto");
        }
    }

    function aplicarNumeracion() {
        document.querySelectorAll(".numero-pagina").forEach(n => n.remove());
        if (!configNumeracion) return;

        document.querySelectorAll(".page").forEach((page, index) => {
            const num = document.createElement("div");
            num.className = "numero-pagina";
            num.textContent = index + 1;
            num.style.position = "absolute";
            num.style.fontSize = "20px";

            let target;
            if (configNumeracion.includes("superior")) target = page.querySelector(".page-header");
            else target = page.querySelector(".page-footer");

            if (configNumeracion.includes("izquierda")) num.style.left = "20px";
            if (configNumeracion.includes("derecha")) num.style.right = "20px";

            target.appendChild(num);
        });
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
            configNumeracion = null;
            modal.classList.add("oculto");
            overlay.classList.add("oculto");
        };
        document.getElementById("nuevoNo").onclick = () => {
            modal.classList.add("oculto");
            overlay.classList.add("oculto");
        };
    };

});
