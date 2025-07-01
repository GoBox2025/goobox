
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";


//se inicializa la llave de la aplicación
const firebaseConfig = {
    apiKey: "AIzaSyBB0GFK5FhyPsLXrZGIYCxNT47738DXK1o",
    authDomain: "goboxprueba.firebaseapp.com",
    projectId: "goboxprueba",
    storageBucket: "goboxprueba.firebasestorage.app",
    messagingSenderId: "470323269250",
    appId: "1:470323269250:web:777b46cbea8d7260822e9b"
};

//se inicializan los imports
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// Espera que el DOM  esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {

    //codigo para ver si la libreria de voiceflow esta disponible o no
    if (!window.voiceflow?.chat) {
        // Reintenta cada 200ms hasta que el script esté listo
        const esperarVF = setInterval(() => {
            if (window.voiceflow?.chat) {
                clearInterval(esperarVF); // Detiene el ciclo cuando Voiceflow está listo
                iniciarBoxBot();
            }
        }, 200);
    } else {
        // Si ya estaba disponible, simplemente comienza de inmediato
        iniciarBoxBot();
    }
});

function iniciarBoxBot() {
    //esta función permite obtener el usuario que ha iniciado sesión
    onAuthStateChanged(auth, async (user) => {
        //se verifica si el usuaria esta autenticado
        if (!user) {
            console.warn(" Usuario no autenticado. No se cargará el chatbot.");
            return;
        }

        try {
              // Referencia al documento del usuario en Firestore, usando su UID
            const ref = doc(db, "users", user.uid);

            const snap = await getDoc(ref); // Obtiene el documento

             // Si existe el documento, extrae los datos; si no, crea un objeto vacío
            const data = snap.exists() ? snap.data() : {};

            // Toma el nombre y correo del documento del usuario
            const name = data.name || user.displayName || "Viajero";
            const email = data.email || user.email || "";

            // Carga el chatbot de Voiceflow con los datos personalizados del usuario
            window.voiceflow.chat.load({
                verify: { projectID: '6830fec2df2dd5c17145e885' },
                url: 'https://general-runtime.voiceflow.com',
                versionID: "production",
                render: {
                    mode: "embedded",
                    target: document.getElementById("chat-container") //Es el div en donde se mostrara el chatbot en la pagina html
                },
                user: {
                    id: user.uid, // Identificador único del usuario
                    name,
                    email
                }
            });
        } catch (error) {
            //por si ocurre algun error
            console.error(" Error cargando datos del usuario:", error);
        }
    });
}