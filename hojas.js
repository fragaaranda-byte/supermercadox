// hojas.js

document.addEventListener("DOMContentLoaded", () => {
  const docArea = document.getElementById("doc-area");
  const primeraPagina = docArea.querySelector(".page .doc-content");

  // Configuración inicial de página
  let configPagina = {
    tamaño: "A4",
    orientacion: "Vertical",
    margenes: {
      superior: 20,
      inferior: 20,
      izquierdo: 20,
      derecho: 20
    }
  };

  // === Función para aplicar configuración de página ===
  function aplicarConfigPagina() {
    const paginas = docArea.querySelectorAll(".page");

    paginas.forEach(pagina => {
      let width, height;
      switch (configPagina.tamaño) {
        case "A4": width = 210; height = 297; break;
        case "A5": width = 148; height = 210; break;
        case "A3": width = 297; height = 420; break;
        case "Legal": width = 216; height = 356; break;
        case "Folio": width = 210; height = 330; break;
        case "Carta": width = 216; height = 279; break;
        default: width = 210; height = 297;
      }

      if (configPagina.orientacion === "Horizontal") {
        [width, height] = [height, width];
      }

      pagina.style.width = width + "mm";
      pagina.style.height = height + "mm";

      const contenido = pagina.querySelector(".doc-content");
      if (contenido) {
        contenido.style.paddingTop = configPagina.margenes.superior + "mm";
        contenido.style.paddingBottom = configPagina.margenes.inferior + "mm";
        contenido.style.paddingLeft = configPagina.margenes.izquierdo + "mm";
        contenido.style.paddingRight = configPagina.margenes.derecho + "mm";
      }
    });
  }

  // === Función para crear nueva página ===
  function crearPagina() {
    const nuevaPagina = document.createElement("div");
    nuevaPagina.className = "page";

    const nuevoContenido = document.createElement("div");
    nuevoContenido.className = "doc-content";
    nuevoContenido.contentEditable = "true";

    nuevaPagina.appendChild(nuevoContenido);
    docArea.appendChild(nuevaPagina);

    aplicarConfigPagina();
    return nuevoContenido;
  }

  // === Paginación dinámica ===
  function verificarPaginacion() {
    const paginas = docArea.querySelectorAll(".page");
    paginas.forEach(pagina => {
      const contenido = pagina.querySelector(".doc-content");
      if (
        contenido.scrollHeight > pagina.clientHeight &&
        contenido.textContent.trim() !== ""
      ) {
        const nuevoContenido = crearPagina();
        while (contenido.scrollHeight > pagina.clientHeight) {
          const ultimoNodo = contenido.lastChild;
          if (!ultimoNodo) break;
          nuevoContenido.insertBefore(ultimoNodo, nuevoContenido.firstChild);
        }
      }
    });
  }

  // === Evento: cada vez que el usuario escribe, verificar paginación ===
  primeraPagina.addEventListener("input", verificarPaginacion);

  // === Exponer funciones globales para archivo.js (configurar página) ===
  window.configurarPagina = function(opciones) {
    configPagina.orientacion = opciones.orientacion;
    configPagina.tamaño = opciones.papel;
    configPagina.margenes = {
      derecho: parseFloat(opciones.derecho),
      izquierdo: parseFloat(opciones.izquierdo),
      superior: parseFloat(opciones.superior),
      inferior: parseFloat(opciones.inferior)
    };
    aplicarConfigPagina();
  };

  aplicarConfigPagina();
});
