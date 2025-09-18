import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc, orderBy, Timestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyB8fQJsN0tqpuz48Om30m6u6jhEcSfKYEw",
  authDomain: "supermercadox-107f6.firebaseapp.com",
  projectId: "supermercadox-107f6",
  storageBucket: "supermercadox-107f6.firebasestorage.app",
  messagingSenderId: "504958637825",
  appId: "1:504958637825:web:6ae5e2cde43206b3052d00"
};

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
    checkOperatingHours();
  } catch (e) {
    alert("Error de login: "+e.message);
  }
};

// Navegación
window.showPage = function(pageId) {
  document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));
  document.getElementById(pageId).classList.remove("hidden");
  if(pageId==="sell") checkOperatingHours();
};

// --- Bloqueo horario ---
function checkOperatingHours() {
  const now = new Date();
  const hour = now.getHours();
  const ventaInputs = document.querySelectorAll("#venderSection input, #venderSection button");
  if(hour<7 || hour>=22){
    ventaInputs.forEach(e=>e.disabled=true);
    alert("Sistema fuera de horario (07:00-22:00). Solo TIRAR Z permitido.");
  } else {
    ventaInputs.forEach(e=>e.disabled=false);
  }
}

// --- Cargar Stock ---
async function guardarProducto() {
  const codigo = document.getElementById("codigo").value.trim();
  const nombre = document.getElementById("nombre").value.trim();
  const precio = parseFloat(document.getElementById("precio").value);
  const stock = parseInt(document.getElementById("stockCantidad").value);
  const expiryDate = document.getElementById("expiryDate").value;

  if (!codigo || !nombre || isNaN(precio) || isNaN(stock)) return alert("Completa todos los campos correctamente");

  try {
    await addDoc(collection(db,"products"),{
      code:codigo, name:nombre, price:precio, currentStock:stock,
      expiryDate: expiryDate? new Date(expiryDate) : null,
      createdAt: new Date()
    });
    alert("Producto guardado!");
    document.getElementById("codigo").value="";
    document.getElementById("nombre").value="";
    document.getElementById("precio").value="";
    document.getElementById("stockCantidad").value="";
    document.getElementById("expiryDate").value="";
    loadStockList();
  } catch(e){ console.error(e); alert("Error al guardar producto"); }
}
document.getElementById("btnGuardarProducto").addEventListener("click",guardarProducto);

// --- Listar Stock ---
async function loadStockList() {
  const stockDiv = document.getElementById("stockList");
  stockDiv.innerHTML="<h3>Listado de productos:</h3>";
  try {
    const snapshot = await getDocs(collection(db,"products"));
    if(snapshot.empty){ stockDiv.innerHTML+="<p>No hay productos.</p>"; return; }
    let html="<table><tr><th>Nombre</th><th>Código</th><th>Precio</th><th>Stock</th><th>Vencimiento</th></tr>";
    snapshot.forEach(docSnap=>{
      const d=docSnap.data();
      html+=`<tr>
        <td>${d.name}</td>
        <td>${d.code}</td>
        <td>$${d.price.toFixed(2)}</td>
        <td>${d.currentStock}</td>
        <td>${d.expiryDate? new Date(d.expiryDate.seconds*1000).toLocaleDateString() : "-"}</td>
      </tr>`;
    });
    html+="</table>";
    stockDiv.innerHTML+=html;
  } catch(e){ console.error(e); }
}

// --- Vender ---
let total=0;
let cart=[];

window.addProduct= async function(){
  const code=document.getElementById("barcodeInput").value.trim();
  const qty=parseInt(document.getElementById("quantityInput").value);
  if(!code||isNaN(qty)||qty<=0) return;

  try{
    const snapshot = await getDocs(collection(db,"products"));
    let found=false;
    snapshot.forEach(docSnap=>{
      const d=docSnap.data();
      if(d.code===code){
        cart.push({code:d.code, name:d.name, price:d.price, quantity:qty});
        total += d.price*qty;
        addRow(d.name,d.code,d.price,qty);
        found=true;
      }
    });
    if(!found) alert("Producto no encontrado");
    document.getElementById("barcodeInput").value="";
    document.getElementById("quantityInput").value=1;
    document.getElementById("total").innerText=total.toFixed(2);
  } catch(e){ console.error(e); alert("Error al buscar producto"); }
};

function addRow(name,code,price,qty){
  const tbody=document.querySelector("#cartTable tbody");
  const row=document.createElement("tr");
  row.innerHTML=`<td>${name}</td><td>${code}</td><td>$${price.toFixed(2)}</td><td>${qty}</td><td>$${(price*qty).toFixed(2)}</td>`;
  tbody.appendChild(row);
}

// --- Cobrar e imprimir ticket ---
window.checkout = async function(){
  if(cart.length===0) return alert("Carrito vacío");
  const saleData={products:cart,total:total,timestamp:new Date()};
  await addDoc(collection(db,"sales"),saleData);

  // Ticket A4
  let ticketHTML=`<h1>SUPERMERCADO X</h1><p>${new Date().toLocaleString()}</p><table border="1" style="width:100%;border-collapse:collapse;"><tr><th>Producto</th><th>Código</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th></tr>`;
  cart.forEach(p=>ticketHTML+=`<tr><td>${p.name}</td><td>${p.code}</td><td>$${p.price.toFixed(2)}</td><td>${p.quantity}</td><td>$${(p.price*p.quantity).toFixed(2)}</td></tr>`);
  ticketHTML+=`</table><h3>Total: $${total.toFixed(2)}</h3>`;
  const w=window.open(); w.document.write(ticketHTML); w.print(); w.close();

  cart=[]; total=0;
  document.querySelector("#cartTable tbody").innerHTML="";
  document.getElementById("total").innerText="0";
};

// --- TIRAR Z ---
window.printDailyReport= async function(){
  const now=new Date();
  const start=new Date(now); start.setHours(7,0,0,0);
  const end=new Date(now); end.setHours(22,0,0,0);

  const snapshot = await getDocs(collection(db,"sales"));
  let html=`<h1>SUPERMERCADO X - Informe Diario</h1><p>${now.toLocaleDateString()}</p><table border="1" style="width:100%;border-collapse:collapse;"><tr><th>Producto</th><th>Código</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th>Hora</th></tr>`;
  let dailyTotal=0;

  snapshot.forEach(docSnap=>{
    const s=docSnap.data();
    const saleTime = s.timestamp.toDate();
    if(saleTime>=start && saleTime<=end){
      s.products.forEach(p=>{
        html+=`<tr><td>${p.name}</td><td>${p.code}</td><td>$${p.price.toFixed(2)}</td><td>${p.quantity}</td><td>$${(p.price*p.quantity).toFixed(2)}</td><td>${saleTime.toLocaleTimeString()}</td></tr>`;
        dailyTotal+=p.price*p.quantity;
      });
    }
  });
  html+=`</table><h3>Total del Día: $${dailyTotal.toFixed(2)}</h3>`;
  const w=window.open(); w.document.write(html); w.print(); w.close();
};

// --- Modificar productos ---
document.getElementById("btnModificar").addEventListener("click", async () => {
  const master=document.getElementById("masterPassword").value;
  if(master!=="TU_CONTRASEÑA_MAESTRA") return alert("Contraseña maestra incorrecta");

  const modCode=document.getElementById("modCodigo").value.trim();
  const modName=document.getElementById("modNombre").value.trim();
  const modPrice=parseFloat(document.getElementById("modPrecio").value);
  const modStock=parseInt(document.getElementById("modStock").value);
  const modExpiry=document.getElementById("modExpiry").value;

  if(!modCode) return alert("Ingrese el código del producto");

  const q=query(collection(db,"products"),where("code","==",modCode));
  const snapshot=await getDocs(q);
  if(snapshot.empty) return alert("Producto no encontrado");

  snapshot.forEach(async docSnap=>{
    const docRef=doc(db,"products",docSnap.id);
    await updateDoc(docRef,{
      name: modName||docSnap.data().name,
      price:isNaN(modPrice)?docSnap.data().price:modPrice,
      currentStock:isNaN(modStock)?docSnap.data().currentStock:modStock,
      expiryDate:modExpiry?new Date(modExpiry):docSnap.data().expiryDate
    });
  });
  alert("Producto modificado");
  loadStockList();
});
