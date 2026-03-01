// logica.js

document.addEventListener("DOMContentLoaded", () => {

    const editor = document.getElementById("editor");

    // NEGRITA
    document.querySelector(".btn-texto:nth-child(3)").addEventListener("click", () => {
        document.execCommand("bold");
        editor.focus();
    });

    // CURSIVA
    document.querySelector(".btn-texto:nth-child(4)").addEventListener("click", () => {
        document.execCommand("italic");
        editor.focus();
    });

    // SUBRAYADO
    document.querySelector(".btn-texto:nth-child(5)").addEventListener("click", () => {
        document.execCommand("underline");
        editor.focus();
    });

    // FUENTE
    document.querySelector("#barra-formato select:nth-child(1)").addEventListener("change", function () {
        document.execCommand("fontName", false, this.value);
        editor.focus();
    });

    // TAMAÑO
    document.querySelector("#barra-formato select:nth-child(2)").addEventListener("change", function () {
        document.execCommand("fontSize", false, "7");
        let fontElements = editor.getElementsByTagName("font");
        for (let i = 0; i < fontElements.length; i++) {
            if (fontElements[i].size == "7") {
                fontElements[i].removeAttribute("size");
                fontElements[i].style.fontSize = this.value + "px";
            }
        }
        editor.focus();
    });

    // COLOR LETRA
    document.querySelector("#barra-formato input[type='color']:nth-child(3)").addEventListener("change", function () {
        document.execCommand("foreColor", false, this.value);
        editor.focus();
    });

    // COLOR RESALTADO
    document.querySelector("#barra-formato input[type='color']:nth-child(4)").addEventListener("change", function () {
        document.execCommand("hiliteColor", false, this.value);
        editor.focus();
    });

    // ALINEACIÓN
    const alignButtons = document.querySelectorAll("#barra-formato .btn-icono:nth-child(n+7)");
    alignButtons[0].addEventListener("click", () => { document.execCommand("justifyLeft"); editor.focus(); });
    alignButtons[1].addEventListener("click", () => { document.execCommand("justifyCenter"); editor.focus(); });
    alignButtons[2].addEventListener("click", () => { document.execCommand("justifyRight"); editor.focus(); });

});
