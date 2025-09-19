import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, query, where, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Firebase config
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

// --- Variables ---
let cart = [];
let salesToday = [];
let deletedSales = [];

// --- Navegación ---
function showSection(id){
  document.querySelectorAll(".section").forEach(s=>s.style.display="none");
  document.getElementById(id).style.display="block";
}
document.getElementById("btnCargar").onclick = ()=>showSection("cargar");
document.getElementById("btnVender").onclick = ()=>showSection("vender");
document.getElementById("btnControl").onclick = ()=>showSection("control");
document.getElementById("btnModify").onclick = ()=>showSection("modify");
document.getElementById("btnControlVentas").onclick = ()=>showSection("controlVentas");

// --- Cargar Stock ---
async function addStock(){
  const code = document.getElementById("barcodeInput").value.trim();
  const name = document.getElementById("nameInput").value.trim();
  const priceInt = parseInt(document.getElementById("priceInput").value);
  const cents = parseInt(document.getElementById("centsInput").value) || 0;
  const price = priceInt + cents/100;
  const qty = parseInt(document.getElementById("quantityInput").value);
  if(!code||!name||isNaN(priceInt)||isNaN(qty)) return alert("Complete todos los campos");

  const q = query(collection(db,"products"), where("code","==",code));
  const snapshot = await getDocs(q);
  if(!snapshot.empty){
    snapshot.forEach(async d=>{
      await updateDoc(doc(db,"products",d.id), {name:name.toLowerCase(), price, currentStock: qty});
    });
    alert("Producto actualizado");
  }else{
    await addDoc(collection(db,"products"), {code, name:name.toLowerCase(), price, currentStock: qty});
    alert("Producto agregado");
  }
  document.getElementById("barcodeInput").value="";
  document.getElementById("nameInput").value="";
  document.getElementById("priceInput").value="";
  document.getElementById("centsInput").value="";
  document.getElementById("quantityInput").value="";
  loadStockList();
  loadModifyProductList();
}
document.getElementById("addStockButton").onclick = addStock;

async function loadStockList(){
  const tbody = document.querySelector("#stockTable tbody");
  tbody.innerHTML="";
  const snapshot = await getDocs(collection(db,"products"));
  snapshot.forEach(docSnap=>{
    const d = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${d.name.toUpperCase()}</td><td>${d.code}</td><td>${d.price.toFixed(2)}</td><td>${d.currentStock}</td>`;
    tbody.appendChild(tr);
  });
}
loadStockList();

// --- Modificar Producto ---
async function loadModifyProductList(){
  const select = document.getElementById("modProductSelect");
  select.innerHTML='<option value="">-- Seleccione producto --</option>';
  const snapshot = await getDocs(collection(db,"products"));
  snapshot.forEach(d=>{
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = d.data().name.toUpperCase();
    select.appendChild(opt);
  });
}
loadModifyProductList();

document.getElementById("modProductSelect").onchange = async ()=>{
  const id = document.getElementById("modProductSelect").value;
  if(!id) return;
  const docRef = doc(db,"products",id);
  const docSnap = await getDocs(query(collection(db,"products"), where("__name__","==",id)));
  docSnap.forEach(d=>{
    const data = d.data();
    document.getElementById("modNombre").value = data.name;
    const intPart = Math.floor(data.price);
    const centPart = Math.round((data.price - intPart)*100);
    document.getElementById("modPrecio").value = intPart;
    document.getElementById("modCents").value = centPart;
    document.getElementById("modStock").value = data.currentStock;
  });
};

document.getElementById("btnModificar").onclick = async ()=>{
  const master = document.getElementById("masterPassword").value;
  if(master !== "123456789") return alert("Contraseña maestra incorrecta");
  const docId = document.getElementById("modProductSelect").value;
  if(!docId) return alert("Seleccione producto");

  const name = document.getElementById("modNombre").value.trim();
  const priceInt = parseInt(document.getElementById("modPrecio").value);
  const cents = parseInt(document.getElementById("modCents").value) || 0;
  const price = priceInt + cents/100;
  const stock = parseInt(document.getElementById("modStock").value);

  await updateDoc(doc(db,"products",docId), {name:name.toLowerCase(), price, currentStock: stock});
  alert("Producto modificado");
  loadStockList();
  loadModifyProductList();
};

// --- Vender ---
document.getElementById("addProductButton").onclick = async ()=>{
  const code = document.getElementById("barcodeInputSale").value.trim();
  const qty = parseInt(document.getElementById("quantityInputSale").value);
  if(!code||isNaN(qty)) return alert("Ingrese código y cantidad");

  const snapshot = await getDocs(query(collection(db,"products"), where("code","==",code)));
  if(snapshot.empty) return alert("Producto no encontrado");

  snapshot.forEach(d=>{
    const data = d.data();
    const exists = cart.find(p=>p.code===code);
    if(exists){
      exists.qty = qty;
    }else{
      cart.push({code, name:data.name.toUpperCase(), price:data.price, qty});
    }
  });
  updateCartTable();
  document.getElementById("barcodeInputSale").value="";
  document.getElementById("quantityInputSale").value=1;
};

function updateCartTable(){
  const tbody = document.querySelector("#cartTable tbody");
  tbody.innerHTML="";
  let total = 0;
  cart.forEach(c=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${c.name}</td><td>${c.code}</td><td>${c.price.toFixed(2)}</td><td>${c.qty}</td><td>${(c.price*c.qty).toFixed(2)}</td>`;
    tbody.appendChild(tr);
    total += c.price*c.qty;
  });
  document.getElementById("total").textContent = total.toFixed(2);
}

// --- Pago ---
document.getElementById("choosePaymentButton").onclick = ()=>{
  if(cart.length===0) return alert("Carrito vacío");
  document.getElementById("paymentMethodDiv").style.display="block";
};
document.getElementById("payCash").onclick = ()=>checkout("Efectivo");
document.getElementById("payCard").onclick = ()=>checkout("Tarjeta");

async function checkout(method){
  const now = new Date();
  for(let c of cart){
    const snapshot = await getDocs(query(collection(db,"products"), where("code","==",c.code)));
    snapshot.forEach(async d=>{
      const current = d.data().currentStock;
      await updateDoc(doc(db,"products",d.id), {currentStock: current - c.qty});
    });
    await addDoc(collection(db,"sales"), {code:c.code, name:c.name, price:c.price, qty:c.qty, date: now, method});
    salesToday.push({code:c.code,name:c.name,price:c.price,qty:c.qty,date:now,method});
  }
  cart=[];
  updateCartTable();
  loadStockList();
  loadSalesTable();
  document.getElementById("paymentMethodDiv").style.display="none";
  alert("Venta registrada y ticket generado");
}

// --- Control de ventas ---
async function loadSalesTable(){
  const tbody = document.querySelector("#salesTable tbody");
  tbody.innerHTML="";
  const snapshot = await getDocs(collection(db,"sales"));
  snapshot.forEach(docSnap=>{
    const s = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${new Date(s.date.seconds*1000).toLocaleString()}</td><td>${s.name} [${s.qty}] ($${s.price.toFixed(2)})</td><td>${(s.qty*s.price).toFixed(2)}</td><td>${s.method}</td>
    <td><button onclick="deleteSale('${docSnap.id}')">ELIMINAR VENTA</button></td>`;
    tbody.appendChild(tr);
  });
}
window.loadSalesTable = loadSalesTable;

window.deleteSale = async function(id){
  const reason = prompt("MOTIVO DE ELIMINACION:");
  if(!reason) return alert("Debe ingresar un motivo");
  const master = prompt("Ingrese contraseña maestra:");
  if(master !== "123456789") return alert("Contraseña incorrecta");

  const snapshot = await getDocs(query(collection(db,"sales"), where("__name__","==",id)));
  snapshot.forEach(async d=>{
    const saleData = d.data();
    deletedSales.push({...saleData, reason});
    const prodSnap = await getDocs(query(collection(db,"products"), where("code","==",saleData.code)));
    prodSnap.forEach(async prod=>{
      const curr = prod.data().currentStock;
      await updateDoc(doc(db,"products",prod.id), {currentStock: curr + saleData.qty});
    });
    await deleteDoc(doc(db,"sales",id));
  });
  loadStockList();
  loadSalesTable();
};

// --- Tirar Z ---
document.getElementById("tirarZButton").onclick = function(){
  const master = prompt("Ingrese contraseña maestra para TIRAR Z:");
  if(master !== "123456789") return alert("Contraseña incorrecta");
  const printWindow = window.open('','Print','width=800,height=600');
  let efectivoTotal=0, tarjetaTotal=0;
  let html='<h2>SUPERMERCADO X - TIRAR Z</h2><hr>';
  html+='<h3>Ventas en efectivo</h3>';
  salesToday.filter(s=>s.method==="Efectivo").forEach(p=>{ html+=`${p.name} [${p.qty}] ($${p.price.toFixed(2)})<br>`; efectivoTotal+=p.price*p.qty; });
  html+=`Total efectivo: $${efectivoTotal.toFixed(2)}<hr>`;
  html+='<h3>Ventas con tarjeta</h3>';
  salesToday.filter(s=>s.method==="Tarjeta").forEach(p=>{ html+=`${p.name} [${p.qty}] ($${p.price.toFixed(2)})<br>`; tarjetaTotal+=p.price*p.qty; });
  html+=`Total tarjeta: $${tarjetaTotal.toFixed(2)}<hr>`;
  html+=`TOTAL DEL DIA: $${(efectivoTotal+tarjetaTotal).toFixed(2)}`;
  printWindow.document.write(html);
  printWindow.print();
  salesToday=[];
  loadSalesTable();
};

