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

        document.getElementById("aceptarNumeracion").onclick = () => {
            if (seleccion && window.aplicarNumeracion) {
                window.configNumeracion = seleccion;
                window.aplicarNumeracion(seleccion);
            }
            cerrarModal("modalNumeracion");
        };

        document.getElementById("cancelarNumeracion").onclick = () => cerrarModal("modalNumeracion");
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
