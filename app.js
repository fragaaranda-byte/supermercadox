import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, query, where, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { v4 as uuidv4 } from "https://cdn.skypack.dev/uuid";

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

// ------------------ UI ------------------
window.showSection = function(id){
  document.querySelectorAll(".section").forEach(s=>s.style.display="none");
  document.getElementById(id).style.display="block";
};

// ------------------ STOCK ------------------
window.addStock = async function(){
  const code = document.getElementById("barcodeInput").value.trim();
  const name = document.getElementById("nameInput").value.trim();
  const price = parseFloat(document.getElementById("priceInput").value);
  const qty = parseInt(document.getElementById("quantityInput").value);

  if(!code || !name || isNaN(price) || isNaN(qty)) return alert("Complete todos los campos");

  const q = query(collection(db,"products"), where("code","==",code));
  const snapshot = await getDocs(q);

  if(!snapshot.empty){
    snapshot.forEach(async d=>{
      await updateDoc(doc(db,"products",d.id),{
        currentStock: qty,
        price,
        name: name.toLowerCase()
      });
    });
    alert("Producto actualizado");
  } else {
    await addDoc(collection(db,"products"),{
      code, name: name.toLowerCase(), price, currentStock: qty
    });
    alert("Producto agregado");
  }

  document.getElementById("barcodeInput").value="";
  document.getElementById("nameInput").value="";
  document.getElementById("priceInput").value="";
  document.getElementById("quantityInput").value="";
  loadStockList();
  loadModifyProductList();
};

window.loadStockList = async function(){
  const tbody = document.querySelector("#stockTable tbody");
  tbody.innerHTML = "";
  const snapshot = await getDocs(collection(db,"products"));
  snapshot.forEach(docSnap=>{
    const d = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${d.name.toUpperCase()}</td><td>${d.code}</td><td>${d.price}</td><td>${d.currentStock}</td>`;
    tbody.appendChild(tr);
  });
};
loadStockList();

// ------------------ MODIFICAR ------------------
window.loadModifyProductList = async function(){
  const select = document.getElementById("modProductSelect");
  select.innerHTML = '<option value="">-- Seleccione producto --</option>';
  const snapshot = await getDocs(collection(db,"products"));
  snapshot.forEach(d=>{
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = d.data().name.toUpperCase();
    select.appendChild(opt);
  });
};
loadModifyProductList();

window.loadProductToModify = async function(){
  const id = document.getElementById("modProductSelect").value;
  if(!id) return;
  const snapshot = await getDocs(query(collection(db,"products"), where("__name__","==",id)));
  snapshot.forEach(d=>{
    const data = d.data();
    document.getElementById("modNombre").value = data.name;
    document.getElementById("modPrecio").value = data.price;
    document.getElementById("modStock").value = data.currentStock;
  });
};

document.getElementById("btnModificar").addEventListener("click", async ()=>{
  const master = document.getElementById("masterPassword").value;
  if(master!=="123456789") return alert("Contraseña maestra incorrecta");
  const docId = document.getElementById("modProductSelect").value;
  if(!docId) return alert("Seleccione producto");

  const modName = document.getElementById("modNombre").value.trim();
  const modPrice = parseFloat(document.getElementById("modPrecio").value);
  const modStock = parseInt(document.getElementById("modStock").value);

  await updateDoc(doc(db,"products",docId),{
    name: modName.toLowerCase(),
    price: modPrice,
    currentStock: modStock
  });
  alert("Producto modificado");
  loadStockList();
  loadModifyProductList();
});

// ------------------ VENDER ------------------
window.addProduct = async function(){
  const code = document.getElementById("barcodeInputSale").value.trim();
  if(!code) return alert("Ingrese código");

  const snapshot = await getDocs(query(collection(db,"products"), where("code","==",code)));
  if(snapshot.empty) return alert("Producto no existe");

  snapshot.forEach(d=>{
    const data = d.data();
    const exists = cart.find(p=>p.code===code);
    if(exists){
      exists.qty += 1;
    } else {
      cart.push({code, qty:1, name:data.name.toUpperCase(), price:data.price});
    }
  });
  updateCartTable();
  document.getElementById("barcodeInputSale").value = "";
};

window.updateCartTable = function(){
  const tbody = document.querySelector("#cartTable tbody");
  tbody.innerHTML = "";
  let total = 0;
  cart.forEach(c=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.name}</td>
      <td>${c.code}</td>
      <td>${c.price}</td>
      <td>
        <button onclick="changeQty('${c.code}',-1)">-</button>
        ${c.qty}
        <button onclick="changeQty('${c.code}',1)">+</button>
      </td>
      <td>${(c.price*c.qty).toFixed(2)}</td>`;
    tbody.appendChild(tr);
    total += c.price * c.qty;
  });
  document.getElementById("total").textContent = total.toFixed(2);
};

window.changeQty = function(code, delta){
  const product = cart.find(p=>p.code===code);
  if(!product) return;
  product.qty += delta;
  if(product.qty < 1) cart = cart.filter(p=>p.code!==code);
  updateCartTable();
};

window.checkout = async function(){
  const now = new Date();
  const method = prompt("Método de pago (Efectivo/Tarjeta):");
  if(!method) return alert("Debe ingresar un método");

  for(let c of cart){
    const snapshot = await getDocs(query(collection(db,"products"), where("code","==",c.code)));
    snapshot.forEach(async d=>{
      const current = d.data().currentStock;
      await updateDoc(doc(db,"products",d.id), {currentStock: current - c.qty});
    });
    const saleId = uuidv4();
    await addDoc(collection(db,"sales"),{
      id: saleId,
      code: c.code,
      name: c.name,
      price: c.price,
      qty: c.qty,
      date: now,
      method
    });
    salesToday.push({id: saleId, code: c.code, name:c.name, price:c.price, qty:c.qty, date:now, method});
  }

  // Imprimir ticket
  const printWindow = window.open('', 'Print', 'width=800,height=600');
  let html = '<h2>SUPERMERCADO X - TICKET</h2><hr>';
  cart.forEach(p=>{ html += `${p.name} [${p.qty}] ($${p.price.toFixed(2)})<br>`; });
  html += `<hr>Total: $${cart.reduce((a,p)=>a+p.price*p.qty,0).toFixed(2)}`;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();

  cart = [];
  updateCartTable();
  loadStockList();
  loadSalesTable();
};

// ------------------ CONTROL DE VENTAS ------------------
window.loadSalesTable = async function(){
  const tbody = document.querySelector("#salesTable tbody");
  tbody.innerHTML = "";
  const snapshot = await getDocs(collection(db,"sales"));
  snapshot.forEach(docSnap=>{
    const s = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${new Date(s.date.seconds*1000).toLocaleString()}</td>
      <td>${s.name} [${s.qty}] ($${s.price})</td>
      <td>${(s.qty*s.price).toFixed(2)}</td>
      <td>${s.method}</td>
      <td>${s.id}</td>
      <td><button onclick="deleteSale('${docSnap.id}')">ELIMINAR VENTA</button></td>`;
    tbody.appendChild(tr);
  });
};

window.deleteSale = async function(id){
  const reason = prompt("MOTIVO DE ELIMINACION:");
  if(!reason) return alert("Debe ingresar un motivo");
  const master = prompt("Ingrese contraseña maestra:");
  if(master!=="123456789") return alert("Contraseña incorrecta");

  const snapshot = await getDocs(query(collection(db,"sales"), where("__name__","==",id)));
  snapshot.forEach(async d=>{
    const saleData = d.data();
    deletedSales.push({...saleData, reason, id: saleData.id});
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

// ------------------ TIRAR Z ------------------
window.printDailyReport = function(){
  const master = prompt("Ingrese contraseña maestra para TIRAR Z:");
  if(master!=="123456789") return alert("Contraseña incorrecta");
  const printWindow = window.open('','Print','width=800,height=600');
  let efectivoTotal = 0, tarjetaTotal = 0;
  let html='<h2>SUPERMERCADO X - TIRAR Z</h2><hr>';
  salesToday.filter(s=>s.method==="Efectivo").forEach(p=>{ html+=`${p.name} [${p.qty}] ($${p.price.toFixed(2)}) - ID: ${p.id}<br>`; efectivoTotal+=p.price*p.qty; });
  html+=`Total efectivo: $${efectivoTotal.toFixed(2)}<hr>`;
  salesToday.filter(s=>s.method==="Tarjeta").forEach(p=>{ html+=`${p.name} [${p.qty}] ($${p.price.toFixed(2)}) - ID: ${p.id}<br>`; tarjetaTotal+=p.price*p.qty; });
  html+=`Total tarjeta: $${tarjetaTotal.toFixed(2)}<hr>`;
  html+='<h3>Ventas Eliminadas</h3>';
  deletedSales.forEach(p=>{ html+=`${p.name} [${p.qty}] ($${p.price.toFixed(2)}) - Motivo: ${p.reason} - ID: ${p.id}<br>`; });
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
};

// ------------------ INICIO ------------------
showSection("inicio");
loadSalesTable();
