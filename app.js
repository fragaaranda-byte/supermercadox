import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

let carrito = [];
let ventas = [];
let ventasEliminadas = [];

function mostrarSeccion(seccion) {
  document.querySelectorAll('.seccion').forEach(div => div.style.display = 'none');
  document.getElementById(seccion).style.display = 'block';
}

// --- Cargar Stock ---
async function cargarStock() {
  const codigo = document.getElementById('productoCodigo').value;
  const nombre = document.getElementById('productoNombre').value.toUpperCase();
  const cantidad = parseInt(document.getElementById('productoCantidad').value);
  const precio = parseFloat(document.getElementById('productoPrecio').value);
  if(!codigo || !nombre || !cantidad || !precio) return alert('Completa todos los campos');
  try {
    await addDoc(collection(db,'productos'), {codigo,nombre,cantidad,precio});
    alert('Producto agregado');
    actualizarStock();
    document.getElementById('productoCodigo').value='';
    document.getElementById('productoNombre').value='';
    document.getElementById('productoCantidad').value='';
    document.getElementById('productoPrecio').value='';
  } catch(e){console.log(e);}
}

// --- Actualizar Stock ---
async function actualizarStock() {
  const stockDiv = document.getElementById('stockLista');
  stockDiv.innerHTML='';
  const querySnap = await getDocs(collection(db,'productos'));
  querySnap.forEach(docu=>{
    const d = docu.data();
    stockDiv.innerHTML += `<p>${d.nombre} [${d.cantidad}] ($${d.precio})</p>`;
  });
}

// --- Agregar al carrito ---
function agregarAlCarrito(){
  const codigo = document.getElementById('venderCodigo').value;
  const cantidad = parseInt(document.getElementById('venderCantidad').value);
  if(!codigo || !cantidad) return alert('Completa los campos');
  const item = carrito.find(i=>i.codigo===codigo);
  if(item){item.cantidad+=cantidad;} 
  else {carrito.push({codigo,cantidad});}
  mostrarCarrito();
  document.getElementById('venderCodigo').value='';
  document.getElementById('venderCantidad').value='';
  document.getElementById('metodoPagoDiv').style.display='block';
}

// --- Mostrar carrito ---
function mostrarCarrito(){
  const lista = document.getElementById('ventaLista');
  lista.innerHTML='';
  carrito.forEach(i=>{
    lista.innerHTML += `<p>${i.codigo} [${i.cantidad}]</p>`;
  });
}

// --- Finalizar venta ---
async function finalizarVenta(metodo){
  for(const item of carrito){
    const idVenta = Math.floor(Math.random()*9999)+1;
    ventas.push({...item, metodo,id:idVenta});
  }
  alert('Ticket generado, método: '+metodo);
  carrito = [];
  document.getElementById('ventaLista').innerHTML='';
  document.getElementById('metodoPagoDiv').style.display='none';
  actualizarStock();
  actualizarTirarZ();
}

// --- Actualizar Tirar Z ---
function actualizarTirarZ(){
  const lista = document.getElementById('tirarZLista');
  lista.innerHTML='';
  let totalE=0, totalT=0;
  ventas.forEach(v=>{
    lista.innerHTML += `<p>ID:${v.id} ${v.codigo} [${v.cantidad}] ($${v.cantidad*1}) - ${v.metodo}</p><hr>`;
    if(v.metodo==='Efectivo') totalE += v.cantidad*1;
    else totalT += v.cantidad*1;
  });
  ventasEliminadas.forEach(v=>{
    lista.innerHTML += `<p>ID:${v.id} ELIMINADO ${v.codigo} [${v.cantidad}] ($${v.cantidad*1}) - ${v.metodo} Motivo: ${v.motivo}</p><hr>`;
  });
  document.getElementById('totalEfectivo').innerText = totalE;
  document.getElementById('totalTarjeta').innerText = totalT;
}

// --- Modificar Producto ---
async function modificarProducto(){
  const sel = document.getElementById('productoModificarSelect').value;
  const cantidad = parseInt(document.getElementById('productoModificarCantidad').value);
  const precio = parseFloat(document.getElementById('productoModificarPrecio').value);
  const pass = document.getElementById('passwordMaestra').value;
  if(pass!=='123456789') return alert('Contraseña incorrecta');
  const querySnap = await getDocs(collection(db,'productos'));
  querySnap.forEach(async docu=>{
    if(docu.data().codigo===sel){
      await updateDoc(doc(db,'productos',docu.id),{cantidad,precio});
    }
  });
  alert('Producto modificado');
  actualizarStock();
}

// --- Inicialización ---
mostrarSeccion('cargarStock');
actualizarStock();
