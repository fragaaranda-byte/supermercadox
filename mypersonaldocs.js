document.addEventListener("DOMContentLoaded", () => {

    // =====================
    // MODALES Y OVERLAY
    // =====================
    const overlay = document.getElementById("overlay");

    function abrirModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove("oculto");
        overlay.classList.remove("oculto");
    }

    function cerrarModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add("oculto");
        overlay.classList.add("oculto");
    }

    overlay.addEventListener("click", () => {
        document.querySelectorAll(".modal").forEach(modal => modal.classList.add("oculto"));
        overlay.classList.add("oculto");
    });

    // =====================
    // MODAL CONFIGURACIÓN DE PÁGINAS
    // =====================
    btnConfigPagina.onclick = () => {
        abrirModal("modalConfigPaginas");

        // Valores por defecto del modal
        document.getElementById("selectHoja").value = "A4";
        document.getElementById("selectOrientacion").value = "Vertical";
        document.getElementById("margenSupIzq").value = 2;
        document.getElementById("margenSupDer").value = 2;
        document.getElementById("margenInfIzq").value = 2;
        document.getElementById("margenInfDer").value = 2;
    };

    document.getElementById("aceptarConfigPaginas").onclick = () => {
        const configPaginasData = {
            hoja: document.getElementById("selectHoja").value,
            orientacion: document.getElementById("selectOrientacion").value,
            margenes: {
                supIzq: parseFloat(document.getElementById("margenSupIzq").value),
                supDer: parseFloat(document.getElementById("margenSupDer").value),
                infIzq: parseFloat(document.getElementById("margenInfIzq").value),
                infDer: parseFloat(document.getElementById("margenInfDer").value)
            }
        };

        // Aplicar cambios de tamaño/márgenes sin tocar CSS
        if (window.aplicarConfigPaginas) {
            window.aplicarConfigPaginas(configPaginasData);
        }

        cerrarModal("modalConfigPaginas");
    };

    document.getElementById("cancelarConfigPaginas").onclick = () => {
        cerrarModal("modalConfigPaginas");
    };

 // =====================
// MODAL NUMERACIÓN
// =====================
btnNumerar.onclick = () => {
    abrirModal("modalNumeracion");

    let seleccion = null;
    document.getElementById("posicionNumeracion").onchange = e => seleccion = e.target.value;

    // Estilos iniciales
    let negrita = false;
    let cursiva = false;
    let subrayado = false;
    let tamanio = parseInt(document.getElementById("tamanioNumeracion").value);
    let colorTexto = document.getElementById("colorNumeracionTexto").value;
    let colorFondo = document.getElementById("colorNumeracionFondo").value;

    // Toggle estilos
    document.getElementById("numNegrita").onclick = () => negrita = !negrita;
    document.getElementById("numCursiva").onclick = () => cursiva = !cursiva;
    document.getElementById("numSubrayado").onclick = () => subrayado = !subrayado;

    // Cambios en tiempo real
    document.getElementById("tamanioNumeracion").onchange = e => tamanio = parseInt(e.target.value);
    document.getElementById("colorNumeracionTexto").onchange = e => colorTexto = e.target.value;
    document.getElementById("colorNumeracionFondo").onchange = e => colorFondo = e.target.value;

    // Función interna para aplicar estilos
    function crearNumeroPagina(texto) {
        const num = document.createElement("div");
        num.className = "numero-pagina";
        num.textContent = texto;

        // Aplicar estilos desde modal
        num.style.fontWeight = negrita ? "bold" : "normal";
        num.style.fontStyle = cursiva ? "italic" : "normal";
        num.style.textDecoration = subrayado ? "underline" : "none";
        num.style.fontSize = tamanio + "px";
        num.style.color = colorTexto;
        num.style.backgroundColor = colorFondo;

        num.style.position = "absolute";
        return num;
    }

    // Aceptar numeración
    document.getElementById("aceptarNumeracion").onclick = () => {
        if (!seleccion) return;

        // Primero eliminar numeraciones previas
        document.querySelectorAll(".numero-pagina").forEach(n => n.remove());

        window.configNumeracion = {
            posicion: seleccion,
            negrita,
            cursiva,
            subrayado,
            tamanio,
            colorTexto,
            colorFondo
        };

        document.querySelectorAll(".page").forEach((page, index) => {
            const num = crearNumeroPagina(index + 1);

            let target;
            if (seleccion.includes("superior")) target = page.querySelector(".page-header");
            else target = page.querySelector(".page-footer");

            if (seleccion.includes("izquierda")) num.style.left = "20px";
            if (seleccion.includes("derecha")) num.style.right = "20px";

            target.appendChild(num);
        });

        cerrarModal("modalNumeracion");
    };

    // Cancelar numeración: borrar todo y cerrar
    document.getElementById("cancelarNumeracion").onclick = () => {
        document.querySelectorAll(".numero-pagina").forEach(n => n.remove());
        window.configNumeracion = null;
        cerrarModal("modalNumeracion");
    };
};

    // =====================
    // MODAL NUEVO DOCUMENTO
    // =====================
    btnNuevo.onclick = () => {
        abrirModal("modalNuevo");

        document.getElementById("nuevoSi").onclick = () => {
            if (editor && editor.innerHTML) {
                editor.innerHTML = "";
                if (window.crearPagina) editor.appendChild(window.crearPagina());
            }
            window.configNumeracion = null;
            cerrarModal("modalNuevo");
        };

        document.getElementById("nuevoNo").onclick = () => cerrarModal("modalNuevo");
    };

});
