document.addEventListener("DOMContentLoaded", () => {

const editor = document.getElementById("editor");
editor.innerHTML = "";

let archivoActual = null;
let configNumeracion = null;
let rangoGuardado = null;
let indiceActivo = null;

// =====================
// FORMATO ACTUAL
// =====================
let formatoActual = {
    colorTexto: "#000000",
    colorFondo: "#ffffff",
    fontSize: 8,
    fontName: "Arial"
};

// Medidas A4
const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;
const MARGEN = 56;

// =====================
// ELEMENTOS MODAL
// =====================
const btnNumerar = document.getElementById("btnNumerar");
const modalNumeracion = document.getElementById("modalNumeracion");
const overlay = document.getElementById("overlay");
const btnAceptarNumeracion = document.getElementById("btnAceptarNumeracion");
const btnCancelarNumeracion = document.getElementById("btnCancelarNumeracion");
let seleccionNumeracion = null;

// =====================
// PANEL INSERTAR TOGGLE
// =====================
const panelInsertar = document.getElementById("panel-insertar");
const togglePanel = document.getElementById("toggle-panel");

togglePanel.onclick = () => {
    panelInsertar.classList.toggle("oculto");
};

// =====================
// GUARDAR / RESTAURAR CURSOR
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

document.querySelectorAll("button, select, input, img").forEach(el => {
    el.addEventListener("mousedown", () => {
        restaurarCursor();
    });
});

// =====================
// CREAR PAGINA
// =====================
function crearPagina() {
    const page = document.createElement("div");
    page.className = "page";
    page.style.width = PAGE_WIDTH + "px";
    page.style.height = PAGE_HEIGHT + "px";
    page.style.margin = "20px auto";
    page.style.border = "1px solid #444";
    page.style.background = "white";
    page.style.position = "relative";
    page.style.display = "flex";
    page.style.flexDirection = "column";
    page.style.overflow = "hidden";

    const header = document.createElement("div");
    header.className = "page-header";
    header.style.height = MARGEN + "px";
    header.style.pointerEvents = "none";

    const content = document.createElement("div");
    content.className = "page-content";
    content.contentEditable = true;
    content.style.flex = "1";
    content.style.padding = MARGEN + "px";
    content.style.outline = "none";
    content.style.overflow = "hidden";
    content.style.wordWrap = "break-word";

    const footer = document.createElement("div");
    footer.className = "page-footer";
    footer.style.height = MARGEN + "px";
    footer.style.pointerEvents = "none";

    page.appendChild(header);
    page.appendChild(content);
    page.appendChild(footer);

    content.addEventListener("input", verificarOverflow);

    return page;
}

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
// FORMATO TEXTO
// =====================
btnNegrita.onclick = () => { restaurarCursor(); document.execCommand("bold"); };
btnCursiva.onclick = () => { restaurarCursor(); document.execCommand("italic"); };
btnSubrayado.onclick = () => { restaurarCursor(); document.execCommand("underline"); };

fuenteSelect.onchange = e => {
    formatoActual.fontName = e.target.value;
    restaurarCursor();
    document.execCommand("fontName", false, formatoActual.fontName);
};

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
// INSERTAR TABLA
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

    let table = `<table border="1" style="border-collapse:collapse;table-layout:fixed;">`;

    for (let i = 0; i < filas; i++) {
        table += "<tr>";
        for (let j = 0; j < columnas; j++) {
            table += `<td style="min-width:60px;min-height:30px;resize:both;overflow:auto;vertical-align:top;">&nbsp;</td>`;
        }
        table += "</tr>";
    }

    table += "</table><br>";
    document.execCommand("insertHTML", false, table);
}

// =====================
// INSERTAR SÍMBOLOS
// =====================
document.querySelectorAll(".simbolos button").forEach(btn => {
    btn.onclick = () => {
        restaurarCursor();
        document.execCommand("insertText", false, btn.textContent);
    };
});

// =====================
// INSERTAR IMAGEN
// =====================
const btnInsertarImagen = document.getElementById("btnInsertarImagen");

btnInsertarImagen.onclick = () => {
    restaurarCursor();
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            document.execCommand("insertHTML", false, `<img src="${reader.result}" style="max-width:300px;">`);
        };
        reader.readAsDataURL(file);
    };
    input.click();
};

// =====================
// INDICES (1) 1. A) a.)
// =====================
document.querySelectorAll("[id^='btnIndice']").forEach(btn=>{
    btn.onclick=()=>{
        restaurarCursor();
        indiceActivo = btn.id.replace("btnIndice","");
    };
});

editor.addEventListener("keydown", e => {
    if (indiceActivo && e.key === "Enter") {
        e.preventDefault();
        const count = document.querySelectorAll(".item-indice").length + 1;
        let texto = "";

        if(indiceActivo==="1)") texto = count + ") ";
        if(indiceActivo==="1.") texto = count + ". ";
        if(indiceActivo==="A)") texto = String.fromCharCode(64+count)+") ";
        if(indiceActivo==="a)") texto = String.fromCharCode(96+count)+") ";
        if(indiceActivo==="A.") texto = String.fromCharCode(64+count)+". ";
        if(indiceActivo==="a.") texto = String.fromCharCode(96+count)+". ";

        document.execCommand("insertHTML", false, `<div class="item-indice">${texto}</div>`);
    }
});

// =====================
// MODAL NUMERACION
// =====================
btnNumerar.onclick = () => {
    modalNumeracion.classList.remove("oculto");
    overlay.classList.remove("oculto");
};

document.querySelectorAll(".modal-botones-esquinas button").forEach(btn=>{
    btn.onclick=()=>{
        seleccionNumeracion = btn.dataset.pos;
        document.querySelectorAll(".modal-botones-esquinas button").forEach(b=>b.classList.remove("activo"));
        btn.classList.add("activo");
    };
});

btnAceptarNumeracion.onclick = ()=>{
    if(seleccionNumeracion){
        configNumeracion = seleccionNumeracion;
        aplicarNumeracion();
    }
    cerrarModal();
};

btnCancelarNumeracion.onclick = cerrarModal;
overlay.onclick = cerrarModal;

function cerrarModal(){
    modalNumeracion.classList.add("oculto");
    overlay.classList.add("oculto");
}

// =====================
// APLICAR NUMERACION
// =====================
function aplicarNumeracion() {
    document.querySelectorAll(".numero-pagina").forEach(n=>n.remove());
    if(!configNumeracion) return;

    document.querySelectorAll(".page").forEach((page,index)=>{
        const num=document.createElement("div");
        num.className="numero-pagina";
        num.textContent=index+1;
        num.style.position="absolute";
        num.style.fontSize="18px";
        num.style.pointerEvents="none";

        let target;
        if(configNumeracion.includes("top")){
            target=page.querySelector(".page-header");
            num.style.top="30px";
        } else {
            target=page.querySelector(".page-footer");
            num.style.bottom="30px";
        }

        if(configNumeracion.includes("left")) num.style.left="30px";
        if(configNumeracion.includes("right")) num.style.right="30px";

        target.appendChild(num);
    });
}

// =====================
// NUEVO DOCUMENTO
// =====================
btnNuevo.onclick=()=>{
    if(confirm("Nuevo documento?")){
        editor.innerHTML="";
        editor.appendChild(crearPagina());
        configNumeracion=null;
    }
};

});
