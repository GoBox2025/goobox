import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    doc, 
    getDoc,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// Llave Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBB0GFK5FhyPsLXrZGIYCxNT47738DXK1o",
    authDomain: "goboxprueba.firebaseapp.com",
    projectId: "goboxprueba",
    storageBucket: "goboxprueba.appspot.com",
    messagingSenderId: "470323269250",
    appId: "1:470323269250:web:777b46cbea8d7260822e9b"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ========= 1. LÓGICA DE LOS SELECTORES =========
document.addEventListener('DOMContentLoaded', () => {
  // Oculta todos los selectores condicionales al inicio
  document.querySelectorAll('.departamentosSV, .estadosUSA').forEach(el => el.style.display = 'none');

  // Asignar eventos a los selects de país
  document.getElementById('paisOrigen').addEventListener('change', function () {
    mostrarUbicacion('Origen', this.value);
  });

  document.getElementById('paisDestino').addEventListener('change', function () {
    mostrarUbicacion('Destino', this.value);
  });
});

// Muestra el selector correcto según el país
function mostrarUbicacion(tipo, pais) {
  const deptSV = document.getElementById(`departamentos${tipo}SV`);
  const estadosUSA = document.getElementById(`estados${tipo}USA`);

  deptSV.style.display = 'none';
  estadosUSA.style.display = 'none';

  if (pais === 'El Salvador') {
    deptSV.style.display = 'block';
  } else if (pais === 'Estados Unidos') {
    estadosUSA.style.display = 'block';
  }
}

// ========= 2. ENVÍO DE FORMULARIO A FIRESTORE =========
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('anadirViaje');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      alert("Debes iniciar sesión para registrar un viaje.");
      return;
    }

    // Obtener valores básicos
    const paisOrigen = document.getElementById('paisOrigen').value;
    const paisDestino = document.getElementById('paisDestino').value;
    const fechaViaje = document.getElementById('fechaDeViaje').value;

    // Obtener valores específicos de ubicación
    let ubicacionOrigen = '';
    if (paisOrigen === 'El Salvador') {
      ubicacionOrigen = document.getElementById('departamentosOrigenSV').value;
    } else if (paisOrigen === 'Estados Unidos') {
      ubicacionOrigen = document.getElementById('estadosOrigenUSA').value;
    }

    let ubicacionDestino = '';
    if (paisDestino === 'El Salvador') {
      ubicacionDestino = document.getElementById('departamentosDestinoSV').value;
    } else if (paisDestino === 'Estados Unidos') {
      ubicacionDestino = document.getElementById('estadosDestinoUSA').value;
    }

    // Validaciones
    if (!paisOrigen || !paisDestino) {
      alert('Por favor selecciona los países de origen y destino.');
      return;
    }

    if (!ubicacionOrigen || !ubicacionDestino) {
      alert('Por favor selecciona las ubicaciones específicas.');
      return;
    }

    if (!fechaViaje) {
      alert('Por favor selecciona la fecha del viaje.');
      return;
    }

    // Construcción de datos del viaje
    const viajeData = {
      paisOrigen,
      ubicacionOrigen,
      paisDestino,
      ubicacionDestino,
      fechaViaje,
      viajeroId: user.uid,
      nombre: user.displayName || "Usuario desconocido",
      correo: user.email,
      fecha_publicacion: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, "Viajes"), viajeData);
      alert("¡Viaje añadido con éxito!");
      form.reset();
      window.location.href = "viajes.html";
    } catch (error) {
      console.error("Error al añadir el viaje: ", error);
      alert("Error al añadir el viaje: " + error.message);
    }
  });
});
