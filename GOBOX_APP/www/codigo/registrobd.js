// Importar funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBB0GFK5FhyPsLXrZGIYCxNT47738DXK1o",
    authDomain: "goboxprueba.firebaseapp.com",
    projectId: "goboxprueba",
    storageBucket: "goboxprueba.firebasestorage.app",
    messagingSenderId: "470323269250",
    appId: "1:470323269250:web:777b46cbea8d7260822e9b"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para subir imagen a ImgBB y obtener URL
async function uploadToImgBB(imageFile) {
    const formData = new FormData();
    formData.append("image", imageFile);

    const res = await fetch("https://api.imgbb.com/1/upload?key=1404856594a8d1b1c9b941aae6004f22", {
        method: "POST",
        body: formData
    });

    const data = await res.json();
    return data.data.url;
}

// Evento del botón de envío
const enviar = document.getElementById('botonEnvio');
enviar.addEventListener("click", async function (event) {
    event.preventDefault();

    const nombre = document.getElementById('name').value;
    const contraseña = document.getElementById('password').value;
    const telefono = document.getElementById('phone').value;
    const correo = document.getElementById('email').value;
    const foto = document.getElementById('foto').files[0];
    let rol = "Comprador";

    const auth = getAuth();

    try {
        const credencial = await createUserWithEmailAndPassword(auth, correo, contraseña);
        const uid = credencial.user.uid;
        const idPersonal = Math.floor(10000 + Math.random() * 90000).toString();

        let fotoURL = "";
        if (foto) {
            fotoURL = await uploadToImgBB(foto);
        }

        await setDoc(doc(db, "users", idPersonal), {
            uid: uid,
            nombre: nombre,
            contraseña: contraseña,
            telefono: telefono,
            correo: correo,
            fotoURL: fotoURL,
            Rol: rol
        });

        alert("¡Su cuenta ha sido creada exitosamente!");
        window.location.href = "login.html";

    } catch (error) {
        const errorMessage = error.message;
        alert("Ocurrió un error al crear su cuenta: " + errorMessage);
    }
});

// Mostrar imagen seleccionada como vista previa
const inputFoto = document.getElementById("foto");
const imagenPreview = document.querySelector(".wer");

inputFoto.addEventListener("change", function () {
    const archivo = inputFoto.files[0];
    if (archivo) {
        const reader = new FileReader();
        reader.onload = function (e) {
            imagenPreview.src = e.target.result;
        };
        reader.readAsDataURL(archivo);
    }
});
