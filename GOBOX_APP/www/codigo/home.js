// Importar e inicializar Firebase App (módulo principal)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBB0GFK5FhyPsLXrZGIYCxNT47738DXK1o",
  authDomain: "goboxprueba.firebaseapp.com",
  projectId: "goboxprueba",
  storageBucket: "goboxprueba.appspot.com",
  messagingSenderId: "470323269250",
  appId: "1:470323269250:web:777b46cbea8d7260822e9b"
};
// Inicializar la app de Firebase con la configuración anterior
const app = initializeApp(firebaseConfig);

// Obtener instancia del servicio de autenticación
const auth = getAuth(app);

// Obtener instancia de la base de datos Firestore
const db = getFirestore(app);

// Obtener el contenedor del DOM donde se mostrarán los pedidos del usuario
const contenedorPedidos = document.getElementById("mis-pedidos");

// Función que se ejecuta cuando cambia el estado de autenticación del usuario (por ejemplo, si inicia o cierra sesión)
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Si hay un usuario autenticado, obtenemos su UID
    const uid = user.uid;

    // Referencia a la colección "pedido1" en Firestore
    const pedidosRef = collection(db, "pedido1");

    // Crear una consulta para obtener los pedidos donde el campo "usuarioId" coincide con el UID actual
    const consulta = query(pedidosRef, where("usuarioId", "==", uid));

    try {
      // Ejecutar la consulta
      const querySnapshot = await getDocs(consulta);

      // Si no hay pedidos, mostrar mensaje
      if (querySnapshot.empty) {
        contenedorPedidos.innerHTML = "<p>No tienes pedidos publicados.</p>";
        return;
      }

      // Si hay pedidos, recorrer cada uno
      querySnapshot.forEach((doc) => {
        const pedido = doc.data(); // Obtener los datos del pedido

        // Crear un contenedor visual (card) para mostrar la información del pedido
        const card = document.createElement("div");
        card.classList.add("pedido-card"); // Agregar clase CSS para estilo

        // Definir el contenido HTML de la card con los datos del pedido
        card.innerHTML = `
          <img src="${pedido.imagen_url}" alt="Imagen del producto" class="imagen-pedido" />
          <h3>Producto: ${pedido.producto}</h3>
          <p><strong>Descripción:</strong> ${pedido.descripcion}</p>
          <p><strong>Estado:</strong> ${pedido.estado}</p>
          <p><strong>Fecha estimada:</strong> ${pedido.fecha_estimada}</p>
        `;

        // Agregar la card al contenedor principal en la página
        contenedorPedidos.appendChild(card);
      });
    } catch (error) {
      // En caso de error al consultar los pedidos, mostrar mensaje en consola y en pantalla
      console.error("Error al cargar los pedidos:", error);
      contenedorPedidos.innerHTML = "<p>Error al cargar tus pedidos.</p>";
    }
  } else {
    // Si no hay usuario autenticado, mostrar mensaje pidiendo iniciar sesión
    contenedorPedidos.innerHTML = "<p>Inicia sesión para ver tus pedidos.</p>";
  }
});
