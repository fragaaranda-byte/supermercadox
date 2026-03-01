document.addEventListener("DOMContentLoaded", () => {

const editor = document.getElementById("editor");
editor.innerHTML = "";

let archivoActual = null;
let configNumeracion = null;
let rangoGuardado = null;
let indiceActivo = false;
let contadorIndice = 1;

// =====================
// FORMATO ACTUAL (persistente)
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
    header.className = "header";
    header.style.height = MARGEN + "px";
    header.style.pointerEvents = "none";

    const content = document.createElement("div");
    content.className = "content";
    content.contentEditable = true;
    content.style.flex = "1";
    content.style.padding = MARGEN + "px";
    content.style.outline = "none";
    content.style.overflow = "hidden";
    content.style.wordWrap = "break-word";

    const footer = document.createElement("div");
    footer.className = "footer";
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
        const content = page.querySelector(".content");

        while (content.scrollHeight > content.clientHeight) {
            let nuevaPagina = pages[index + 1];
            if (!nuevaPagina) {
                nuevaPagina = crearPagina();
                editor.appendChild(nuevaPagina);
            }
            nuevaPagina.querySelector(".content").prepend(content.lastChild);
        }
    });

    aplicarNumeracion();
}

// =====================
// FORMATO ACTUAL
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
// BOTONES FORMATO
// =====================
btnNegrita.onclick = () => { restaurarCursor(); document.execCommand("bold"); };
btnCursiva.onclick = () => { restaurarCursor(); document.execCommand("italic"); };
btnSubrayado.onclick = () => { restaurarCursor(); document.execCommand("underline"); };

fuenteSelect.onchange = e => {
    formatoActual.fontName = e.target.value;
    restaurarCursor();
    document.execCommand("fontName", false, formatoActual.fontName);
};

// =====================
// FIX DEFINITIVO TAMAÑO FUENTE
// =====================
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

    let table = `<table border="1" style="border-collapse:collapse;width:auto;">`;
    for (let i = 0; i < filas; i++) {
        table += "<tr>";
        for (let j = 0; j < columnas; j++) {
            table += `<td style="min-width:50px;height:30px;vertical-align:top;">&nbsp;</td>`;
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
// INSERTAR EMOJIS
// =====================
document.querySelectorAll(".emojis img").forEach(img => {
    img.onclick = () => {
        restaurarCursor();
        document.execCommand("insertHTML", false, `<img src="${img.src}" width="32">`);
    };
});

// =====================
// INSERTAR IMAGEN
// =====================
btnImagen.onclick = () => {
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
// INDICE
// =====================
btnIndice.onclick = () => {
    indiceActivo = !indiceActivo;
    contadorIndice = 1;
};

editor.addEventListener("keydown", e => {
    if (indiceActivo && e.key === "Enter") {
        e.preventDefault();
        restaurarCursor();
        document.execCommand("insertHTML", false, `<br>${contadorIndice}) `);
        contadorIndice++;
    }
});

// =====================
// NUMERACION
// =====================
btnNumerar.onclick = abrirModalNumeracion;

function abrirModalNumeracion() {
    const overlay = document.createElement("div");
    overlay.style.position="fixed";
    overlay.style.top=0;
    overlay.style.left=0;
    overlay.style.width="100%";
    overlay.style.height="100%";
    overlay.style.background="rgba(0,0,0,0.6)";
    overlay.style.display="flex";
    overlay.style.justifyContent="center";
    overlay.style.alignItems="center";
    overlay.style.zIndex=9999;

    const modal=document.createElement("div");
    modal.style.background="#222";
    modal.style.color="white";
    modal.style.padding="20px";
    modal.style.borderRadius="10px";

    modal.innerHTML=`
        <h3>Numeración</h3>
        <button class="pos sup-izq">↖</button>
        <button class="pos sup-der">↗</button>
        <button class="pos inf-izq">↙</button>
        <button class="pos inf-der">↘</button><br><br>
        <button id="aceptarNum">Aceptar</button>
        <button id="cancelarNum">Cancelar</button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    let seleccion=null;

    modal.querySelectorAll(".pos").forEach(btn=>{
        btn.onclick=()=>{
            seleccion=btn.classList[1];
            modal.querySelectorAll(".pos").forEach(b=>b.style.background="");
            btn.style.background="yellow";
        };
    });

    aceptarNum.onclick=()=>{
        if(seleccion){
            configNumeracion=seleccion;
            aplicarNumeracion();
        }
        overlay.remove();
    };

    cancelarNum.onclick=()=>overlay.remove();
}

function aplicarNumeracion() {
    document.querySelectorAll(".numero-pagina").forEach(n=>n.remove());
    if(!configNumeracion) return;

    document.querySelectorAll(".page").forEach((page,index)=>{
        const num=document.createElement("div");
        num.className="numero-pagina";
        num.textContent=index+1;
        num.style.position="absolute";
        num.style.fontSize="20px";
        num.style.pointerEvents="none";

        let target;
        if(configNumeracion.startsWith("sup")){
            target=page.querySelector(".header");
            num.style.top="30px";
        } else {
            target=page.querySelector(".footer");
            num.style.bottom="30px";
        }

        if(configNumeracion.endsWith("izq")) num.style.left="30px";
        if(configNumeracion.endsWith("der")) num.style.right="30px";

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
