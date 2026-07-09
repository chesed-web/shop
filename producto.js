import "./carrito.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js"
import {
    getFirestore,
    doc,
    getDoc,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDUq8Mp5D-RyVXhkqQLpGuthJXYggviUEM",
    authDomain: "chesed-ce52a.firebaseapp.com",
    projectId: "chesed-ce52a",
    storageBucket: "chesed-ce52a.firebasestorage.app",
    messagingSenderId: "631081373301",
    appId: "1:631081373301:web:7e88fd4d2f37ac6de7b23c"
};

let carrito = JSON.parse(localStorage.getItem("carrito")) || {};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const parametros = new URLSearchParams(window.location.search);
const idProducto = parametros.get("id");
let productoActual = null;
let cantidad = 0;

function actualizarCantidad() {
    document.getElementById("cantidad").textContent = cantidad;
}

function modificarCantidad(delta) {
    if (!productoActual) return;
    const nuevaCantidad = cantidad + delta;
    if (nuevaCantidad < 0) return;
    if (nuevaCantidad > productoActual.stock) return;
    cantidad = nuevaCantidad;
    actualizarCantidad();
}

async function cargarProducto() {
    const referencia = doc(db, "productos", idProducto);
    const documento = await getDoc(referencia);

    if (!documento.exists()) {
        document.body.innerHTML = "<h1 style='padding:24px;color:white;'>Producto no encontrado</h1>";
        return;
    }

    productoActual = documento.data();
    mostrarProducto();
    cargarRelacionados();

    document.getElementById("btn-sumar").addEventListener("click", () => modificarCantidad(1));
    document.getElementById("btn-restar").addEventListener("click", () => modificarCantidad(-1));
    document.getElementById("agregar-carrito").addEventListener("click", agregarAlCarrito);
}

function mostrarProducto() {
    document.getElementById("nombre").textContent = productoActual.nombre || "";
    document.getElementById("categoria").textContent = productoActual.categoria || "";
    document.getElementById("precio").textContent = "$ " + (productoActual.precio || 0).toLocaleString();
    document.getElementById("descripcion").textContent = productoActual.descripcion || "";
    document.getElementById("stock").textContent = productoActual.stock > 0 ? "🟢 Disponible" : "🔴 Agotado";
    const imagenes = productoActual.imagenes || [];
    document.getElementById("imagen-principal").src = imagenes[0] || "https://via.placeholder.com/600x600?text=Sin+imagen";
    cantidad = 0;
    actualizarCantidad();
    mostrarMiniaturas(imagenes);
    const primeraMiniatura = document.querySelector(".miniaturas img");
    if (primeraMiniatura) {
        primeraMiniatura.classList.add("active");
    }
}

function mostrarMiniaturas(imagenes) {
    const contenedor = document.getElementById("miniaturas");
    contenedor.innerHTML = "";
    imagenes.forEach((imagen) => {
        const img = document.createElement("img");
        img.src = imagen;
        img.alt = productoActual.nombre || "Imagen";
        img.addEventListener("click", () => cambiarImagen(imagen, img));
        contenedor.appendChild(img);
    });
}

window.cambiarImagen = function (imagen, elemento) {
    document.getElementById("imagen-principal").src = imagen;
    document.querySelectorAll(".miniaturas img").forEach((img) => img.classList.remove("active"));
    if (elemento) elemento.classList.add("active");
};

async function cargarRelacionados() {
    const snapshot = await getDocs(collection(db, "productos"));
    const todos = [];
    snapshot.forEach((docSnap) => {
        todos.push({ id: docSnap.id, ...docSnap.data() });
    });

    const relacionados = todos.filter((p) => p.categoria === productoActual.categoria && p.id !== idProducto);
    const contenedor = document.getElementById("productos-relacionados");
    contenedor.innerHTML = "";

    relacionados.slice(0, 6).forEach((p) => {
        const card = document.createElement("div");
        card.className = "card-relacionado";
        card.addEventListener("click", () => irProducto(p.id));
        card.innerHTML = `
            <img src="${(p.imagenes && p.imagenes[0]) || "https://via.placeholder.com/400x400?text=Sin+imagen"}" alt="${p.nombre}">
            <p>${p.nombre}</p>
            <b>$${p.precio}</b>
        `;
        contenedor.appendChild(card);
    });
}

window.irProducto = function (id) {
    window.location.href = `producto.html?id=${id}`;
};

window.agregarAlCarrito = function () {
    if (cantidad === 0) {
        alert("Seleccioná al menos una unidad.");
        return;
    }

    if (!carrito[idProducto]) {
        carrito[idProducto] = {
            producto: {
                id: idProducto,
                ...productoActual
            },
            cantidad: 0
        };
    }

    carrito[idProducto].cantidad += cantidad;
    localStorage.setItem("carrito", JSON.stringify(carrito));
    cantidad = 0;
    actualizarCantidad();
    alert("Producto agregado");
};

cargarProducto();
