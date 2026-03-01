document.addEventListener("DOMContentLoaded", () => {

const editor = document.getElementById("editor");

// ================== VARIABLES ==================
let archivoActual = null;
let posicionPagina = null;

// ================== BOTONES ==================
const btnNuevo = document.querySelector(".submenu-archivo button:nth-child(1)");
const btnAbrir = document.querySelector(".submenu-archivo button:nth-child(2)");
const btnGuardar = document.querySelector(".submenu-archivo button:nth-child(3)");
const btnGuardarComo = document.querySelector(".submenu-archivo button:nth-child(4)");
const btnImprimir = document.querySelector(".submenu-archivo button:nth-child(5)");

const botonesSuperior = document.getElementById("barra-superior").getElementsByClassName("btn-icono");
const btnDeshacer = botonesSuperior[0];
const btnRehacer = botonesSuperior[1];
const btnNumerar = botonesSuperior[2];

const barraFormato = document.getElementById("barra-formato");
const selects = barraFormato.getElementsByTagName("select");
const botonesTexto = barraFormato.getElementsByClassName("btn-texto");
const inputsColor = barraFormato.querySelectorAll("input[type='color']");
const botonesIcono = barraFormato.getElementsByClassName("btn-icono");

const panelInsertar = document.getElementById("panel-insertar");
const togglePanel = document.getElementById("toggle-panel");
const btnInsertarImagen = document.querySelector(".bloque-insertar .btn-icono:first-child");
const btnIndice = document.querySelector(".bloque-insertar .btn-icono:nth-child(2)");

const gridTabla = document.querySelectorAll(".grid-tabla div");
const simbolos = document.querySelectorAll(".simbolos button");
const emojis = document.querySelectorAll(".emojis img");

// ================== FUNCION GENERAL ==================
function ejecutar(cmd, val = null){
    editor.focus();
    document.execCommand(cmd,false,val);
}

// ================== TEXTO ==================
botonesTexto[0].onclick=()=>ejecutar("bold");
botonesTexto[1].onclick=()=>ejecutar("italic");
botonesTexto[2].onclick=()=>ejecutar("underline");

selects[0].onchange=function(){ ejecutar("fontName",this.value); };

selects[1].onchange=function(){
    document.execCommand("fontSize",false,"7");
    let fonts=editor.getElementsByTagName("font");
    for(let f of fonts){
        if(f.size==="7"){
            f.removeAttribute("size");
            f.style.fontSize=this.value+"px";
        }
    }
};

inputsColor[0].onchange=()=>ejecutar("foreColor",inputsColor[0].value);
inputsColor[1].onchange=()=>ejecutar("hiliteColor",inputsColor[1].value);

botonesIcono[0].onclick=()=>ejecutar("justifyLeft");
botonesIcono[1].onclick=()=>ejecutar("justifyCenter");
botonesIcono[2].onclick=()=>ejecutar("justifyRight");

// ================== DESHACER ==================
btnDeshacer.onclick=()=>ejecutar("undo");
btnRehacer.onclick=()=>ejecutar("redo");

// ================== ARCHIVO ==================
btnNuevo.onclick=()=>{
 if(confirm("¿Nuevo documento?")){
    editor.innerHTML="";
    archivoActual=null;
 }
};

btnAbrir.onclick=()=>{
 const input=document.createElement("input");
 input.type="file";
 input.accept=".html,.txt,.mpd";
 input.onchange=e=>{
   const r=new FileReader();
   r.onload=ev=>{
     editor.innerHTML=ev.target.result;
     archivoActual=input.files[0].name;
   };
   r.readAsText(input.files[0]);
 };
 input.click();
};

btnGuardar.onclick=()=>{ archivoActual?guardarArchivo(archivoActual):guardarComo(); };
btnGuardarComo.onclick=guardarComo;

function guardarComo(){
 const nombre=prompt("Nombre del archivo:","documento.mpd");
 if(!nombre)return;
 archivoActual=nombre;
 guardarArchivo(nombre);
}

function guardarArchivo(nombre){
 const blob=new Blob([editor.innerHTML],{type:"text/html"});
 const a=document.createElement("a");
 a.href=URL.createObjectURL(blob);
 a.download=nombre;
 a.click();
}

btnImprimir.onclick=()=>window.print();

// ================== PANEL ==================
togglePanel.onclick=()=>{
 panelInsertar.classList.toggle("oculto");
 togglePanel.textContent=panelInsertar.classList.contains("oculto")?">>":"<<";
};

// ================== INSERTAR ==================
simbolos.forEach(b=>b.onclick=()=>insertTextAtCursor(b.textContent));
emojis.forEach(img=>img.onclick=()=>insertImageAtCursor(img.src));

btnInsertarImagen.onclick=()=>{
 const input=document.createElement("input");
 input.type="file"; input.accept="image/*";
 input.onchange=e=>{
  const r=new FileReader();
  r.onload=ev=>insertImageAtCursor(ev.target.result);
  r.readAsDataURL(input.files[0]);
 };
 input.click();
};

btnIndice.onclick=()=>ejecutar("insertHTML","<h2>Índice</h2><ul><li>Sección 1</li></ul>");

// ================== TABLAS ==================
let filas=0,columnas=0;
gridTabla.forEach((c,i)=>{
 c.onmouseover=()=>{
   columnas=(i%10)+1;
   filas=Math.floor(i/10)+1;
 };
 c.onclick=()=>{
   let t="<table border='1' style='width:100%;border-collapse:collapse'>";
   for(let f=0;f<filas;f++){
    t+="<tr>";
    for(let c=0;c<columnas;c++)t+="<td>&nbsp;</td>";
    t+="</tr>";
   }
   t+="</table><br>";
   ejecutar("insertHTML",t);
 };
});

// ================== MODAL NUMERACIÓN ==================
btnNumerar.onclick=()=>abrirModalNumeracion();

function abrirModalNumeracion(){
 const overlay=document.createElement("div");
 overlay.id="modal-overlay";
 overlay.style=`position:fixed;inset:0;background:rgba(0,0,0,0.4);backdrop-filter:blur(5px);display:flex;justify-content:center;align-items:center;z-index:9999`;

 const modal=document.createElement("div");
 modal.style=`width:60%;height:60%;background:#fff;padding:20px;position:relative`;

 modal.innerHTML=`<h2>Numeración de Páginas</h2>
 <div style="display:grid;grid-template:1fr 1fr/1fr 1fr;height:70%">
 <button data-pos="sup-izq">⬉</button>
 <button data-pos="sup-der">⬈</button>
 <button data-pos="inf-izq">⬋</button>
 <button data-pos="inf-der">⬊</button>
 </div>
 <br>
 <button id="aceptar">Aceptar</button>
 <button id="cancelar">Cancelar</button>`;

 let seleccion=null;
 modal.querySelectorAll("button[data-pos]").forEach(b=>{
   b.onclick=()=>seleccion=b.dataset.pos;
 });

 modal.querySelector("#aceptar").onclick=()=>{
   if(seleccion){
     posicionPagina=seleccion;
     aplicarNumeracion();
   }
   document.body.removeChild(overlay);
 };

 modal.querySelector("#cancelar").onclick=()=>{
   document.body.removeChild(overlay);
 };

 overlay.appendChild(modal);
 document.body.appendChild(overlay);
}

// ================== NUMERAR ==================
function aplicarNumeracion(){
 eliminarNumeros();
 const alto=900;
 const paginas=Math.ceil(editor.scrollHeight/alto);

 for(let i=1;i<=paginas;i++){
  const num=document.createElement("div");
  num.className="numero-pagina";
  num.textContent=i;
  num.contentEditable="true";

  num.style.position="absolute";
  num.style.fontSize=window.getComputedStyle(editor).fontSize;

  if(posicionPagina==="inf-der"){num.style.right="10px";num.style.bottom=(i*alto)+"px";}
  if(posicionPagina==="inf-izq"){num.style.left="10px";num.style.bottom=(i*alto)+"px";}
  if(posicionPagina==="sup-der"){num.style.right="10px";num.style.top=(i*alto)+"px";}
  if(posicionPagina==="sup-izq"){num.style.left="10px";num.style.top=(i*alto)+"px";}

  editor.appendChild(num);
 }
}

function eliminarNumeros(){
 document.querySelectorAll(".numero-pagina").forEach(n=>n.remove());
}

// ================== CURSOR ==================
function insertTextAtCursor(text){
 let sel=window.getSelection();
 if(!sel.rangeCount)return;
 let r=sel.getRangeAt(0);
 r.deleteContents();
 r.insertNode(document.createTextNode(text));
 r.collapse(false);
 sel.removeAllRanges();
 sel.addRange(r);
}

function insertImageAtCursor(src){
 let img=document.createElement("img");
 img.src=src; img.style.maxWidth="300px";
 let sel=window.getSelection();
 if(!sel.rangeCount)return;
 let r=sel.getRangeAt(0);
 r.insertNode(img);
}

// ================== ATAJOS ==================
document.addEventListener("keydown",e=>{
 if(e.ctrlKey && e.key==="s"){e.preventDefault();btnGuardar.click();}
 if(e.ctrlKey && e.key==="b"){e.preventDefault();ejecutar("bold");}
 if(e.ctrlKey && e.key==="i"){e.preventDefault();ejecutar("italic");}
 if(e.ctrlKey && e.key==="u"){e.preventDefault();ejecutar("underline");}
});

// ================== LIMPIAR TEXTO ==================
editor.onfocus=()=>{
 if(editor.textContent==="Escribe tu documento aquí...")editor.innerHTML="";
};

});
