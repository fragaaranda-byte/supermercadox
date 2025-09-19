import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, query, where, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB8fQJsN0tqpuz48Om30m6u6jhEcSfKYEw",
  authDomain: "supermercadox-107f6.firebaseapp.com",
  projectId: "supermercadox-107f6",
  storageBucket: "supermercadox-107f6.appspot.com",
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
  if(document.getElementById(id)) document.getElementById(id).style.display="block";
};

// ------------------ STOCK ------------------
window.addStock = async function(){
  const code = document.getElementById("barcodeInput").value.trim();
  const name = document.getElementById("nameInput").value.trim();
  const priceInt = parseInt(document.getElementById("priceInput").value);
  const cents = parseInt(document.getElementById("centsInput").value) || 0;
  const qty = parseInt(document.getElementById("quantityInput").value);

  if(!code || !name || isNaN(priceInt) || isNaN(qty)) return alert("Complete todos los campos");

  const price = priceInt + cents/100;

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
  document.getElementById("centsInput").value="";
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
    tr.innerHTML=`<td>${d.name.toUpperCase()}</td><td>${d.code}</td><td>${d.price.toFixed(2)}</td><td>${d.currentStock}</td>`;
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
  const docRef = doc(db, "products", id);
  const docSnap = await getDocs(query(collection(db,"products"), where("__name__","==",id)));
  docSnap.forEach(d=>{
    const data=d.data();
    document.getElementById("modNombre").value=data.name;
    document.getElementById("modPrecio").value=Math.floor(data.price);
    document.getElementById("modCentavos").value=Math.round((data.price-Math.floor(data.price))*100);
    document.getElementById("modStock").value=data.currentStock;
  });
};

document.getElementById("btnModificar").addEventListener("click", async ()=>{
  const master=document.getElementById("masterPassword").value;
  if(master!=="123456789") return alert("Contraseña maestra incorrecta");
  const docId=document.getElementById("modProductSelect").value;
  if(!docId) return alert("Seleccione producto");

  const modName=document.getElementById("modNombre").value.trim();
  const modPrice=parseInt(document.getElementById("modPrecio").value);
  const modCents=parseInt(document.getElementById("modCentavos").value) || 0;
  const modStock=parseInt(document.getElementById("modStock").value);

  await updateDoc(doc(db,"products",docId),{
    name:modName.toLowerCase(),
    price:modPrice + modCents/100,
    currentStock:modStock
  });
  alert("Producto modificado");
  loadStockList();
  loadModifyProductList();
});

// ------------------ VENDER ------------------
window.addProduct=async function(){
  const code=document.getElementById("barcodeInputSale").value.trim();
  const qty=parseInt(document.getElementById("quantityInputSale").value);
  if(!code||isNaN(qty)) return alert("Ingrese código y cantidad");

  const snapshot=await getDocs(query(collection(db,"products"), where("code","==",code)));
  if(snapshot.empty) return alert("Producto no encontrado");

  snapshot.forEach(d=>{
    const data=d.data();
    const exists=cart.find(p=>p.code===code);
    if(exists){
      exists.qty += qty;
      if(exists.qty > data.currentStock) exists.qty = data.currentStock;
    }else{
      cart.push({code,dataName:data.name.toUpperCase(),name:data.name.toUpperCase(),price:data.price,qty: qty > data.currentStock ? data.currentStock : qty});
    }
  });
  updateCartTable();
  document.getElementById("barcodeInputSale").value="";
  document.getElementById("quantityInputSale").value=1;
};

window.updateCartTable=function(){
  const tbody=document.querySelector("#cartTable tbody");
  tbody.innerHTML="";
  total=0;
  cart.forEach((c,i)=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`
      <td>${c.name}</td>
      <td>${c.code}</td>
      <td>${c.price.toFixed(2)}</td>
      <td>
        <button class="action-btn" onclick="changeQty(${i},-1)">-</button>
        ${c.qty}
        <button class="action-btn" onclick="changeQty(${i},1)">+</button>
      </td>
      <td>${(c.price*c.qty).toFixed(2)}</td>
      <td><button class="action-btn" onclick="removeFromCart(${i})">X</button></td>
    `;
    tbody.appendChild(tr);
    total += c.price*c.qty;
  });
  document.getElementById("total").textContent=total.toFixed(2);
};

window.changeQty=(index,delta)=>{
  const item=cart[index];
  if(!item) return;
  item.qty += delta;
  if(item.qty<1) item.qty=1;
  updateCartTable();
};

window.removeFromCart=(index)=>{
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
      const current=d.data().currentStock;
      await updateDoc(doc(db,"products",d.id),{currentStock: current - c.qty});
    });
    await addDoc(collection(db,"sales"),{
      code:c.code,
      name:c.name,
      price:c.price,
      qty:c.qty,
      date:now,
      method
    });
    salesToday.push({code:c.code,name:c.name,price:c.price,qty:c.qty,date:now,method});
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
    tr.innerHTML=`
      <td>${docSnap.id}</td>
      <td>${new Date(s.date.seconds*1000).toLocaleString()}</td>
      <td>${s.name} [${s.qty}] ($${s.price.toFixed(2)})</td>
      <td>${(s.qty*s.price).toFixed(2)}</td>
      <td>${s.method}</td>
      <td><button onclick="deleteSale('${docSnap.id}')">ELIMINAR VENTA</button></td>
    `;
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
  let report="REPORTE DIARIO\n\n";
  let totalDay=0;
  salesToday.forEach(s=>{
    report+=`${s.name} x${s.qty} $${s.price.toFixed(2)}\n`;
    totalDay += s.price*s.qty;
  });
  report += `\nTOTAL DEL DIA: $${totalDay.toFixed(2)}`;
  console.log(report);
  alert("TIRAR Z generado en consola");
};
