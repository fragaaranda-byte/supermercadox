// insertar.js

document.addEventListener("DOMContentLoaded", () => {
  const docContent = document.getElementById("doc-content");

  // === Función auxiliar: insertar HTML en la posición del cursor ===
  function insertarEnCursor(html) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();

    const temp = document.createElement("div");
    temp.innerHTML = html;
    const frag = document.createDocumentFragment();
    let node, lastNode;
    while ((node = temp.firstChild)) {
      lastNode = frag.appendChild(node);
    }
    range.insertNode(frag);

    // mover cursor después del contenido insertado
    if (lastNode) {
      range.setStartAfter(lastNode);
      range.setEndAfter(lastNode);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  // === Insertar Imagen ===
  const btnImagen = document.querySelector("#insertar-menu button:first-child");
  btnImagen.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        insertarEnCursor(`<img src="${ev.target.result}" style="max-width:200px;">`);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  });

  // === Insertar Índice (simplificado: lista de títulos) ===
  const btnIndice = document.querySelector("#insertar-menu button:nth-child(2)");
  btnIndice.addEventListener("click", () => {
    const headings = docContent.querySelectorAll("h1, h2, h3");
    let indiceHTML = "<div><h3>Índice</h3><ul>";
    headings.forEach(h => {
      indiceHTML += `<li>${h.textContent}</li>`;
    });
    indiceHTML += "</ul></div>";
    insertarEnCursor(indiceHTML);
  });

  // === Insertar Emojis ===
  document.querySelectorAll(".emoji-list img").forEach(img => {
    img.addEventListener("click", () => {
      insertarEnCursor(`<img src="${img.src}" alt="${img.alt}" style="width:20px;height:20px;">`);
    });
  });

  // === Insertar Símbolos ===
  document.querySelectorAll(".simbolos span").forEach(span => {
    span.addEventListener("click", () => {
      insertarEnCursor(span.textContent);
    });
  });

  // === Insertar Tabla (grid-selector 10x10) ===
  const grid = document.querySelector(".grid");
  if (grid) {
    // Generar las 100 celdas si no existen
    if (grid.children.length < 100) {
      for (let i = 0; i < 100; i++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        grid.appendChild(cell);
      }
    }

    let filas = 0, columnas = 0;

    grid.querySelectorAll(".cell").forEach((cell, index) => {
      const row = Math.floor(index / 10) + 1;
      const col = (index % 10) + 1;

      cell.addEventListener("mouseover", () => {
        filas = row;
        columnas = col;
        // resaltar las celdas seleccionadas
        grid.querySelectorAll(".cell").forEach((c, i) => {
          const r = Math.floor(i / 10) + 1;
          const ccol = (i % 10) + 1;
          c.style.background = (r <= filas && ccol <= columnas) ? "#cce" : "#eee";
        });
      });

      cell.addEventListener("click", () => {
        // Crear tabla HTML
        let tablaHTML = "<table border='1' style='border-collapse:collapse;'>";
        for (let r = 0; r < filas; r++) {
          tablaHTML += "<tr>";
          for (let c = 0; c < columnas; c++) {
            tablaHTML += "<td style='width:50px;height:20px;'></td>";
          }
          tablaHTML += "</tr>";
        }
        tablaHTML += "</table>";
        insertarEnCursor(tablaHTML);
        // resetear colores
        grid.querySelectorAll(".cell").forEach(c => c.style.background = "#eee");
      });
    });
  }

});
