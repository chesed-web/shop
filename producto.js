import "./carrito.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getFirestore,
    doc,
    getDoc,
    collection,
    getDocs
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {

    apiKey: "AIzaSyDUq8Mp5D-RyVXhkqQLpGuthJXYggviUEM",
    authDomain: "chesed-ce52a.firebaseapp.com",
    projectId: "chesed-ce52a",
    storageBucket: "chesed-ce52a.firebasestorage.app",
    messagingSenderId: "631081373301",
    appId: "1:631081373301:web:7e88fd4d2f37ac6de7b23c"

};

let carrito =
JSON.parse(localStorage.getItem("carrito")) || {};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const parametros = new URLSearchParams(
    window.location.search
);

const idProducto =
    parametros.get("id");

let productoActual = null;

let cantidad = 0;

function actualizarCantidad() {

    document.getElementById("cantidad").textContent = cantidad;

}

function sumarCantidad() {

    console.log("click +");

    cantidad++;

    actualizarCantidad();

}

function restarCantidad() {

    console.log("click -");

    if (cantidad > 0) {

        cantidad--;

        actualizarCantidad();

    }

}

async function cargarProducto(){

    const referencia =
        doc(
            db,
            "productos",
            idProducto
        );

    const documento =
        await getDoc(referencia);

    if(!documento.exists()){

        document.body.innerHTML =
        "<h1>Producto no encontrado</h1>";

        return;

    }

    productoActual = documento.data();

    mostrarProducto();

    cargarRelacionados();

document
    .getElementById("btn-sumar")
    .addEventListener("click", sumarCantidad);

document
    .getElementById("btn-restar")
    .addEventListener("click", restarCantidad);

}

function mostrarProducto(){

    document.getElementById(
        "nombre"
    ).textContent =
    productoActual.nombre;

    document.getElementById(
        "categoria"
    ).textContent =
    productoActual.categoria;

    document.getElementById(
        "precio"
    ).textContent =
    "$ " +
    productoActual.precio.toLocaleString();

    document.getElementById(
        "descripcion"
    ).textContent =
    productoActual.descripcion || "";

    document.getElementById(
        "stock"
    ).textContent =
    productoActual.stock > 0
        ? "🟢 Disponible"
        : "🔴 Agotado";

    document.getElementById(
        "imagen-principal"
    ).src =
    productoActual.imagenes[0];

    mostrarMiniaturas();
  
document
  .getElementById("agregar-carrito")
  .onclick = agregarAlCarrito;

}


function mostrarMiniaturas(){

    const contenedor =
        document.getElementById(
            "miniaturas"
        );

    contenedor.innerHTML = "";

    productoActual.imagenes.forEach(imagen=>{

        contenedor.innerHTML += `

            <img
                src="${imagen}"
                onclick="cambiarImagen('${imagen}')">

        `;

    });

}

window.cambiarImagen =
function(imagen){

    document.getElementById(
        "imagen-principal"
    ).src = imagen;

}

cargarProducto();

async function cargarRelacionados(){

    const snapshot =
        await getDocs(
            collection(db, "productos")
        );

    const todos = [];

    snapshot.forEach(doc => {

        todos.push({
            id: doc.id,
            ...doc.data()
        });

    });

    const relacionados =
        todos.filter(p =>

            p.categoria === productoActual.categoria &&
            p.id !== idProducto

        );

    const contenedor =
        document.getElementById(
            "productos-relacionados"
        );

    contenedor.innerHTML = "";

    relacionados.slice(0,6).forEach(p => {

        contenedor.innerHTML += `

            <div class="card-relacionado"
                onclick="irProducto('${p.id}')">

                <img src="${p.imagenes?.[0] || ''}">

                <p>${p.nombre}</p>

                <b>$${p.precio}</b>

            </div>

        `;

    });

}

window.irProducto = function(id){

    window.location.href =
        `producto.html?id=${id}`;

}

window.agregarAlCarrito = function(){

if (cantidad === 0) {

    alert("Seleccioná al menos una unidad.");

    return;

}

    if(!carrito[idProducto]){

        carrito[idProducto]={

            producto:{
                id:idProducto,
                ...productoActual
            },

            cantidad:0

        };

    }

    carrito[idProducto].cantidad += cantidad;

    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
    );

    cantidad = 0;

    document.getElementById("cantidad").textContent = 0;

    alert("Producto agregado");

}

window.sumarCantidad = function(){

    if(cantidad >= productoActual.stock) return;

    cantidad++;

    document.getElementById(
        "cantidad"
    ).textContent = cantidad;

}

window.restarCantidad = function(){

    if(cantidad <= 1) return;

    cantidad--;

    document.getElementById(
        "cantidad"
    ).textContent = cantidad;

}