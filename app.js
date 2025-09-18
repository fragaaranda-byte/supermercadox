// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Configuración Firebase
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

// Cargar lista productos para modificar
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

// Cargar datos producto seleccionado
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
  const modExpiry=document.getElementById("modExpiry").value;

  const docRef=doc(db,"products",docId);
  await updateDoc(docRef,{
    name:modName.toLowerCase(),
    price:isNaN(modPrice)?0:modPrice,
    currentStock:isNaN(modStock)?0:modStock,
    expiryDate:modExpiry? new Date(modExpiry) : null
  });
  alert("Producto modificado");
  loadModifyProductList();
  loadStockList();
});

// Agregar producto al carrito
window.addProduct = async function(){
  const code=document.getElementById("barcodeInputSale").value.trim();
  const qty=parseInt(document.getElementById("quantityInputSale").value);
  if(!code || isNaN(qty) || qty<=0) return;

  const snapshot = await getDocs(collection(db,"products"));
  let found=false;
  snapshot.forEach(docSnap=>{
    const d=docSnap.data();
    if(d.code===code){
      const existing=cart.find(p=>p.code===code);
      if(existing) existing.quantity+=qty;
      else cart.push({code:d.code,name:d.name,price:d.price,quantity:qty});
      total+=d.price*qty;
      updateCartTable();
      found=true;
    }
  });
  if(!found) alert("Producto no encontrado");
  document.getElementById("barcodeInputSale").value="";
  document.getElementById("quantityInputSale").value=1;
  document.getElementById("total").innerText=total.toFixed(2);
};

function updateCartTable(){
  const tbody=document.querySelector("#cartTable tbody");
  tbody.innerHTML="";
  cart.forEach(p=>{
    const row=document.createElement("tr");
    row.innerHTML=`<td>${p.name.toUpperCase()}</td><td>${p.code}</td><td>${p.price.toFixed(2)}</td><td>${p.quantity}</td><td>${(p.price*p.quantity).toFixed(2)}</td>`;
    tbody.appendChild(row);
  });
}

// Cobrar e imprimir ticket vertical
window.checkout = async function(){
  if(cart.length===0) return alert("Carrito vacío");
  const saleData={products:cart,total:total,timestamp:new Date()};
  await addDoc(collection(db,"sales"),saleData);

  let ticketHTML=`<div style="width:28%; margin:0 auto; font-family: Arial, sans-serif;">
    <h2 style="text-align:center;">SUPERMERCADO X</h2>
    <p>${new Date().toLocaleString()}</p>
    <hr>
    <table style="width:100%; border-collapse: collapse;">`;
  cart.forEach(p=>{
    ticketHTML+=`<tr><td style="text-transform:uppercase;">${p.name}</td><td>[${p.quantity}]</td><td>(${p.price.toFixed(2)})</td></tr>`;
  });
  ticketHTML+=`</table><hr><h3>Total: $${total.toFixed(2)}</h3>
    <div id="qrcode" style="margin-top:20px; text-align:center;"></div></div>`;

  const w=window.open("","_blank","width=400,height=800");
  w.document.write(ticketHTML);
  w.document.close();

  const qrScript=w.document.createElement("script");
  qrScript.src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
  qrScript.onload=()=>{ new w.QRCode(w.document.getElementById("qrcode"), {text:"https://wa.me/543794576062",width:100,height:100}); };
  w.document.body.appendChild(qrScript);

  w.print();
  w.close();

  cart=[]; total=0;
  document.querySelector("#cartTable tbody").innerHTML="";
  document.getElementById("total").innerText="0";
};

// TIRAR Z (horizontal) - se mantiene igual
window.printDailyReport = async function(){
  const today=new Date();
  const snapshot=await getDocs(collection(db,"sales"));
  let reportHTML=`<div style="width:100%; font-family: Arial, sans-serif;"><h2>Informe Diario TIRAR Z</h2><table style="width:100%; border-collapse: collapse;"><tr><th>Producto</th><th>Código</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th>Fecha/Hora</th></tr>`;
  snapshot.forEach(docSnap=>{
    const s=docSnap.data();
    s.products.forEach(p=>{
      reportHTML+=`<tr><td>${p.name.toUpperCase()}</td><td>${p.code}</td><td>${p.price.toFixed(2)}</td><td>${p.quantity}</td><td>${(p.price*p.quantity).toFixed(2)}</td><td>${new Date(s.timestamp.seconds*1000).toLocaleString()}</td></tr>`;
    });
  });
  reportHTML+=`</table></div>`;
  const w=window.open("","_blank","width=900,height=700");
  w.document.write(reportHTML);
  w.document.close();
  w.print();
  w.close();
};
