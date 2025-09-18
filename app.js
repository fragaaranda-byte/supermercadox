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
  const code=document.getElementById("barcodeInput").value.trim();
  const name=document.getElementById("nameInput").value.trim();
  const price=parseFloat(document.getElementById("priceInput").value);
  const qty=parseInt(document.getElementById("quantityInput").value);
  const expiry=document.getElementById("expiryInput").value;
  if(!code||!name||isNaN(price)||isNaN(qty)) return alert("Complete todos los campos");

  const q=query(collection(db,"products"), where("code","==",code));
  const snapshot=await getDocs(q);
  if(!snapshot.empty){
    snapshot.forEach(async d=>{
      await updateDoc(doc(db,"products",d.id),{
        currentStock: qty,
        price,
        name: name.toLowerCase(),
        expiryDate: expiry? new Date(expiry) : null
      });
    });
    alert("Producto actualizado");
  }else{
    await addDoc(collection(db,"products"),{
      code,name:name.toLowerCase(),price,currentStock:qty,expiryDate:expiry? new Date(expiry):null
    });
    alert("Producto agregado");
  }
  document.getElementBy
