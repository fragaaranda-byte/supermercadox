document.addEventListener("DOMContentLoaded", () => {

const editor = document.getElementById("editor");

// ---------------------
// DIMENSIONES HOJA POR DEFECTO
// ---------------------
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

// ---------------------
// CREAR PÁGINA
// ---------------------
function crearPagina() {
    const page = document.createElement("div");
    page.className = "page";

    // Aplicar dimensiones y márgenes
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

    const header = document.createElement("div");
    header.className = "page-header";
    header.contentEditable = false;

    const content = document.createElement("div");
    content.className = "page-content";
    content.contentEditable = true;

    const footer = document.createElement("div");
    footer.className = "page-footer";
    footer.contentEditable = false;

    page.appendChild(header);
    page.appendChild(content);
    page.appendChild(footer);

    return page;
}

// Inicializar editor con una página si no hay
if (editor.children.length === 0) editor.appendChild(crearPagina());

// ---------------------
// MODAL CONFIGURAR PÁGINAS
// ---------------------
const btnConfig = document.querySelectorAll('.btn-icono img[src="iconos/config.png"]')[0];
btnConfig.onclick = abrirModalConfigPaginas;

function abrirModalConfigPaginas() {
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
        dimensionesHoja.orientacion = document.getElementById("orientacionSelect").value;
        dimensionesHoja.margenTop = document.getElementById("margenTop").value + "cm";
        dimensionesHoja.margenBottom = document.getElementById("margenBottom").value + "cm";
        dimensionesHoja.margenLeft = document.getElementById("margenLeft").value + "cm";
        dimensionesHoja.margenRight = document.getElementById("margenRight").value + "cm";
        dimensionesHoja.tipoHoja = document.getElementById("tamanoHoja").value;

        // Aplicar solo tamaño y márgenes a las páginas existentes
        document.querySelectorAll(".page").forEach(page => {
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
