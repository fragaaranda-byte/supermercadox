import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = { apiKey: "...", authDomain: "...", projectId: "...", storageBucket: "...", messagingSenderId: "...", appId: "..." };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let cart = [];
let total = 0;
let salesToday = [];

window.showSection = id => {
    document.querySelectorAll(".section").forEach(s=>s.style.display="none");
    document.getElementById(id)?.style.display="block";
};

window.addStock = async function(){
    const code = document.getElementById("barcodeInput").value.trim();
    const name = document.getElementById("nameInput").value.trim();
    const price = parseFloat(document.getElementById("priceInput").value);
    const qty = parseInt(document.getElementById("quantityInput").value);
    if(!code || !name || isNaN(price) || isNaN(qty)) return alert("Complete todos los campos");

    const q = query(collection(db,"products"), where("code","==",code));
    const snapshot = await getDocs(q);
    if(!snapshot.empty){
        snapshot.forEach(async d=>{
            await updateDoc(doc(db,"products",d.id), {currentStock: d.data().currentStock + qty, price, name: name.toLowerCase()});
        });
        alert("Producto actualizado");
    } else {
        await addDoc(collection(db,"products"), {code, name:name.toLowerCase(), price, currentStock: qty});
        alert("Producto agregado");
    }
    ["barcodeInput","nameInput","priceInput","quantityInput"].forEach(id=>document.getElementById(id).value="");
    loadStockList(); loadModifyProductList();
};

window.loadStockList = async function(){
    const tbody = document.querySelector("#stockTable tbody"); tbody.innerHTML="";
    const snapshot = await getDocs(collection(db,"products"));
    snapshot.forEach(d=>{ const data=d.data(); const tr=document.createElement("tr");
        tr.innerHTML=`<td>${data.name.toUpperCase()}</td><td>${data.code}</td><td>${data.price}</td><td>${data.currentStock}</td>`; tbody.appendChild(tr);
    });
};
loadStockList();

window.loadModifyProductList = async function(){
    const select=document.getElementById("modProductSelect"); select.innerHTML='<option value="">-- Seleccione producto --</option>';
    const snapshot=await getDocs(collection(db,"products"));
    snapshot.forEach(d=>{ const opt=document.createElement("option"); opt.value=d.id; opt.textContent=d.data().name.toUpperCase(); select.appendChild(opt); });
};
loadModifyProductList();

window.loadProductToModify = async function(){
    const id = document.getElementById("modProductSelect").value; if(!id) return;
    const snapshot = await getDocs(query(collection(db,"products"), where("__name__","==",id)));
    snapshot.forEach(d=>{ const data=d.data();
        document.getElementById("modNombre").value=data.name;
        document.getElementById("modPrecio").value=data.price;
        document.getElementById("modStock").value=data.currentStock;
    });
};

document.getElementById("btnModificar").addEventListener("click", async ()=>{
    if(document.getElementById("masterPassword").value!=="123456789") return alert("Contraseña maestra incorrecta");
    const docId=document.getElementById("modProductSelect").value; if(!docId) return alert("Seleccione producto");
    const modName=document.getElementById("modNombre").value.trim();
    const modPrice=parseFloat(document.getElementById("modPrecio").value);
    const modStock=parseInt(document.getElementById("modStock").value);
    await updateDoc(doc(db,"products",docId),{name:modName.toLowerCase(), price:modPrice, currentStock:modStock});
    alert("Producto modificado"); loadStockList(); loadModifyProductList();
});

// VENDER
window.addProduct=async function(){
    const code=document.getElementById("barcodeInputSale").value.trim();
    const qty=parseInt(document.getElementById("quantityInputSale").value); if(!code||isNaN(qty)) return alert("Ingrese código y cantidad");
    const snapshot=await getDocs(query(collection(db,"products"), where("code","==",code)));
    if(snapshot.empty) return alert("Producto no encontrado");
    snapshot.forEach(d=>{
        const data=d.data(); const exists=cart.find(p=>p.code===code);
        if(exists){ exists.qty+=1; } else { cart.push({id:d.id, code, name:data.name.toUpperCase(), price:data.price, qty}); }
    });
    updateCartTable(); document.getElementById("barcodeInputSale").value=""; document.getElementById("quantityInputSale").value=1;
};
window.adjustQty=function(val){ let qty=parseInt(document.getElementById("quantityInputSale").value); qty=Math.max(1, qty+val); document.getElementById("quantityInputSale").value=qty; };
window.updateCartTable=function(){ const tbody=document.querySelector("#cartTable tbody"); tbody.innerHTML=""; total=0;
    cart.forEach(c=>{ const tr=document.createElement("tr"); tr.innerHTML=`<td>${c.name}</td><td>${c.code}</td><td>${c.price}</td><td>${c.qty}</td><td>${(c.price*c.qty).toFixed(2)}</td>`; tbody.appendChild(tr); total+=c.price*c.qty; });
    document.getElementById("total").textContent=total.toFixed(2);
};
window.choosePaymentMethod=function(){ if(cart.length===0) return alert("Carrito vacío"); document.getElementById("paymentMethodDiv").style.display="block"; };
window.checkout=async function(method){
    const now=new Date(); const saleId='V'+now.getTime();
    for(let c of cart){ await updateDoc(doc(db,"products",c.id),{currentStock:c.currentStock-c.qty});
        await addDoc(collection(db,"sales"),{id:saleId, code:c.code, name:c.name, price:c.price, qty:c.qty, date:now, method});
        salesToday.push({id:saleId, code:c.code, name:c.name, price:c.price, qty:c.qty, date:now, method});
    }
    cart=[]; updateCartTable(); loadStockList(); loadSalesTable();
    const printWindow=window.open('','Print','width=600,height=400'); let html=`<h2>SUPERMERCADO X - Ticket</h2><p>Fecha: ${now.toLocaleString()}</p>`;
    salesToday.forEach(p=>{ html+=`${p.name} [${p.qty}] ($${p.price.toFixed(2)})<br>`; });
    html+=`<p>Total: $${total.toFixed(2)}</p>`; printWindow.document.write(html); printWindow.document.close(); printWindow.print();
    document.getElementById("paymentMethodDiv").style.display="none";
};
window.loadSalesTable=async function(){ const tbody=document.querySelector("#salesTable tbody"); tbody.innerHTML="";
    const snapshot=await getDocs(collection(db,"sales")); snapshot.forEach(docSnap=>{ const s=docSnap.data(); const tr=document.createElement("tr");
        tr.innerHTML=`<td>${s.id}</td><td>${new Date(s.date.seconds*1000).toLocaleString()}</td><td>${s.name} [${s.qty}] ($${s.price})</td><td>${(s.qty*s.price).toFixed(2)}</td><td>${s.method}</td>`;
        tbody.appendChild(tr);
    });
};
window.printDailyReport=function(){
    const now=new Date(); const printWindow=window.open('','Print','width=800,height=600'); let html=`<h2>SUPERMERCADO X - TIRAR Z</h2><p>Fecha: ${now.toLocaleString()}</p>`;
    salesToday.forEach(p=>{ html+=`ID:${p.id} - ${p.name} [${p.qty}] ($${p.price.toFixed(2)}) - Método: ${p.method}<br>`; });
    printWindow.document.write(html); printWindow.document.close(); printWindow.print();
};
showSection("cargar"); loadSalesTable();
