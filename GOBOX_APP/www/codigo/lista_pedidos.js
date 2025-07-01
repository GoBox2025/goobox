import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBB0GFK5FhyPsLXrZGIYCxNT47738DXK1o",
  authDomain: "goboxprueba.firebaseapp.com",
  databaseURL: "https://goboxprueba-default-rtdb.firebaseio.com",
  projectId: "goboxprueba",
  storageBucket: "goboxprueba.appspot.com",
  messagingSenderId: "470323269250",
  appId: "1:470323269250:web:777b46cbea8d7260822e9b"
};

// Inicialización de Firebase y de los servicios necesarios (Firestore y Auth)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Variable para guardar el correo del usuario autenticado
let uidActual = null;

// Monitorea el estado de autenticación; si hay sesión activa, carga los pedidos, si no, redirige al login
onAuthStateChanged(auth, (user) => {
  if (user) {
    uidActual = user.email;
    cargarPedidos();
  } else {
    alert("Debes iniciar sesión para ver tus pedidos.");
    window.location.href = "/www/login.html";
  }
});

// Función principal que carga los pedidos filtrados según el estado y pertenencia al usuario autenticado
async function cargarPedidos(estadoFiltro = "todos") {
  const container = document.querySelector(".orders");
  container.innerHTML = "";

  const template = document.getElementById("pedido-template");
  const querySnapshot = await getDocs(collection(db, "pedido1"));

  querySnapshot.forEach((doc) => {
    const pedido = doc.data();

    // Verifica si el pedido es del usuario actual y cumple con el filtro
    if (
      pedido.tomadoPorViajero === uidActual &&
      (estadoFiltro === "todos" || pedido.estado === estadoFiltro)
    ) {
      const clone = template.content.cloneNode(true);
      const card = clone.querySelector(".order-card");
      card.dataset.status = pedido.estado;

      const imagen = pedido.imagen_url || "/www/img/caja.png";
      clone.querySelector(".product-img").src = imagen;
      clone.querySelector(".pedido-nombre").textContent = pedido.nombre;
      clone.querySelector(".pedido-estado").textContent = "Estado: " + pedido.estado;
      clone.querySelector(".pedido-fecha").textContent = "Fecha de entrega: " + pedido.fecha_estimada;
      clone.querySelector(".detalle-btn").onclick = () => verDetalle(doc.id);

      container.appendChild(clone);
    }
  });
}

// Evento para recargar pedidos cuando se cambia el filtro de estado
document.getElementById("filter-select").addEventListener("change", function () {
  const estadoSeleccionado = this.value;
  cargarPedidos(estadoSeleccionado);
});

// Función que redirige a la página de detalle del pedido, usando su ID en la URL
window.verDetalle = function (pedidoId) {
  window.location.href = `DetallesParaLista.html?id=${pedidoId}`;
};

