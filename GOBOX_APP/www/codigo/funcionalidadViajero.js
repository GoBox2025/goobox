// Importaciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    doc,
    updateDoc,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// Configuración Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBB0GFK5FhyPsLXrZGIYCxNT47738DXK1o",
    authDomain: "goboxprueba.firebaseapp.com",
    projectId: "goboxprueba",
    storageBucket: "goboxprueba.firebasestorage.app",
    messagingSenderId: "470323269250",
    appId: "1:470323269250:web:777b46cbea8d7260822e9b",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Referencias a elementos HTML
const username = document.getElementById("username");
const useremail = document.getElementById("useremail");
const userphoto = document.getElementById("photo");
const userphone = document.getElementById("userphone");
const botonEdit = document.getElementById("change");
const selectRol = document.getElementById("rolSelect");
const fechaNacimiento = document.getElementById("userFecha");
const selectGenero = document.getElementById("selectGenero");
const signOut = document.getElementById("logout");

let selectedGenero = "";
let selectedRol = "";

// Función para cerrar sesión con confirmación
const cerrarSesion = async () => {
    try {
        let confirmacion = confirm("¿Estás seguro de cerrar sesión?");
        if (confirmacion) {
            await auth.signOut();
            window.location.href = "login.html";
        }
    } catch (error) {
        console.error("Error cerrando sesión:", error);
    }
};

// Asignar evento al botón cerrar sesión
signOut.addEventListener("click", cerrarSesion);

// Mostrar perfil del usuario autenticado
async function mostrarPerfil() {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            console.error("No hay usuario autenticado.");
            return;
        }

        const uid = user.uid;

        // Buscar datos del usuario en Firestore
        const q = query(collection(db, "users"), where("uid", "==", uid));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.error("No se encontró el perfil del usuario.");
            return;
        }

        // Obtener datos del primer documento encontrado
        const docData = querySnapshot.docs[0].data();

        // Mostrar datos en la interfaz
        username.innerText = docData.nombre || "";
        useremail.innerText = docData.correo || "";

        // Mostrar foto si existe
        userphoto.innerHTML = "";
        if (docData.fotoURL) {
            const img = document.createElement("img");
            img.src = docData.fotoURL;
            img.alt = "Foto de perfil";
            img.style.width = "130px";
            img.style.height = "130px";
            img.style.borderRadius = "80px";
            userphoto.appendChild(img);
        }

        userphone.value = docData.telefono || "";
        fechaNacimiento.value = docData.FechaNacimiento || "";
        selectGenero.value = docData.Genero || "Femenino";
        selectedGenero = selectGenero.value;
        selectRol.value = docData.Rol || "Comprador";
        selectedRol = selectRol.value;

        // Inicialmente deshabilitar edición en nombre (es un h2, no input)
        username.setAttribute("contenteditable", "false");
    });
}

// Confirmación para cambio de rol a Comprador
function rolcambio() {
    const confirmCambio = confirm(
        "¿Está seguro de cambiar a comprador y disfrutar de las mejores funcionalidades para pedir en GoBox?"
    );
    if (confirmCambio) {
        window.location.href = "Home_comprador.html";
    }
}

// Actualizar variables cuando cambia selección de género
selectGenero.addEventListener("change", () => {
    selectedGenero = selectGenero.value;
});

// Actualizar variable cuando cambia selección de rol
selectRol.addEventListener("change", () => {
    selectedRol = selectRol.value;
});

// Función para habilitar edición de los campos
function habilitarEdicion() {
    // Permitimos editar el nombre directamente (usando contenteditable)
    username.setAttribute("contenteditable", "true");
    username.focus();

    userphone.disabled = false;
    fechaNacimiento.disabled = false;
    selectGenero.disabled = false;
    selectRol.disabled = false;

    botonEdit.textContent = "GUARDAR";
}

// Función para deshabilitar edición
function deshabilitarEdicion() {
    username.setAttribute("contenteditable", "false");
    userphone.disabled = true;
    fechaNacimiento.disabled = true;
    selectGenero.disabled = true;
    selectRol.disabled = true;

    botonEdit.textContent = "EDITAR";
}

// Guardar los cambios realizados en Firestore
async function guardarCambios() {
    const user = auth.currentUser;
    if (!user) {
        alert("No hay usuario autenticado.");
        return;
    }

    const uid = user.uid;
    const q = query(collection(db, "users"), where("uid", "==", uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        alert("No se encontró tu perfil en la base de datos.");
        return;
    }

    const userDoc = querySnapshot.docs[0];
    const userRef = doc(db, "users", userDoc.id);

    // Validar y preparar datos para guardar
    const nombreEditado = username.innerText.trim();
    const telefonoEditado = userphone.value.trim();
    const fechaEditada = fechaNacimiento.value || "2000-01-01";
    const generoEditado = selectedGenero;
    const rolEditado = selectedRol;

    try {
        await updateDoc(userRef, {
            // nombre: nombreEditado,
            telefono: telefonoEditado,
            FechaNacimiento: fechaEditada,
            Genero: generoEditado,
            Rol: rolEditado,
        });

        alert("Tu perfil se editó correctamente");
        deshabilitarEdicion();

        // Si cambió el rol a Comprador, redirigir
        if (rolEditado === "Comprador") {
            rolcambio();
        }
    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        alert("Hubo un error al guardar los cambios.");
    }
}

// Función que controla el botón Editar/Guardar
function toggleEditarGuardar() {
    if (botonEdit.textContent.trim().toUpperCase() === "EDITAR") {
        habilitarEdicion();
    } else {
        guardarCambios();
    }
}

// Eventos
botonEdit.addEventListener("click", toggleEditarGuardar);

// Cargar perfil al inicio
window.onload = mostrarPerfil;
