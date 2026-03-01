document.addEventListener("DOMContentLoaded", () => {

const editor = document.getElementById("editor");

let archivoActual = null;
let configNumeracion = null;

// =====================
// CREAR PAGINA A4
// =====================
function crearPagina() {
    const page = document.createElement("div");
    page.className = "page";
    page.style.width = "794px";
    page.style.height = "1123px";
    page.style.margin = "20px auto";
    page.style.border = "1px solid #555";
    page.style.background = "white";
    page.style.position = "relative";
    page.style.display = "flex";
    page.style.flexDirection = "column";

    const header = document.createElement("div");
    header.className = "header-space";
    header.style.height = "40px";
    header.style.flexShrink = "0";

    const content = document.createElement("div");
    content.className = "content";
    content.contentEditable = true;
    content.style.flex = "1";
    content.style.padding = "40px";
    content.style.outline = "none";
    content.style.overflow = "hidden";

    const footer = document.createElement("div");
    footer.className = "footer-space";
    footer.style.height = "40px";
    footer.style.flexShrink = "0";

    page.appendChild(header);
    page.appendChild(content);
    page.appendChild(footer);

    content.addEventListener("input", verificarOverflow);

    return page;
}

editor.appendChild(crearPagina());

// =====================
// PAGINACION AUTOMATICA
// =====================
function verificarOverflow() {
    const pages = document.querySelectorAll(".page");

    pages.forEach((page, index) => {
        const content = page.querySelector(".content");

        if (content.scrollHeight > content.clientHeight) {
            const nuevaPagina = crearPagina();
            const nuevoContent = nuevaPagina.querySelector(".content");

            while (content.scrollHeight > content.clientHeight) {
                nuevoContent.prepend(content.lastChild);
            }

            if (!pages[index + 1]) {
                editor.appendChild(nuevaPagina);
            }
        }
    });

    aplicarNumeracion();
}

// =====================
// BOTON NUMERAR
// =====================
const btnNumerar = document.querySelectorAll(".btn-icono")[2];
btnNumerar.addEventListener("click", abrirModalNumeracion);

// =====================
// MODAL
// =====================
function abrirModalNumeracion() {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backdropFilter = "blur(6px)";
    overlay.style.background = "rgba(0,0,0,0.4)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = 9999;

    const modal = document.createElement("div");
    modal.style.width = "60%";
    modal.style.height = "60%";
    modal.style.background = "#222";
    modal.style.color = "white";
    modal.style.borderRadius = "12px";
    modal.style.position = "relative";
    modal.style.padding = "20px";

    modal.innerHTML = `
        <h2 style="text-align:center;">Numeración de Páginas</h2>
        <button class="pos sup-izq">↖</button>
        <button class="pos sup-der">↗</button>
        <button class="pos inf-izq">↙</button>
        <button class="pos inf-der">↘</button>
        <div style="position:absolute;bottom:20px;right:20px;">
            <button id="aceptarNum">Aceptar</button>
            <button id="cancelarNum">Cancelar</button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    let seleccion = null;

    modal.querySelectorAll(".pos").forEach(btn => {
        btn.style.position="absolute";
        btn.style.width="32px";
        btn.style.height="32px";

        btn.onclick = ()=>{
            seleccion = btn.classList[1];
            modal.querySelectorAll(".pos").forEach(b=>b.style.background="");
            btn.style.background="yellow";
        };
    });

    modal.querySelector(".sup-izq").style.top="10px";
    modal.querySelector(".sup-izq").style.left="10px";
    modal.querySelector(".sup-der").style.top="10px";
    modal.querySelector(".sup-der").style.right="10px";
    modal.querySelector(".inf-izq").style.bottom="10px";
    modal.querySelector(".inf-izq").style.left="10px";
    modal.querySelector(".inf-der").style.bottom="10px";
    modal.querySelector(".inf-der").style.right="10px";

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
// NUMERACION REAL
// =====================
function aplicarNumeracion() {
    document.querySelectorAll(".numero-pagina").forEach(n=>n.remove());
    if(!configNumeracion) return;

    const pages = document.querySelectorAll(".page");

    pages.forEach((page,index)=>{
        const num = document.createElement("div");
        num.className="numero-pagina";
        num.textContent = index+1;
        num.style.pointerEvents = "none";
        num.style.position="absolute";
        num.style.fontSize="14px";

        if(configNumeracion.startsWith("sup")){
            num.style.top="10px";
            page.querySelector(".header-space").appendChild(num);
        }
        if(configNumeracion.startsWith("inf")){
            num.style.bottom="10px";
            page.querySelector(".footer-space").appendChild(num);
        }

        if(configNumeracion.endsWith("izq")) num.style.left="10px";
        if(configNumeracion.endsWith("der")) num.style.right="10px";
    });
}

// =====================
// NUEVO DOCUMENTO
// =====================
document.querySelector(".submenu-archivo button:nth-child(1)").onclick=()=>{
    if(confirm("Nuevo documento?")){
        editor.innerHTML="";
        editor.appendChild(crearPagina());
        configNumeracion=null;
    }
};

});
