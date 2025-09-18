import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, query, where, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

// VARIABLES
let cart = [];
let total = 0;
let salesToday = [];
let deletedSales = [];

// ------------------ UI ------------------
window.showSection = function(id){
  document.querySelectorAll(".section").forEach(s=>s.style.display="none");
  document.getElementById(id).style.display="block";
};

// ------------------ STOCK ------------------
window.addStock = async function(){
  const code=document.getElementById("barcodeInput").value.trim();
  const name=document.getElementById("nameInput").value.trim();
  const price=parseFloat(document.getElementById("priceInput").value);
  const qty=parseInt(document.getElementById("quantityInput").value);
  const expiry=document.getElementById("expiryInput").value;
  if(!code||!name||isNaN(price)||isNaN(qty)) return alert("Complete todos los campos");

  const q=query(collection(db,"products"), where("code","==",code));
  const snapshot=await getDocs(q);
  if(!snapshot.empty){
    snapshot.forEach(async d=>{
      await updateDoc(doc(db,"products",d.id),{
        currentStock: qty,
        price,
        name: name.toLowerCase(),
        expiryDate: expiry? new Date(expiry) : null
      });
    });
    alert("Producto actualizado");
  }else{
    await addDoc(collection(db,"products"),{
      code,name:name.toLowerCase(),price,currentStock:qty,expiryDate:expiry? new Date(expiry):null
    });
    alert("Producto agregado");
  }
  document.getElementById("barcodeInput").value="";
  document.getElementById("nameInput").value="";
  document.getElementById("priceInput").value="";
  document.getElementById("quantityInput").value="";
  document.getElementById("expiryInput").value="";
  loadStockList();
  loadModifyProductList();
};

window.loadStockList=async function(){
  const tbody=document.querySelector("#stockTable tbody");
  tbody.innerHTML="";
  const snapshot=await getDocs(collection(db,"products"));
  snapshot.forEach(docSnap=>{
    const d=docSnap.data();
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${d.name.toUpperCase()}</td><td>${d.code}</td><td>${d.price}</td><td>${d.currentStock}</td><td>${d.expiryDate? new Date(d.expiryDate.seconds*1000).toLocaleDateString() : ''}</td>`;
    tbody.appendChild(tr);
  });
};
loadStockList();

// ------------------ MODIFICAR ------------------
window.loadModifyProductList=async function(){
  const select=document.getElementById("modProductSelect");
  select.innerHTML='<option value="">-- Seleccione producto --</option>';
  const snapshot=await getDocs(collection(db,"products"));
  snapshot.forEach(d=>{
    const opt=document.createElement("option");
    opt.value=d.id;
    opt.textContent=d.data().name.toUpperCase();
    select.appendChild(opt);
  });
};
loadModifyProductList();

window.loadProductToModify= async function(){
  const id=document.getElementById("modProductSelect").value;
  if(!id) return;
  const snapshot=await getDocs(query(collection(db,"products"), where("__name__","==",id)));
  snapshot.forEach(d=>{
    const data=d.data();
    document.getElementById("modNombre").value=data.name;
    document.getElementById("modPrecio").value=data.price;
    document.getElementById("modStock").value=data.currentStock;
    document.getElementById("modExpiry").value=data.expiryDate? new Date(data.expiryDate.seconds*1000).toISOString().slice(0,10):"";
  });
};

document.getElementById("btnModificar").addEventListener("click", async ()=>{
  const master=document.getElementById("masterPassword").value;
  if(master!=="123456789") return alert("Contraseña maestra incorrecta");
  const docId=document.getElementById("modProductSelect").value;
  if(!docId) return alert("Seleccione producto");

  const modName=document.getElementById("modNombre").value.trim();
  const modPrice=parseFloat(document.getElementById("modPrecio").value);
  const modStock=parseInt(document.getElementById("modStock").value);
  const modExpiry=document.getElementById("modExpiry").value? new Date(document.getElementById("modExpiry").value):null;

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

// ------------------ VENTA ------------------
window.addProduct=function(){
  const code=document.getElementById("barcodeInputSale").value.trim();
  const qty=parseInt(document.getElementById("quantityInputSale").value);
  if(!code||isNaN(qty)) return alert("Complete los campos");

  const snapshotPromise=getDocs(query(collection(db,"products"), where("code","==",code)));
  snapshotPromise.then(snapshot=>{
    if(snapshot.empty) return alert("Producto no encontrado");
    snapshot.forEach(d=>{
      const data=d.data();
      const existing=cart.find(p=>p.code===code);
      if(existing){ existing.qty=qty; }else{ cart.push({code,name:data.name.toUpperCase(),price:data.price,qty}); }
      updateCartTable();
    });
  });
};

function updateCartTable(){
  const tbody=document.querySelector("#cartTable tbody");
  tbody.innerHTML="";
  total=0;
  cart.forEach(p=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${p.name}</td><td>${p.code}</td><td>${p.price}</td><td>${p.qty}</td><td>${(p.price*p.qty).toFixed(2)}</td>`;
    tbody.appendChild(tr);
    total+=p.price*p.qty;
  });
  document.getElementById("total").textContent=total.toFixed(2);
}

window.choosePaymentMethod=function(){
  if(cart.length===0) return alert("Carrito vacío");
  document.getElementById("paymentMethodDiv").style.display="block";
};

window.checkout=async function(method){
  if(cart.length===0) return alert("Carrito vacío");
  const now=new Date();
  for(let p of cart){
    await addDoc(collection(db,"sales"),{
      code:p.code,
      name:p.name,
      price:p.price,
      qty:p.qty,
      date:now,
      method
    });
  }
  generateTicket(cart,total,method);
  salesToday.push(...cart.map(p=>({...p, method, date:now})));
  cart=[];
  updateCartTable();
  document.getElementById("paymentMethodDiv").style.display="none";
};

function generateTicket(cart,total,method){
  const printWindow=window.open('','Print','width=300,height=600');
  let html='<div class="printTicket"><h3>SUPERMERCADO X</h3><hr>';
  cart.forEach(p=>{ html+=`${p.name} [${p.qty}] ($${p.price.toFixed(2)})<br>`; });
  html+=`<hr>Total: $${total.toFixed(2)}<br>Método de pago: ${method}</div>`;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
}

// ------------------ CONTROL VENTAS ------------------
window.loadSales=async function(){
  const tbody=document.querySelector("#salesTable tbody");
  tbody.innerHTML="";
  const snapshot=await getDocs(collection(db,"sales"));
  snapshot.forEach(docSnap=>{
    const d=docSnap.data();
    const tr=document.createElement("tr");
    const productsDesc=JSON.stringify({name:d.name,qty:d.qty,price:d.price});
    tr.innerHTML=`<td>${new Date(d.date.seconds*1000).toLocaleTimeString()}</td><td>${productsDesc}</td><td>$${(d.qty*d.price).toFixed(2)}</td><td>${d.method}</td>
      <td><button style="background-color:red;color:white;" onclick="deleteSale('${docSnap.id}')">ELIMINAR VENTA</button></td>`;
    tbody.appendChild(tr);
  });
};
window.loadSales();

// Función eliminar venta
window.deleteSale=async function(id){
  const master=prompt("Contraseña maestra:");
  if(master!=="123456789") return alert("Contraseña incorrecta");
  let reason=prompt("MOTIVO DE ELIMINACION (obligatorio):");
  if(!reason) return alert("Debe ingresar un motivo");
  const docRef=doc(db,"sales",id);
  const snapshot=await getDocs(query(collection(db,"sales"), where("__name__","==",id)));
  snapshot.forEach(async d=>{
    deletedSales.push({...d.data(), reason});
    await deleteDoc(doc(db,"sales",id));
  });
  loadSales();
};

// ------------------ TIRAR Z ------------------
window.printDailyReport=function(){
  const master=prompt("Ingrese contraseña maestra para TIRAR Z:");
  if(master!=="123456789") return alert("Contraseña incorrecta");
  const printWindow=window.open('','Print','width=800,height=600');
  let efectivoTotal=0, tarjetaTotal=0;
  let html='<h2>SUPERMERCADO X - TIRAR Z</h2><hr>';
  html+='<h3>Ventas en efectivo</h3>';
  salesToday.filter(s=>s.method==="Efectivo").forEach(p=>{ html+=`${p.name} [${p.qty}] ($${p.price.toFixed(2)})<br>`; efectivoTotal+=p.price*p.qty; });
  html+=`Total efectivo: $${efectivoTotal.toFixed(2)}<hr>`;
  html+='<h3>Ventas con tarjeta</h3>';
  salesToday.filter(s=>s.method==="Tarjeta").forEach(p=>{ html+=`${p.name} [${p.qty}] ($${p.price.toFixed(2)})<br>`; tarjetaTotal+=p.price*p.qty; });
  html+=`Total tarjeta: $${tarjetaTotal.toFixed(2)}<hr>`;
  html+='<h3>Ventas Eliminadas</h3>';
  deletedSales.forEach(p=>{ html+=`${p.name} [${p.qty}] ($${p.price.toFixed(2)}) - Motivo: ${p.reason}<br>`; });
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
};

// ------------------ INICIO ------------------
showSection("inicio");
