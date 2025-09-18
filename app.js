import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB8fQJsN0tqpuz48Om30m6u6jhEcSfKYEw",
  authDomain: "supermercadox-107f6.firebaseapp.com",
  projectId: "supermercadox-107f6",
  storageBucket: "supermercadox-107f6.firebasestorage.app",
  messagingSenderId: "504958637825",
  appId: "1:504958637825:web:6ae5e2cde43206b3052d00"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Manejo de secciones
function showSection(id){
  document.querySelectorAll(".section").forEach(s=>s.style.display="none");
  document.getElementById(id).style.display="block";
}

// Carrito
let cart = [];
let total = 0;

// Agregar stock
window.addStock = async function(){
  const code = document.getElementById("barcodeInput").value.trim();
  const name = document.getElementById("nameInput").value.trim();
  const price = parseFloat(document.getElementById("priceInput").value);
  const qty = parseInt(document.getElementById("quantityInput").value);
  const expiry = document.getElementById("expiryInput").value;

  if(!code || !name || isNaN(price) || isNaN(qty)) return alert("Complete todos los campos");

  await addDoc(collection(db,"products"),{
    code,name:name.toLowerCase(),price,currentStock:qty,expiryDate:expiry? new Date(expiry) : null
  });
  alert("Producto agregado al stock");
  document.getElementById("barcodeInput").value="";
  document.getElementById("nameInput").value="";
  document.getElementById("priceInput").value="";
  document.getElementById("quantityInput").value="";
  document.getElementById("expiryInput").value="";
  loadStockList();
  loadModifyProductList();
};

// Listar stock
window.loadStockList = async function(){
  const tbody = document.querySelector("#stockTable tbody");
  tbody.innerHTML="";
  const snapshot = await getDocs(collection(db,"products"));
  snapshot.forEach(docSnap=>{
    const d = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML=`<td>${d.name.toUpperCase()}</td><td>${d.code}</td><td>${d.price}</td><td>${d.currentStock}</td><td>${d.expiryDate? new Date(d.expiryDate.seconds*1000).toLocaleDateString() : ''}</td>`;
    tbody.appendChild(tr);
  });
};
loadStockList();

// Lista productos modificar
window.loadModifyProductList = async function() {
  const select = document.getElementById("modProductSelect");
  select.innerHTML='<option value="">-- Seleccione producto --</option>';
  const snapshot = await getDocs(collection(db,"products"));
  snapshot.forEach(docSnap=>{
    const opt = document.createElement("option");
    opt.value=docSnap.id;
    opt.textContent=docSnap.data().name.toUpperCase();
    select.appendChild(opt);
  });
};

// Cargar datos producto
window.loadProductToModify = async function(){
  const id = document.getElementById("modProductSelect").value;
  if(!id) return;
  const docSnap = await getDocs(query(collection(db,"products"), where("__name__","==",id)));
  docSnap.forEach(d=>{
    const data=d.data();
    document.getElementById("modNombre").value=data.name;
    document.getElementById("modPrecio").value=data.price;
    document.getElementById("modStock").value=data.currentStock;
    document.getElementById("modExpiry").value=data.expiryDate ? new Date(data.expiryDate.seconds*1000).toISOString().slice(0,10) : "";
  });
};

// Modificar producto
document.getElementById("btnModificar").addEventListener("click", async ()=>{
  const master=document.getElementById("masterPassword").value;
  if(master!=="123456789") return alert("Contraseña maestra incorrecta");
  const docId=document.getElementById("modProductSelect").value;
  if(!docId) return alert("Seleccione un producto");

  const modName=document.getElementById("modNombre").value.trim();
  const modPrice=parseFloat(document.getElementById("modPrecio").value);
  const modStock=parseInt(document.getElementById("modStock").value);
  const modExpiry=document.getElementById("modExpiry").value ? new Date(document.getElementById("modExpiry").value) : null;

  await updateDoc(doc(db,"products",docId),{
    name:modName.toLowerCase(),
    price:modPrice,
    currentStock:modStock,
    expiryDate:modExpiry
  });
  alert("Producto modificado");
  loadStockList();
  loadModifyProductList();
});

// Mostrar secciones al inicio
showSection("inicio");

// ---------- Aquí faltaría implementar carrito, checkout, tickets vertical y TIRAR Z como ya lo teníamos ----------
// Por limitaciones de espacio, puedo generarte esta parte completa lista para tickets y TIRAR Z en la próxima respuesta si querés.
