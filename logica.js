document.addEventListener("DOMContentLoaded", () => {

// =========================
// VARIABLES PRINCIPALES
// =========================
const editor = document.getElementById("editor");

const btnNuevo = document.querySelector(".submenu-archivo button:nth-child(1)");
const btnAbrir = document.querySelector(".submenu-archivo button:nth-child(2)");
const btnGuardar = document.querySelector(".submenu-archivo button:nth-child(3)");
const btnGuardarComo = document.querySelector(".submenu-archivo button:nth-child(4)");
const btnImprimir = document.querySelector(".submenu-archivo button:nth-child(5)");

const btnDeshacer = document.querySelectorAll(".btn-icono")[0];
const btnRehacer = document.querySelectorAll(".btn-icono")[1];
const btnNumerar = document.querySelectorAll(".btn-icono")[2];

const fuenteSelect = document.querySelector("#barra-formato select:nth-child(1)");
const sizeSelect = document.querySelector("#barra-formato select:nth-child(2)");

const btnNegrita = document.querySelectorAll(".btn-texto")[0];
const btnCursiva = document.querySelectorAll(".btn-texto")[1];
const btnSubrayado = document.querySelectorAll(".btn-texto")[2];

const colorTexto = document.querySelector("#barra-formato input[type='color']");
const colorFondo = document.querySelectorAll("#barra-formato input[type='color']")[1];

const btnIzq = document.querySelectorAll(".btn-icono")[3];
const btnCentro = document.querySelectorAll(".btn-icono")[4];
const btnDer = document.querySelectorAll(".btn-icono")[5];

const btnImagen = document.querySelector("#panel-insertar .bloque-insertar button:nth-child(1)");
const btnIndice = document.querySelector("#panel-insertar .bloque-insertar button:nth-child(2)");

const gridTabla = document.querySelectorAll(".grid-tabla div");

const simbolos = document.querySelectorAll(".simbolos button");
const emojis = document.querySelectorAll(".emojis img");

const togglePanel = document.getElementById("toggle-panel");
const panelInsertar = document.getElementById("panel-insertar");

let archivoActual = null;
let paginasNumeradas = false;

// =========================
// FUNCIONES BÁSICAS
// =========================
function ejecutar(comando, valor = null) {
    editor.focus();
    document.execCommand(comando, false, valor);
}

// =========================
// NUEVO DOCUMENTO
// =========================
btnNuevo.addEventListener("click", () => {
    if (confirm("¿Nuevo documento? Se perderán los cambios no guardados.")) {
        editor.innerHTML = "";
        archivoActual = null;
    }
});

// =========================
// ABRIR ARCHIVO
// =========================
btnAbrir.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt,.html";

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

// =========================
// GUARDAR
// =========================
btnGuardar.addEventListener("click", () => {
    if (!archivoActual) {
        guardarComo();
    } else {
        guardarArchivo(archivoActual);
    }
});

btnGuardarComo.addEventListener("click", guardarComo);

function guardarComo() {
    const nombre = prompt("Nombre del archivo:", "documento.html");
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

// =========================
// IMPRIMIR
// =========================
btnImprimir.addEventListener("click", () => {
    window.print();
});

// =========================
// DESHACER / REHACER
// =========================
btnDeshacer.addEventListener("click", () => ejecutar("undo"));
btnRehacer.addEventListener("click", () => ejecutar("redo"));

// =========================
// FORMATO TEXTO
// =========================
btnNegrita.addEventListener("click", () => ejecutar("bold"));
btnCursiva.addEventListener("click", () => ejecutar("italic"));
btnSubrayado.addEventListener("click", () => ejecutar("underline"));

fuenteSelect.addEventListener("change", () => ejecutar("fontName", fuenteSelect.value));
sizeSelect.addEventListener("change", () => ejecutar("fontSize", "7"));

colorTexto.addEventListener("change", () => ejecutar("foreColor", colorTexto.value));
colorFondo.addEventListener("change", () => ejecutar("hiliteColor", colorFondo.value));

// =========================
// ALINEACIÓN
// =========================
btnIzq.addEventListener("click", () => ejecutar("justifyLeft"));
btnCentro.addEventListener("click", () => ejecutar("justifyCenter"));
btnDer.addEventListener("click", () => ejecutar("justifyRight"));

// =========================
// INSERTAR IMAGEN
// =========================
btnImagen.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = ev => {
            ejecutar("insertImage", ev.target.result);
        };

        reader.readAsDataURL(file);
    };

    input.click();
});

// =========================
// INSERTAR ÍNDICE (placeholder)
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
// SÍMBOLOS
// =========================
simbolos.forEach(btn => {
    btn.addEventListener("click", () => {
        ejecutar("insertText", btn.textContent);
    });
});

// =========================
// EMOJIS
// =========================
emojis.forEach(img => {
    img.addEventListener("click", () => {
        ejecutar("insertImage", img.src);
    });
});

// =========================
// PANEL LATERAL
// =========================
togglePanel.addEventListener("click", () => {
    panelInsertar.classList.toggle("oculto");
    togglePanel.textContent = panelInsertar.classList.contains("oculto") ? ">>" : "<<";
});

// =========================
// NUMERAR PÁGINAS (visual)
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
// LIMPIEZA DE TEXTO INICIAL
// =========================
editor.addEventListener("focus", () => {
    if (editor.textContent === "Escribe tu documento aquí...") {
        editor.innerHTML = "";
    }
});

});
