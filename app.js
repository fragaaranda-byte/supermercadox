import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, query, where, doc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

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

let cart = [];
let salesToday = [];
let deletedSales = [];
let total = 0;

// Mostrar sección
window.showSection = function(id) {
  document.querySelectorAll(".section").forEach(s => s.style.display = "none");
  document.getElementById(id).style.display = "block";
  if(id==="controlStock") loadStockList();
  if(id==="modificar") loadModifyProductList();
  if(id==="controlVentas") loadSalesTable();
};

// Cargar Stock
document.getElementById("btnAddStock").addEventListener("click", async () => {
  const code = document.getElementById("barcodeInputStock").value.trim();
  const name = document.getElementById("nameInputStock").value.trim().toLowerCase();
  const price = parseFloat(document.getElementById("priceInputStock").value);
  const qty = parseInt(document.getElementById("quantityInputStock").value);
  if (!code || !name || isNaN(price) || isNaN(qty)) return alert("Complete todos los campos");

  const q = query(collection(db, "products"), where("code", "==", code));
  const snap = await getDocs(q);
  if (!snap.empty) {
    snap.forEach(async d => {
      await updateDoc(doc(db, "products", d.id), { currentStock: d.data().currentStock + qty, price, name });
    });
  } else {
    await addDoc(collection(db, "products"), { code, name, price, currentStock: qty });
  }
  loadStockList();
  loadModifyProductList();
});

// Listar Stock
window.loadStockList = async function() {
  const tbody = document.querySelector("#stockList tbody");
  tbody.innerHTML = "";
  const snap = await getDocs(collection(db,"products"));
  snap.forEach(d => {
    const data = d.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${data.code}</td><td>${data.name.toUpperCase()}</td><td>${data.price}</td><td>${data.currentStock}</td>`;
    tbody.appendChild(tr);
  });
};

// Modificar Productos
window.loadModifyProductList = async function() {
  const sel = document.getElementById("modProductSelect");
  sel.innerHTML = '<option value="">Seleccione un producto</option>';
  const snap = await getDocs(collection(db,"products"));
  snap.forEach(d => sel.innerHTML += `<option value="${d.id}">${d.data().name.toUpperCase()}</option>`);
};

window.loadProductToModify = async function() {
  const id = document.getElementById("modProductSelect").value;
  if(!id) return;
  const d = await getDocs(query(collection(db,"products"), where("__name__", "==", id)));
  const data = d.docs[0].data();
  document.getElementById("modNombre").value = data.name;
  document.getElementById("modPrecio").value = data.price;
  document.getElementById("modStock").value = data.currentStock;
};

document.getElementById("btnModificar").addEventListener("click", async () => {
  const id = document.getElementById("modProductSelect").value;
  const password = document.getElementById("masterPassword").value;
  if(password !== "123456789") return alert("Contraseña incorrecta");
  const modName = document.getElementById("modNombre").value.trim();
  const modPrice = parseFloat(document.getElementById("modPrecio").value);
  const modStock = parseInt(document.getElementById("modStock").value);
  if(!id || !modName || isNaN(modPrice) || isNaN(modStock)) return alert("Complete los campos");
  await updateDoc(doc(db,"products",id), { name: modName.toLowerCase(), price: modPrice, currentStock: modStock });
  alert("Producto modificado");
  loadStockList();
  loadModifyProductList();
});

// Venta
window.addProduct = async function() {
  const code = document.getElementById("barcodeInputSale").value.trim();
  const qty = parseInt(document.getElementById("quantityInputSale").value);
  if(!code || isNaN(qty)) return alert("Ingrese código y cantidad");
  const snap = await getDocs(query(collection(db,"products"), where("code","==",code)));
  if(snap.empty) return alert("Producto no encontrado");
  let prod;
  snap.forEach(d => prod = d.data());
  const exists = cart.find(p=>p.code===code);
  if(exists){
    exists.qty += qty;
    if(exists.qty > prod.currentStock) exists.qty = prod.currentStock;
  } else {
    cart.push({ code, qty, name: prod.name.toUpperCase(), price: prod.price, stock: prod.currentStock });
  }
  updateCartTable();
  document.getElementById("barcodeInputSale").value = "";
  document.getElementById("quantityInputSale").value = 1;
};

// Carrito
window.updateCartTable = function() {
  const tbody = document.querySelector("#cartTable tbody");
  tbody.innerHTML = "";
  total=0;
  cart.forEach(c=>{
    const subtotal = c.qty*c.price;
    total += subtotal;
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${c.name}</td><td>${c.code}</td><td>${c.price}</td><td>${c.qty}</td><td>${subtotal.toFixed(2)}</td>`;
    tbody.appendChild(tr);
  });
  document.getElementById("total").textContent = total.toFixed(2);
};

// + / -
window.increaseQty = async function() {
  const code = document.getElementById("barcodeInputSale").value.trim();
  const qtyInput = document.getElementById("quantityInputSale");
  if(!code) return;
  const snap = await getDocs(query(collection(db,"products"), where("code","==",code)));
  snap.forEach(d=>{
    if(qtyInput.value < d.data().currentStock) qtyInput.value = parseInt(qtyInput.value)+1;
  });
};
window.decreaseQty = function() {
  const qtyInput = document.getElementById("quantityInputSale");
  if(qtyInput.value>1) qtyInput.value = parseInt(qtyInput.value)-1;
};

// Cobrar
window.choosePaymentMethod = function() {
  if(cart.length===0) return alert("Carrito vacío");
  document.getElementById("paymentMethodDiv").style.display="block";
};

window.checkout = async function(method){
  const now = new Date().toLocaleString();
  for(let c of cart){
    const saleID = Math.floor(Math.random()*9999)+1;
    await addDoc(collection(db,"sales"), { saleID, code:c.code, name:c.name, price:c.price, qty:c.qty, date:now, method });
    const snap = await getDocs(query(collection(db,"products"),where("code","==",c.code)));
    snap.forEach(async d=>await updateDoc(doc(db,"products",d.id),{ currentStock: d.data().currentStock - c.qty }));
    salesToday.push({ saleID, ...c, date:now, method });
  }
  generateTicket(cart, method, now);
  cart = [];
  updateCartTable();
  document.getElementById("paymentMethodDiv").style.display="none";
};

// Ticket
function generateTicket(products, method, date){
  let content=`<div class="ticketWindow"><h2>SUPERMERCADO X</h2><p>${date}</p><hr>`;
  let totalTicket=0;
  products.forEach(p=>{
    content+=`<p>${p.name} [${p.qty}] (${p.price})</p>`;
    totalTicket+=p.qty*p.price;
  });
  content+=`<hr><h3>Total: $${totalTicket.toFixed(2)}</h3><p>Método de pago: ${method}</p></div>`;
  const ticketWindow = window.open("","Ticket","width=300,height=600");
  ticketWindow.document.write(content);
  ticketWindow.document.close();
  ticketWindow.print();
}

// Control de ventas
window.loadSalesTable = function(){
  const tbody = document.querySelector("#salesTable tbody");
  tbody.innerHTML="";
  salesToday.forEach(s=>{
    const tr = document.createElement("tr");
    tr.innerHTML=`<td>${s.saleID}</td><td>${s.date}</td><td>${s.name} x${s.qty}</td><td>${(s.price*s.qty).toFixed(2)}</td><td>${s.method}</td><td><button onclick="deleteSale(${s.saleID})" style="background:red;color:white;">ELIMINAR VENTA</button></td>`;
    tbody.appendChild(tr);
  });
};

// Eliminar venta
window.deleteSale = function(saleID){
  const reason=prompt("MOTIVO DE ELIMINACION:");
  if(!reason) return alert("Debe ingresar motivo");
  const password=prompt("Ingrese contraseña maestra:");
  if(password!=="123456789") return alert("Contraseña incorrecta");
  const index = salesToday.findIndex(s=>s.saleID===saleID);
  if(index===-1) return alert("Venta no encontrada");
  const sale = salesToday[index];
  deletedSales.push({...sale, reason});
  salesToday.splice(index,1);
  getDocs(query(collection(db,"products"),where("code","==",sale.code))).then(snap=>{
    snap.forEach(async d=>await updateDoc(doc(db,"products",d.id),{ currentStock: d.data().currentStock + sale.qty }));
  });
  loadSalesTable();
  loadStockList();
};

// TIRAR Z
window.printDailyReport=function(){
  let efectivoTotal=0;
  let tarjetaTotal=0;
  let content=`<div class="ticketWindow"><h2>SUPERMERCADO X</h2><hr>`;
  content+="<h3>Ventas del día</h3>";
  salesToday.forEach(s=>{
    content+=`<p>${s.name} x${s.qty} - $${(s.price*s.qty).toFixed(2)} - ${s.method}</p>`;
    if(s.method==="Efectivo") efectivoTotal+=s.price*s.qty;
    else tarjetaTotal+=s.price*s.qty;
  });
  content+="<hr><h3>Total Efectivo: $"+efectivoTotal.toFixed(2)+"</h3>";
  content+="<h3>Total Tarjeta: $"+tarjetaTotal.toFixed(2)+"</h3>";

  if(deletedSales.length>0){
    content+="<hr><h3>Ventas Eliminadas</h3>";
    deletedSales.forEach(s=>{
      content+=`<p>${s.name} x${s.qty} - $${(s.price*s.qty).toFixed(2)} - ${s.method} - Motivo: ${s.reason}</p>`;
      if(s.method==="Efectivo") efectivoTotal-=s.price*s.qty;
      else tarjetaTotal-=s.price*s.qty;
    });
    content+="<hr><h3>Resultado final Efectivo: $"+efectivoTotal.toFixed(2)+"</h3>";
    content+="<h3>Resultado final Tarjeta: $"+tarjetaTotal.toFixed(2)+"</h3>";
  }

  const ticketWindow = window.open("","TIRARZ","width=600,height=800");
  ticketWindow.document.write(content);
  ticketWindow.document.close();
  ticketWindow.print();
};
