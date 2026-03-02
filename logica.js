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
        margen: { top: 20, bottom: 20, left: 20, right: 20 }
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
// TABLAS REDIMENSIONABLES (exacto estilo Word)
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
    table.style.width = "auto";

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
            td.style.position = "relative";

            // Cursor estilo Word
            td.addEventListener("mousemove", e => {
                if (e.offsetX > td.offsetWidth - 8) {
                    td.style.cursor = "col-resize";
                } else {
                    td.style.cursor = "text";
                }
            });

            // Redimensionamiento con posibilidad de Shift para varias celdas
            td.addEventListener("mousedown", e => {
                if (e.offsetX > td.offsetWidth - 8) {
                    iniciarRedimensionWord(e, td);
                    e.preventDefault();
                }
            });

            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

    // Insertar tabla en el cursor
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(table);
    range.collapse(false);

    const br = document.createElement("br");
    table.after(br);
}

// =====================
// Redimensionamiento estilo Word
// =====================
let celdaRedim = null;
let startX, startWidth;
let celdasColumna = [];

function iniciarRedimensionWord(e, td) {
    celdaRedim = td;
    startX = e.clientX;
    startWidth = td.offsetWidth;

    // Seleccionar todas las celdas de la columna si Shift está presionado
    if (e.shiftKey) {
        const table = td.closest("table");
        const index = Array.from(td.parentNode.children).indexOf(td);
        celdasColumna = Array.from(table.querySelectorAll("tr")).map(tr => tr.children[index]);
    } else {
        celdasColumna = [td];
    }

    document.addEventListener("mousemove", redimensionarWord);
    document.addEventListener("mouseup", detenerRedimensionWord);
}

function redimensionarWord(e) {
    if (!celdaRedim) return;
    const delta = e.clientX - startX;
    const nuevoAncho = startWidth + delta;
    if (nuevoAncho > 30) {
        celdasColumna.forEach(c => c.style.width = nuevoAncho + "px");
    }
}

function detenerRedimensionWord() {
    celdaRedim = null;
    celdasColumna = [];
    document.removeEventListener("mousemove", redimensionarWord);
    document.removeEventListener("mouseup", detenerRedimensionWord);
}

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
// NUMERACIÓN COMPLETA CORREGIDA
// =====================
btnNumerar.onclick = abrirModalNumeracion;

function abrirModalNumeracion() {
    const modal = document.getElementById("modalNumeracion");
    const overlay = document.getElementById("overlay");

    modal.classList.remove("oculto");
    overlay.classList.remove("oculto");

    let seleccion = null;
    let negrita = false;
    let cursiva = false;
    let subrayado = false;
    let tamanio = parseInt(document.getElementById("tamanioNumeracion").value);
    let colorTexto = document.getElementById("colorNumeracionTexto").value;
    let colorFondo = document.getElementById("colorNumeracionFondo").value;

    document.getElementById("posicionNumeracion").onchange = e => seleccion = e.target.value;
    document.getElementById("numNegrita").onclick = () => negrita = !negrita;
    document.getElementById("numCursiva").onclick = () => cursiva = !cursiva;
    document.getElementById("numSubrayado").onclick = () => subrayado = !subrayado;
    document.getElementById("tamanioNumeracion").onchange = e => tamanio = parseInt(e.target.value);
    document.getElementById("colorNumeracionTexto").onchange = e => colorTexto = e.target.value;
    document.getElementById("colorNumeracionFondo").onchange = e => colorFondo = e.target.value;

    document.getElementById("aceptarNumeracion").onclick = () => {
        if (!seleccion) return;

        configNumeracion = {
            posicion: seleccion,
            negrita,
            cursiva,
            subrayado,
            tamanio,
            colorTexto,
            colorFondo
        };

        aplicarNumeracion();
        cerrarModal();
    };

    document.getElementById("cancelarNumeracion").onclick = () => {
        // Borra todas las numeraciones
        document.querySelectorAll(".numero-pagina").forEach(n => n.remove());
        document.querySelectorAll(".page-header, .page-footer").forEach(hf => hf.style.height = "0px");
        configNumeracion = null;
        cerrarModal();
    };

    function cerrarModal() {
        modal.classList.add("oculto");
        overlay.classList.add("oculto");
    }
}

function aplicarNumeracion() {
    if (!configNumeracion) return;

    const esSuperior = configNumeracion.posicion.includes("superior");
    const esIzquierda = configNumeracion.posicion.includes("izquierda");
    const esDerecha = configNumeracion.posicion.includes("derecha");

    document.querySelectorAll(".page").forEach((page, index) => {
        let target = esSuperior ? page.querySelector(".page-header") : page.querySelector(".page-footer");

        // buscar numeración existente en este target
        let numExistente = target.querySelector(".numero-pagina");
        if (numExistente) {
            // actualizar estilos y número
            numExistente.textContent = index + 1;
            numExistente.style.fontWeight = configNumeracion.negrita ? "bold" : "normal";
            numExistente.style.fontStyle = configNumeracion.cursiva ? "italic" : "normal";
            numExistente.style.textDecoration = configNumeracion.subrayado ? "underline" : "none";
            numExistente.style.fontSize = configNumeracion.tamanio + "px";
            numExistente.style.color = configNumeracion.colorTexto;
            numExistente.style.backgroundColor = configNumeracion.colorFondo;
            numExistente.style.left = esIzquierda ? "20px" : "";
            numExistente.style.right = esDerecha ? "20px" : "";
        } else {
            // crear nueva numeración
            const num = document.createElement("div");
            num.className = "numero-pagina";
            num.textContent = index + 1;
            num.style.fontWeight = configNumeracion.negrita ? "bold" : "normal";
            num.style.fontStyle = configNumeracion.cursiva ? "italic" : "normal";
            num.style.textDecoration = configNumeracion.subrayado ? "underline" : "none";
            num.style.fontSize = configNumeracion.tamanio + "px";
            num.style.color = configNumeracion.colorTexto;
            num.style.backgroundColor = configNumeracion.colorFondo;
            num.style.position = "absolute";
            if (esIzquierda) num.style.left = "20px";
            if (esDerecha) num.style.right = "20px";

            target.appendChild(num);
        }

        // altura solo si hay numeración
        target.style.height = "56px";
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
