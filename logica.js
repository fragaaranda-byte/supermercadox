document.addEventListener("DOMContentLoaded", () => {

const editor = document.getElementById("editor");
editor.innerHTML = "";

let archivoActual = null;
let configNumeracion = null;
let rangoGuardado = null;

// Medidas A4
const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;
const MARGEN = 56; // 1.5cm

// =====================
// GUARDAR / RESTAURAR CURSOR
// =====================
document.addEventListener("selectionchange", () => {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (editor.contains(range.startContainer)) {
            rangoGuardado = range;
        }
    }
});

function restaurarCursor() {
    if (rangoGuardado) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(rangoGuardado);
    }
}

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

            nuevaPagina.querySelector(".content")
                .prepend(content.lastChild);
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
    restaurarCursor();
    document.execCommand("fontName", false, e.target.value);
};

// 🔧 FIX REAL TAMAÑO FUENTE
sizeSelect.onchange = e => {
    restaurarCursor();
    document.execCommand("fontSize", false, "1");

    const fontElements = document.getElementsByTagName("font");
    for (let i = fontElements.length - 1; i >= 0; i--) {
        const font = fontElements[i];
        font.removeAttribute("size");
        font.style.fontSize = e.target.value + "px";
    }
};

colorTexto.onchange = e => {
    restaurarCursor();
    document.execCommand("foreColor", false, e.target.value);
};

colorFondo.onchange = e => {
    restaurarCursor();
    document.execCommand("hiliteColor", false, e.target.value);
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

    let table = "<table border='1' style='border-collapse:collapse;width:100%'>";
    for (let i = 0; i < filas; i++) {
        table += "<tr>";
        for (let j = 0; j < columnas; j++) {
            table += "<td>&nbsp;</td>";
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
