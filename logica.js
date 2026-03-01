document.addEventListener("DOMContentLoaded", () => {

const editor = document.getElementById("editor");
editor.innerHTML = "";

let archivoActual = null;
let configNumeracion = null;

// Medidas A4
const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;
const MARGEN = 56; // 1.5cm aprox

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

            // mover último nodo
            nuevoContent.prepend(content.lastChild);
        }
    });

    aplicarNumeracion();
}

// =====================
// FORMATO TEXTO
// =====================
document.getElementById("btnNegrita").onclick = () => document.execCommand("bold");
document.getElementById("btnCursiva").onclick = () => document.execCommand("italic");
document.getElementById("btnSubrayado").onclick = () => document.execCommand("underline");

document.getElementById("fuenteSelect").onchange = e =>
    document.execCommand("fontName", false, e.target.value);

document.getElementById("sizeSelect").onchange = e =>
    document.execCommand("fontSize", false, "7");

document.getElementById("colorTexto").onchange = e =>
    document.execCommand("foreColor", false, e.target.value);

document.getElementById("colorFondo").onchange = e =>
    document.execCommand("hiliteColor", false, e.target.value);

document.getElementById("btnIzq").onclick = ()=>document.execCommand("justifyLeft");
document.getElementById("btnCentro").onclick = ()=>document.execCommand("justifyCenter");
document.getElementById("btnDer").onclick = ()=>document.execCommand("justifyRight");

// =====================
// BOTON NUMERAR
// =====================
const botonesSuperior = document.getElementById("barra-superior").getElementsByClassName("btn-icono");
const btnNumerar = botonesSuperior[2];
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
        num.style.fontSize="14px";

        let target;

        if(configNumeracion.startsWith("sup")){
            target = page.querySelector(".header");
            num.style.top="10px";
        } else {
            target = page.querySelector(".footer");
            num.style.bottom="10px";
        }

        if(configNumeracion.endsWith("izq")) num.style.left="10px";
        if(configNumeracion.endsWith("der")) num.style.right="10px";

        target.appendChild(num);
    });
}

// =====================
// NUEVO DOCUMENTO
// =====================
const btnNuevo = document.querySelector(".submenu-archivo button:nth-child(1)");
btnNuevo.onclick = ()=>{
    if(confirm("Nuevo documento?")){
        editor.innerHTML="";
        editor.appendChild(crearPagina());
        configNumeracion=null;
    }
};

});
