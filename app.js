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
  if(!code||!name||isNaN(price)||isNaN(qty)) return alert("Complete todos los campos");

  const q=query(collection(db,"products"), where("code","==",code));
  const snapshot=await getDocs(q);
  if(!snapshot.empty){
    snapshot.forEach(async d=>{
      await updateDoc(doc(db,"products",d.id),{
        currentStock: qty,
        price,
        name: name.toLowerCase()
      });
    });
    alert("Producto actualizado");
  }else{
    await addDoc(collection(db,"products"),{
      code,name:name.toLowerCase(),price,currentStock:qty
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

window.loadStockList=async function(){
  const tbody=document.querySelector("#stockTable tbody");
  tbody.innerHTML="";
  const snapshot=await getDocs(collection(db,"products"));
  snapshot.forEach(docSnap=>{
    const d=docSnap.data();
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${d.name.toUpperCase()}</td><td>${d.code}</td><td>${d.price}</td><td>${d.currentStock}</td>`;
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

window.loadProductToModify=async function(){
  const id=document.getElementById("modProductSelect").value;
  if(!id) return;
  const d=await getDocs(query(collection(db,"products"), where("__name__","==",id)));
  d.forEach(docSnap=>{
    const data=docSnap.data();
    document.getElementById("modNombre").value=data.name;
    document.getElementById("modPrecio").value=data.price;
    document.getElementById("modStock").value=data.currentStock;
  });
};

document.getElementById("btnModificar").addEventListener("click", async ()=>{
  const id=document.getElementById("modProductSelect").value;
  const password=document.getElementById("masterPassword").value;
  if(password!=="123456789") return alert("Contraseña incorrecta");
  const modName=document.getElementById("modNombre").value.trim();
  const modPrice=parseFloat(document.getElementById("modPrecio").value);
  const modStock=parseInt(document.getElementById("modStock").value);
  if(!id||!modName||isNaN(modPrice)||isNaN(modStock)) return alert("Complete los campos");
  await updateDoc(doc(db,"products",id),{
    name:modName.toLowerCase(),
    price:modPrice,
    currentStock:modStock
  });
  alert("Producto modificado");
  loadStockList();
  loadModifyProductList();
});

// ------------------ VENDER ------------------
window.addProduct=function(){
  const code=document.getElementById("barcodeInputSale").value.trim();
  const qty=parseInt(document.getElementById("quantityInputSale").value);
  if(!code||isNaN(qty)) return alert("Ingrese código y cantidad");

  const exists=cart.find(p=>p.code===code);
  if(exists){
    exists.qty+=qty; // sumamos cantidad
  }else{
    cart.push({code,qty,name:code,price:0});
  }
  updateCartTable();
  document.getElementById("barcodeInputSale").value="";
  document.getElementById("quantityInputSale").value=1;
};

window.updateCartTable=function(){
  const tbody=document.querySelector("#cartTable tbody");
  tbody.innerHTML="";
  total=0;
  cart.forEach(async c=>{
    const snapshot=await getDocs(query(collection(db,"products"), where("code","==",c.code)));
    snapshot.forEach(d=>{
      const data=d.data();
      c.name=data.name.toUpperCase();
      c.price=data.price;
      const tr=document.createElement("tr");
      tr.innerHTML=`<td>${c.name}</td><td>${c.code}</td><td>${c.price}</td><td>${c.qty}</td><td>${(c.price*c.qty).toFixed(2)}</td>`;
      tbody.appendChild(tr);
      total+=c.price*c.qty;
      document.getElementById("total").textContent=total.toFixed(2);
    });
  });
};

// ------------------ PAGO ------------------
window.choosePaymentMethod=function(){
  if(cart.length===0) return alert("Carrito vacío");
  document.getElementById("paymentMethodDiv").style.display="block";
};

window.checkout=async function(method){
  const now=new Date();
  for(let c of cart){
    const saleID = Math.floor(Math.random()*9999)+1;
    const snapshot=await getDocs(query(collection(db,"products"), where("code","==",c.code)));
    snapshot.forEach(async d=>{
      const current=d.data().currentStock;
      await updateDoc(doc(db,"products",d.id),{currentStock: current - c.qty});
    });
    await addDoc(collection(db,"sales"),{
      saleID,
      code:c.code,
      name:c.name,
      price:c.price,
      qty:c.qty,
      date:now,
      method
    });
    salesToday.push({saleID, code:c.code,name:c.name,price:c.price,qty:c.qty,date:now,method});
  }
  cart=[];
  updateCartTable();
  loadStockList();
  loadSalesTable();
  document.getElementById("paymentMethodDiv").style.display="none";
  alert("Venta registrada y ticket generado");
};

// ------------------ CONTROL DE VENTAS ------------------
window.loadSalesTable=async function(){
  const tbody=document.querySelector("#salesTable tbody");
  tbody.innerHTML="";
  const snapshot=await getDocs(collection(db,"sales"));
  snapshot.forEach(docSnap=>{
    const s=docSnap.data();
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${s.saleID}</td><td>${new Date(s.date.seconds*1000).toLocaleString()}</td><td>${s.name} [${s.qty}] ($${s.price})</td><td>${(s.qty*s.price).toFixed(2)}</td><td>${s.method}</td>
    <td><button onclick="deleteSale('${docSnap.id}')">ELIMINAR VENTA</button></td>`;
    tbody.appendChild(tr);
  });
};

window.deleteSale=async function(id){
  const reason=prompt("MOTIVO DE ELIMINACION:");
  if(!reason) return alert("Debe ingresar un motivo");
  const master=prompt("Ingrese contraseña maestra:");
  if(master!=="123456789") return alert("Contraseña incorrecta");

  const snapshot=await getDocs(query(collection(db,"sales"), where("__name__","==",id)));
  snapshot.forEach(async d=>{
    const saleData=d.data();
    deletedSales.push({...saleData, reason});
    // devolver stock
    const prodSnap=await getDocs(query(collection(db,"products"), where("code","==",saleData.code)));
    prodSnap.forEach(async prod=>{
      const curr=prod.data().currentStock;
      await updateDoc(doc(db,"products",prod.id), {currentStock: curr + saleData.qty});
    });
    await deleteDoc(doc(db,"sales",id));
  });
  loadStockList();
  loadSalesTable();
};

// ------------------ TIRAR Z ------------------
window.printDailyReport=function(){
  const master=prompt("Ingrese contraseña maestra para TIRAR Z:");
  if(master!=="123456789") return alert("Contraseña incorrecta");
  const printWindow=window.open('','Print','width=800,height=600');
  let efectivoTotal=0, tarjetaTotal=0;
  salesToday.filter(s=>s.method==="Efectivo").forEach(p=>{ efectivoTotal+=p.price*p.qty; });
  salesToday.filter(s=>s.method==="Tarjeta").forEach(p=>{ tarjetaTotal+=p.price*p.qty; });
  let efectivoElim=0, tarjetaElim=0;
  deletedSales.filter(s=>s.method==="Efectivo").forEach(p=>{ efectivoElim+=p.price*p.qty; });
  deletedSales.filter(s=>s.method==="Tarjeta").forEach(p=>{ tarjetaElim+=p.price*p.qty; });

  let html='<h2>SUPERMERCADO X - TIRAR Z</h2><hr>';
  html+='<h3>Ventas en efectivo</h3>';
  salesToday.filter(s=>s.method==="Efectivo").forEach(p=>{ html+=`${p.name} [${p.qty}] ($${p.price.toFixed(2)})<br>`; });
  html+=`Total efectivo: $${(efectivoTotal-efectivoElim).toFixed(2)}<hr>`;
  html+='<h3>Ventas con tarjeta</h3>';
  salesToday.filter(s=>s.method==="Tarjeta").forEach(p=>{ html+=`${p.name} [${p.qty}] ($${p.price.toFixed(2)})<br>`; });
  html+=`Total tarjeta: $${(tarjetaTotal-tarjetaElim).toFixed(2)}<hr>`;
  html+='<h3>Ventas Eliminadas</h3>';
  deletedSales.forEach(p=>{ html+=`${p.name} [${p.qty}] ($${p.price.toFixed(2)}) - Motivo: ${p.reason}<br>`; });

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
};

// ------------------ INICIO ------------------
showSection("inicio");
loadSalesTable();
