import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";

// Configuración de Firebase
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
const auth = getAuth(app);

async function mostrarNotificaciones(usuarioId) {
  const contenedor = document.getElementById("notificaciones-container");
  contenedor.innerHTML = "";

  const notificacionesRef = collection(db, "notificaciones");
  const q = query(notificacionesRef, where("propietarioId", "==", usuarioId));
  const snapshot = await getDocs(q);

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const docId = docSnap.id;

    // Buscar nombre del viajero
    const usersRef = collection(db, "users");
    const userQuery = query(usersRef, where("correo", "==", data.correoViajero));
    const userSnapshot = await getDocs(userQuery);

    let nombreViajero = "Viajero desconocido";
    if (!userSnapshot.empty) {
      nombreViajero = userSnapshot.docs[0].data().nombre || nombreViajero;
    }

    // Buscar datos del pedido
    let detallesPedido = "";
    if (data.pedidoId) {
      const pedidoRef = query(collection(db, "pedido1"), where("id", "==", data.pedidoId));
      const pedidoSnapshot = await getDocs(pedidoRef);
      
      if (!pedidoSnapshot.empty) {
        const pedido = pedidoSnapshot.docs[0].data();
        detallesPedido = `
          <div class="pedido-info">
            <img src="${pedido.imagen_url}" alt="Imagen del pedido" width="100">
            <p><strong>Producto:</strong> ${pedido.producto}</p>
            <p><strong>Peso:</strong> ${pedido.peso} lb </p>
            <p><strong>Destino:</strong> ${pedido.direccion_destino}</p>
          </div>
        `;
      }
    }

    // Crear elemento de notificación
    const div = document.createElement("div");
    div.classList.add("notificacion");
    div.innerHTML = `
      <p><strong>${nombreViajero}</strong> te ofrece <strong>$${data.precio}</strong> para entregar tu paquete el <strong>${data.fechaEntrega}</strong></p>
      ${detallesPedido}
      <button class="aceptar">Aceptar</button>
      <button class="rechazar">Rechazar</button>
    `;

    // Acción aceptar
    div.querySelector(".aceptar").addEventListener("click", async () => {
      await updateDoc(doc(db, "notificaciones", docId), { leida: true });
      alert("Oferta aceptada.");
      window.open("https://www.paypal.com", "paypalWindow", "width=600,height=700");
      mostrarNotificaciones(usuarioId);
    });

    // Acción rechazar
    div.querySelector(".rechazar").addEventListener("click", async () => {
      await deleteDoc(doc(db, "notificaciones", docId));
      alert("Oferta rechazada.");
      mostrarNotificaciones(usuarioId);
    });

    contenedor.appendChild(div);
  }
}

// Escuchar sesión del usuario
onAuthStateChanged(auth, (user) => {
  if (user) {
    mostrarNotificaciones(user.uid);
  } else {
    alert("Debes iniciar sesión para ver tus notificaciones.");
    window.location.href = "/www/login.html";
  }
});
