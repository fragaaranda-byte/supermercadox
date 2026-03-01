document.addEventListener("DOMContentLoaded", () => {

const editor = document.getElementById("editor");

let archivoActual = null;
let configNumeracion = null;

// =====================
// CREAR PRIMERA PAGINA
// =====================
function crearPagina() {
    const page = document.createElement("div");
    page.className = "page";
    page.contentEditable = true;
    page.style.minHeight = "900px";
    page.style.width = "800px";
    page.style.margin = "20px auto";
    page.style.padding = "60px";
    page.style.border = "1px solid #555";
    page.style.background = "white";
    page.style.position = "relative";
    return page;
}

editor.appendChild(crearPagina());

// =====================
// PAGINACION AUTOMATICA
// =====================
function verificarOverflow() {
    const pages = document.querySelectorAll(".page");

    pages.forEach((page, index) => {
        if (page.scrollHeight > page.clientHeight) {
            const nuevaPagina = crearPagina();
            const range = document.createRange();
            range.selectNodeContents(page);
            range.collapse(false);

            let overflowNodes = [];

            while (page.scrollHeight > page.clientHeight) {
                overflowNodes.unshift(page.lastChild);
                page.removeChild(page.lastChild);
            }

            overflowNodes.forEach(n => nuevaPagina.appendChild(n));

            if (!pages[index + 1]) {
                editor.appendChild(nuevaPagina);
            }
        }
    });

    aplicarNumeracion();
}

editor.addEventListener("input", verificarOverflow);

// =====================
// MODAL NUMERACION
// =====================
const btnNumerar = document.querySelectorAll(".btn-icono")[2];

btnNumerar.addEventListener("click", abrirModalNumeracion);

function abrirModalNumeracion() {
    const overlay = document.createElement("div");
    overlay.id = "overlayModal";
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

    modal.querySelectorAll(".pos").forEach(btn=>{
        btn.style.position="absolute";
        btn.style.width="32px";
        btn.style.height="32px";
        btn.style.fontSize="18px";

        btn.onclick = ()=> {
            seleccion = btn.classList[1];
            modal.querySelectorAll(".pos").forEach(b=>b.style.background="");
            btn.style.background="yellow";
        }
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
        num.contentEditable = true;
        num.style.position="absolute";

        if(configNumeracion==="sup-izq"){
            num.style.top="10px";
            num.style.left="10px";
        }
        if(configNumeracion==="sup-der"){
            num.style.top="10px";
            num.style.right="10px";
        }
        if(configNumeracion==="inf-izq"){
            num.style.bottom="10px";
            num.style.left="10px";
        }
        if(configNumeracion==="inf-der"){
            num.style.bottom="10px";
            num.style.right="10px";
        }

        page.appendChild(num);

        num.addEventListener("input", ()=>{
            if(num.textContent.trim()===""){
                configNumeracion=null;
                document.querySelectorAll(".numero-pagina").forEach(n=>n.remove());
            }
        });
    });
}

// =====================
// GUARDAR / ABRIR
// =====================
function guardarArchivo(nombre){
    const blob = new Blob([editor.innerHTML], {type:"text/html"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = nombre;
    a.click();
}

document.querySelector(".submenu-archivo button:nth-child(3)").onclick=()=>{
    if(!archivoActual) archivoActual="documento.mpd";
    guardarArchivo(archivoActual);
};

document.querySelector(".submenu-archivo button:nth-child(2)").onclick=()=>{
    const input=document.createElement("input");
    input.type="file";
    input.accept=".mpd,.html";
    input.onchange=e=>{
        const file=e.target.files[0];
        const reader=new FileReader();
        reader.onload=ev=>{
            editor.innerHTML=ev.target.result;
        };
        reader.readAsText(file);
    };
    input.click();
};

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
