import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBB0GFK5FhyPsLXrZGIYCxNT47738DXK1o",
  authDomain: "goboxprueba.firebaseapp.com",
  projectId: "goboxprueba",
  storageBucket: "goboxprueba.firebasestorage.app",
  messagingSenderId: "470323269250",
  appId: "1:470323269250:web:777b46cbea8d7260822e9b"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
  const loginEmailField = document.getElementById('loginEmail');
  const loginPasswordField = document.getElementById('loginPassword');
  const loginBtn = document.getElementById('botonLogin');

  loginBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = loginEmailField.value.trim();
    const password = loginPasswordField.value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);

      let userFound = null;

      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.uid === user.uid) {
          userFound = data;
        }
      });

      if (userFound) {
        const rol = userFound.Rol?.toLowerCase();
        if (rol === "viajero") {
          window.location.href = "Home_viajero.html";
        } else if (rol === "comprador") {
          window.location.href = "Home_comprador.html";
        } else {
          alert("Rol desconocido: " + userFound.Rol);
        }
      } else {
        alert("Usuario no encontrado en la colección 'users'.");
      }

    } catch (error) {
      alert("Error al iniciar sesión: " + error.message);
      console.error(error);
    }
  });
});
