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

    // Cerrar modales al hacer click fuera
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
    const selectPosicion = document.getElementById("posicionNumeracion");
    const selectTamanoNumeracion = document.getElementById("tamanoNumeracion");
    const btnNegritaNumeracion = document.getElementById("negritaNumeracion");
    const btnCursivaNumeracion = document.getElementById("cursivaNumeracion");
    const btnSubrayadoNumeracion = document.getElementById("subrayadoNumeracion");

    let configNumeracion = {
        posicion: "esq-sup-izq",
        estilo: { negrita: false, cursiva: false, subrayado: false },
        tamano: 12
    };

    btnNumerar.addEventListener("click", () => abrirModal(modalNumeracion));

    // Cambios en posición
    selectPosicion.addEventListener("change", () => {
        configNumeracion.posicion = selectPosicion.value;
    });

    // Cambios en tamaño
    selectTamanoNumeracion.addEventListener("change", () => {
        configNumeracion.tamano = parseInt(selectTamanoNumeracion.value);
    });

    // Cambios en estilo
    btnNegritaNumeracion.addEventListener("click", () => {
        configNumeracion.estilo.negrita = !configNumeracion.estilo.negrita;
    });
    btnCursivaNumeracion.addEventListener("click", () => {
        configNumeracion.estilo.cursiva = !configNumeracion.estilo.cursiva;
    });
    btnSubrayadoNumeracion.addEventListener("click", () => {
        configNumeracion.estilo.subrayado = !configNumeracion.estilo.subrayado;
    });

    btnAceptarNumeracion.addEventListener("click", () => {
        cerrarModal(modalNumeracion);
        console.log("Numeración aplicada:", configNumeracion);
        // aplicarNumeracion(configNumeracion) → implementar en logica.js
    });

    btnCancelarNumeracion.addEventListener("click", () => cerrarModal(modalNumeracion));

    // =====================
    // MODAL CONFIGURACIÓN DE PÁGINA
    // =====================
    const btnConfig = document.getElementById("btnConfig");
    const btnAceptarConfig = document.getElementById("aceptarConfig");
    const btnCancelarConfig = document.getElementById("cancelarConfig");

    btnConfig.addEventListener("click", () => abrirModal(modalConfigPaginas));

    btnAceptarConfig.addEventListener("click", () => {
        const orientacion = document.getElementById("orientacionPagina").value;
        const hoja = document.getElementById("hojaPagina").value;
        const margSupIzq = parseFloat(document.getElementById("margenSupIzq").value);
        const margSupDer = parseFloat(document.getElementById("margenSupDer").value);
        const margInfIzq = parseFloat(document.getElementById("margenInfIzq").value);
        const margInfDer = parseFloat(document.getElementById("margenInfDer").value);

        const configPaginasData = {
            orientacion,
            hoja,
            margenes: {
                supIzq: margSupIzq,
                supDer: margSupDer,
                infIzq: margInfIzq,
                infDer: margInfDer
            }
        };

        console.log("Configuración de páginas aplicada:", configPaginasData);
        cerrarModal(modalConfigPaginas);
        // aplicarConfigPaginas(configPaginasData) → implementar en logica.js
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
        console.log("Documento nuevo generado");
        cerrarModal(modalNuevo);
        // generarDocumentoNuevo() → implementar en logica.js
    });

    btnNuevoNo.addEventListener("click", () => cerrarModal(modalNuevo));

    // =====================
    // MODAL ABRIR DOCUMENTO
    // =====================
    const btnAbrir = document.getElementById("btnAbrir");
    const btnAbrirSi = document.getElementById("abrirSi");
    const btnAbrirNo = document.getElementById("abrirNo");

    btnAbrir.addEventListener("click", () => abrirModal(modalAbrir));

    btnAbrirSi.addEventListener("click", async () => {
        cerrarModal(modalAbrir);
        // Abrir cuadro de selección de archivo
        try {
            const [fileHandle] = await window.showOpenFilePicker({
                multiple: false,
                types: [{
                    description: "Documentos My Personal Docs",
                    accept: { "application/mpd": [".mpd"] }
                }]
            });
            console.log("Archivo abierto:", fileHandle.name);
            // abrirDocumento(fileHandle) → implementar en logica.js
        } catch (err) {
            console.log("Abrir cancelado o error:", err);
        }
    });

    btnAbrirNo.addEventListener("click", () => cerrarModal(modalAbrir));

    // =====================
    // BOTÓN GUARDAR
    // =====================
    const btnGuardar = document.getElementById("btnGuardar");
    let documentoGuardado = false;
    let nombreArchivo = "";

    btnGuardar.addEventListener("click", async () => {
        if (documentoGuardado && nombreArchivo) {
            console.log("Guardando documento en:", nombreArchivo);
            // guardarDocumento(nombreArchivo) → implementar en logica.js
        } else {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: "documento.mpd",
                    types: [{
                        description: "Documentos My Personal Docs",
                        accept: { "application/mpd": [".mpd"] }
                    }]
                });
                nombreArchivo = handle.name;
                documentoGuardado = true;
                console.log("Guardar Como:", nombreArchivo);
                // guardarDocumentoNuevo(handle) → implementar en logica.js
            } catch (err) {
                console.log("Guardar Como cancelado o error:", err);
            }
        }
    });

    // =====================
    // INICIALIZAR TODOS MODALES OCULTOS
    // =====================
    [modalNumeracion, modalConfigPaginas, modalNuevo, modalAbrir].forEach(m => m.classList.add("oculto"));
    overlay.classList.add("oculto");

});
