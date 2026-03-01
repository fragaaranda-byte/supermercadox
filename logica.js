document.addEventListener("DOMContentLoaded", () => {

    const editor = document.getElementById("editor");

    const barraFormato = document.getElementById("barra-formato");
    const panelInsertar = document.getElementById("panel-insertar");
    const togglePanel = document.getElementById("toggle-panel");

    const selects = barraFormato.getElementsByTagName("select");
    const botonesTexto = barraFormato.getElementsByClassName("btn-texto");
    const inputsColor = barraFormato.querySelectorAll("input[type='color']");
    const botonesIcono = barraFormato.getElementsByClassName("btn-icono");

    const botonesSuperior = document.getElementById("barra-superior").getElementsByClassName("btn-icono");

    /* =========================
       FUNCIONES TEXTO
    ========================== */

    // Negrita
    botonesTexto[0].addEventListener("click", () => {
        document.execCommand("bold");
        editor.focus();
    });

    // Cursiva
    botonesTexto[1].addEventListener("click", () => {
        document.execCommand("italic");
        editor.focus();
    });

    // Subrayado
    botonesTexto[2].addEventListener("click", () => {
        document.execCommand("underline");
        editor.focus();
    });

    // Fuente
    selects[0].addEventListener("change", function () {
        document.execCommand("fontName", false, this.value);
        editor.focus();
    });

    // Tamaño real en px
    selects[1].addEventListener("change", function () {
        document.execCommand("fontSize", false, "7");

        let fonts = editor.getElementsByTagName("font");
        for (let i = 0; i < fonts.length; i++) {
            if (fonts[i].size === "7") {
                fonts[i].removeAttribute("size");
                fonts[i].style.fontSize = this.value + "px";
            }
        }
        editor.focus();
    });

    // Color de texto
    inputsColor[0].addEventListener("change", function () {
        document.execCommand("foreColor", false, this.value);
        editor.focus();
    });

    // Color resaltado
    inputsColor[1].addEventListener("change", function () {
        document.execCommand("hiliteColor", false, this.value);
        editor.focus();
    });

    // Alineación
    botonesIcono[0].addEventListener("click", () => {
        document.execCommand("justifyLeft");
        editor.focus();
    });

    botonesIcono[1].addEventListener("click", () => {
        document.execCommand("justifyCenter");
        editor.focus();
    });

    botonesIcono[2].addEventListener("click", () => {
        document.execCommand("justifyRight");
        editor.focus();
    });

    /* =========================
       DESHACER / REHACER
    ========================== */

    botonesSuperior[0].addEventListener("click", () => {
        document.execCommand("undo");
        editor.focus();
    });

    botonesSuperior[1].addEventListener("click", () => {
        document.execCommand("redo");
        editor.focus();
    });

    /* =========================
       PANEL INSERTAR
    ========================== */

    let panelVisible = true;

    togglePanel.addEventListener("click", () => {
        if (panelVisible) {
            panelInsertar.style.display = "none";
            togglePanel.innerHTML = ">>";
            panelVisible = false;
        } else {
            panelInsertar.style.display = "block";
            togglePanel.innerHTML = "<<";
            panelVisible = true;
        }
    });

    /* =========================
       INSERTAR SÍMBOLOS
    ========================== */

    const simbolos = document.querySelectorAll(".simbolos button");

    simbolos.forEach(btn => {
        btn.addEventListener("click", () => {
            insertTextAtCursor(btn.textContent);
        });
    });

    /* =========================
       INSERTAR EMOJIS
    ========================== */

    const emojis = document.querySelectorAll(".emojis img");

    emojis.forEach(img => {
        img.addEventListener("click", () => {
            insertImageAtCursor(img.src);
        });
    });

    /* =========================
       INSERTAR IMAGEN
    ========================== */

    const btnInsertarImagen = document.querySelector(".bloque-insertar .btn-icono:first-child");

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

    /* =========================
       FUNCIONES AUXILIARES
    ========================== */

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

});
