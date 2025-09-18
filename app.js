// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

// Variables globales
let carrito = [];
let metodoPagoSeleccionado = "";
const PASSWORD_MAESTRA = "123456789";

// Mostrar sección
function mostrarSeccion(id) {
  document.querySelectorAll(".seccion").forEach(sec => sec.style.display = "none");
  document.getElementById(id).style.display = "block";
  if(id === "modificar") cargarProductosModificar();
  if(id === "controlStock") actualizarStockLista();
  if(id === "tirarZ") actualizarTirarZ();
  if(id === "controlVentas") cargarVentasHoy();
}

// Cargar stock
async function cargarStock() {
  const codigo = document.getElementById("productoCodigo").value;
  const nombre = document.getElementById("productoNombre").value.toUpperCase();
  const cantidad = parseFloat(document.getElementById("productoCantidad").value);
  const precio = parseFloat(document.getElementById("productoPrecio").value);
  if(!codigo || !nombre || isNaN(cantidad) || isNaN(precio)) { alert("Complete todos los campos"); return; }

  const productosRef = collection(db, "productos");
  const productosSnap = await getDocs(productosRef);
  let encontrado = false;
  productosSnap.forEach(p => {
    if(p.data().codigo === codigo){
      updateDoc(doc(db,"productos",p.id),{ cantidad: p.data().cantidad + cantidad, precio: precio });
      encontrado = true;
    }
  });
  if(!encontrado){
    await addDoc(productosRef,{ codigo, nombre, cantidad, precio });
  }
  alert("Producto cargado correctamente");
  document.getElementById("productoCodigo").value="";
  document.getElementById("productoNombre").value="";
  document.getElementById("productoCantidad").value="";
  document.getElementById("productoPrecio").value="";
}

// Vender
async function agregarAlCarrito() {
  const codigo = document.getElementById("venderCodigo").value;
  let cantidad = parseFloat(document.getElementById("venderCantidad").value);
  if(!codigo || isNaN(cantidad) || cantidad <=0) { alert("Ingrese código y cantidad válida"); return; }

  // Buscar producto en Firestore
  const productosRef = collection(db,"productos");
  const productosSnap = await getDocs(productosRef);
  let producto = null;
  productosSnap.forEach(p => {
    if(p.data().codigo === codigo || p.data().nombre.toUpperCase() === codigo.toUpperCase()){
      producto = {id:p.id, ...p.data()};
    }
  });
  if(!producto){ alert("Producto no encontrado"); return; }
  if(cantidad > producto.cantidad){ alert("No hay suficiente stock"); return; }

  // Agregar o sumar en carrito
  let index = carrito.findIndex(p=>p.codigo===producto.codigo);
  if(index>=0){
    carrito[index].cantidad += cantidad;
  } else {
    carrito.push({codigo:producto.codigo, nombre:producto.nombre, cantidad, precio:producto.precio});
  }
  renderCarrito();
  document.getElementById("venderCodigo").value="";
  document.getElementById("venderCantidad").value="";
}

// Render carrito
function renderCarrito(){
  const lista = document.getElementById("ventaLista");
  lista.innerHTML="";
  carrito.forEach((p,i)=>{
    const pEl = document.createElement("p");
    pEl.innerHTML = `${p.nombre} [${p.cantidad}] (${p.precio}) 
      <button onclick="sumar(${i})">+</button>
      <button onclick="restar(${i})">-</button>`;
    lista.appendChild(pEl);
  });
  document.getElementById("metodoPagoDiv").style.display = carrito.length>0 ? "block":"none";
}

function sumar(i){
  carrito[i].cantidad +=1;
  renderCarrito();
}
function restar(i){
  carrito[i].cantidad = Math.max(1,carrito[i].cantidad-1);
  renderCarrito();
}

// Finalizar venta
async function finalizarVenta(metodo){
  metodoPagoSeleccionado = metodo;
  await cobrarTicket();
}

// Cobrar ticket
async function cobrarTicket(){
  if(carrito.length===0){ alert("Carrito vacío"); return; }
  const total = carrito.reduce((sum,p)=>sum + p.cantidad*p.precio,0);

  // Registrar venta en Firestore
  const ventasRef = collection(db,"ventas");
  const idVenta = Math.floor(Math.random()*9999)+1;
  await addDoc(ventasRef,{
    productos: carrito,
    total,
    metodoPago: metodoPagoSeleccionado,
    fecha: new Date(),
    idVenta
  });

  // Actualizar stock
  for(const p of carrito){
    const productosRef = collection(db,"productos");
    const productosSnap = await getDocs(productosRef);
    productosSnap.forEach(prod=>{
      if(prod.data().codigo===p.codigo){
        updateDoc(doc(db,"productos",prod.id),{ cantidad: prod.data().cantidad - p.cantidad });
      }
    });
  }

  // Mostrar ticket para imprimir
  const ticketWindow = window.open('','Ticket','width=300,height=600');
  ticketWindow.document.write(`<div class="ticketWindow"><h2>SUPERMERCADO X</h2><hr>`);
  carrito.forEach(p=>{
    ticketWindow.document.write(`<p>${p.nombre} [${p.cantidad}] (${p.precio})</p>`);
  });
  ticketWindow.document.write(`<hr><p>Total: $${total.toFixed(2)}</p>`);
  ticketWindow.document.write(`<p>Metodo de pago: ${metodoPagoSeleccionado}</p></div>`);
  ticketWindow.document.close();
  ticketWindow.print();

  carrito=[];
  renderCarrito();
}

// Control stock
async function actualizarStockLista(){
  const lista = document.getElementById("stockLista");
  lista.innerHTML="";
  const productosRef = collection(db,"productos");
  const productosSnap = await getDocs(productosRef);
  productosSnap.forEach(p=>{
    lista.innerHTML += `<p>${p.data().nombre} [${p.data().cantidad}] (${p.data().precio})</p>`;
  });
}

// Modificar productos
async function cargarProductosModificar(){
  const select = document.getElementById("productoModificarSelect");
  select.innerHTML="";
  const productosRef = collection(db,"productos");
  const productosSnap = await getDocs(productosRef);
  productosSnap.forEach(p=>{
    select.innerHTML += `<option value="${p.id}">${p.data().nombre}</option>`;
  });
}

async function modificarProducto(){
  const password = document.getElementById("passwordMaestra").value;
  if(password!==PASSWORD_MAESTRA){ alert("Contraseña incorrecta"); return; }
  const id = document.getElementById("productoModificarSelect").value;
  const cantidad = parseFloat(document.getElementById("productoModificarCantidad").value);
  const precio = parseFloat(document.getElementById("productoModificarPrecio").value);
  if(isNaN(cantidad) || isNaN(precio)){ alert("Valores inválidos"); return; }
  await updateDoc(doc(db,"productos",id),{ cantidad, precio });
  alert("Producto modificado");
  document.getElementById("productoModificarCantidad").value="";
  document.getElementById("productoModificarPrecio").value="";
}

// Tirar Z
async function actualizarTirarZ(){
  const listaDiv = document.getElementById("tirarZLista");
  const ventasElimDiv = document.getElementById("ventasEliminadasLista");
  listaDiv.innerHTML="";
  ventasElimDiv.innerHTML="";
  const ventasRef = collection(db,"ventas");
  const ventasSnap = await getDocs(ventasRef);
  let totalEfectivo = 0;
  let totalTarjeta = 0;

  ventasSnap.forEach(v=>{
    const data = v.data();
    if(!data.eliminada){
      data.metodoPago==="Efectivo"? totalEfectivo+=data.total : totalTarjeta+=data.total;
      listaDiv.innerHTML += `<p>ID: ${data.idVenta} - ${data.productos.map(p=>`${p.nombre}[${p.cantidad}](${p.precio})`).join(', ')} - $${data.total.toFixed(2)} - ${data.metodoPago}</p><hr>`;
    } else {
      ventasElimDiv.innerHTML += `<p>ID: ${data.idVenta} - ${data.productos.map(p=>`${p.nombre}[${p.cantidad}](${p.precio})`).join(', ')} - $${data.total.toFixed(2)} - ${data.metodoPago} - Motivo: ${data.motivo}</p><hr>`;
    }
  });
  document.getElementById("totalEfectivo").innerText = totalEfectivo.toFixed(2);
  document.getElementById("totalTarjeta").innerText = totalTarjeta.toFixed(2);
}

// Control de ventas
async function cargarVentasHoy(){
  const ventasHoyDiv = document.getElementById("ventasHoy");
  ventasHoyDiv.innerHTML="";
  const ventasRef = collection(db,"ventas");
  const ventasSnap = await getDocs(ventasRef);
  ventasSnap.forEach(v=>{
    const data = v.data();
    const p = document.createElement("p");
    p.innerHTML = `${data.productos.map(prod=>prod.nombre+"["+prod.cantidad+"]("+prod.precio+")").join(", ")} - $${data.total.toFixed(2)} - ${data.metodoPago} <button onclick="eliminarVenta('${v.id}')">ELIMINAR VENTA</button>`;
    ventasHoyDiv.appendChild(p);
  });
}

// Eliminar venta
async function eliminarVenta(id){
  const password = prompt("Ingrese contraseña maestra:");
  if(password!==PASSWORD_MAESTRA){ alert("Contraseña incorrecta"); return; }
  const motivo = prompt("MOTIVO DE ELIMINACION:");
  if(!motivo){ alert("Debe ingresar un motivo"); return; }
  await updateDoc(doc(db,"ventas",id),{eliminada:true,motivo});
  actualizarTirarZ();
  cargarVentasHoy();
}
