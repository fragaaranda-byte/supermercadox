document.addEventListener("DOMContentLoaded", () => {

const editor = document.getElementById("editor");

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

// =====================
// CURSOR
// =====================
document.addEventListener("selectionchange", () => {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (editor.contains(range.startContainer)) {
            rangoGuardado = range.cloneRange();
            // Actualizar select de tamaño de fuente en tiempo real
            const parent = range.startContainer.parentElement;
            if (parent) {
                const size = parseInt(window.getComputedStyle(parent).fontSize);
                if (!isNaN(size)) sizeSelect.value = size;
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
// CREAR PAGINA
// =====================
function crearPagina() {
    const page = document.createElement("div");
    page.className = "page";

    // Tamaño A4 en pixeles (794 x 1123)
    page.style.width = "794px";
    page.style.height = "1123px";
    page.style.padding = "0"; // Sin márgenes extras
    page.style.background = "#fff";
    page.style.position = "relative";
    page.style.boxSizing = "border-box";
    page.style.marginBottom = "20px";
    page.style.overflow = "hidden";
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

    const footer = document.createElement("div");
    footer.className = "page-footer";
    footer.contentEditable = false;

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

// =====================
// BOTONES
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
    let table = document.createElement("table");
    table.border = 1;
    table.style.borderCollapse = "collapse";
    table.style.width = "auto";

    for (let i = 0; i < filas; i++) {
        let tr = document.createElement("tr");
        for (let j = 0; j < columnas; j++) {
            let td = document.createElement("td");
            td.style.minWidth = "50px";
            td.style.height = "30px";
            td.style.resize = "both";
            td.style.overflow = "auto";
            td.innerHTML = "&nbsp;";
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    document.execCommand("insertHTML", false, table.outerHTML + "<br>");
}

// =====================
// MODALES FUNCIONALES
// =====================
function abrirModalNumeracion() {
    const modal = document.getElementById("modalNumeracion");
    const overlay = document.getElementById("overlay");
    if (!modal || !overlay) return;

    modal.classList.remove("oculto");
    overlay.classList.remove("oculto");

    let seleccion = null;
    modal.querySelectorAll("button[data-pos]").forEach(btn => {
        btn.onclick = () => seleccion = btn.dataset.pos;
    });

    btnAceptarNumeracion.onclick = () => {
        if (seleccion) {
            configNumeracion = seleccion;
            aplicarNumeracion();
        }
        cerrarModal();
    };

    btnCancelarNumeracion.onclick = cerrarModal;
}

function cerrarModal() {
    const modal = document.getElementById("modalNumeracion");
    const overlay = document.getElementById("overlay");
    if (!modal || !overlay) return;
    modal.classList.add("oculto");
    overlay.classList.add("oculto");
}

btnNumerar.onclick = abrirModalNumeracion;

// =====================
// RESTO DEL CÓDIGO (no se toca)
// =====================
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
        if (configNumeracion.includes("top")) target = page.querySelector(".page-header");
        else target = page.querySelector(".page-footer");

        if (configNumeracion.includes("left")) num.style.left = "20px";
        if (configNumeracion.includes("right")) num.style.right = "20px";

        target.appendChild(num);
    });
}

btnNuevo.onclick = () => {
    if (confirm("Nuevo documento?")) {
        editor.innerHTML = "";
        editor.appendChild(crearPagina());
        configNumeracion = null;
    }
};

});
