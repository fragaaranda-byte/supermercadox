document.addEventListener("DOMContentLoaded", () => {

    // =====================
    // ELEMENTOS MODALES
    // =====================
    const overlay = document.getElementById("overlay");

    const modalNumeracion = document.getElementById("modalNumeracion");
    const modalConfigPaginas = document.getElementById("modalConfigPaginas");
    const modalNuevo = document.getElementById("modalNuevo");
    const modalAbrir = document.getElementById("modalAbrir");
    const modalGuardarComo = document.getElementById("modalGuardarComo");

    // =====================
    // FUNCIONES GENERALES
    // =====================
    function abrirModal(modal) {
        if (!modal || !overlay) return;
        modal.classList.remove("oculto");
        overlay.classList.remove("oculto");
    }

    function cerrarModal(modal) {
        if (!modal || !overlay) return;
        modal.classList.add("oculto");
        overlay.classList.add("oculto");
    }

    // Hacer click sobre overlay cierra cualquier modal activo
    overlay.addEventListener("click", () => {
        [modalNumeracion, modalConfigPaginas, modalNuevo, modalAbrir, modalGuardarComo].forEach(m => {
            if (m && !m.classList.contains("oculto")) {
                cerrarModal(m);
            }
        });
    });

    // =====================
    // MODAL NUMERACIÓN
    // =====================
    const btnNumerar = document.getElementById("btnNumerar");
    const btnAceptarNumeracion = document.getElementById("btnAceptarNumeracion");
    const btnCancelarNumeracion = document.getElementById("btnCancelarNumeracion");

    let configNumeracion = null;
    let seleccionNumeracion = null;

    btnNumerar.addEventListener("click", () => abrirModal(modalNumeracion));

    modalNumeracion.querySelectorAll("button[data-pos]").forEach(btn => {
        btn.onclick = () => seleccionNumeracion = btn.dataset.pos;
    });

    btnAceptarNumeracion.addEventListener("click", () => {
        if (seleccionNumeracion) configNumeracion = seleccionNumeracion;
        cerrarModal(modalNumeracion);
        // aplicarNumeracion() → se llama desde logica.js
    });

    btnCancelarNumeracion.addEventListener("click", () => cerrarModal(modalNumeracion));

    // =====================
    // MODAL CONFIG PÁGINAS
    // =====================
    const btnConfig = document.querySelectorAll("#barra-superior .btn-icono")[2]; // asumiendo icono config
    const btnAceptarConfig = document.getElementById("btnAceptarConfig");
    const btnCancelarConfig = document.getElementById("btnCancelarConfig");

    let configPaginas = {
        tamaño: "A4",
        margen: {top: 20, bottom: 20, left: 20, right: 20} // default
    };

    btnConfig.addEventListener("click", () => abrirModal(modalConfigPaginas));

    btnAceptarConfig?.addEventListener("click", () => {
        // Aquí se leerían los inputs de tamaño/márgenes y actualizar configPaginas
        cerrarModal(modalConfigPaginas);
        // Luego se aplicaría a las páginas en logica.js
    });

    btnCancelarConfig?.addEventListener("click", () => cerrarModal(modalConfigPaginas));

    // =====================
    // MODALES ARCHIVO
    // =====================
    const btnNuevo = document.getElementById("btnNuevo");
    const btnAbrir = document.getElementById("btnAbrir");
    const btnGuardarComo = document.getElementById("btnGuardarComo");

    const modalMap = {
        "btnNuevo": modalNuevo,
        "btnAbrir": modalAbrir,
        "btnGuardarComo": modalGuardarComo
    };

    Object.keys(modalMap).forEach(btnId => {
        const btn = document.getElementById(btnId);
        btn?.addEventListener("click", () => abrirModal(modalMap[btnId]));
    });

    // Para cerrar, se pueden agregar botones de cancelar dentro de cada modal de archivo
    document.querySelectorAll(".modal-cancel").forEach(btn => {
        btn.addEventListener("click", () => {
            const modal = btn.closest(".modal");
            cerrarModal(modal);
        });
    });

    // =====================
    // INICIALIZAR TODOS MODALES OCULTOS
    // =====================
    [modalNumeracion, modalConfigPaginas, modalNuevo, modalAbrir, modalGuardarComo].forEach(m => {
        if (m) m.classList.add("oculto");
    });
    if (overlay) overlay.classList.add("oculto");

});
