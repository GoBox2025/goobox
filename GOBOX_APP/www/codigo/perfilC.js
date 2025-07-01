import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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

// DOM Elements
const username = document.getElementById('username');
const useremail = document.getElementById('useremail');
const userphoto = document.getElementById('photo');
const userphone = document.getElementById('userphone');
const botonEdit = document.getElementById("change");
const select = document.getElementById("rolSelect");
const fechaNacimiento = document.getElementById("userFecha");
const SelectGender = document.getElementById("selectGenero");
const signOut = document.getElementById("logout");

// Variables globales para selects
let selectedValue = "";
let seleccion = "";

// Logout
signOut.addEventListener("click", async () => {
    if (confirm("¿Estás seguro de cerrar sesión?")) {
        try {
            await auth.signOut();
            window.location.href = "login.html";
        } catch (error) {
            console.error("Error cerrando sesión:", error);
        }
    }
});

// Mostrar perfil de usuario autenticado
async function mostrarPerfil() {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            console.error("No hay usuario autenticado.");
            return;
        }

        const uid = user.uid;
        const q = query(collection(db, "users"), where("uid", "==", uid));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.warn("No se encontró perfil para este usuario.");
            return;
        }

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();

            // Asignar valores al DOM
            username.value = data.nombre || "";
            useremail.textContent = data.correo || "";
            userphone.value = data.telefono || "";
            fechaNacimiento.value = data.FechaNacimiento || "";
            SelectGender.value = data.Genero || "Masculino";
            select.value = data.Rol || "Comprador";

            selectedValue = data.Genero || "Masculino";
            seleccion = data.Rol || "Comprador";

            // Renderizar foto
            userphoto.innerHTML = ""; // limpiar para evitar duplicados
            if (data.fotoURL) {
                const foto = document.createElement("img");
                foto.src = data.fotoURL;
                foto.alt = "Foto de perfil";
                foto.style.width = "130px";
                foto.style.height = "130px";
                foto.style.borderRadius = "80px";
                userphoto.appendChild(foto);
            }
        });
    });
}

// Cambiar a la interfaz de viajero
function rolcambio() {
    if (confirm("¿Estás seguro de cambiar a Viajero y empezar a ganar con GoBox?")) {
        window.location.href = "Home_viajero.html"; // Cambia esta ruta según tu estructura
    }
}

// Eventos de cambio de select
SelectGender.addEventListener("change", () => {
    selectedValue = SelectGender.value;
});
select.addEventListener("change", () => {
    seleccion = select.value;
});

// Habilitar inputs para edición
function habilitarInput() {
    console.log("Habilitando edición...");
    [username, userphone, fechaNacimiento, SelectGender, select].forEach(el => el.disabled = false);
    botonEdit.textContent = "Guardar";
}

// Guardar cambios en Firestore
async function Guardar() {
    const user = auth.currentUser;
    if (!user) return;

    const uid = user.uid;
    const q = query(collection(db, "users"), where("uid", "==", uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        alert("No se encontró tu perfil en la base de datos.");
        return;
    }

    const userDoc = snapshot.docs[0];
    const userRef = doc(db, "users", userDoc.id);

    const fecha = new Date(fechaNacimiento.value);
    const fechaISO = !isNaN(fecha.getTime()) ? fecha.toISOString().split("T")[0] : "2000-01-01";

    try {
        await updateDoc(userRef, {
            nombre: username.value,
            telefono: userphone.value,
            FechaNacimiento: fechaISO,
            Genero: selectedValue,
            Rol: seleccion
        });

       

        // Deshabilitar inputs
        [username, userphone, fechaNacimiento, SelectGender, select].forEach(el => el.disabled = true);
        botonEdit.textContent = "Editar";

        if (seleccion === "Viajero") rolcambio();

    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        alert("Hubo un error actualizando el perfil.");
    }
}

// Alternar entre editar y guardar
function editarP() {
    if (botonEdit.textContent.trim() === "Editar") {
        habilitarInput();
    } else {
        Guardar();
    }
}

botonEdit.addEventListener("click", editarP);
window.onload = mostrarPerfil;
