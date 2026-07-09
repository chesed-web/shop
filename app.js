import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDUq8Mp5D-RyVXhkqQLpGuthJXYggviUEM",
  authDomain: "chesed-ce52a.firebaseapp.com",
  projectId: "chesed-ce52a",
  storageBucket: "chesed-ce52a.firebasestorage.app",
  messagingSenderId: "631081373301",
  appId: "1:631081373301:web:7e88fd4d2f37ac6de7b23c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);



// ===============================
// 🛒 CARRITO SIMPLE
// ===============================

let carrito =
  JSON.parse(localStorage.getItem("carrito")) || {};

function guardarCarrito() {
  localStorage.setItem(
    "carrito",
    JSON.stringify(carrito)
  );
}



// ===============================
// 📦 PRODUCTOS
// ===============================

let todosLosProductos = [];

let categoriaActual = "todos";

async function cargarProductos() {

  const snapshot =
    await getDocs(collection(db, "productos"));

  todosLosProductos = [];

  snapshot.forEach(doc => {
    todosLosProductos.push({
      id: doc.id,
      ...doc.data()
    });
  });

  mostrarProductos(todosLosProductos);
  generarCategorias();

}

function generarCategorias() {

  const filtros =
    document.getElementById("filtros");

  filtros.innerHTML = "";

  filtros.innerHTML += `
    <button
      class="activo"
      onclick="filtrar('todos', this)">
      Todos
    </button>
  `;

  const categorias = [
    ...new Set(
      todosLosProductos.map(
        p => p.categoria
      )
    )
  ];

  categorias.forEach(categoria => {

    filtros.innerHTML += `
      <button
        onclick="filtrar('${categoria}', this)">
        ${categoria}
      </button>
    `;

  });

}

window.filtrar = function(categoria, boton) {

  categoriaActual = categoria;

  document
    .querySelectorAll("#filtros button")
    .forEach(btn =>
      btn.classList.remove("activo")
    );

  if (boton) {

    boton.classList.add("activo");

  }

  aplicarFiltros();

}

function aplicarFiltros() {

  const texto =
    document
      .getElementById("buscador")
      .value
      .toLowerCase();

  let lista = [...todosLosProductos];

  if (categoriaActual !== "todos") {

    lista = lista.filter(
      p => p.categoria === categoriaActual
    );

  }

  lista = lista.filter(
    p =>
      p.nombre
        .toLowerCase()
        .includes(texto)
  );

  mostrarProductos(lista);

}

window.buscarProductos = function() {

  aplicarFiltros();

}

// ===============================
// 🖥️ MOSTRAR PRODUCTOS
// ===============================

function mostrarProductos(lista) {

  const contenedor =
    document.getElementById("productos");

  contenedor.innerHTML = "";

  lista.forEach(producto => {

    const cantidad =
      carrito[producto.id]?.cantidad || 0;

    contenedor.innerHTML += `
      <div class="producto"
        onclick="abrirProducto('${producto.id}')">

        <img
  src="${
    producto.imagenes?.length
      ? producto.imagenes[0]
      : 'https://placehold.co/400x400?text=Sin+Imagen'
  }"
  alt="${producto.nombre}">

        <h3>${producto.nombre}</h3>

        <p>$${producto.precio}</p>

        <div
    class="controles"
    onclick="event.stopPropagation()">

          <button onclick="restar('${producto.id}')">-</button>

          <span id="cantidad-${producto.id}">
    ${cantidad}
</span>

          <button onclick="sumar('${producto.id}')">+</button>

        </div>

      </div>
    `;

  });
}



// ===============================
// 🔥 CLICK → PRODUCTO.HTML
// ===============================

window.abrirProducto = function(id) {
  window.location.href = `producto.html?id=${id}`;
};



// ===============================
// ➕ SUMAR
// ===============================

window.sumar = function(id) {

  const producto =
    todosLosProductos.find(p => p.id === id);

  if (!carrito[id]) {
    carrito[id] = { producto, cantidad: 0 };
  }

  carrito[id].cantidad++;

  guardarCarrito();
  renderCarrito();

};



// ===============================
// ➖ RESTAR
// ===============================

window.restar = function(id) {

  if (!carrito[id]) return;

  carrito[id].cantidad--;

  if (carrito[id].cantidad <= 0) {
    delete carrito[id];
  }

  guardarCarrito();
  renderCarrito();

}



// ===============================
// 🛒 RENDER CARRITO
// ===============================

function renderCarrito() {

  const lista =
    document.getElementById("lista-carrito");

  lista.innerHTML = "";

  let total = 0;
  let cantidadTotal = 0;

  Object.values(carrito).forEach(item => {

    const subtotal =
      item.producto.precio * item.cantidad;

    total += subtotal;
    cantidadTotal += item.cantidad;

    lista.innerHTML += `
  <li class="item-carrito">

    <div class="info-carrito">

      <strong>${item.producto.nombre}</strong>

      <span>${item.cantidad} × $${item.producto.precio}</span>

    </div>

    <strong>$${item.producto.precio * item.cantidad}</strong>

  </li>
`;

  });

  document.getElementById("total").textContent = total;
  document.getElementById("cantidad-carrito").textContent = cantidadTotal;

  // Actualiza también las cantidades de las tarjetas
  mostrarProductos(todosLosProductos);

}



// ===============================
// 📲 WHATSAPP
// ===============================

window.enviarWhatsApp = async function() {

  if (Object.keys(carrito).length === 0) {
    alert("Carrito vacío");
    return;
  }

  let mensaje = "Hola, quiero pedir:%0A%0A";

  const nombre =
  document.getElementById("nombre").value;

const direccion =
  document.getElementById("direccion").value;

const observaciones =
  document.getElementById("observaciones").value;

const ubicacion =
  document.getElementById("ubicacion").value;

  let total = 0;

  Object.values(carrito).forEach(item => {

    const subtotal =
      item.producto.precio * item.cantidad;

    mensaje +=
      `• ${item.producto.nombre} x${item.cantidad}%0A`;

    total += subtotal;

  });

  mensaje += `%0A💰 Total: $${total}`;

  if (nombre.trim() !== "") {

  mensaje += `%0A%0A👤 Nombre:%0A${nombre}`;

}

if (direccion.trim() !== "") {

  mensaje += `%0A%0A🏠 Dirección:%0A${direccion}`;

}

if (observaciones.trim() !== "") {

  mensaje += `%0A%0A📝 Observaciones:%0A${observaciones}`;

}

if (ubicacion.trim() !== "") {

  mensaje += `%0A%0A📍 Ubicación:%0A${ubicacion}`;

}

  const telefono = "5493644831903";

  window.open(
    `https://wa.me/${telefono}?text=${mensaje}`,
    "_blank"
  );

};



// ===============================
// 🚀 INIT
// ===============================

cargarProductos();
renderCarrito();

window.toggleCarrito = function () {

    const detalle =
        document.getElementById("detalle-carrito");

    const overlay =
        document.getElementById("overlay-carrito");

    const flecha =
        document.getElementById("flecha-carrito");

    const abierto =
        detalle.style.display === "block";

    if (abierto) {

        detalle.style.display = "none";
        overlay.style.display = "none";

        if (flecha)
            flecha.textContent = "▼";

    } else {

        detalle.style.display = "block";
        overlay.style.display = "block";

        if (flecha)
            flecha.textContent = "▲";

    }

}

window.vaciarCarrito = function () {

  carrito = {};

  guardarCarrito();

  renderCarrito();

}

window.obtenerUbicacion = function () {

  if (!navigator.geolocation) {

    alert("Tu navegador no soporta geolocalización.");

    return;

  }

  navigator.geolocation.getCurrentPosition(

    function (posicion) {

      const lat = posicion.coords.latitude;
      const lng = posicion.coords.longitude;

      const link =
        `https://maps.google.com/?q=${lat},${lng}`;

      document.getElementById("ubicacion").value = link;

      alert("✅ Ubicación obtenida correctamente.");

    },

    function () {

      alert("No se pudo obtener la ubicación.");

    }

  );

};

document
  .getElementById("buscador")
  .addEventListener(
    "input",
    aplicarFiltros
  );

  document
    .getElementById("overlay-carrito")
    .addEventListener("click", () => {

        document.getElementById("detalle-carrito").style.display = "none";

        document.getElementById("overlay-carrito").style.display = "none";

        document.getElementById("flecha-carrito").textContent = "▼";

});