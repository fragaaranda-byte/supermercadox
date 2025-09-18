import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// Firebase
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

// Datos
let stock = [];
let salesToday = [];
let deletedSales = [];
let saleCounter = 1;

// Utilidades
function generarID() {
    return Math.floor(Math.random() * 9999) + 1;
}

// Funciones de interfaz
function mostrarSeccion(id) {
    document.querySelectorAll('.seccion').forEach(s => s.style.display='none');
    document.getElementById(id).style.display='block';
}

// Botones menú
document.getElementById('btnCargarStock').onclick = () => mostrarSeccion('cargarStockDiv');
document.getElementById('btnVender').onclick = () => mostrarSeccion('venderDiv');
document.getElementById('btnControlStock').onclick = () => mostrarSeccion('controlStockDiv');
document.getElementById('btnModificar').onclick = () => mostrarSeccion('modificarDiv');
document.getElementById('btnTirarZ').onclick = () => printDailyReport();
document.getElementById('btnControlVentas').onclick = () => mostrarSeccion('controlVentasDiv');

// Cargar Stock
document.getElementById('agregarStockBtn').onclick = () => {
    let codigo = document.getElementById('stockCodigo').value.trim();
    let nombre = document.getElementById('stockNombre').value.trim().toUpperCase();
    let cantidad = parseInt(document.getElementById('stockCantidad').value);
    let precio = parseFloat(document.getElementById('stockPrecio').value);

    if(!codigo || !nombre || !cantidad || !precio) return alert("Complete todos los campos");

    let prod = stock.find(p=>p.codigo===codigo);
    if(prod){
        prod.cantidad += cantidad;
        prod.precio = precio;
    } else {
        stock.push({codigo, nombre, cantidad, precio});
    }
    updateStockTable();
};

// Control Stock
function updateStockTable() {
    const div = document.getElementById('stockTabla');
    div.innerHTML = '';
    stock.forEach(p => {
        div.innerHTML += `<p>${p.nombre} | ${p.cantidad} unidades | $${p.precio.toFixed(2)}</p>`;
    });
    updateModificarSelect();
}

// Modificar Productos
function updateModificarSelect(){
    const select = document.getElementById('modProductoSelect');
    select.innerHTML='';
    stock.forEach(p=>{
        select.innerHTML += `<option value="${p.codigo}">${p.nombre}</option>`;
    });
}
document.getElementById('modProductoBtn').onclick = () => {
    const pass = document.getElementById('passMaestra').value;
    if(pass!=="123456789") return alert("Contraseña incorrecta");
    const codigo = document.getElementById('modProductoSelect').value;
    const cantidad = parseInt(document.getElementById('modCantidad').value);
    const precio = parseFloat(document.getElementById('modPrecio').value);
    let prod = stock.find(p=>p.codigo===codigo);
    if(prod){
        if(cantidad) prod.cantidad = cantidad;
        if(precio) prod.precio = precio;
        updateStockTable();
        alert("Producto modificado");
    }
};

// Vender
function renderVentaLista(){
    const div = document.getElementById('ventaLista');
    div.innerHTML='';
    salesToday.forEach((s,i)=>{
        div.innerHTML += `<p>${s.name} [${s.qty}] ($${s.price}) <button onclick="sumar(${i})">+</button> <button onclick="restar(${i})">-</button></p>`;
    });
}
window.sumar = function(i){
    if(salesToday[i].qty<getStockCantidad(salesToday[i].codigo)){
        salesToday[i].qty++;
        renderVentaLista();
    }
}
window.restar = function(i){
    if(salesToday[i].qty>1){
        salesToday[i].qty--;
    } else {
        salesToday.splice(i,1);
    }
    renderVentaLista();
}
function getStockCantidad(codigo){
    let prod = stock.find(p=>p.codigo===codigo);
    return prod? prod.cantidad : 0;
}

document.getElementById('agregarVentaBtn').onclick = () => {
    let codigo = document.getElementById('ventaCodigo').value.trim();
    let cantidad = parseInt(document.getElementById('ventaCantidad').value);
    let prod = stock.find(p=>p.codigo===codigo);
    if(!prod) return alert("Producto no encontrado");
    if(cantidad>prod.cantidad) cantidad = prod.cantidad;

    let venta = salesToday.find(s=>s.codigo===codigo);
    if(venta){
        if(venta.qty+cantidad>prod.cantidad) venta.qty = prod.cantidad;
        else venta.qty += cantidad;
    } else {
        salesToday.push({
            saleID: generarID(),
            codigo,
            name: prod.nombre,
            qty: cantidad,
            price: prod.precio,
            method: ''
        });
    }
    renderVentaLista();
};

// Cobrar e imprimir ticket
document.getElementById('cobrarImprimirBtn').onclick = () => {
    const metodoDiv = document.getElementById('metodoPagoDiv');
    metodoDiv.style.display='block';
};

// Selección método pago
document.getElementById('pagoEfectivoBtn').onclick = ()=>finalizarVenta("Efectivo");
document.getElementById('pagoTarjetaBtn').onclick = ()=>finalizarVenta("Tarjeta");

function finalizarVenta(metodo){
    salesToday.forEach(s=>{ if(!s.method) s.method=metodo; });
    // descontar stock
    salesToday.forEach(s=>{
        let prod = stock.find(p=>p.codigo===s.codigo);
        if(prod) prod.cantidad -= s.qty;
    });
    renderVentaLista();
    updateStockTable();
    alert("Ticket generado");
    document.getElementById('metodoPagoDiv').style.display='none';
}

// Control de Ventas
function renderControlVentas(){
    const div = document.getElementById('ventasHoy');
    div.innerHTML='';
    salesToday.forEach((s,i)=>{
        div.innerHTML += `<p>ID:${s.saleID} ${s.name} x${s.qty} - $${(s.price*s.qty).toFixed(2)} - ${s.method} <button onclick="eliminarVenta(${i})" style="background:red;color:white">ELIMINAR VENTA</button></p><hr>`;
    });
}
window.eliminarVenta = function(i){
    const pass = prompt("Contraseña maestra");
    if(pass!=="123456789") return alert("Contraseña incorrecta");
    let motivo = prompt("MOTIVO DE ELIMINACION:");
    if(!motivo) return alert("Debe ingresar un motivo");
    let v = salesToday[i];
    deletedSales.push({...v, reason:motivo});
    let prod = stock.find(p=>p.codigo===v.codigo);
    if(prod) prod.cantidad += v.qty; // restaurar stock
    salesToday.splice(i,1);
    renderVentaLista();
    renderControlVentas();
    alert("Venta eliminada");
};

// TIRAR Z
function printDailyReport() {
    let content = `<div class="ticketWindow"><h2>SUPERMERCADO X</h2><hr>`;
    content += "<h3>Ventas del día</h3>";

    salesToday.forEach(s => {
        content += `<p>ID:${s.saleID} | ${s.name} x${s.qty} - $${(s.price*s.qty).toFixed(2)} - ${s.method}</p><hr>`;
    });

    let efectivoTotal = salesToday
        .filter(s=>s.method==="Efectivo")
        .reduce((sum,s)=>sum+s.price*s.qty,0);
    let tarjetaTotal = salesToday
        .filter(s=>s.method==="Tarjeta")
        .reduce((sum,s)=>sum+s.price*s.qty,0);

    content += `<h3>Total Efectivo: $${efectivoTotal.toFixed(2)}</h3>`;
    content += `<h3>Total Tarjeta: $${tarjetaTotal.toFixed(2)}</h3>`;

    if(deletedSales.length>0){
        content += "<hr><h3>Ventas Eliminadas</h3>";
        deletedSales.forEach(s=>{
            content += `<p>ID:${s.saleID} | ${s.name} x${s.qty} - $${(s.price*s.qty).toFixed(2)} - ${s.method} - Motivo: ${s.reason}</p><hr>`;
        });
    }

    const ticketWindow = window.open("","TIRARZ","width=600,height=800");
    ticketWindow.document.write(content);
    ticketWindow.document.close();
    ticketWindow.print();
}

// Inicialización
updateStockTable();
