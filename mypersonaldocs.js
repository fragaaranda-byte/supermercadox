document.addEventListener("DOMContentLoaded", () => {

    // =====================
    // ELEMENTOS MODALES
    // =====================
    const overlay = document.getElementById("overlay");

    const modalNumeracion = document.getElementById("modalNumeracion");
    const modalConfigPaginas = document.getElementById("modalConfigPaginas");
    const modalNuevo = document.getElementById("modalNuevo");
    const modalAbrir = document.getElementById("modalAbrir");

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
        [modalNumeracion, modalConfigPaginas, modalNuevo, modalAbrir].forEach(m => {
            if (m && !m.classList.contains("oculto")) cerrarModal(m);
        });
    });

    // =====================
    // MODAL NUMERACIÓN
    // =====================
    const btnNumerar = document.getElementById("btnNumerar");
    const btnAceptarNumeracion = document.getElementById("aceptarNumeracion");
    const btnCancelarNumeracion = document.getElementById("cancelarNumeracion");

    let seleccionNumeracion = null;

    btnNumerar.addEventListener("click", () => abrirModal(modalNumeracion));

    // Selección de posición
    const selectPosicion = document.getElementById("posicionNumeracion");
    selectPosicion.addEventListener("change", () => {
        seleccionNumeracion = selectPosicion.value;
    });

    btnAceptarNumeracion.addEventListener("click", () => {
        // Aquí se puede guardar la configuración en logica.js
        cerrarModal(modalNumeracion);
    });

    btnCancelarNumeracion.addEventListener("click", () => cerrarModal(modalNumeracion));

    // =====================
    // MODAL CONFIGURACIÓN PÁGINA
    // =====================
    const btnConfig = document.getElementById("btnConfig");
    const btnAceptarConfig = document.getElementById("aceptarConfig");
    const btnCancelarConfig = document.getElementById("cancelarConfig");

    btnConfig.addEventListener("click", () => abrirModal(modalConfigPaginas));

    btnAceptarConfig.addEventListener("click", () => {
        // Leer valores de los select y guardarlos en tu objeto de configuración
        cerrarModal(modalConfigPaginas);
    });

    btnCancelarConfig.addEventListener("click", () => cerrarModal(modalConfigPaginas));

    // =====================
    // MODAL NUEVO DOCUMENTO
    // =====================
    const btnNuevo = document.getElementById("btnNuevo");
    const btnNuevoSi = document.getElementById("nuevoSi");
    const btnNuevoNo = document.getElementById("nuevoNo");

    btnNuevo.addEventListener("click", () => abrirModal(modalNuevo));

    btnNuevoSi.addEventListener("click", () => {
        // Generar documento nuevo vacío
        cerrarModal(modalNuevo);
    });

    btnNuevoNo.addEventListener("click", () => cerrarModal(modalNuevo));

    // =====================
    // MODAL ABRIR DOCUMENTO
    // =====================
    const btnAbrir = document.getElementById("btnAbrir");
    const btnAbrirSi = document.getElementById("abrirSi");
    const btnAbrirNo = document.getElementById("abrirNo");

    btnAbrir.addEventListener("click", () => abrirModal(modalAbrir));

    btnAbrirSi.addEventListener("click", () => {
        // Abrir cuadro típico de selección de archivo
        cerrarModal(modalAbrir);
    });

    btnAbrirNo.addEventListener("click", () => cerrarModal(modalAbrir));

    // =====================
    // INICIALIZAR TODOS MODALES OCULTOS
    // =====================
    [modalNumeracion, modalConfigPaginas, modalNuevo, modalAbrir].forEach(m => {
        if (m) m.classList.add("oculto");
    });
    if (overlay) overlay.classList.add("oculto");

});
