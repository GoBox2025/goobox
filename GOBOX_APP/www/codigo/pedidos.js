import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBB0GFK5FhyPsLXrZGIYCxNT47738DXK1o",
  authDomain: "goboxprueba.firebaseapp.com",
  projectId: "goboxprueba",
  storageBucket: "goboxprueba.appspot.com",
  messagingSenderId: "470323269250",
  appId: "1:470323269250:web:777b46cbea8d7260822e9b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let todosLosPedidos = [];

document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("contenedor-pedidos");

async function obtenerPedidos() {
    todosLosPedidos = []; // Resetear lista antes de cargar nuevos pedidos

    const pedidosSnapshot = await getDocs(collection(db, "pedido1"));
    pedidosSnapshot.forEach(docSnap => {
        console.log("✅ ID obtenido de Firestore:", docSnap.id); 

        const data = docSnap.data();
        todosLosPedidos.push({ id: docSnap.id, ...data });
    });

    console.log("✅ Lista de pedidos:", todosLosPedidos);
    renderPedidos(todosLosPedidos);
}

  function renderPedidos(lista = todosLosPedidos) {
    contenedor.innerHTML = "";
    if (lista.length === 0) {
      contenedor.innerHTML = "<p>No hay pedidos guardados.</p>";
      return;
    }

    const plantilla = document.getElementById("plantilla-tarjeta");
    lista.forEach(pedidoID => {
      const clone = plantilla.content.cloneNode(true);
      const tarjeta = clone.querySelector(".ordenar-tarjeta");
      tarjeta.setAttribute("data-id", pedidoID.id);

      tarjeta.addEventListener("click", () => {
    console.log("✅ ID del pedido antes de redirigir:", pedidoID.id);

    if (!pedidoID.id) {
        console.error(" Error: pedidoID.id está indefinido.");
        return; // Evita redirigir si el ID no está disponible
    }

    window.location.href = `DetallesParaLista.html?id=${pedidoID.id}`;
});
    

      clone.querySelector(".nombre-usuario").textContent = pedidoID.nombre || "Sin nombre";
      clone.querySelector(".profile-pic").src = "img/userDefect.png";
      clone.querySelector(".product-img").src = pedidoID.imagen_url || "img/caja.png";
      clone.querySelector(".detalles-pedido").textContent = pedidoID.descripcion || "Sin detalles";
      clone.querySelector(".tipo-pedido").textContent = pedidoID.producto || "-";
      clone.querySelector(".fecha-entrega").textContent = pedidoID.fecha_estimada || "-";
      clone.querySelector(".recoger-en").textContent = pedidoID.direccion_origen || "-";
      clone.querySelector(".entregar-en").textContent = pedidoID.direccion_destino || "-";
      clone.querySelector(".precio-pedido").textContent = pedidoID.costo || "0";

      
    

      contenedor.appendChild(clone);


     
    });
  }

  window.ordenarPorFecha = function (orden = "desc") {
    const ordenados = [...todosLosPedidos].sort((a, b) => {
      const fechaA = new Date(a.fecha_estimada);
      const fechaB = new Date(b.fecha_estimada);
      return orden === "asc" ? fechaA - fechaB : fechaB - fechaA;
    });
    renderPedidos(ordenados);
  };

  window.mostrarTodos = function () {
    renderPedidos(todosLosPedidos);
  };

  

  await obtenerPedidos();
});
