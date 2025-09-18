// Importar Firebase desde CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Configuración de tu Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB8fQJsN0tqpuz48Om30m6u6jhEcSfKYEw",
  authDomain: "supermercadox-107f6.firebaseapp.com",
  projectId: "supermercadox-107f6",
  storageBucket: "supermercadox-107f6.firebasestorage.app",
  messagingSenderId: "504958637825",
  appId: "1:504958637825:web:6ae5e2cde43206b3052d00"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let total = 0;

// LOGIN
window.login = async function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    document.getElementById("login-section").classList.add("hidden");
    document.getElementById("app-section").classList.remove("hidden");
  } catch (error) {
    alert("Error en login: " + error.message);
  }
};

// CAMBIAR PANTALLA
window.showPage = function(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById(pageId).classList.remove("hidden");
};

// AGREGAR PRODUCTO AL CARRITO
window.addProduct = async function() {
  const code = document.getElementById("barcodeInput").value.trim();
  if (!code) return;

  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);
    let found = false;

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.code === code) {
        addRow(data.name, data.code, data.price);
        total += data.price;
        document.getElementById("total").innerText = total.toFixed(2);
        found = true;
      }
    });

    if (!found) alert("Producto no encontrado");
    document.getElementById("barcodeInput").value = "";

  } catch (err) {
    alert("Error al buscar producto: " + err.message);
  }
};

// Mostrar producto en la tabla
function addRow(name, code, price) {
  const tbody = document.querySelector("#cartTable tbody");
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${name}</td>
    <td>${code}</td>
    <td>$${price.toFixed(2)}</td>
  `;
  tbody.appendChild(row);
}

// COBRAR
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
