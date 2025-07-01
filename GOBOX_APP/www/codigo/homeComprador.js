// Importamos funciones para inicializar Firebase y usar Firestore y autenticación
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    onSnapshot,
    doc,
    deleteDoc,
    updateDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// Configuración con datos del proyecto Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBB0GFK5FhyPsLXrZGIYCxNT47738DXK1o",
    authDomain: "goboxprueba.firebaseapp.com",
    projectId: "goboxprueba",
    storageBucket: "goboxprueba.firebasestorage.app",
    messagingSenderId: "470323269250",
    appId: "1:470323269250:web:777b46cbea8d7260822e9b"
};

// Inicializamos Firebase y obtenemos referencias a Firestore y Auth
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Obtenemos referencia al cuerpo de la tabla de pedidos
const tabla = document.getElementById("tablaPedidos").getElementsByTagName("tbody")[0];

// URL de PayPal a donde redirigiremos al aceptar una oferta
const paypalLoginUrl = "https://www.paypal.com/signin";

// ------------------------- FUNCIÓN ACEPTAR OFERTA -------------------------
async function aceptarOferta(notificacionId) {
    try {
        const notiRef = doc(db, "notificaciones", notificacionId);
        const notiSnap = await getDoc(notiRef);

        if (!notiSnap.exists()) {
            alert("No se encontró la notificación.");
            return;
        }

        const notiData = notiSnap.data();
        const pedidoId = notiData.pedidoId;

        if (!pedidoId) {
            alert("No se encontró el ID del pedido asociado.");
            return;
        }

        const viajeroId = notiData.viajeroId || notiData.correoViajero || null;

        if (!viajeroId) {
            alert("No se encontró quién hizo la oferta.");
            return;
        }

        // Actualiza el estado del pedido y registra quién lo tomó
        await updateDoc(doc(db, "pedido1", pedidoId), {
            estado: "Tomado",
            tomadoPorViajero: viajeroId
        });

        // Borra la notificación ya que fue aceptada
        await deleteDoc(notiRef);

        alert("¡Oferta aceptada correctamente!");
        window.location.href = paypalLoginUrl; // Redirige a PayPal
    } catch (error) {
        console.error("Error al aceptar oferta:", error);
        alert("Ocurrió un error al aceptar la oferta.");
    }
}

// ------------------------- FUNCIÓN MOSTRAR SALUDO PERSONALIZADO -------------------------
async function mostrarSaludo() {
    onAuthStateChanged(auth, async (user) => {
        if (!user) return;

        const uid = user.uid;
        const usuarios = query(collection(db, "users"), where("uid", "==", uid));
        const querySnapshot = await getDocs(usuarios);

        querySnapshot.docs.forEach((userDoc) => {
            const data = userDoc.data();
            const saludo = document.getElementById("BienvenidaP");
            saludo.innerHTML = `Bienvenido ${data.nombre}, hoy es un gran día para que tu próximo paquete encuentre un destino.`;
        });
    });
}

// ------------------------- FUNCIÓN MOSTRAR PEDIDOS Y OFERTAS -------------------------
async function mostrarPedido() {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            console.error("No hay usuario autenticado.");
            return;
        }

        const uid = user.uid;

        // Consulta para detectar nuevas ofertas hechas al usuario (propietario del pedido)
        const notificacionesQuery = query(collection(db, "notificaciones"), where("propietarioId", "==", uid));

        // Para evitar mostrar notificaciones repetidas
        const notificacionesMostradas = new Set(JSON.parse(localStorage.getItem(`notificaciones_mostradas_${uid}`)) || []);

        // Escucha en tiempo real las notificaciones nuevas
        onSnapshot(notificacionesQuery, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const docId = change.doc.id;

                    if (notificacionesMostradas.has(docId)) return;

                    const data = change.doc.data();
                    const confirmar = confirm(
                        `¡Nueva oferta recibida!\nViajero: ${data.correoViajero || "Desconocido"}\nFecha entrega: ${data.fechaEntrega || "No especificada"}\nPrecio: $${data.precio || "0.00"}\n\n¿Quieres aceptarla ahora?`
                    );

                    if (confirmar) {
                        aceptarOferta(docId);
                    }

                    notificacionesMostradas.add(docId);
                    localStorage.setItem(`notificaciones_mostradas_${uid}`, JSON.stringify([...notificacionesMostradas]));
                }
            });
        });

        // Consulta para obtener los pedidos del usuario
        const pedidosUsuario = query(collection(db, "pedido1"), where("usuarioId", "==", uid));
        const querySnapshot = await getDocs(pedidosUsuario);
        tabla.innerHTML = ""; // Limpia la tabla antes de llenarla

        querySnapshot.docs.forEach((pedidoDoc) => {
            const data = pedidoDoc.data();

            const fila = tabla.insertRow(0);
            fila.classList = 'fila';

            // Celda con imagen del pedido
            const celdaFoto = fila.insertCell(0);
            const img = document.createElement("img");
            img.src = data.imagen_url;
            img.alt = "Foto de pedido";
            img.style.width = "100px";
            img.style.height = "90px";
            img.style.borderRadius = "10px";
            celdaFoto.appendChild(img);

            // Celda con nombre, estado y fecha estimada
            const celda = document.createElement('td');
            celda.innerHTML = `
                Nombre: ${data.nombre}<br><br>
                Estado: ${data.estado}<br><br>
                Fecha de entrega: ${data.fecha_estimada}
            `;
            fila.appendChild(celda);

            // Celda para botones
            const celdaBoton = fila.insertCell(2);
            celdaBoton.id = "celdaBotones";

            const button = document.createElement("button");     // Botón de detalles
            const button2 = document.createElement("button");    // Botón de eliminar
            button.id = 'Detalles';
            button2.id = 'colordelete';

            // Función para eliminar un pedido
            async function eliminarPedido(docId, fila, fila2) {
                let resultado = confirm("¿Está seguro de eliminar tu pedido?");
                if (!resultado) return;

                window.open("https://www.paypal.com", "paypalWindow", "width=600,height=700");

                try {
                    await deleteDoc(doc(db, "pedido1", docId));
                    fila.remove();
                    if (fila2) fila2.remove();
                } catch (error) {
                    console.error("Error al eliminar pedido:", error);
                    alert("Ocurrió un error al borrar el pedido");
                }
            }

            // Evento eliminar
            button2.addEventListener("click", () => {
                eliminarPedido(pedidoDoc.id, fila);
            });

            // Evento ver detalles
            button.addEventListener("click", () => {
                const pedidoId = pedidoDoc.id;
                window.location.href = `/GOBOX_APP/www/detallesC.html?pedidoId=${pedidoId}`;
            });

            // Icono para botón de detalles
            const imgButton = document.createElement("img");
            imgButton.id = 'arrow';
            imgButton.src = '/GOBOX_APP/www/img/ArrowRight.png';

            // Icono para botón de eliminar
            const imgdelete = document.createElement("img");
            imgdelete.src = '/GOBOX_APP/www/img/basura.png';
            imgdelete.style.height = "20px";
            imgdelete.id = 'Delete';

            button2.appendChild(imgdelete);
            button.appendChild(imgButton);

            celdaBoton.appendChild(button);
            celdaBoton.appendChild(button2);

            // Fila adicional vacía (quizás para diseño futuro)
            const fila2 = tabla.insertRow(0);
            fila2.id = 'fila2';
        });

        // Si no hay pedidos, mostramos mensaje e imagen de caja vacía
        if (querySnapshot.empty) {
            document.querySelector(".listPedidos").innerHTML = "<br><p>Aún no has realizado pedidos.</p>";
            const emptyBOX = document.querySelector(".listPedidos");
            const imgB = document.createElement("img");
            imgB.src = '/GOBOX_APP/www/img/caja.png';
            imgB.id = 'Cajavacia';
            imgB.style.height = "130px";
            imgB.style.borderRadius = "10px";
            emptyBOX.appendChild(imgB);
        }
    });
}

// ------------------------- EJECUTAR TODAS LAS FUNCIONES AL INICIO -------------------------
function AllFunctions() {
    mostrarSaludo();
    mostrarPedido();
}

// Ejecutamos todo al cargar la página
AllFunctions();
