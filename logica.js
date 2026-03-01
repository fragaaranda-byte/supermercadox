document.addEventListener("DOMContentLoaded", () => {

const editor = document.getElementById("editor");

// ===== BOTONES ARCHIVO =====
const btnNuevo = document.querySelector(".submenu-archivo button:nth-child(1)");
const btnAbrir = document.querySelector(".submenu-archivo button:nth-child(2)");
const btnGuardar = document.querySelector(".submenu-archivo button:nth-child(3)");
const btnGuardarComo = document.querySelector(".submenu-archivo button:nth-child(4)");
const btnImprimir = document.querySelector(".submenu-archivo button:nth-child(5)");

// ===== BARRA SUPERIOR =====
const botonesSuperior = document.getElementById("barra-superior").getElementsByClassName("btn-icono");
const btnDeshacer = botonesSuperior[0];
const btnRehacer = botonesSuperior[1];
const btnNumerar = botonesSuperior[2];

// ===== FORMATO =====
const barraFormato = document.getElementById("barra-formato");
const selects = barraFormato.getElementsByTagName("select");
const botonesTexto = barraFormato.getElementsByClassName("btn-texto");
const inputsColor = barraFormato.querySelectorAll("input[type='color']");
const botonesIcono = barraFormato.getElementsByClassName("btn-icono");

// ===== PANEL INSERTAR =====
const panelInsertar = document.getElementById("panel-insertar");
const togglePanel = document.getElementById("toggle-panel");
const btnInsertarImagen = document.querySelector(".bloque-insertar .btn-icono:first-child");
const btnIndice = document.querySelector(".bloque-insertar .btn-icono:nth-child(2)");

const gridTabla = document.querySelectorAll(".grid-tabla div");
const simbolos = document.querySelectorAll(".simbolos button");
const emojis = document.querySelectorAll(".emojis img");

let archivoActual = null;
let paginasNumeradas = false;

// =========================
// FUNCION GENERAL
// =========================
function ejecutar(comando, valor = null) {
    editor.focus();
    document.execCommand(comando, false, valor);
}

// =========================
// TEXTO
// =========================
botonesTexto[0].addEventListener("click", () => ejecutar("bold"));
botonesTexto[1].addEventListener("click", () => ejecutar("italic"));
botonesTexto[2].addEventListener("click", () => ejecutar("underline"));

// Fuente
selects[0].addEventListener("change", function () {
    ejecutar("fontName", this.value);
});

// Tamaño real px
selects[1].addEventListener("change", function () {
    document.execCommand("fontSize", false, "7");
    let fonts = editor.getElementsByTagName("font");
    for (let i = 0; i < fonts.length; i++) {
        if (fonts[i].size === "7") {
            fonts[i].removeAttribute("size");
            fonts[i].style.fontSize = this.value + "px";
        }
    }
});

// Colores
inputsColor[0].addEventListener("change", () => ejecutar("foreColor", inputsColor[0].value));
inputsColor[1].addEventListener("change", () => ejecutar("hiliteColor", inputsColor[1].value));

// Alineación
botonesIcono[0].addEventListener("click", () => ejecutar("justifyLeft"));
botonesIcono[1].addEventListener("click", () => ejecutar("justifyCenter"));
botonesIcono[2].addEventListener("click", () => ejecutar("justifyRight"));

// =========================
// DESHACER / REHACER
// =========================
btnDeshacer.addEventListener("click", () => ejecutar("undo"));
btnRehacer.addEventListener("click", () => ejecutar("redo"));

// =========================
// ARCHIVO
// =========================
btnNuevo.addEventListener("click", () => {
    if (confirm("¿Nuevo documento?")) {
        editor.innerHTML = "";
        archivoActual = null;
    }
});

btnAbrir.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".html,.txt,.mpd";

    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = ev => {
            editor.innerHTML = ev.target.result;
            archivoActual = file.name;
        };

        reader.readAsText(file);
    };

    input.click();
});

btnGuardar.addEventListener("click", () => {
    if (!archivoActual) guardarComo();
    else guardarArchivo(archivoActual);
});

btnGuardarComo.addEventListener("click", guardarComo);

function guardarComo() {
    const nombre = prompt("Nombre del archivo:", "documento.mpd");
    if (!nombre) return;
    archivoActual = nombre;
    guardarArchivo(nombre);
}

function guardarArchivo(nombre) {
    const blob = new Blob([editor.innerHTML], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = nombre;
    a.click();
}

btnImprimir.addEventListener("click", () => window.print());

// =========================
// PANEL INSERTAR
// =========================
togglePanel.addEventListener("click", () => {
    panelInsertar.classList.toggle("oculto");
    togglePanel.textContent = panelInsertar.classList.contains("oculto") ? ">>" : "<<";
});

// =========================
// INSERTAR SÍMBOLOS
// =========================
simbolos.forEach(btn => {
    btn.addEventListener("click", () => {
        insertTextAtCursor(btn.textContent);
    });
});

// =========================
// INSERTAR EMOJIS
// =========================
emojis.forEach(img => {
    img.addEventListener("click", () => {
        insertImageAtCursor(img.src);
    });
});

// =========================
// INSERTAR IMAGEN
// =========================
btnInsertarImagen.addEventListener("click", () => {
    let input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = function () {
        let file = input.files[0];
        let reader = new FileReader();

        reader.onload = function (e) {
            insertImageAtCursor(e.target.result);
        };

        reader.readAsDataURL(file);
    };

    input.click();
});

// =========================
// ÍNDICE
// =========================
btnIndice.addEventListener("click", () => {
    ejecutar("insertHTML", "<h2>Índice</h2><ul><li>Sección 1</li><li>Sección 2</li></ul>");
});

// =========================
// TABLAS
// =========================
let filas = 0;
let columnas = 0;

gridTabla.forEach((celda, index) => {
    celda.addEventListener("mouseover", () => {
        columnas = (index % 10) + 1;
        filas = Math.floor(index / 10) + 1;
    });

    celda.addEventListener("click", () => {
        let tabla = "<table border='1' style='border-collapse:collapse;width:100%'>";
        for (let i = 0; i < filas; i++) {
            tabla += "<tr>";
            for (let j = 0; j < columnas; j++) {
                tabla += "<td>&nbsp;</td>";
            }
            tabla += "</tr>";
        }
        tabla += "</table><br>";
        ejecutar("insertHTML", tabla);
    });
});

// =========================
// NUMERAR PÁGINAS
// =========================
btnNumerar.addEventListener("click", () => {
    paginasNumeradas = !paginasNumeradas;

    if (paginasNumeradas) {
        numerarPaginas();
    } else {
        document.querySelectorAll(".numero-pagina").forEach(n => n.remove());
    }
});

function numerarPaginas() {
    const altoPagina = 900;
    const contenido = editor.scrollHeight;
    const paginas = Math.ceil(contenido / altoPagina);

    for (let i = 1; i <= paginas; i++) {
        const num = document.createElement("div");
        num.className = "numero-pagina";
        num.textContent = "Página " + i;
        num.style.textAlign = "center";
        num.style.marginTop = "20px";
        editor.appendChild(num);
    }
}

// =========================
// FUNCIONES CURSOR
// =========================
function insertTextAtCursor(text) {
    let sel = window.getSelection();
    if (!sel.rangeCount) return;

    let range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    editor.focus();
}

function insertImageAtCursor(src) {
    let img = document.createElement("img");
    img.src = src;
    img.style.maxWidth = "300px";
    img.style.display = "block";
    img.style.margin = "5px 0";

    let sel = window.getSelection();
    if (!sel.rangeCount) return;

    let range = sel.getRangeAt(0);
    range.insertNode(img);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    editor.focus();
}

// =========================
// LIMPIAR TEXTO INICIAL
// =========================
editor.addEventListener("focus", () => {
    if (editor.textContent === "Escribe tu documento aquí...") {
        editor.innerHTML = "";
    }
});

});
