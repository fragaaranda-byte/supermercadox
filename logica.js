document.addEventListener("DOMContentLoaded", () => {

const editor = document.getElementById("editor");

let archivoActual = null;
let configNumeracion = null;
let rangoGuardado = null;
let indiceActivo = null;
let contadorIndice = 1;

// =====================
// FORMATO ACTUAL
// =====================
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
// DIMENSIONES POR DEFECTO
// =====================
let dimensionesHoja = {
    ancho: 794,
    alto: 1123,
    margenTop: "1.5cm",
    margenBottom: "1.5cm",
    margenLeft: "1.5cm",
    margenRight: "1.5cm",
    orientacion: "vertical",
    tipoHoja: "A4"
};

const HOJAS = {
    "A4": { w: 794, h: 1123 },
    "A3": { w: 1123, h: 1587 },
    "A5": { w: 559, h: 794 },
    "Carta": { w: 816, h: 1056 },
    "Legal": { w: 816, h: 1344 }
};

// =====================
// CREAR PÁGINA
// =====================
function crearPagina() {
    const page = document.createElement("div");
    page.className = "page";

    // Aplicar dimensiones y márgenes actuales
    if (dimensionesHoja.orientacion === "vertical") {
        page.style.width = dimensionesHoja.ancho + "px";
        page.style.height = dimensionesHoja.alto + "px";
    } else {
        page.style.width = dimensionesHoja.alto + "px";
        page.style.height = dimensionesHoja.ancho + "px";
    }
    page.style.paddingTop = dimensionesHoja.margenTop;
    page.style.paddingBottom = dimensionesHoja.margenBottom;
    page.style.paddingLeft = dimensionesHoja.margenLeft;
    page.style.paddingRight = dimensionesHoja.margenRight;
    page.style.boxSizing = "border-box";
    page.style.backgroundColor = "#E0E0E0"; // fondo apagado

    const header = document.createElement("div");
    header.className = "page-header";
    header.contentEditable = false;

    const content = document.createElement("div");
    content.className = "page-content";
    content.contentEditable = true;
    content.style.minHeight = "20px"; // asegurar altura mínima
    content.addEventListener("input", verificarOverflow);

    const footer = document.createElement("div");
    footer.className = "page-footer";
    footer.contentEditable = false;

    page.appendChild(header);
    page.appendChild(content);
    page.appendChild(footer);

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
// MODAL CONFIGURAR PÁGINAS
// =====================
const btnConfig = document.querySelectorAll('.btn-icono img[src="iconos/config.png"]')[0];
btnConfig.onclick = abrirModalConfigPaginas;

function abrirModalConfigPaginas() {
    // Crear overlay y modal
    let overlay = document.getElementById("overlayConfig");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "overlayConfig";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.background = "rgba(0,0,0,0.3)";
        overlay.style.zIndex = "2000";
        document.body.appendChild(overlay);
    }

    let modal = document.getElementById("modalConfig");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "modalConfig";
        modal.style.position = "fixed";
        modal.style.top = "50%";
        modal.style.left = "50%";
        modal.style.transform = "translate(-50%, -50%)";
        modal.style.width = "60%";
        modal.style.maxWidth = "800px";
        modal.style.background = "#fff";
        modal.style.padding = "20px";
        modal.style.boxShadow = "0 0 15px rgba(0,0,0,0.5)";
        modal.style.zIndex = "2001";
        modal.style.display = "flex";
        modal.style.flexDirection = "column";
        modal.style.gap = "10px";
        modal.style.borderRadius = "8px";
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <h2>Configurar Páginas</h2>
        <label>Orientación:
            <select id="orientacionSelect">
                <option value="vertical">Vertical</option>
                <option value="horizontal">Horizontal</option>
            </select>
        </label>
        <label>Márgen superior:
            <select id="margenTop">
                <option value="1.5">1.5 cm</option>
                <option value="2">2 cm</option>
                <option value="3">3 cm</option>
                <option value="4">4 cm</option>
                <option value="5">5 cm</option>
            </select>
        </label>
        <label>Márgen inferior:
            <select id="margenBottom">
                <option value="1.5">1.5 cm</option>
                <option value="2">2 cm</option>
                <option value="3">3 cm</option>
                <option value="4">4 cm</option>
                <option value="5">5 cm</option>
            </select>
        </label>
        <label>Márgen derecho:
            <select id="margenRight">
                <option value="1.5">1.5 cm</option>
                <option value="2">2 cm</option>
                <option value="3">3 cm</option>
                <option value="4">4 cm</option>
                <option value="5">5 cm</option>
            </select>
        </label>
        <label>Márgen izquierdo:
            <select id="margenLeft">
                <option value="1.5">1.5 cm</option>
                <option value="2">2 cm</option>
                <option value="3">3 cm</option>
                <option value="4">4 cm</option>
                <option value="5">5 cm</option>
            </select>
        </label>
        <label>Hoja:
            <select id="tamanoHoja">
                <option value="A4">A4</option>
                <option value="A3">A3</option>
                <option value="A5">A5</option>
                <option value="Carta">Carta</option>
                <option value="Legal">Legal</option>
            </select>
        </label>
        <div style="margin-top:15px; text-align:right;">
            <button id="cancelarConfig">Cancelar</button>
            <button id="aceptarConfig">Aceptar</button>
        </div>
    `;

    // Set defaults actuales
    document.getElementById("orientacionSelect").value = dimensionesHoja.orientacion;
    document.getElementById("margenTop").value = parseFloat(dimensionesHoja.margenTop);
    document.getElementById("margenBottom").value = parseFloat(dimensionesHoja.margenBottom);
    document.getElementById("margenLeft").value = parseFloat(dimensionesHoja.margenLeft);
    document.getElementById("margenRight").value = parseFloat(dimensionesHoja.margenRight);
    document.getElementById("tamanoHoja").value = dimensionesHoja.tipoHoja;

    overlay.style.display = "block";
    modal.style.display = "flex";

    document.getElementById("cancelarConfig").onclick = () => {
        overlay.style.display = "none";
        modal.style.display = "none";
    };

    document.getElementById("aceptarConfig").onclick = () => {
        // Guardar valores
        dimensionesHoja.orientacion = document.getElementById("orientacionSelect").value;
        dimensionesHoja.margenTop = document.getElementById("margenTop").value + "cm";
        dimensionesHoja.margenBottom = document.getElementById("margenBottom").value + "cm";
        dimensionesHoja.margenLeft = document.getElementById("margenLeft").value + "cm";
        dimensionesHoja.margenRight = document.getElementById("margenRight").value + "cm";
        dimensionesHoja.tipoHoja = document.getElementById("tamanoHoja").value;

        // Aplicar a todas las páginas
        const pages = document.querySelectorAll(".page");
        pages.forEach(page => {
            const hoja = HOJAS[dimensionesHoja.tipoHoja];
            if (dimensionesHoja.orientacion === "vertical") {
                page.style.width = hoja.w + "px";
                page.style.height = hoja.h + "px";
            } else {
                page.style.width = hoja.h + "px";
                page.style.height = hoja.w + "px";
            }
            page.style.paddingTop = dimensionesHoja.margenTop;
            page.style.paddingBottom = dimensionesHoja.margenBottom;
            page.style.paddingLeft = dimensionesHoja.margenLeft;
            page.style.paddingRight = dimensionesHoja.margenRight;
        });

        overlay.style.display = "none";
        modal.style.display = "none";
    };
}

});
