import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    getDoc,
    updateDoc 
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

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

// Función para crear una notificación asociada a una oferta
async function crearNotificacionOferta(oferta) {
  const notificacionData = {
    correoViajero: oferta.correo,
    fechaEntrega: oferta.fechaEntrega,
    precio: oferta.precio,
    pedidoId: oferta.pedidoId,
    propietarioId: oferta.propietarioId,
    fecha: new Date().toISOString(),
    leida: false
  };
  await addDoc(collection(db, "notificaciones"), notificacionData);
}

// Lógica ejecutada una vez cargado el DOM
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const cancelButton = document.getElementById('bttnCancelarOferta');

  // Evento al enviar el formulario de oferta
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fechaRetiro = document.getElementById('textFechaRetiroPaq').value;
    const fechaEntrega = document.getElementById('textFechaEntregaPaq').value;
    const precio = document.getElementById('textPrecioEntregarPaq').value;

    const user = auth.currentUser;
    if (!user) {
      alert('Debes iniciar sesión para hacer una oferta.');
      return;
    }

    const uid = user.uid;
    const nombre = user.displayName || "Nombre no disponible";
    const correo = user.email;

    const params = new URLSearchParams(window.location.search);
    const pedidoId = params.get('id');
    if (!pedidoId) {
      alert("No se encontró el ID del pedido.");
      return;
    }

    const pedidoRef = doc(db, "pedido1", pedidoId);
    const pedidoSnap = await getDoc(pedidoRef);
    if (!pedidoSnap.exists()) {
      alert("El pedido no existe.");
      return;
    }

    const propietarioId = pedidoSnap.data().usuarioId;

    const ofertaData = {
      fechaRetiro,
      fechaEntrega,
      precio: parseFloat(precio),
      viajeroId: uid,
      nombre,
      correo,
      pedidoId,
      propietarioId,
      fecha_publicacion: new Date().toISOString()
    };

    await addDoc(collection(db, "HacerOferta"), ofertaData);
    await crearNotificacionOferta(ofertaData);

    try {
      await updateDoc(pedidoRef, { ofertado: true });
    } catch (error) {
      console.error("Error al actualizar el estado del pedido:", error);
      alert("Ocurrió un error actualizando el estado del pedido.");
      return;
    }

    alert('¡Oferta publicada con éxito!');
    form.reset();
    window.location.href = 'Home_viajero.html';
  });

  cancelButton.addEventListener('click', () => {
    form.reset();
  });
});
