import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, query, where, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_BUCKET",
  messagingSenderId: "TU_MSG",
  appId: "TU_APPID"
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
  if(document.getElementById(id)) document.getElementById(id).style.display="block";
};
showSection('inicio');

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
        name: name.toLowerCase(),
        price,
        currentStock: qty
      });
    });
    alert("Producto actualizado");
  } else{
    await addDoc(collection(db,"products"),{
      code,
      name:name.toLowerCase(),
      price,
      currentStock:qty
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

window.loadProductToModify= async function(){
  const id=document.getElementById("modProductSelect").value;
  if(!id) return;
  const docRef = doc(db,"products",id);
  const snapshot = await getDocs(query(collection(db,"products"), where("__name__","==",id)));
  snapshot.forEach(d=>{
    const data=d.data();
    document.getElementById("modNombre").value=data.name;
    document.getElementById("modPrecio").value=data.price;
    document.getElementById("modStock").value=data.currentStock;
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

  await updateDoc(doc(db,"products",docId),{
    name:modName.toLowerCase(),
    price:modPrice,
    currentStock:modStock
  });
  alert("Producto modificado");
  loadStockList();
  loadModifyProductList();
});

// ------------------ VENDER ------------------
window.addProduct=async function(){
  const code=document.getElementById("barcodeInputSale").value.trim();
  if(!code) return alert("Ingrese código");

  const snapshot = await getDocs(query(collection(db,"products"), where("code","==",code)));
  if(snapshot.empty) return alert("Producto no encontrado");

  snapshot.forEach(d=>{
    const data=d.data();
    const exists=cart.find(p=>p.code===code);
    if(exists) exists.qty++;
    else cart.push({code,name:data.name.toUpperCase(),price:data.price,qty:1});
  });
  updateCartTable();
  document.getElementById("barcodeInputSale").value="";
};

window.updateCartTable=function(){
  const tbody=document.querySelector("#cartTable tbody");
  tbody.innerHTML="";
  total=0;
  cart.forEach((c,i)=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${c.name}</td><td>${c.code}</td><td>${c.price}</td><td>${c.qty}</td>
    <td>${(c.price*c.qty).toFixed(2)}</td>
    <td class="cart-actions">
      <button onclick="changeQty(${i},-1)">-</button>
      <button onclick="changeQty(${i},1)">+</button>
      <button onclick="removeItem(${i})">X</button>
    </td>`;
    tbody.appendChild(tr);
    total+=c.price*c.qty;
  });
  document.getElementById("total").textContent=total.toFixed(2);
};

window.changeQty=(index,delta)=>{
  cart[index].qty += delta;
  if(cart[index].qty<=0) cart.splice(index,1);
  updateCartTable();
};

window.removeItem=(index)=>{
  cart.splice(index,1);
  updateCartTable();
};

// ------------------ PAGO ------------------
window.choosePaymentMethod=function(){
  if(cart.length===0) return alert("Carrito vacío");
  document.getElementById("paymentMethodDiv").style.display="block";
};

window.checkout=async function(method){
  const now=new Date();
  for(let c of cart){
    const snapshot=await getDocs(query(collection(db,"products"), where("code","==",c.code)));
    snapshot.forEach(async d=>{
      const curr=d.data().currentStock;
      await updateDoc(doc(db,"products",d.id),{currentStock: curr - c.qty});
    });
    await addDoc(collection(db,"sales"),{
      code:c.code,
      name:c.name,
      price:c.price,
      qty:c.qty,
      date:now,
      method
    });
    salesToday.push({...c,date:now,method});
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
    tr.innerHTML=`<td>${docSnap.id}</td><td>${new Date(s.date.seconds*1000).toLocaleString()}</td><td>${s.name} [${s.qty}] ($${s.price})</td><td>${(s.qty*s.price).toFixed(2)}</td><td>${s.method}</td>
    <td><button onclick="deleteSale('${docSnap.id}')">ELIMINAR</button></td>`;
    tbody.appendChild(tr);
  });
};
loadSalesTable();

window.deleteSale=async function(id){
  const reason=prompt("MOTIVO DE ELIMINACION:");
  if(!reason) return alert("Debe ingresar un motivo");
  const master=prompt("Ingrese contraseña maestra:");
  if(master!=="123456789") return alert("Contraseña incorrecta");

  const snapshot=await getDocs(query(collection(db,"sales"), where("__name__","==",id)));
  snapshot.forEach(async d=>{
    const sale=d.data();
    deletedSales.push({...sale, reason});
    const prodSnap=await getDocs(query(collection(db,"products"), where("code","==",sale.code)));
    prodSnap.forEach(async p=>{
      const curr=p.data().currentStock;
      await updateDoc(doc(db,"products",p.id),{currentStock:curr+sale.qty});
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
