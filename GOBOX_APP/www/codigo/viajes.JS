import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBB0GFK5FhyPsLXrZGIYCxNT47738DXK1o",
  authDomain: "goboxprueba.firebaseapp.com",
  projectId: "goboxprueba",
  storageBucket: "goboxprueba.appspot.com",
  messagingSenderId: "470323269250",
  appId: "1:470323269250:web:777b46cbea8d7260822e9b"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);  // Firestore base de datos
const auth = getAuth(app);     // Autenticación

// Cargar viajes del usuario autenticado
async function cargarViajes(userId) {
  const viajesRef = collection(db, "Viajes");    
  const snapshot = await getDocs(viajesRef);       

  // Filtrar viajes que pertenezcan al usuario (viajeroId)
  const viajes = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(viaje => viaje.viajeroId === userId);

  mostrarViajes(viajes);
}

// Mostrar lista de viajes en el HTML
function mostrarViajes(lista) {
  const contenedor = document.querySelector(".lista-viaje");
  contenedor.innerHTML = "";  // Limpiar contenido previo

  lista.forEach((viaje) => {
    const div = document.createElement("div");
    div.className = "carta-viaje";
    div.innerHTML = `
      <h4>Origen: ${viaje.paisOrigen}, ${viaje.ubicacionOrigen}</h4>
      <h4>Destino: ${viaje.paisDestino}, ${viaje.ubicacionDestino}</h4>
      <p>Fecha de viaje: ${viaje.fechaViaje}</p>
      <button class="boton-borrar" onclick="borrarViaje('${viaje.id}')">
        <img src="img/basura.png" alt="Eliminar" class="icono-eliminar">
      </button>
    `;
    contenedor.appendChild(div);
  });
}

// Función global para borrar un viaje por id
window.borrarViaje = async function(id) {
  const confirmado = confirm("¿Está seguro de que desea borrar este viaje?");
  if (confirmado) {
    await deleteDoc(doc(db, "Viajes", id));  // Borra documento Firestore
    const user = auth.currentUser;
    if (user) cargarViajes(user.uid);        // Recargar lista de viajes
  }
}

// Al cargar la página, verificar usuario y cargar viajes
document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      cargarViajes(user.uid);
    } else {
      alert("Por favor inicia sesión para ver tus viajes.");
      window.location.href = "login.html";  // Redirigir si no está autenticado
    }
  });
});
