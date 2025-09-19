// Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB8fQJsN0tqpuz48Om30m6u6jhEcSfKYEw",
  authDomain: "supermercadox-107f6.firebaseapp.com",
  projectId: "supermercadox-107f6",
  storageBucket: "supermercadox-107f6.firebasestorage.app",
  messagingSenderId: "504958637825",
  appId: "1:504958637825:web:6ae5e2cde43206b3052d00"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

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
  const price = parseInt(document.getElementById("priceInput").value) || 0;
  const cents = parseInt(document.getElementById("centsInput").value) || 0;
  const qty = parseInt(document.getElementById("quantityInput").value);

  if(!code || !name || isNaN(qty)) return alert("Complete todos los campos");

  const totalPrice = price + cents/100;

  const snapshot = await db.collection("products").where("code","==",code).get();
  if(!snapshot.empty){
    snapshot.forEach(async d=>{
      await db.collection("products").doc(d.id).update({
        name: name.toLowerCase(),
        price: totalPrice,
        currentStock: qty
      });
    });
    alert("Producto actualizado");
  }else{
    await db.collection("products").add({
      code,
      name: name.toLowerCase(),
      price: totalPrice,
      currentStock: qty
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

window.loadStockList = async function(){
  const tbody = document.querySelector("#stockTable tbody");
  tbody.innerHTML="";
  const snapshot = await db.collection("products").get();
  snapshot.forEach(d=>{
    const data = d.data();
    const tr = document.createElement("tr");
    tr.innerHTML=`<td>${data.name.toUpperCase()}</td><td>${data.code}</td><td>${data.price.toFixed(2)}</td><td>${data.currentStock}</td>`;
    tbody.appendChild(tr);
  });
};
loadStockList();

// ------------------ MODIFICAR ------------------
window.loadModifyProductList = async function(){
  const select = document.getElementById("modProductSelect");
  select.innerHTML='<option value="">-- Seleccione producto --</option>';
  const snapshot = await db.collection("products").get();
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
  const docSnap = await db.collection("products").doc(id).get();
  const data = docSnap.data();
  document.getElementById("modNombre").value = data.name;
  const price = Math.floor(data.price);
  const cents = Math.round((data.price - price)*100);
  document.getElementById("modPrecio").value = price;
  document.getElementById("modCentavos").value = cents;
  document.getElementById("modStock").value = data.currentStock;
};

document.getElementById("btnModificar").addEventListener("click", async ()=>{
  const master = document.getElementById("masterPassword").value;
  if(master!=="123456789") return alert("Contraseña maestra incorrecta");

  const id = document.getElementById("modProductSelect").value;
  if(!id) return alert("Seleccione producto");

  const name = document.getElementById("modNombre").value.trim();
  const price = parseInt(document.getElementById("modPrecio").value)||0;
  const cents = parseInt(document.getElementById("modCentavos").value)||0;
  const totalPrice = price + cents/100;
  const stock = parseInt(document.getElementById("modStock").value)||0;

  await db.collection("products").doc(id).update({
    name: name.toLowerCase(),
    price: totalPrice,
    currentStock: stock
  });
  alert("Producto modificado");
  loadStockList();
  loadModifyProductList();
});

// ------------------ VENDER ------------------
window.addProduct = async function(){
  const code = document.getElementById("barcodeInputSale").value.trim();
  let qty = parseInt(document.getElementById("quantityInputSale").value) || 1;
  if(!code) return alert("Ingrese código");

  const snapshot = await db.collection("products").where("code","==",code).get();
  if(snapshot.empty) return alert("Producto no encontrado");

  snapshot.forEach(d=>{
    const data = d.data();
    const exists = cart.find(p=>p.code===code);
    if(exists){
      exists.qty += qty;
    }else{
      cart.push({code,dataName:data.name.toUpperCase(),name:data.name.toUpperCase(),price:data.price,qty});
    }
  });
  updateCartTable();
  document.getElementById("barcodeInputSale").value="";
  document.getElementById("quantityInputSale").value=1;
};

window.updateCartTable = function(){
  const tbody = document.querySelector("#cartTable tbody");
  tbody.innerHTML="";
  total=0;
  cart.forEach(c=>{
    const tr = document.createElement("tr");
    tr.innerHTML=`<td>${c.name}</td><td>${c.code}</td><td>${c.price.toFixed(2)}</td>
      <td>
        <button onclick="changeQty('${c.code}',-1)">-</button>
        ${c.qty}
        <button onclick="changeQty('${c.code}',1)">+</button>
      </td>
      <td>${(c.price*c.qty).toFixed(2)}</td>
      <td><button onclick="removeFromCart('${c.code}')">X</button></td>`;
    tbody.appendChild(tr);
    total += c.price*c.qty;
  });
  document.getElementById("total").textContent = total.toFixed(2);
};

window.changeQty = function(code,delta){
  const item = cart.find(p=>p.code===code);
  if(!item) return;
  item.qty += delta;
  if(item.qty<1) item.qty=1;
  updateCartTable();
};

window.removeFromCart = function(code){
  cart = cart.filter(p=>p.code!==code);
  updateCartTable();
};

// ------------------ PAGO ------------------
window.choosePaymentMethod = function(){
  if(cart.length===0) return alert("Carrito vacío");
  document.getElementById("paymentMethodDiv").style.display="block";
};

window.checkout = async function(method){
  const now = new Date();
  for(let c of cart){
    const snapshot = await db.collection("products").where("code","==",c.code).get();
    snapshot.forEach(async d=>{
      const curr = d.data().currentStock;
      await db.collection("products").doc(d.id).update({currentStock: curr - c.qty});
    });
    await db.collection("sales").add({
      id: Date.now(),
      code:c.code,
      name:c.name,
      price:c.price,
      qty:c.qty,
      date:now,
      method
    });
    salesToday.push({id:Date.now(),code:c.code,name:c.name,price:c.price,qty:c.qty,date:now,method});
  }
  cart=[];
  updateCartTable();
  loadStockList();
  loadSalesTable();
  document.getElementById("paymentMethodDiv").style.display="none";
  alert("Venta registrada y ticket generado");
};

// ------------------ CONTROL DE VENTAS ------------------
window.loadSalesTable = async function(){
  const tbody = document.querySelector("#salesTable tbody");
  tbody.innerHTML="";
  const snapshot = await db.collection("sales").get();
  snapshot.forEach(d=>{
    const s = d.data();
    const tr = document.createElement("tr");
    tr.innerHTML=`<td>${s.id || ''}</td>
      <td>${new Date(s.date.seconds*1000).toLocaleString()}</td>
      <td>${s.name} [${s.qty}] ($${s.price.toFixed(2)})</td>
      <td>${(s.qty*s.price).toFixed(2)}</td>
      <td>${s.method}</td>
      <td><button onclick="deleteSale('${d.id}')">ELIMINAR VENTA</button></td>`;
    tbody.appendChild(tr);
  });
};

window.deleteSale = async function(id){
  const reason = prompt("MOTIVO DE ELIMINACION:");
  if(!reason) return alert("Debe ingresar un motivo");
  const master = prompt("Ingrese contraseña maestra:");
  if(master!=="123456789") return alert("Contraseña incorrecta");

  const docSnap = await db.collection("sales").doc(id).get();
  const saleData = docSnap.data();
  deletedSales.push({...saleData, reason});

  const prodSnap = await db.collection("products").where("code","==",saleData.code).get();
  prodSnap.forEach(async p=>{
    const curr = p.data().currentStock;
    await db.collection("products").doc(p.id).update({currentStock: curr + saleData.qty});
  });

  await db.collection("sales").doc(id).delete();
  loadStockList();
  loadSalesTable();
};

// ------------------ TIRAR Z ------------------
window.printDailyReport = function(){
  const master = prompt("Ingrese contraseña maestra para TIRAR Z:");
  if(master!=="123456789") return alert("Contraseña incorrecta");
  const w = window.open('','Print','width=800,height=600');
  let html = `<h2>SUPERMERCADO X - TIRAR Z</h2><hr>`;
  let efectivoTotal=0, tarjetaTotal=0;
  salesToday.filter(s=>s.method==="Efectivo").forEach(p=>{ html+=`${p.name} [${p.qty}] ($${p.price.toFixed(2)})<br>`; efectivoTotal+=p.price*p.qty; });
  html+=`Total efectivo: $${efectivoTotal.toFixed(2)}<hr>`;
  salesToday.filter(s=>s.method==="Tarjeta").forEach(p=>{ html+=`${p.name} [${p.qty}] ($${p.price.toFixed(2)})<br>`; tarjetaTotal+=p.price*p.qty; });
  html+=`Total tarjeta: $${tarjetaTotal.toFixed(2)}<hr>`;
  html+=`Total del día: $${(efectivoTotal+tarjetaTotal).toFixed(2)}`;
  w.document.write(html);
  w.document.close();
  w.print();
  salesToday=[];
  alert("TIRAR Z completado");
};

window.loadSalesTable();
