// Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_BUCKET",
  messagingSenderId: "TU_MESSAGING_ID",
  appId: "TU_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let cart = [];
let total = 0;
let salesToday = [];
let deletedSales = [];

// UI
function showSection(id){
  document.querySelectorAll(".section").forEach(s=>s.style.display="none");
  document.getElementById(id).style.display="block";
}
showSection("cargar");

// ---------------- STOCK ----------------
async function addStock(){
  const code=document.getElementById("barcodeInput").value.trim();
  const name=document.getElementById("nameInput").value.trim();
  const price=parseFloat(document.getElementById("priceInput").value);
  const qty=parseInt(document.getElementById("quantityInput").value);
  if(!code||!name||isNaN(price)||isNaN(qty)) return alert("Complete todos los campos");

  const snapshot = await db.collection("products").where("code","==",code).get();
  if(!snapshot.empty){
    snapshot.forEach(async docSnap=>{
      await db.collection("products").doc(docSnap.id).update({
        currentStock: qty,
        price,
        name:name.toLowerCase()
      });
    });
    alert("Producto actualizado");
  } else{
    await db.collection("products").add({
      code, name:name.toLowerCase(), price, currentStock:qty
    });
    alert("Producto agregado");
  }

  document.getElementById("barcodeInput").value="";
  document.getElementById("nameInput").value="";
  document.getElementById("priceInput").value="";
  document.getElementById("quantityInput").value="";
  loadStockList();
  loadModifyProductList();
}

async function loadStockList(){
  const tbody=document.querySelector("#stockTable tbody");
  tbody.innerHTML="";
  const snapshot=await db.collection("products").get();
  snapshot.forEach(docSnap=>{
    const d=docSnap.data();
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${d.name.toUpperCase()}</td><td>${d.code}</td><td>${d.price}</td><td>${d.currentStock}</td>`;
    tbody.appendChild(tr);
  });
}
loadStockList();

// ---------------- MODIFICAR ----------------
async function loadModifyProductList(){
  const select=document.getElementById("modProductSelect");
  select.innerHTML='<option value="">-- Seleccione producto --</option>';
  const snapshot=await db.collection("products").get();
  snapshot.forEach(d=>{
    const opt=document.createElement("option");
    opt.value=d.id;
    opt.textContent=d.data().name.toUpperCase();
    select.appendChild(opt);
  });
}
loadModifyProductList();

async function loadProductToModify(){
  const id=document.getElementById("modProductSelect").value;
  if(!id) return;
  const docSnap=await db.collection("products").doc(id).get();
  const data=docSnap.data();
  document.getElementById("modNombre").value=data.name;
  document.getElementById("modPrecio").value=data.price;
  document.getElementById("modStock").value=data.currentStock;
}

document.getElementById("btnModificar").addEventListener("click", async ()=>{
  const master=document.getElementById("masterPassword").value;
  if(master!=="123456789") return alert("Contraseña maestra incorrecta");
  const docId=document.getElementById("modProductSelect").value;
  if(!docId) return alert("Seleccione producto");
  const modName=document.getElementById("modNombre").value.trim();
  const modPrice=parseFloat(document.getElementById("modPrecio").value);
  const modStock=parseInt(document.getElementById("modStock").value);

  await db.collection("products").doc(docId).update({
    name:modName.toLowerCase(),
    price:modPrice,
    currentStock:modStock
  });
  alert("Producto modificado");
  loadStockList();
  loadModifyProductList();
});

// ---------------- VENDER ----------------
function addProduct(){
  const code=document.getElementById("barcodeInputSale").value.trim();
  if(!code) return alert("Ingrese código");

  const exists=cart.find(p=>p.code===code);
  if(exists){
    exists.qty++;
  } else{
    cart.push({code, qty:1, name:code, price:0});
  }
  updateCartTable();
  document.getElementById("barcodeInputSale").value="";
}

async function updateCartTable(){
  const tbody=document.querySelector("#cartTable tbody");
  tbody.innerHTML="";
  total=0;
  for(const c of cart){
    const snapshot=await db.collection("products").where("code","==",c.code).get();
    snapshot.forEach(d=>{
      const data=d.data();
      c.name=data.name.toUpperCase();
      c.price=data.price;
    });
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${c.name}</td><td>${c.code}</td><td>${c.price}</td>
    <td>${c.qty}</td>
    <td>${(c.qty*c.price).toFixed(2)}</td>
    <td class="cart-actions">
      <button onclick="changeQty('${c.code}',1)">+</button>
      <button onclick="changeQty('${c.code}',-1)">-</button>
    </td>`;
    tbody.appendChild(tr);
    total+=c.price*c.qty;
  }
  document.getElementById("total").textContent=total.toFixed(2);
}

function changeQty(code,delta){
  const item=cart.find(p=>p.code===code);
  if(!item) return;
  item.qty+=delta;
  if(item.qty<1) cart=cart.filter(p=>p.code!==code);
  updateCartTable();
}

// ---------------- CHECKOUT ----------------
async function checkout(){
  if(cart.length===0) return alert("Carrito vacío");
  const method = prompt("Método de pago (Efectivo/Tarjeta):","Efectivo");
  const now=new Date();
  for(const c of cart){
    const snapshot=await db.collection("products").where("code","==",c.code).get();
    snapshot.forEach(async d=>{
      await db.collection("products").doc(d.id).update({currentStock:d.data().currentStock-c.qty});
    });
    const id='V'+Date.now()+'-'+Math.floor(Math.random()*1000);
    await db.collection("sales").add({
      id, code:c.code, name:c.name, price:c.price, qty:c.qty, date:now, method
    });
    salesToday.push({id, code:c.code, name:c.name, price:c.price, qty:c.qty, date:now, method});
  }
  cart=[];
  updateCartTable();
  loadStockList();
  loadSalesTable();
  printTicket(salesToday);
}

function printTicket(items){
  const win=window.open('','Print','width=600,height=800');
  let html='<h2>SUPERMERCADO X - TICKET</h2><hr>';
  let totalTicket=0;
  items.forEach(p=>{
    html+=`<b>${p.name}</b> [${p.qty}] ($${p.price})<br>`;
    totalTicket+=p.price*p.qty;
  });
  html+=`<hr>Total: $${totalTicket.toFixed(2)}`;
  win.document.write(html);
  win.document.close();
  win.print();
}

// ---------------- CONTROL VENTAS ----------------
async function loadSalesTable(){
  const tbody=document.querySelector("#salesTable tbody");
  tbody.innerHTML="";
  const snapshot=await db.collection("sales").get();
  snapshot.forEach(docSnap=>{
    const s=docSnap.data();
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${s.id}</td><td>${new Date(s.date.seconds*1000).toLocaleString()}</td>
    <td>${s.name} [${s.qty}] ($${s.price})</td>
    <td>${(s.qty*s.price).toFixed(2)}</td>
    <td>${s.method}</td>
    <td><button onclick="deleteSale('${docSnap.id}')">Eliminar</button></td>`;
    tbody.appendChild(tr);
  });
}

// ---------------- ELIMINAR VENTA ----------------
async function deleteSale(id){
  const reason=prompt("Motivo de eliminación:");
  if(!reason) return alert("Debe ingresar motivo");
  const master=prompt("Contraseña maestra:");
  if(master!=="123456789") return alert("Contraseña incorrecta");

  const docSnap=await db.collection("sales").doc(id).get();
  const s=docSnap.data();
  deletedSales.push({...s, reason});
  const prodSnap=await db.collection("products").where("code","==",s.code).get();
  prodSnap.forEach(async p=>await db.collection("products").doc(p.id).update({currentStock:p.data().currentStock+s.qty}));
  await db.collection("sales").doc(id).delete();
  loadStockList();
  loadSalesTable();
}

// ---------------- TIRAR Z ----------------
function printDailyReport(){
  const master=prompt("Contraseña maestra para TIRAR Z:");
  if(master!=="123456789") return alert("Contraseña incorrecta");
  const win=window.open('','Print','width=600,height=800');
  let html='<h2>SUPERMERCADO X - TIRAR Z</h2><hr>';
  salesToday.forEach(p=>html+=`${p.id} - ${p.name} [${p.qty}] ($${p.price}) - ${p.method}<br>`);
  html+='<h3>Ventas eliminadas</h3>';
  deletedSales.forEach(p=>html+=`${p.id} - ${p.name} [${p.qty}] ($${p.price}) - Motivo: ${p.reason}<br>`);
  win.document.write(html);
  win.document.close();
  win.print();
}
