// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  runTransaction,
  increment
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBB0GFK5FhyPsLXrZGIYCxNT47738DXK1o",
  authDomain: "goboxprueba.firebaseapp.com",
  projectId: "goboxprueba",
  storageBucket: "goboxprueba.appspot.com",
  messagingSenderId: "470323269250",
  appId: "1:470323269250:web:777b46cbea8d7260822e9b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Imagen
const inputImagen = document.getElementById('imagen');
const iconoRegistro = document.querySelector('.icono-registro');

iconoRegistro?.addEventListener('click', () => inputImagen?.click());

inputImagen?.addEventListener('change', (event) => {
  const archivo = event.target.files[0];
  if (archivo) {
    const lector = new FileReader();
    lector.onload = function (e) {
      const imagenPreview = iconoRegistro.querySelector('img');
      if (imagenPreview) imagenPreview.src = e.target.result;
    };
    lector.readAsDataURL(archivo);
  }
});

// ID incremental
async function obtenerSiguienteID() {
  const contadorRef = doc(db, "contadores", "pedido");
  try {
    const nuevoNumero = await runTransaction(db, async (transaction) => {
      const docContador = await transaction.get(contadorRef);
      if (!docContador.exists()) {
        transaction.set(contadorRef, { valor: 1 });
        return 1;
      }
      const valorActual = docContador.data().valor;
      transaction.update(contadorRef, { valor: increment(1) });
      return valorActual + 1;
    });
    return nuevoNumero;
  } catch (error) {
    console.error("Error al obtener ID:", error);
    throw error;
  }
}

// Validar país
function validarUbicacion(direccion) {
  if (!direccion) return false;
  const paisPermitido = ["estados unidos", "el salvador"];
  return paisPermitido.some(pais => direccion.toLowerCase().includes(pais));
}

// Publicar pedido
async function publicarPedido(event) {
  event.preventDefault();

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("Debes iniciar sesión para publicar un pedido.");
      return;
    }

    try {
      const uid = user.uid;
      const siguienteID = await obtenerSiguienteID();
      const idFormateado = siguienteID.toString().padStart(5, '0');

      const nombre = document.getElementById('nombre').value;
      const producto = document.getElementById('producto').value;
      const cantidad = document.getElementById('cantidad').value;
      const peso = document.getElementById('peso').value;
      const empaquetado = document.getElementById('empaquetado').value;
      const direccionOrigen = document.getElementById('direccion_origen').value;
      const direccionDestino = document.getElementById('direccion_destino').value;
      const descripcion = document.getElementById('descripcion').value;
      const costo = document.getElementById('costo').value;
      const fechaEstimada = document.getElementById('fecha_estimada').value;

      // Validación de ubicación
      if (!validarUbicacion(direccionOrigen) || !validarUbicacion(direccionDestino)) {
        alert("Las direcciones deben estar ubicadas en Estados Unidos o El Salvador.");
        return;
      }

      // Imagen
      const imagenArchivo = inputImagen.files[0];
      let imagenURL = "";
      if (imagenArchivo) {
        const formData = new FormData();
        formData.append("image", imagenArchivo);

        const respuesta = await fetch(`https://api.imgbb.com/1/upload?key=1404856594a8d1b1c9b941aae6004f22&name=Pedidos_${idFormateado}`, {
          method: "POST",
          body: formData
        });

        const resultado = await respuesta.json();
        if (resultado.success) {
          imagenURL = resultado.data.url;
        } else {
          throw new Error("Error al subir la imagen");
        }
      }

      const nuevoPedido = {
        id: idFormateado,
        usuarioId: uid,
        nombre,
        producto,
        cantidad,
        peso,
        empaquetado,
        direccion_origen: direccionOrigen,
        direccion_destino: direccionDestino,
        descripcion,
        costo,
        fecha_estimada: fechaEstimada,
        imagen_url: imagenURL,
        estado: "En espera",
        fecha_publicacion: new Date().toISOString()
      };

      await setDoc(doc(db, "pedido1", idFormateado), nuevoPedido);
      alert("¡Pedido publicado con éxito!");
      window.location.href = "Home_comprador.html";
    } catch (error) {
      console.error("Error al publicar el pedido:", error);
      alert("Hubo un error al publicar el pedido.");
    }
  });
}

document.querySelector('.formulario')?.addEventListener('submit', publicarPedido);
