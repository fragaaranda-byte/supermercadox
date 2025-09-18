// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, query, where, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB8fQJsN0tqpuz48Om30m6u6jhEcSfKYEw",
  authDomain: "supermercadox-107f6.firebaseapp.com",
  projectId: "supermercadox-107f6",
  storageBucket: "supermercadox-107f6.firebasestorage.app",
  messagingSenderId: "504958637825",
  appId: "1:504958637825:web:6ae5e2cde43206b3052d00"
};

// Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Login
window.login = async function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    document.getElementById("login-section").classList.add("hidden");
    document.getElementById("app-section").classList.remove("hidden");
    loadStockList();
  } catch (error) {
    alert("Error en login: " + error.message);
  }
};

// Navegación
window.showPage = function(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById(pageId).classList.remove("hidden");
};

// --- Cargar Stock ---
async function guardarProducto() {
  const codigo = document.getElementById("codigo").value.trim();
  const nombre = document.getElementById("nombre").value.trim();
  const precio = parseFloat(document.getElementById("precio").value);
  const stock = parseInt(document.getElementById("stockCantidad").value);
  const expiryDate = document.getElementById("expiryDate").value;

  if (!codigo || !nombre || isNaN(precio) || isNaN(stock)) {
    alert("Completa todos los campos correctamente.");
    return;
  }

  try {
    await addDoc(collection(db, "products"), {
      code: codigo,
      name: nombre,
      price: precio,
      currentStock: stock,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      createdAt: new Date()
    });
    alert("✅ Producto guardado!");
    document.getElementById("codigo").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("stockCantidad").value = "";
    document.getElementById("expiryDate").value = "";
    loadStockList();
  } catch (e) {
    console.error(e);
    alert("❌ Error al guardar producto");
  }
}
document.getElementById("btnGuardarProducto").addEventListener("click", guardarProducto);

// --- Listar Stock ---
async function loadStockList() {
  const stockDiv = document.getElementById("stockList");
  stockDiv.innerHTML = "<h3>Listado de productos:</h3>";

  try {
    const snapshot = await getDocs(collection(db, "products"));
    if (snapshot.empty) {
      stockDiv.innerHTML += "<p>No hay productos.</p>";
      return;
    }

    let html = "<table><tr><th>Nombre</th><th>Código</th><th>Precio</th><th>Stock</th><th>Vencimiento</th></tr>";
    snapshot.forEach(doc => {
      const d = doc.data();
      html += `<tr>
        <td>${d.name}</td>
        <td>${d.code}</td>
        <td>$${d.price.toFixed(2)}</td>
        <td>${d.currentStock}</td>
        <td>${d.expiryDate ? new Date(d.expiryDate.seconds*1000).toLocaleDateString() : "-"}</td>
      </tr>`;
    });
    html += "</table>";
    stockDiv.innerHTML += html;
  } catch (e) {
    console.error(e);
  }
}

// --- Vender ---
let total = 0;

window.addProduct = async function() {
  const code = document.getElementById("barcodeInput").value.trim();
  if (!code) return;

  try {
    const snapshot = await getDocs(collection(db, "products"));
    let found = false;
    snapshot.forEach(doc => {
      const d = doc.data();
      if (d.code === code) {
        addRow(d.name, d.code, d.price);
        total += d.price;
        document.getElementById("total").innerText = total.toFixed(2);
        found = true;
      }
    });
    if (!found) alert("Producto no encontrado");
    document.getElementById("barcodeInput").value = "";
  } catch (e) {
    console.error(e);
    alert("Error al buscar producto");
  }
};

function addRow(name, code, price) {
  const tbody = document.querySelector("#cartTable tbody");
  const row = document.createElement("tr");
  row.innerHTML = `<td>${name}</td><td>${code}</td><td>$${price.toFixed(2)}</td>`;
  tbody.appendChild(row);
}

// --- Cobrar ---
window.checkout = function() {
  if (total === 0) {
    alert("No hay productos en el carrito");
    return;
  }
  alert("Compra realizada. Total: $" + total.toFixed(2));
  document.querySelector("#cartTable tbody").innerHTML = "";
  total = 0;
  document.getElementById("total").innerText = "0";
};

// --- Modificar productos ---
document.getElementById("btnModificar").addEventListener("click", async () => {
  const master = document.getElementById("masterPassword").value;
  if (master !== "TU_CONTRASEÑA_MAESTRA") {
    alert("Contraseña maestra incorrecta");
    return;
  }

  const modCode = document.getElementById("modCodigo").value.trim();
  const modName = document.getElementById("modNombre").value.trim();
  const modPrice = parseFloat(document.getElementById("modPrecio").value);
  const modStock = parseInt(document.getElementById("modStock").value);
  const modExpiry = document.getElementById("modExpiry").value;

  if (!modCode) {
    alert("Ingrese el código del producto a modificar");
    return;
  }

  try {
    const q = query(collection(db, "products"), where("code","==",modCode));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      alert("Producto no encontrado");
      return;
    }

    snapshot.forEach(async docSnap => {
      const docRef = doc(db, "products", docSnap.id);
      await updateDoc(docRef, {
        name: modName || docSnap.data().name,
        price: isNaN(modPrice) ? docSnap.data().price : modPrice,
        currentStock: isNaN(modStock) ? docSnap.data().currentStock : modStock,
        expiryDate: modExpiry ? new Date(modExpiry) : docSnap.data().expiryDate
      });
    });

    alert("Producto modificado!");
    loadStockList();
    document.getElementById("modCodigo").value = "";
    document.getElementById("modNombre").value = "";
    document.getElementById("modPrecio").value = "";
    document.getElementById("modStock").value = "";
    document.getElementById("modExpiry").value = "";
    document.getElementById("masterPassword").value = "";
  } catch(e) {
    console.error(e);
    alert("Error al modificar producto");
  }
});
