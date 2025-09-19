let cart = [];
let total = 0;
let stock = [];
let salesToday = [];

function showSection(id){
  document.querySelectorAll(".section").forEach(s=>s.style.display="none");
  document.getElementById(id).style.display="block";
}

// ----- STOCK -----
function addStock(){
  const code = document.getElementById("barcodeInput").value.trim();
  const name = document.getElementById("nameInput").value.trim();
  const price = parseFloat(document.getElementById("priceInput").value);
  const qty = parseInt(document.getElementById("quantityInput").value);

  if(!code || !name || isNaN(price) || isNaN(qty)){
    return alert("Complete todos los campos");
  }

  const exist = stock.find(p=>p.code===code);
  if(exist){
    exist.name=name;
    exist.price=price;
    exist.qty=qty;
  } else {
    stock.push({code, name, price, qty});
  }

  document.getElementById("barcodeInput").value="";
  document.getElementById("nameInput").value="";
  document.getElementById("priceInput").value="";
  document.getElementById("quantityInput").value="";
  loadStockList();
  loadModifyProductList();
}

function loadStockList(){
  const tbody = document.querySelector("#stockTable tbody");
  tbody.innerHTML="";
  stock.forEach(p=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${p.name}</td><td>${p.code}</td><td>${p.price}</td><td>${p.qty}</td>`;
    tbody.appendChild(tr);
  });
}

// ----- VENTAS -----
function addProduct(){
  const code=document.getElementById("barcodeInputSale").value.trim();
  const qty=parseInt(document.getElementById("quantityInputSale").value);

  if(!code || isNaN(qty)) return alert("Ingrese código y cantidad");

  const product = stock.find(p=>p.code===code);
  if(!product) return alert("Producto no encontrado");

  const exist = cart.find(p=>p.code===code);
  if(exist){
    exist.qty += qty;
  } else {
    cart.push({code, name:product.name, price:product.price, qty});
  }

  document.getElementById("barcodeInputSale").value="";
  document.getElementById("quantityInputSale").value=1;
  updateCartTable();
}

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

function checkout(method){
  if(cart.length===0) return alert("Carrito vacío");
  printTicket(cart, method);
  cart.forEach(c=>{
    const product = stock.find(p=>p.code===c.code);
    if(product) product.qty -= c.qty;
  });
  cart=[];
  updateCartTable();
  loadStockList();
}

function printTicket(items, method){
  const w=window.open('','Print','width=600,height=600');
  let html="<h2>SUPERMERCADO X - TICKET</h2><hr>";
  items.forEach(p=> html+=`${p.name} [${p.qty}] $${p.price} -> $${(p.qty*p.price).toFixed(2)}<br>`);
  html+=`<hr>Total: $${items.reduce((a,b)=>a+b.price*b.qty,0).toFixed(2)}<br>`;
  html+=`Método: ${method}`;
  w.document.write(html);
  w.document.close();
  w.print();
}

// ----- MODIFICAR PRODUCTO -----
function loadModifyProductList(){
  const select=document.getElementById("modProductSelect");
  select.innerHTML='<option value="">-- Seleccione producto --</option>';
  stock.forEach((p,i)=>{
    const opt=document.createElement("option");
    opt.value=i;
    opt.textContent=p.name;
    select.appendChild(opt);
  });
}

function loadProductToModify(){
  const index=parseInt(document.getElementById("modProductSelect").value);
  if(isNaN(index)) return;
  const p=stock[index];
  document.getElementById("modNombre").value=p.name;
  document.getElementById("modPrecio").value=p.price;
  document.getElementById("modStock").value=p.qty;
}

function modifyProduct(){
  const master=document.getElementById("masterPassword").value;
  if(master!=="123456") return alert("Contraseña incorrecta");
  const index=parseInt(document.getElementById("modProductSelect").value);
  if(isNaN(index)) return alert("Seleccione producto");
  stock[index].name=document.getElementById("modNombre").value;
  stock[index].price=parseFloat(document.getElementById("modPrecio").value);
  stock[index].qty=parseInt(document.getElementById("modStock").value);
  loadStockList();
  loadModifyProductList();
  alert("Producto modificado correctamente");
}
