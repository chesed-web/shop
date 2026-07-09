import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  deleteDoc
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

let productos = [];
let imagenesNuevoProducto = [];
let categoriaActual = "todos";

const $ = (id) => document.getElementById(id);

async function cargarProductos() {
  const snapshot = await getDocs(collection(db, "productos"));
  productos = [];

  snapshot.forEach((docSnap) => {
    productos.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  generarCategorias();
  mostrarProductos();
}

function mostrarProductos(lista = productos) {
  const contenedor = $("productos");
  contenedor.innerHTML = "";

  if (!lista.length) {
    contenedor.innerHTML = `
      <div class="empty-state">No se encontraron productos.</div>
    `;
    return;
  }

  lista.forEach((producto) => {
    contenedor.innerHTML += `
      <div class="producto">
        <div class="cabecera-producto" onclick="toggleProducto('${producto.id}')">
          <h3>${producto.nombre}</h3>
        </div>

        <div class="contenido-producto" id="contenido-${producto.id}" style="display:none;">
          <label>Categoría</label>
          <input type="text" id="categoria-${producto.id}" value="${producto.categoria || ""}">

          <label>Precio</label>
          <input type="number" id="precio-${producto.id}" value="${producto.precio}">

          <label>Estado</label>
          <select id="stock-${producto.id}">
            <option value="1" ${producto.stock > 0 ? "selected" : ""}>Disponible</option>
            <option value="0" ${producto.stock <= 0 ? "selected" : ""}>Agotado</option>
          </select>

          <label>Descripción</label>
          <textarea id="descripcion-${producto.id}">${producto.descripcion || ""}</textarea>

          <label>Imágenes</label>
          <div id="imagenes-${producto.id}"></div>

          <div class="image-actions">
            <input type="file" id="archivo-${producto.id}" accept="image/*">
            <button type="button" onclick="subirImagenProducto('${producto.id}')">☁️ Subir imagen</button>
          </div>

          <div class="image-actions">
            <input type="text" id="url-${producto.id}" placeholder="https://...">
            <button type="button" onclick="agregarUrlProducto('${producto.id}')">🔗 Agregar URL</button>
          </div>

          <button class="eliminar" type="button" onclick="eliminarProducto('${producto.id}')">🗑 Eliminar</button>
        </div>
      </div>
    `;
  });

  lista.forEach((producto) => mostrarImagenesProducto(producto.id));
}

function mostrarImagenesProducto(id) {
  const producto = productos.find((p) => p.id === id);
  const contenedor = $("imagenes-" + id);
  contenedor.innerHTML = "";

  producto.imagenes = producto.imagenes || [];

  producto.imagenes.forEach((imagen, indice) => {
    contenedor.innerHTML += `
      <div class="imagen-admin">
        <img src="${imagen}" class="preview-imagen">
        <button type="button" onclick="eliminarImagenProducto('${id}', ${indice})">🗑</button>
      </div>
    `;
  });
}

window.subirImagenProducto = async function (id) {
  const archivo = $("archivo-" + id).files[0];
  if (!archivo) return;

  const datos = new FormData();
  datos.append("file", archivo);
  datos.append("upload_preset", "chesed");

  const respuesta = await fetch("https://api.cloudinary.com/v1_1/nziuiskk/image/upload", {
    method: "POST",
    body: datos
  });
  const resultado = await respuesta.json();

  const producto = productos.find((p) => p.id === id);
  producto.imagenes = producto.imagenes || [];
  producto.imagenes.push(resultado.secure_url);

  await updateDoc(doc(db, "productos", id), { imagenes: producto.imagenes });
  mostrarImagenesProducto(id);
  $("archivo-" + id).value = "";
};

window.agregarUrlProducto = async function (id) {
  const input = $("url-" + id);
  const url = input.value.trim();
  if (!url) return;

  const producto = productos.find((p) => p.id === id);
  producto.imagenes = producto.imagenes || [];
  producto.imagenes.push(url);

  await updateDoc(doc(db, "productos", id), { imagenes: producto.imagenes });
  mostrarImagenesProducto(id);
  input.value = "";
};

window.eliminarImagenProducto = async function (id, indice) {
  const producto = productos.find((p) => p.id === id);
  producto.imagenes.splice(indice, 1);

  await updateDoc(doc(db, "productos", id), { imagenes: producto.imagenes });
  mostrarImagenesProducto(id);
};

window.guardarTodo = async function () {
  for (const producto of productos) {
    const precio = Number($("precio-" + producto.id).value);
    const stock = Number($("stock-" + producto.id).value);
    const categoria = $("categoria-" + producto.id).value;
    const descripcion = $("descripcion-" + producto.id).value;

    await updateDoc(doc(db, "productos", producto.id), {
      precio,
      stock,
      categoria,
      descripcion
    });

    producto.precio = precio;
    producto.stock = stock;
    producto.categoria = categoria;
    producto.descripcion = descripcion;
  }

  alert("Todos los cambios fueron guardados");
};

window.crearProducto = async function () {
  const nombre = $("nuevo-nombre").value.trim();
  const precio = Number($("nuevo-precio").value);
  const stock = Number($("nuevo-stock").value);
  const categoria = $("nuevo-categoria").value.trim();
  const descripcion = $("nuevo-descripcion").value.trim();

  if (!nombre) {
    alert("Ingrese un nombre");
    return;
  }

  const id = nombre.toLowerCase().replaceAll(" ", "");

  await setDoc(doc(db, "productos", id), {
    nombre,
    descripcion,
    precio,
    stock,
    categoria,
    imagenes: imagenesNuevoProducto,
    activo: true,
    destacado: false,
    fechaCreacion: Date.now()
  });

  alert("Producto creado");
  imagenesNuevoProducto = [];
  mostrarImagenesNuevoProducto();

  ["nuevo-nombre", "nuevo-precio", "nuevo-stock", "nuevo-categoria", "nuevo-descripcion", "nuevo-imagen", "nueva-url"].forEach((elementId) => {
    const element = $(elementId);
    if (element) element.value = "";
  });

  cargarProductos();
};

window.eliminarProducto = async function (id) {
  const confirmar = confirm("¿Eliminar este producto?");
  if (!confirmar) return;

  await deleteDoc(doc(db, "productos", id));
  productos = productos.filter((p) => p.id !== id);
  mostrarProductos();
  generarCategorias();

  alert("Producto eliminado");
};

function generarCategorias() {
  const filtros = $("filtros-admin");
  filtros.innerHTML = "";

  filtros.innerHTML += `
    <button type="button" class="${categoriaActual === "todos" ? "activo" : ""}" onclick="filtrarCategoria('todos', this)">Todos</button>
  `;

  const categorias = [...new Set(productos.map((p) => p.categoria).filter(Boolean))];
  categorias.forEach((categoria) => {
    filtros.innerHTML += `
      <button type="button" class="${categoriaActual === categoria ? "activo" : ""}" onclick="filtrarCategoria('${categoria}', this)">${categoria}</button>
    `;
  });
}

window.filtrarCategoria = function (categoria, boton) {
  categoriaActual = categoria;
  document.querySelectorAll("#filtros-admin button").forEach((btn) => btn.classList.remove("activo"));
  if (boton) boton.classList.add("activo");
  aplicarFiltros();
};

function aplicarFiltros() {
  const texto = $("buscador").value.toLowerCase();
  let lista = productos;
  if (categoriaActual !== "todos") {
    lista = lista.filter((p) => p.categoria === categoriaActual);
  }
  lista = lista.filter((p) => p.nombre.toLowerCase().includes(texto));
  mostrarProductos(lista);
}

window.toggleNuevoProducto = function () {
  const panel = $("nuevo-producto");
  panel.style.display = panel.style.display === "block" ? "none" : "block";
};

function mostrarImagenesNuevoProducto() {
  const lista = $("lista-imagenes");
  lista.innerHTML = "";

  imagenesNuevoProducto.forEach((url, indice) => {
    lista.innerHTML += `
      <div class="miniatura-imagen">
        <img src="${url}" alt="Imagen producto">
        <button type="button" onclick="eliminarImagenNueva(${indice})">🗑</button>
      </div>
    `;
  });
}

window.eliminarImagenNueva = function (indice) {
  imagenesNuevoProducto.splice(indice, 1);
  mostrarImagenesNuevoProducto();
};

window.agregarUrlImagen = function () {
  const url = $("nueva-url").value.trim();
  if (!url) return;
  imagenesNuevoProducto.push(url);
  $("nueva-url").value = "";
  mostrarImagenesNuevoProducto();
};

window.subirImagenCloudinary = async function () {
  const archivo = $("nuevo-imagen").files[0];
  if (!archivo) {
    alert("Seleccione una imagen");
    return;
  }
  const datos = new FormData();
  datos.append("file", archivo);
  datos.append("upload_preset", "chesed");

  const respuesta = await fetch("https://api.cloudinary.com/v1_1/nziuiskk/image/upload", {
    method: "POST",
    body: datos
  });
  const resultado = await respuesta.json();
  imagenesNuevoProducto.push(resultado.secure_url);
  $("nuevo-imagen").value = "";
  mostrarImagenesNuevoProducto();
};

window.toggleProducto = function (id) {
  const contenido = $("contenido-" + id);
  contenido.style.display = contenido.style.display === "block" ? "none" : "block";
};

$("buscador").addEventListener("input", aplicarFiltros);

cargarProductos();
