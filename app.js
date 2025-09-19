// app.js (modular Firebase v9)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, addDoc, setDoc, doc, getDocs, query, where, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

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

/* ---------------- state ---------------- */
let cart = []; // items {code,name,price,qty,productDocId}
let ticketsToday = []; // tickets loaded for today (from 'tickets' collection)
let deletedTickets = []; // loaded from 'deletedTickets' if desired

/* ---------------- DOM refs ---------------- */
const byId = id => document.getElementById(id);

const sections = {
  cargar: byId('seccion-cargar'),
  vender: byId('seccion-vender'),
  control: byId('seccion-control'),
  modificar: byId('seccion-modificar'),
  ventas: byId('seccion-ventas')
};

/* top nav buttons */
byId('btnCargar').addEventListener('click', ()=>showSection('cargar'));
byId('btnVender').addEventListener('click', ()=>showSection('vender'));
byId('btnControl').addEventListener('click', ()=>showSection('control'));
byId('btnModificar').addEventListener('click', ()=>showSection('modificar'));
byId('btnVentas').addEventListener('click', ()=>showSection('ventas'));
byId('btnTirarZ').addEventListener('click', printDailyReport);

/* action buttons */
byId('btnAddStock').addEventListener('click', addStock);
byId('btnAddToCart').addEventListener('click', addToCart);
byId('qtyPlus').addEventListener('click', ()=>adjustQty(1));
byId('qtyMinus').addEventListener('click', ()=>adjustQty(-1));
byId('btnCobrar').addEventListener('click', showPaymentOptions);
byId('btnModificar').addEventListener('click', modifyProduct);

/* payment buttons delegation */
document.addEventListener('click', (e)=>{
  if(e.target && e.target.matches('button.pay')){
    const method = e.target.dataset.method;
    if(method) processCheckout(method);
  }
});

/* show one section */
function showSection(name){
  Object.values(sections).forEach(s => s.style.display = 'none');
  if(sections[name]) sections[name].style.display = 'block';
  // refresh related data
  if(name === 'control') loadStockList();
  if(name === 'modificar') loadModifyProductList();
  if(name === 'ventas') loadSalesTable();
}

/* ---------------- STOCK ---------------- */
async function addStock(){
  const code = byId('barcodeInputStock').value.trim();
  const name = byId('nameInputStock').value.trim();
  const price = parseFloat(byId('priceInputStock').value);
  const qty = parseInt(byId('quantityInputStock').value,10);

  if(!code || !name || Number.isNaN(price) || Number.isNaN(qty)){
    return alert('Complete todos los campos correctamente');
  }

  // search product by code
  const q = query(collection(db,'products'), where('code','==',code));
  const snap = await getDocs(q);
  if(!snap.empty){
    // update first doc found
    snap.forEach(async d => {
      await updateDoc(doc(db,'products',d.id), {
        currentStock: (d.data().currentStock||0) + qty,
        price,
        name: name.toLowerCase()
      });
    });
    alert('Producto actualizado en stock');
  } else {
    // add new product
    await addDoc(collection(db,'products'), {
      code, name: name.toLowerCase(), price, currentStock: qty
    });
    alert('Producto agregado');
  }

  // clear inputs & reload
  byId('barcodeInputStock').value='';
  byId('nameInputStock').value='';
  byId('priceInputStock').value='';
  byId('quantityInputStock').value='';
  loadStockList();
  loadModifyProductList();
}

/* list current stock */
async function loadStockList(){
  const tbody = byId('stockList').querySelector('tbody');
  tbody.innerHTML = '';
  const snap = await getDocs(collection(db,'products'));
  snap.forEach(d=>{
    const data = d.data();
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${escapeHtml(data.code)}</td>
                    <td>${escapeHtml((data.name||'').toUpperCase())}</td>
                    <td>$${Number(data.price).toFixed(2)}</td>
                    <td>${Number(data.currentStock||0)}</td>`;
    tbody.appendChild(tr);
  });
}

/* ---------------- MODIFICAR ---------------- */
async function loadModifyProductList(){
  const sel = byId('modProductSelect');
  sel.innerHTML = '<option value="">-- seleccionar --</option>';
  const snap = await getDocs(collection(db,'products'));
  snap.forEach(d=>{
    const opt = document.createElement('option');
    opt.value = d.id;
    opt.textContent = (d.data().name||'').toUpperCase();
    sel.appendChild(opt);
  });
}

/* when a product selected, load fields */
byId('modProductSelect').addEventListener('change', async ()=>{
  const id = byId('modProductSelect').value;
  if(!id) return;
  // fetch doc
  const snap = await getDocs(query(collection(db,'products'), where('__name__','==', id)));
  snap.forEach(d=>{
    const data = d.data();
    byId('modNombre').value = data.name || '';
    byId('modPrecio').value = data.price || '';
    byId('modStock').value = data.currentStock || '';
  });
});

async function modifyProduct(){
  const master = byId('masterPassword').value;
  if(master !== '123456789') return alert('Contraseña maestra incorrecta');
  const id = byId('modProductSelect').value;
  if(!id) return alert('Seleccione producto');
  const modName = byId('modNombre').value.trim();
  const modPrice = parseFloat(byId('modPrecio').value);
  const modStock = parseInt(byId('modStock').value,10);
  if(!modName || Number.isNaN(modPrice) || Number.isNaN(modStock)) return alert('Complete los campos correctamente');
  await updateDoc(doc(db,'products',id), { name: modName.toLowerCase(), price: modPrice, currentStock: modStock });
  alert('Producto modificado');
  loadStockList();
  loadModifyProductList();
}

/* ---------------- CART / VENDER ---------------- */
function adjustQty(delta){
  const inp = byId('quantityInputSale');
  let v = parseInt(inp.value,10) || 1;
  v += delta;
  if(v < 1) v = 1;
  inp.value = v;
}

async function addToCart(){
  const code = byId('barcodeInputSale').value.trim();
  const qty = parseInt(byId('quantityInputSale').value,10) || 1;
  if(!code) return alert('Ingrese código de barras o seleccione producto');
  // find product in DB
  const snap = await getDocs(query(collection(db,'products'), where('code','==', code)));
  if(snap.empty) return alert('Producto no encontrado');
  snap.forEach(d=>{
    const data = d.data();
    const docId = d.id;
    const existing = cart.find(i => i.code === code);
    if(existing){
      existing.qty = Math.min((data.currentStock||0), existing.qty + qty);
    } else {
      cart.push({
        productDocId: docId,
        code,
        name: (data.name||'').toUpperCase(),
        price: Number(data.price),
        qty: Math.min(qty, (data.currentStock||0))
      });
    }
  });
  byId('barcodeInputSale').value = '';
  byId('quantityInputSale').value = 1;
  renderCart();
}

function renderCart(){
  const tbody = byId('cartTable').querySelector('tbody');
  tbody.innerHTML = '';
  let total = 0;
  cart.forEach((item, idx) => {
    const subtotal = item.price * item.qty;
    total += subtotal;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${escapeHtml(item.name)}</td>
                    <td>${escapeHtml(item.code)}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>${item.qty}</td>
                    <td>$${subtotal.toFixed(2)}</td>
                    <td>
                      <button class="small" data-idx="${idx}" data-action="plus">+</button>
                      <button class="small" data-idx="${idx}" data-action="minus">-</button>
                    </td>`;
    tbody.appendChild(tr);
  });
  byId('total').textContent = total.toFixed(2);
}

/* +/- buttons in cart (event delegation) */
byId('cartTable').addEventListener('click', (e)=>{
  const btn = e.target.closest('button');
  if(!btn) return;
  const idx = Number(btn.dataset.idx);
  if(Number.isNaN(idx)) return;
  const action = btn.dataset.action;
  if(action === 'plus') { cart[idx].qty += 1; }
  if(action === 'minus') { cart[idx].qty -= 1; if(cart[idx].qty <=0) cart.splice(idx,1); }
  renderCart();
});

/* ---------------- CHECKOUT / TICKETS ---------------- */
function showPaymentOptions(){
  if(cart.length === 0) return alert('Carrito vacío');
  byId('paymentMethodDiv').classList.remove('hidden');
}

/* process checkout: create ticket doc with id and items array */
async function processCheckout(method){
  const now = new Date();
  // ticket ID random 1-9999 zero-padded
  const idRand = Math.floor(Math.random()*9999)+1;
  const ticketId = String(idRand).padStart(4,'0');

  // compute total and prepare items
  let total = 0;
  const items = cart.map(it => {
    const itemSubtotal = Number(it.price) * Number(it.qty);
    total += itemSubtotal;
    return {
      code: it.code,
      name: it.name,
      price: Number(it.price),
      qty: Number(it.qty),
      subtotal: Number(itemSubtotal)
    };
  });

  // save ticket in 'tickets' collection using custom id
  const ticketRef = doc(db, 'tickets', ticketId);
  await setDoc(ticketRef, {
    ticketId,
    createdAt: now,
    items,
    total,
    method
  });

  // decrement stock in products
  for(const it of cart){
    const prodRef = doc(db, 'products', it.productDocId);
    // fetch current value (simple optimistic update)
    const snap = await getDocs(query(collection(db,'products'), where('__name__','==', it.productDocId)));
    snap.forEach(async d => {
      const curr = d.data().currentStock || 0;
      await updateDoc(doc(db,'products', d.id), { currentStock: curr - it.qty });
    });
  }

  // push to local ticketsToday for UI (so it appears immediately)
  ticketsToday.push({ ticketId, createdAt: now, items, total, method });

  // clear cart & UI
  cart = [];
  renderCart();
  loadStockList();
  loadSalesTable();

  // build printable ticket (formatted lines: "NAME xQTY ($unit) = $subtotal")
  let html = `<div style="font-family:monospace;padding:20px;color:#111"><h2>SUPERMERCADO X</h2>`;
  html += `<div>${now.toLocaleString()}</div><hr>`;
  items.forEach(it => {
    html += `<div style="margin:6px 0;font-size:14px;"><strong>${escapeHtml(it.name)}</strong> x${it.qty} ($${it.price.toFixed(2)}) = $${it.subtotal.toFixed(2)}</div>`;
  });
  html += `<hr><h3>Total: $${total.toFixed(2)}</h3>`;
  html += `<div>Método de pago: ${escapeHtml(method)}</div>`;
  html += `</div>`;

  // open print window and auto-print
  const w = window.open('','Ticket','width=400,height=600');
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();

  // hide payment options
  byId('paymentMethodDiv').classList.add('hidden');
}

/* ------------------ SALES (tickets) table ------------------ */
async function loadSalesTable(){
  const tbody = byId('salesTable').querySelector('tbody');
  tbody.innerHTML = '';
  ticketsToday = []; // refresh local list
  // fetch all tickets and filter by today's date
  const snap = await getDocs(collection(db,'tickets'));
  const today = new Date();
  snap.forEach(d=>{
    const data = d.data();
    // data.createdAt could be Date or Firestore Timestamp; handle both
    let created = data.createdAt;
    if(created && created.seconds) created = new Date(created.seconds * 1000);
    else if(!(created instanceof Date)) created = new Date(created);

    // include only today (same date)
    const sameDay = created.getFullYear() === today.getFullYear() &&
                    created.getMonth() === today.getMonth() &&
                    created.getDate() === today.getDate();
    if(!sameDay) return;

    ticketsToday.push({
      ticketId: data.ticketId || d.id,
      createdAt: created,
      items: data.items || [],
      total: Number(data.total||0),
      method: data.method || ''
    });
  });

  // render
  ticketsToday.forEach(t=>{
    const tr = document.createElement('tr');
    const productsText = t.items.map(i=>`${i.name} x${i.qty}`).join(' — ');
    tr.innerHTML = `<td>${escapeHtml(t.ticketId)}</td>
                    <td>${t.createdAt.toLocaleString()}</td>
                    <td style="text-align:left;padding-left:14px">${escapeHtml(productsText)}</td>
                    <td>$${t.total.toFixed(2)}</td>
                    <td>${escapeHtml(t.method)}</td>
                    <td><button class="small delete-ticket" data-id="${escapeHtml(t.ticketId)}" style="background:${'#ff5a5a'};color:#111">ELIMINAR</button></td>`;
    tbody.appendChild(tr);
  });
}

/* delete full ticket by id (moves to deletedTickets collection with reason) */
document.addEventListener('click', async (e) => {
  if(e.target && e.target.matches('button.delete-ticket')){
    const ticketId = e.target.dataset.id;
    const reason = prompt('MOTIVO DE ELIMINACION (obligatorio):');
    if(!reason) return alert('Debe ingresar un motivo');
    const master = prompt('Ingrese contraseña maestra:');
    if(master !== '123456789') return alert('Contraseña incorrecta');

    // fetch ticket doc
    const ticketRef = doc(db, 'tickets', ticketId);
    const ticketSnap = await getDocs(query(collection(db,'tickets'), where('__name__','==', ticketId)));
    if(ticketSnap.empty){
      return alert('Ticket no encontrado');
    }

    // move to deletedTickets (store reason) and restore stock
    ticketSnap.forEach(async d => {
      const data = d.data();
      // add to deletedTickets
      await addDoc(collection(db,'deletedTickets'), { ticketId, movedAt: new Date(), original: data, reason });

      // restore stock for each item
      const items = data.items || [];
      for(const it of items){
        // find product by code
        const prodSnap = await getDocs(query(collection(db,'products'), where('code','==', it.code)));
        prodSnap.forEach(async p=>{
          const curr = p.data().currentStock || 0;
          await updateDoc(doc(db,'products',p.id), { currentStock: curr + Number(it.qty) });
        });
      }

      // delete original ticket
      await deleteDoc(doc(db,'tickets', ticketId));
    });

    // refresh UI
    await loadStockList();
    await loadSalesTable();
    alert('Ticket eliminado y stock restaurado');
  }
});

/* ------------------ TIRAR Z ------------------ */
async function printDailyReport(){
  const master = prompt('Ingrese contraseña maestra para TIRAR Z:');
  if(master !== '123456789') return alert('Contraseña incorrecta');

  // gather today's tickets
  const snap = await getDocs(collection(db,'tickets'));
  const today = new Date();
  let efectivoTotal = 0, tarjetaTotal = 0;
  let html = `<div style="font-family:monospace;color:#111;padding:18px"><h2>SUPERMERCADO X - TIRAR Z</h2>`;
  html += `<div>Fecha: ${today.toLocaleString()}</div><hr>`;

  // tickets (today)
  const todays = [];
  snap.forEach(d=>{
    const data = d.data();
    let created = data.createdAt;
    if(created && created.seconds) created = new Date(created.seconds * 1000);
    else if(!(created instanceof Date)) created = new Date(created);
    const sameDay = created.getFullYear() === today.getFullYear() &&
                    created.getMonth() === today.getMonth() &&
                    created.getDate() === today.getDate();
    if(!sameDay) return;
    todays.push({ id: d.id, ...data, created });
  });

  if(todays.length === 0){
    html += `<p>No hay ventas para el día.</p>`;
  } else {
    for(const t of todays){
      html += `<div style="margin:6px 0;"><strong>ID: ${escapeHtml(t.ticketId || t.id)} — ${new Date((t.createdAt && t.createdAt.seconds) ? t.createdAt.seconds*1000 : t.createdAt).toLocaleString()}</strong><br>`;
      (t.items || []).forEach(it => {
        html += `${escapeHtml(it.name)} x${it.qty} ($${Number(it.price).toFixed(2)}) = $${Number(it.subtotal).toFixed(2)}<br>`;
      });
      html += `<strong>Total: $${Number(t.total).toFixed(2)}</strong></div><hr>`;
      if(t.method === 'Efectivo') efectivoTotal += Number(t.total);
      else tarjetaTotal += Number(t.total);
    }
    html += `<h3>Totales</h3>`;
    html += `<div>Total Efectivo: $${efectivoTotal.toFixed(2)}</div>`;
    html += `<div>Total Tarjeta: $${tarjetaTotal.toFixed(2)}</div>`;
  }

  // list deleted tickets (from deletedTickets collection)
  const delSnap = await getDocs(collection(db,'deletedTickets'));
  const deletedToday = [];
  delSnap.forEach(d=>{
    const data = d.data();
    let when = data.movedAt;
    if(when && when.seconds) when = new Date(when.seconds*1000);
    else if(!(when instanceof Date)) when = new Date(when);
    const sameDay = when.getFullYear() === today.getFullYear() &&
                    when.getMonth() === today.getMonth() &&
                    when.getDate() === today.getDate();
    if(!sameDay) return;
    deletedToday.push({ id: d.id, ...data, movedAt: when });
  });
  if(deletedToday.length){
    html += `<hr><h3>Ventas Eliminadas (hoy)</h3>`;
    deletedToday.forEach(d=>{
      html += `ID: ${escapeHtml(d.ticketId)} - Motivo: ${escapeHtml(d.reason)}<br>`;
      const orig = d.original || {};
      (orig.items || []).forEach(it => {
        html += `${escapeHtml(it.name)} x${it.qty} ($${Number(it.price).toFixed(2)}) = $${Number(it.subtotal).toFixed(2)}<br>`;
      });
      html += `<hr>`;
    });
  }

  html += `</div>`;

  const w = window.open('','TIRARZ','width=800,height=800');
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
}

/* ------------------ utilities ------------------ */

function escapeHtml(str){
  if(!str && str !== 0) return '';
  return String(str).replace(/[&<>"'`=\/]/g, function(s){
    return ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'
    })[s];
  });
}

/* ------------------ periodic refresh (daily view) ------------------ */
/* We reload the sales table periodically; tickets are filtered by today's date on load.
   This keeps UI focused on today's tickets. No destructive auto-delete is performed. */

setInterval(()=>{
  const now = new Date();
  // every minute refresh today's tickets (keeps the UI up to date)
  if(now.getSeconds() === 0) {
    loadSalesTable();
    loadStockList();
  }
}, 1000);

/* start on load */
showSection('cargar');
loadStockList();
loadModifyProductList();
loadSalesTable();
