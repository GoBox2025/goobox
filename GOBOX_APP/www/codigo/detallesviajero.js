// Importa las funciones necesarias desde los módulos de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

// Configuración de Firebase con las credenciales del proyecto
const firebaseConfig = {
  apiKey: "AIzaSyDOCAbC123dEf456GhI789jKl01-MnO",
  authDomain: "goboxprueba.firebaseapp.com",
  projectId: "goboxprueba",
  storageBucket: "goboxprueba.appspot.com",
  messagingSenderId: "470323269250",
  appId: "1:470323269250:web:a1b2c3d4e5f67890",
  measurementId: "G-ABC1234ABC"
};

// Inicializa la app de Firebase y obtiene una instancia de Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para obtener el ID del pedido desde los parámetros de la URL
function getPedidoId() {
  const params = new URLSearchParams(window.location.search);
  const idPedido = params.get("id");
  console.log("ID recibido:", idPedido);
  return idPedido;
}

// Función principal para mostrar los datos del pedido
async function mostrarPedido() {
  const idPedido = getPedidoId();
  if (!idPedido) {
    document.getElementById("pedido").textContent = "ID de pedido no especificado.";
    return;
  }

  // Referencia al documento del pedido en Firestore
  const docRef = doc(db, "pedido1", idPedido);
  const docSnap = await getDoc(docRef);

  // Verifica si el documento existe
  if (!docSnap.exists()) {
    document.getElementById("pedido").textContent = "No se encontró el pedido.";
    return;
  }

  // Extrae los datos del documento
  const data = docSnap.data();

  // Muestra los datos en los elementos HTML correspondientes
  document.getElementById("costo").textContent = `$ ${data.costo || "No especificado"}`;
  document.getElementById("tipo").textContent = ` ${data.producto || "No especificado"}`;
  document.getElementById("tipoEntrega").textContent = ` ${data.fecha_estimada|| "No especificado"}`;
  document.getElementById("entregarEn").textContent = ` ${data.direccion_destino || "No especificado"}`;
  document.getElementById("recogerEn").textContent = ` ${data.direccion_origen || "No especificado"}`;
  document.getElementById("peso").textContent = `${data.peso || "No especificado"} `;
  document.getElementById("tipoDeEmpaquetado").textContent = ` ${data.empaquetado || "No especificado"}`;
  document.getElementById("imagen-pedido").src = data.imagen_url || "";
  document.getElementById("pedido").textContent = data.producto || "No especificado";
  document.getElementById("cantidad").textContent = `${data.cantidad || "No especificado"}`;

  // Muestra el mapa con las direcciones
  mostrarMapa(data.direccion_origen, data.direccion_destino);

  // Busca el número de teléfono del usuario que hizo el pedido
  const compradorUID = data.usuarioId;
  const usersRef = collection(db, "users");
  const usersSnap = await getDocs(usersRef);
  let telefono = null;

  // Recorre los usuarios para encontrar el que coincide con el UID
  usersSnap.forEach(docUser => {
    const userData = docUser.data();
    if (userData.uid === compradorUID) {
      telefono = userData.telefono;
    }
  });

  // Si no se encuentra el teléfono, se muestra un mensaje en consola
  if (!telefono) {
    console.log("No se encontró el usuario con UID:", compradorUID);
    return;
  }

  // Asegura que el número tenga el código de país 503
  if (!telefono.startsWith("503")) {
    telefono = "503" + telefono;
  }

  // Crea el enlace de WhatsApp y lo asigna al botón
  const whatsappLink = `https://wa.me/${telefono}`;
  const boton = document.getElementById("botonWhatsApp");
  if (boton) {
    boton.onclick = () => window.open(whatsappLink, "_blank");
  }
}

// Función para redirigir a la página de hacer oferta
window.guardarCambios = function () {
  const pedidoId = getPedidoId();
  if (pedidoId) {
    window.location.href = `pant15vjerosHacerOferta.html?id=${pedidoId}`;
  } else {
    alert("No se encontró el ID del pedido.");
  }
};

// Función para mostrar un mapa con Leaflet usando direcciones de origen y destino
async function mostrarMapa(origen, destino) {
  const map = L.map('map').setView([13.7, -89.2], 6); // Vista inicial del mapa

  // Capa base del mapa usando OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);

  // Geocodifica las direcciones
  const coordA = await geocode(origen);
  const coordB = await geocode(destino);

  let markerA, markerB, polyline;

  // Agrega marcador para el origen
  if (coordA) {
    markerA = L.marker([coordA.lat, coordA.lon]).addTo(map).bindPopup("Origen").openPopup();
  }

  // Agrega marcador para el destino
  if (coordB) {
    markerB = L.marker([coordB.lat, coordB.lon]).addTo(map).bindPopup("Destino").openPopup();
  }

  // Dibuja una línea entre origen y destino si ambos existen
  if (coordA && coordB) {
    polyline = L.polyline(
      [
        [coordA.lat, coordA.lon],
        [coordB.lat, coordB.lon],
      ],
      { color: 'orange' }
    ).addTo(map);

    // Ajusta la vista del mapa para mostrar ambos puntos
    const group = new L.featureGroup([markerA, markerB]);
    map.fitBounds(group.getBounds().pad(0.5));
  } else if (coordA) {
    map.setView([coordA.lat, coordA.lon], 12);
  } else if (coordB) {
    map.setView([coordB.lat, coordB.lon], 12);
  }
}

// Función para obtener coordenadas geográficas a partir de una dirección usando Nominatim
async function geocode(address) {
  if (!address) return null;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    }
  } catch (error) {
    console.error('Error en geocoding:', error);
  }

  return null;
}

// Ejecuta la función mostrarPedido cuando la página se carga
window.onload = mostrarPedido;
