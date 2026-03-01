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
// GUARDAR / RESTAURAR CURSOR (como Word)
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
    page.style.boxSizing = "border-box";
    page.style.display = "flex";
    page.style.flexDirection = "column";
    page.style.overflow = "hidden";

    const header = document.createElement("div");
    header.className = "header";
    header.style.height = MARGEN + "px";
    header.style.pointerEvents = "none";
    header.style.position = "relative";

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
    footer.style.position = "relative";

    page.appendChild(header);
    page.appendChild(content);
    page.appendChild(footer);

    content.addEventListener("input", verificarOverflow);

    return page;
}

// =====================
// INICIAR DOCUMENTO
// =====================
editor.appendChild(crearPagina());

// =====================
// OVERFLOW → NUEVA PAGINA
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

            const nuevoContent = nuevaPagina.querySelector(".content");
            nuevoContent.prepend(content.lastChild);
        }
    });

    aplicarNumeracion();
}

// =====================
// ESTADO BOTONES N K S
// =====================
function actualizarEstadoBotones() {
    document.getElementById("btnNegrita").classList.toggle("activo", document.queryCommandState("bold"));
    document.getElementById("btnCursiva").classList.toggle("activo", document.queryCommandState("italic"));
    document.getElementById("btnSubrayado").classList.toggle("activo", document.queryCommandState("underline"));
}

document.addEventListener("keyup", actualizarEstadoBotones);
document.addEventListener("mouseup", actualizarEstadoBotones);

// =====================
// FORMATO TEXTO (Word real)
// =====================
document.getElementById("btnNegrita").onclick = () => {
    restaurarCursor();
    document.execCommand("bold");
    actualizarEstadoBotones();
};

document.getElementById("btnCursiva").onclick = () => {
    restaurarCursor();
    document.execCommand("italic");
    actualizarEstadoBotones();
};

document.getElementById("btnSubrayado").onclick = () => {
    restaurarCursor();
    document.execCommand("underline");
    actualizarEstadoBotones();
};

document.getElementById("fuenteSelect").onchange = e => {
    restaurarCursor();
    document.execCommand("fontName", false, e.target.value);
};

document.getElementById("sizeSelect").onchange = e => {
    restaurarCursor();
    document.execCommand("fontSize", false, "7");
};

document.getElementById("colorTexto").onchange = e => {
    restaurarCursor();
    document.execCommand("foreColor", false, e.target.value);
};

document.getElementById("colorFondo").onchange = e => {
    restaurarCursor();
    document.execCommand("hiliteColor", false, e.target.value);
};

document.getElementById("btnIzq").onclick = () => {
    restaurarCursor();
    document.execCommand("justifyLeft");
};

document.getElementById("btnCentro").onclick = () => {
    restaurarCursor();
    document.execCommand("justifyCenter");
};

document.getElementById("btnDer").onclick = () => {
    restaurarCursor();
    document.execCommand("justifyRight");
};

// =====================
// BOTON NUMERAR
// =====================
const btnNumerar = document.getElementById("btnNumerar");
btnNumerar.addEventListener("click", abrirModalNumeracion);

// =====================
// MODAL NUMERACION
// =====================
function abrirModalNumeracion() {

    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.6)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = 9999;

    const modal = document.createElement("div");
    modal.style.width = "300px";
    modal.style.height = "200px";
    modal.style.background = "#222";
    modal.style.color = "white";
    modal.style.borderRadius = "10px";
    modal.style.position = "relative";
    modal.style.padding = "20px";

    modal.innerHTML = `
        <h3 style="text-align:center;">Numeración</h3>
        <button class="pos sup-izq">↖</button>
        <button class="pos sup-der">↗</button>
        <button class="pos inf-izq">↙</button>
        <button class="pos inf-der">↘</button>
        <br><br>
        <button id="aceptarNum">Aceptar</button>
        <button id="cancelarNum">Cancelar</button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    let seleccion = null;

    modal.querySelectorAll(".pos").forEach(btn => {
        btn.onclick = ()=>{
            seleccion = btn.classList[1];
            modal.querySelectorAll(".pos").forEach(b=>b.style.background="");
            btn.style.background="yellow";
        };
    });

    document.getElementById("aceptarNum").onclick = ()=>{
        if(seleccion){
            configNumeracion = seleccion;
            aplicarNumeracion();
        }
        overlay.remove();
    };

    document.getElementById("cancelarNum").onclick = ()=>{
        overlay.remove();
    };
}

// =====================
// APLICAR NUMERACION
// =====================
function aplicarNumeracion() {

    document.querySelectorAll(".numero-pagina").forEach(n=>n.remove());
    if(!configNumeracion) return;

    const pages = document.querySelectorAll(".page");

    pages.forEach((page,index)=>{
        const num = document.createElement("div");
        num.className="numero-pagina";
        num.textContent = index+1;
        num.style.pointerEvents="none";
        num.style.position="absolute";
        num.style.fontSize="20px";

        let target;

        if(configNumeracion.startsWith("sup")){
            target = page.querySelector(".header");
            num.style.top="30px";
        } else {
            target = page.querySelector(".footer");
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
const btnNuevo = document.getElementById("btnNuevo");
btnNuevo.onclick = ()=>{
    if(confirm("Nuevo documento?")){
        editor.innerHTML="";
        editor.appendChild(crearPagina());
        configNumeracion=null;
    }
};

});
