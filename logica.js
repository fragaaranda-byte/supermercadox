document.addEventListener("DOMContentLoaded", () => {

const editor = document.getElementById("editor");
editor.innerHTML = "";

let configNumeracion = null;
let rangoGuardado = null;
let indiceActivo = false;
let contadorIndice = 1;
let cambiandoSize = false;

// =====================
// PANEL INSERTAR TOGGLE
// =====================
const panelInsertar = document.getElementById("panel-insertar");
const togglePanel = document.getElementById("toggle-panel");

togglePanel.onclick = () => {
    panelInsertar.classList.toggle("cerrado");
};

// =====================
// FORMATO ACTUAL (NO TOCAR COLORES)
// =====================
let formatoActual = {
    colorTexto: "#000000",
    colorFondo: "#ffffff",
    fontSize: 8,
    fontName: "Arial"
};

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;
const MARGEN = 56;

// =====================
// CURSOR
// =====================
document.addEventListener("selectionchange", () => {
    if (cambiandoSize) return;

    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (editor.contains(range.startContainer)) {
            rangoGuardado = range.cloneRange();
            actualizarSelectsDesdeCursor();
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
// CREAR PAGINA A4 REAL
// =====================
function crearPagina() {
    const page = document.createElement("div");
    page.className = "page";
    page.style.width = PAGE_WIDTH+"px";
    page.style.height = PAGE_HEIGHT+"px";
    page.style.margin = "20px auto";
    page.style.border = "1px solid #444";
    page.style.background = "white";
    page.style.display = "flex";
    page.style.flexDirection = "column";
    page.style.position = "relative";

    const header = document.createElement("div");
    header.className = "header";
    header.style.height = MARGEN+"px";

    const content = document.createElement("div");
    content.className = "content";
    content.contentEditable = true;
    content.style.flex = "1";
    content.style.padding = MARGEN+"px";
    content.style.outline = "none";
    content.style.wordWrap = "break-word";
    content.style.whiteSpace = "normal";
    content.style.overflow = "hidden";

    const footer = document.createElement("div");
    footer.className = "footer";
    footer.style.height = MARGEN+"px";

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
// SELECT SIZE DESDE CURSOR
// =====================
function actualizarSelectsDesdeCursor() {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    let node = sel.anchorNode;
    if (node.nodeType === 3) node = node.parentElement;

    const size = window.getComputedStyle(node).fontSize;
    sizeSelect.value = parseInt(size);
}

// =====================
// FORMATO
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
    cambiandoSize = true;
    formatoActual.fontSize = e.target.value;
    restaurarCursor();

    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    const range = sel.getRangeAt(0);

    if (range.collapsed) {
        const span = document.createElement("span");
        span.style.fontSize = formatoActual.fontSize+"px";
        span.appendChild(document.createTextNode("\u200B"));
        range.insertNode(span);

        const newRange = document.createRange();
        newRange.setStart(span.firstChild,1);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
        rangoGuardado = newRange.cloneRange();
    } else {
        const span = document.createElement("span");
        span.style.fontSize = formatoActual.fontSize+"px";
        span.appendChild(range.extractContents());
        range.insertNode(span);
    }

    setTimeout(()=>cambiandoSize=false,100);
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
// TABLA WORD-LIKE
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
    for (let i=0;i<filas;i++){
        table+="<tr>";
        for(let j=0;j<columnas;j++){
            table+=`<td style="width:100px;word-wrap:break-word;white-space:normal;vertical-align:top;">&nbsp;</td>`;
        }
        table+="</tr>";
    }
    table+="</table><br>";

    document.execCommand("insertHTML", false, table);

    activarResizeColumnas();
}

// =====================
// RESIZE COLUMNAS REAL (WORD)
// =====================
let resizing = false;
let tdActual = null;
let tdVecino = null;
let startX = 0;
let startW1 = 0;
let startW2 = 0;

function activarResizeColumnas(){
    document.querySelectorAll("td").forEach(td=>{
        td.onmousemove = e=>{
            if (td.clientWidth - e.offsetX < 6) {
                td.style.cursor = "col-resize";
            } else {
                td.style.cursor = "text";
            }
        };

        td.onmousedown = e=>{
            if (td.clientWidth - e.offsetX < 6) {
                tdActual = td;
                tdVecino = td.nextElementSibling;
                if (!tdVecino) return;

                resizing = true;
                startX = e.clientX;
                startW1 = tdActual.offsetWidth;
                startW2 = tdVecino.offsetWidth;

                document.onmousemove = moverColumna;
                document.onmouseup = soltarColumna;
            }
        };
    });
}

function moverColumna(e){
    if(!resizing) return;

    const dx = e.clientX - startX;
    let nueva1 = startW1 + dx;
    let nueva2 = startW2 - dx;

    if (nueva1 < 40 || nueva2 < 40) return;

    tdActual.style.width = nueva1 + "px";
    tdVecino.style.width = nueva2 + "px";
}

function soltarColumna(){
    resizing = false;
    tdActual = null;
    tdVecino = null;
    document.onmousemove = null;
    document.onmouseup = null;
}

// =====================
// SIMBOLOS
// =====================
document.querySelectorAll(".simbolos button").forEach(btn=>{
    btn.onclick=()=>{
        restaurarCursor();
        document.execCommand("insertText", false, btn.textContent);
    };
});

// =====================
// IMAGEN
// =====================
btnInsertarImagen.onclick=()=>{
    const input=document.createElement("input");
    input.type="file";
    input.accept="image/*";

    input.onchange=()=>{
        const file=input.files[0];
        const reader=new FileReader();
        reader.onload=e=>{
            restaurarCursor();
            document.execCommand("insertHTML",false,`<img src="${e.target.result}" style="max-width:300px;">`);
        };
        reader.readAsDataURL(file);
    };
    input.click();
};

// =====================
// INDICE
// =====================
btnIndice.onclick=()=>{
    indiceActivo=!indiceActivo;
    contadorIndice=1;
};

editor.addEventListener("keydown",e=>{
    if(indiceActivo && e.key==="Enter"){
        e.preventDefault();
        restaurarCursor();
        document.execCommand("insertHTML",false,`<br>${contadorIndice}) `);
        contadorIndice++;
    }
});

// =====================
// NUMERACION
// =====================
btnNumerar.onclick = abrirModalNumeracion;

function abrirModalNumeracion() {
    modalNumeracion.classList.remove("oculto");
    overlay.classList.remove("oculto");

    let seleccion=null;

    modalNumeracion.querySelectorAll("button[data-pos]").forEach(btn=>{
        btn.onclick=()=>seleccion=btn.dataset.pos;
    });

    btnAceptarNumeracion.onclick=()=>{
        if(seleccion){
            configNumeracion=seleccion;
            aplicarNumeracion();
        }
        cerrarModal();
    };

    btnCancelarNumeracion.onclick=cerrarModal;
}

function cerrarModal(){
    modalNumeracion.classList.add("oculto");
    overlay.classList.add("oculto");
}

function aplicarNumeracion(){
    document.querySelectorAll(".numero-pagina").forEach(n=>n.remove());
    if(!configNumeracion)return;

    document.querySelectorAll(".page").forEach((page,index)=>{
        const num=document.createElement("div");
        num.className="numero-pagina";
        num.textContent=index+1;
        num.style.position="absolute";

        let target;
        if(configNumeracion.includes("top")){
            target=page.querySelector(".header");
            num.style.top="10px";
        }else{
            target=page.querySelector(".footer");
            num.style.bottom="10px";
        }

        if(configNumeracion.includes("left")) num.style.left="20px";
        if(configNumeracion.includes("right")) num.style.right="20px";

        target.appendChild(num);
    });
}

// =====================
// NUEVO
// =====================
btnNuevo.onclick=()=>{
    if(confirm("Nuevo documento?")){
        editor.innerHTML="";
        editor.appendChild(crearPagina());
        configNumeracion=null;
    }
};

});
