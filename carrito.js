let carrito =
  JSON.parse(localStorage.getItem("carrito")) || {};

function guardarCarrito(){

  localStorage.setItem(
    "carrito",
    JSON.stringify(carrito)
  );

}

function agregarAlCarrito(producto, cantidad = 1){

  const id = producto.id;

  if(!carrito[id]){

    carrito[id] = {
      producto,
      cantidad: 0
    };

  }

  carrito[id].cantidad += cantidad;

  guardarCarrito();

  console.log("Carrito actualizado:", carrito);

}