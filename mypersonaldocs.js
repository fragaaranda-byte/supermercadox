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
// MODAL NUMERACIÓN COMPLETO CORREGIDO
// =====================
btnNumerar.onclick = () => {
    abrirModal("modalNumeracion");

    // Variables de configuración en tiempo real
    let seleccion = null;
    let negrita = false;
    let cursiva = false;
    let subrayado = false;
    let tamanio = parseInt(document.getElementById("tamanioNumeracion").value);
    let colorTexto = document.getElementById("colorNumeracionTexto").value;
    let colorFondo = document.getElementById("colorNumeracionFondo").value;

    // Posición seleccionada
    document.getElementById("posicionNumeracion").onchange = e => seleccion = e.target.value;

    // Toggle estilos
    document.getElementById("numNegrita").onclick = () => negrita = !negrita;
    document.getElementById("numCursiva").onclick = () => cursiva = !cursiva;
    document.getElementById("numSubrayado").onclick = () => subrayado = !subrayado;

    // Cambios en tiempo real
    document.getElementById("tamanioNumeracion").onchange = e => tamanio = parseInt(e.target.value);
    document.getElementById("colorNumeracionTexto").onchange = e => colorTexto = e.target.value;
    document.getElementById("colorNumeracionFondo").onchange = e => colorFondo = e.target.value;

    // Función para aplicar numeración por página y posición
    window.aplicarNumeracion = function(config) {
        if (!config) {
            // Cancelar: eliminar todas las numeraciones
            document.querySelectorAll(".numero-pagina").forEach(n => n.remove());
            document.querySelectorAll(".page-header, .page-footer").forEach(hf => hf.style.height = "0px");
            return;
        }

        const esSuperior = config.posicion.includes("superior");
        const esIzquierda = config.posicion.includes("izquierda");
        const esDerecha = config.posicion.includes("derecha");

        // Definir un identificador único por posición
        const posicionKey = (esSuperior ? "sup" : "inf") + "-" + (esIzquierda ? "izq" : "der");

        document.querySelectorAll(".page").forEach((page, index) => {
            let target = esSuperior ? page.querySelector(".page-header") : page.querySelector(".page-footer");

            // Buscar numeración existente en la misma posición
            let numExistente = target.querySelector(`.numero-pagina[data-posicion='${posicionKey}']`);

            if (numExistente) {
                // Actualizar estilos y contenido
                numExistente.textContent = index + 1;
                numExistente.style.fontWeight = config.negrita ? "bold" : "normal";
                numExistente.style.fontStyle = config.cursiva ? "italic" : "normal";
                numExistente.style.textDecoration = config.subrayado ? "underline" : "none";
                numExistente.style.fontSize = config.tamanio + "px";
                numExistente.style.color = config.colorTexto;
                numExistente.style.backgroundColor = config.colorFondo;
                numExistente.style.left = esIzquierda ? "20px" : "";
                numExistente.style.right = esDerecha ? "20px" : "";
            } else {
                // Crear nueva numeración si no existe
                const num = document.createElement("div");
                num.className = "numero-pagina";
                num.setAttribute("data-posicion", posicionKey);
                num.textContent = index + 1;

                num.style.fontWeight = config.negrita ? "bold" : "normal";
                num.style.fontStyle = config.cursiva ? "italic" : "normal";
                num.style.textDecoration = config.subrayado ? "underline" : "none";
                num.style.fontSize = config.tamanio + "px";
                num.style.color = config.colorTexto;
                num.style.backgroundColor = config.colorFondo;
                num.style.position = "absolute";

                if (esIzquierda) num.style.left = "20px";
                if (esDerecha) num.style.right = "20px";

                target.appendChild(num);
            }

            // Ajustar altura solo si hay numeración
            target.style.height = "56px";
        });
    };

    // Aceptar numeración
    document.getElementById("aceptarNumeracion").onclick = () => {
        if (!seleccion) return;
        window.configNumeracion = {
            posicion: seleccion,
            negrita,
            cursiva,
            subrayado,
            tamanio,
            colorTexto,
            colorFondo
        };
        window.aplicarNumeracion(window.configNumeracion);
        cerrarModal("modalNumeracion");
    };

    // Cancelar numeración
    document.getElementById("cancelarNumeracion").onclick = () => {
        window.aplicarNumeracion(null);
        window.configNumeracion = null;
        cerrarModal("modalNumeracion");
    };

    // Cerrar modal
    function cerrarModal(idModal) {
        const modal = document.getElementById(idModal);
        const overlay = document.getElementById("overlay");
        modal.classList.add("oculto");
        overlay.classList.add("oculto");
    }
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
