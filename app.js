import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, query, where, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

let cart = [];
let salesToday = [];

// ------------------ UI ------------------
window.showSection = function(id){
    document.querySelectorAll(".section").forEach(s=>s.style.display="none");
    document.getElementById(id).style.display="block";
};

// ------------------ STOCK ------------------
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
            await updateDoc(doc(db,"products",d.id),{ currentStock: d.data().currentStock + qty, price, name: name.toLowerCase() });
        });
    } else {
        await addDoc(collection(db,"products"),{ code, name:name.toLowerCase(), price, currentStock: qty });
    }

    document.getElementById("barcodeInput").value="";
    document.getElementById("nameInput").value="";
    document.getElementById("priceInput").value="";
    document.getElementById("quantityInput").value="";

    loadStockList();
    loadModifyProductList();
};

window.loadStockList=async function(){
    const tbody=document.querySelector("#stockTable tbody");
    tbody.innerHTML="";
    const snapshot=await getDocs(collection(db,"products"));
    snapshot.forEach(docSnap=>{
        const d = docSnap.data();
        const tr = document.createElement("tr");
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
    const docSnap = await getDocs(query(collection(db,"products"), where("__name__","==",id)));
    docSnap.forEach(d=>{
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
    const qty=parseInt(document.getElementById("quantityInputSale").value);
    if(!code || isNaN(qty)) return alert("Ingrese código y cantidad");

    const snapshot = await getDocs(query(collection(db,"products"), where("code","==",code)));
    if(snapshot.empty) return alert("Producto no encontrado");

    snapshot.forEach(d=>{
        const data=d.data();
        const exists = cart.find(p=>p.code===code);
        if(exists){ exists.qty += qty; } 
        else{ cart.push({code,dataName:data.name.toUpperCase(),name:data.name.toUpperCase(),price:data.price,qty}); }
    });

    updateCartTable();
    document.getElementById("barcodeInputSale").value="";
    document.getElementById("quantityInputSale").value=1;
};

window.modifyCartQuantity=function(change){
    const code=document.getElementById("barcodeInputSale").value.trim();
    const item=cart.find(c=>c.code===code);
    if(item){
        item.qty += change;
        if(item.qty < 1) item.qty = 1;
        updateCartTable();
    }
};

window.updateCartTable=function(){
    const tbody=document.querySelector("#cartTable tbody");
    tbody.innerHTML="";
    let total=0;
    cart.forEach(c=>{
        const tr=document.createElement("tr");
        tr.innerHTML=`<td>${c.name}</td><td>${c.code}</td><td>${c.price}</td><td>${c.qty}</td><td>${(c.price*c.qty).toFixed(2)}</td>`;
        tbody.appendChild(tr);
        total+=c.price*c.qty;
    });
    document.getElementById("total").textContent=total.toFixed(2);
};

window.checkout=function(method){
    if(cart.length===0) return alert("Carrito vacío");
    const now = new Date();
    const id = 'V'+now.getTime();
    cart.forEach(c=>{
        salesToday.push({id,date:now,code:c.code,name:c.name,qty:c.qty,price:c.price,method});
    });
    updateCartTable();
    loadSalesTable();
    document.getElementById("paymentMethodDiv").style.display="none";

    // imprimir ticket
    let printWindow = window.open('','Print','width=600,height=600');
    let html = `<h2>SUPERMERCADO X - Ticket</h2>`;
    cart.forEach(c=>{
        html+=`${c.name} [${c.qty}] ($${c.price.toFixed(2)})<br>`;
    });
    html+=`<hr>Total: $${cart.reduce((a,b)=>a+b.price*b.qty,0).toFixed(2)}`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();

    cart = [];
};

// ------------------ CONTROL DE VENTAS ------------------
window.loadSalesTable=function(){
    const tbody=document.querySelector("#salesTable tbody");
    tbody.innerHTML="";
    salesToday.forEach(s=>{
        const tr=document.createElement("tr");
        tr.innerHTML=`<td>${s.id}</td><td>${s.date.toLocaleString()}</td><td>${s.name} [${s.qty}] ($${s.price})</td><td>${(s.qty*s.price).toFixed(2)}</td><td>${s.method}</td>`;
        tbody.appendChild(tr);
    });
};

// ------------------ TIRAR Z ------------------
window.printDailyReport=function(){
    let printWindow = window.open('','Print','width=800,height=600');
    let html='<h2>SUPERMERCADO X - TIRAR Z</h2><hr>';
    let total = 0;
    salesToday.forEach(s=>{
        html+=`ID: ${s.id} - ${s.name} [${s.qty}] ($${s.price.toFixed(2)}) - ${s.method}<br>`;
        total+=s.price*s.qty;
    });
    html+=`<hr>Total del día: $${total.toFixed(2)}`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
};

// ------------------ REINICIO DIARIO ------------------
setInterval(()=>{
    const now = new Date();
    if(now.getHours() === 6 && now.getMinutes() === 0){
        salesToday = [];
        loadSalesTable();
    }
},60000);

// ------------------ INICIO ------------------
showSection("inicio");
loadSalesTable();
