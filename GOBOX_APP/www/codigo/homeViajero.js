import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBB0GFK5FhyPsLXrZGIYCxNT47738DXK1o",
  authDomain: "goboxprueba.firebaseapp.com",
  projectId: "goboxprueba",
  storageBucket: "goboxprueba.firebasestorage.app",
  messagingSenderId: "470323269250",
  appId: "1:470323269250:web:777b46cbea8d7260822e9b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const tabla = document.getElementById("tablaPedidos").getElementsByTagName("tbody")[0];
let pedidosCargados = false;


// === Mostrar saludo con nombre ===
function mostrarSaludo() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    const usuarios = collection(db, "users");
    const querySnapshot = await getDocs(usuarios);
    querySnapshot.forEach((userDoc) => {
      const data = userDoc.data();
      if (data.uid === user.uid) {
        const saludoElem = document.getElementById("BienvenidaP");
        saludoElem.innerHTML = `
          <p style="font-size: 20px; margin-bottom: 0.1em;">Bienvenido/a, ${data.nombre} 👋</p>
          <br>
          <p style="font-size: 0.7em; margin: 0;">Cada viaje es una nueva oportunidad. Llena tu maleta con ganancias.</p>
        `;
      }
    });
  });
}

// FUNCION DE PROXIMO VIAJE
// === Normalizar fecha ===
function getFechaString(fecha) {
  if (typeof fecha === "string") return fecha.replace(/\./g, "-").trim();
  if (fecha?.toDate) return fecha.toDate().toISOString().split("T")[0];
  return null;
}

function cargarProximoViaje() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const viajesRef = collection(db, "Viajes");
    const hoy = new Date();
    const viajesFuturos = [];

    try {
      const snapshot = await getDocs(viajesRef);

      snapshot.forEach((doc) => {
        const data = doc.data();

        // Filtra solo viajes creados por el usuario
     if (data.viajeroId !== user.uid) return;

        const fechaStr = getFechaString(data.fechaViaje);
        const fechaObj = new Date(fechaStr);

        if (!fechaStr || isNaN(fechaObj)) return;

        if (fechaObj >= hoy) {
          viajesFuturos.push({
            id: doc.id,
            ...data,
            fechaViaje: fechaStr,
            horaViaje: data.horaViaje || "00:00"
          });
        }
      });

      // Ordenar y mostrar el más próximo
      viajesFuturos.sort((a, b) => new Date(a.fechaViaje) - new Date(b.fechaViaje));
      mostrarViajeProximo(viajesFuturos[0] || null);
    } catch (err) {
      console.error("Error al obtener los viajes:", err);
    }
  });
};

// === Mostrar próximo viaje ===
function mostrarViajeProximo(viaje) {
  const rutaElem = document.getElementById("viaje-ruta");
  const fechaElem = document.getElementById("viaje-fecha");

  if (!viaje) {
    rutaElem.textContent = "No hay viajes próximos.";
    fechaElem.textContent = "-";
    return;
  }

  const origen = `${viaje.ubicacionOrigen || "?"}, ${viaje.paisOrigen || "?"}`;
  const destino = `${viaje.ubicacionDestino || "?"}, ${viaje.paisDestino || "?"}`;

  const opcionesFecha = { day: 'numeric', month: 'long', year: 'numeric' };
  const fechaFormateada = new Date(viaje.fechaViaje).toLocaleDateString("es-ES", opcionesFecha);

  rutaElem.textContent = `Desde ${origen} a ${destino}`;
  fechaElem.textContent = `${fechaFormateada} a las ${viaje.horaViaje} horas E.S`;
}

document.addEventListener("DOMContentLoaded", cargarProximoViaje);



// Mostrar pedidos
async function mostrarPedidos() {
  onAuthStateChanged(auth, async (user) => {
    if (user && !pedidosCargados) {
      pedidosCargados = true;
      const querySnapshot = await getDocs(collection(db, "pedido1"));
      tabla.innerHTML = "";

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const fila = tabla.insertRow();
        fila.classList.add("fila-pedido");
        fila.setAttribute("data-nombre", data.nombre.toLowerCase());
        fila.setAttribute("data-id", doc.id);

        const estado = data.estado?.toLowerCase().trim();

       

        // Imagen
        const celdaFoto = fila.insertCell(0);
        const img = document.createElement("img");
        img.src = data.imagen_url || "/GOBOX_APP/www/img/caja.png"
        img.alt = "Foto del producto";
        img.style.width = "100px";
        img.style.height = "85px";
        img.style.borderRadius = "10px";
        celdaFoto.appendChild(img);

        // Datos
        const celda = document.createElement("td");
        celda.innerHTML =
          `<p><strong>Nombre:</strong> ${data.nombre}</p>
          <p style="line-height: 20px;"><strong>Dirección destino:</strong> ${data.direccion_destino || "-"}</p>
          <p><strong>Estado:</strong> ${data.estado}</p>`;
        fila.appendChild(celda);

        // Botón
        const buttonCell = fila.insertCell(2);
        buttonCell.id = "celdaBotones";
        const button = document.createElement("button");
        button.id = 'Detalles2';
        button.style.height = "82px";

        button.addEventListener("click", () => {
          const pedidoId = doc.id;
          window.location.href = `detallesviajero.html?id=${pedidoId}`;
        });

        const imgButton = document.createElement("img");
        imgButton.id = 'arrow2';
        imgButton.src = '/GOBOX_APP/www/img/ArrowRight.png';
        button.appendChild(imgButton);
        buttonCell.appendChild(button);

        const fila2 = tabla.insertRow();
        fila2.id = 'fila2';
        fila2.classList.add("fila-separadora");
        fila2.setAttribute("data-id", doc.id);

         if (estado === "tomado" || estado === "entregado exitosamente") {
          fila.style.display = "none";
          fila2.style.display = "none";
        };
      });

      if (tabla.rows.length === 0) {

        //llamar el div para insertar el mensaje dentro de el. y poner el parrafo
        document.querySelector(".listPedidos").innerHTML = "<br><p>Aún no has realizado pedidos.</p>";

        //llamar el div otra vez para que en otra linea se inserte la imagen (solo por decoración)

        const emptyBOX = document.querySelector(".listPedidos");

        //se crea la imagen
        const imgB = document.createElement("img");

        //se le añade su dirección
        imgB.src = '/HomePageComprador/imagene/caja.png';

        //asigno id para modificarlo desde css
        imgB.id = 'Cajavacia';

        //se le modifican sus propiedades para esterilizar mejor :)


        imgB.style.height = "130px";

        imgB.style.borderRadius = "10px";

        //se inserta dentro del DIV
        emptyBOX.appendChild(imgB);

        console.log(querySnapshot.size);
      }
    } else if (!user) {
      document.querySelector(".listPedidos").innerHTML = "<p>Debes iniciar sesión para ver los pedidos.</p>";
    }
    activarFiltroEnInput(); // SIN AUTOCOMPLETADO, SOLO FILTRO
  });
}

// Filtrado simple sin sugerencias
function activarFiltroEnInput() {
  const input = document.getElementById("busquedaProductos");
  input.addEventListener("input", function () {
    filtrarPedidos();
  });
}

// Filtra en base al texto escrito
function filtrarPedidos() {
  const filtro = document.getElementById("busquedaProductos").value.toLowerCase();
  const filas = tabla.querySelectorAll(".fila-pedido");

  filas.forEach(fila => {
    const pedidoId = fila.getAttribute("data-id");
    const filaSeparadora = document.querySelector(`.fila-separadora[data-id="${pedidoId}"]`);

    // Captura TODO el contenido visible de la fila (nombre, estado, fecha, etc.)
    const textoCompleto = fila.textContent.toLowerCase();

    const coincide = textoCompleto.includes(filtro);
    fila.style.display = coincide ? "" : "none";
    if (filaSeparadora) filaSeparadora.style.display = coincide ? "" : "none";
  });
}
// Función de inicialización
function inicializar() {
  mostrarSaludo();
  mostrarPedidos();
  cargarProximoViaje();

}

window.addEventListener("DOMContentLoaded", inicializar);
