// Importación de módulos de Firebase necesarios
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDOCAbC123dEf456GhI789jKl01-MnO",
    authDomain: "goboxprueba.firebaseapp.com",
    projectId: "goboxprueba",
    storageBucket: "goboxprueba.appspot.com",
    messagingSenderId: "470323269250",
    appId: "1:470323269250:web:a1b2c3d4e5f67890",
    measurementId: "G-ABC1234ABC"
};

// Inicializa la aplicación de Firebase y los servicios Firestore y Storage
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Extrae el ID del pedido desde la URL (?pedidoId=xxxxx)
const urlParams = new URLSearchParams(window.location.search);
const pedidoId = urlParams.get('pedidoId');
console.log("ID del Pedido recibido:", pedidoId);

// Si se encontró un ID en la URL, busca el documento correspondiente en Firestore
if (pedidoId) {
    const pedidoRef = doc(db, "pedido1", pedidoId);
    getDoc(pedidoRef).then((docSnapshot) => {
        if (docSnapshot.exists()) {
            const pedido = docSnapshot.data(); // Obtiene los datos del pedido
            mostrarPedido(pedido);             // Muestra los datos en los inputs
        } else {
            console.log("No se encontró el pedido.");
            alert("Este pedido no existe.");
        }
    }).catch((error) => {
        console.error("Error al obtener el pedido:", error);
        alert("Error al cargar el pedido.");
    });
} else {
    alert("No se ha proporcionado un ID de pedido.");
}

// Muestra los datos del pedido en el formulario
function mostrarPedido(pedido) {
    document.getElementById('nombre-pedido').value = pedido.nombre || 'No disponible';
    document.getElementById('producto-pedido').value = pedido.producto || 'No disponible';
    document.getElementById('cantidad-pedido').value = pedido.cantidad || 'No disponible';
    document.getElementById('peso-pedido').value = pedido.peso || 'No disponible';
    document.getElementById('empaquetado-pedido').value = pedido.empaquetado || 'No disponible';
    document.getElementById('direccion-origen-pedido').value = pedido.direccion_origen || 'No disponible';
    document.getElementById('direccion-destino-pedido').value = pedido.direccion_destino || 'No disponible';
    document.getElementById('descripcion-pedido').value = pedido.descripcion || 'No disponible';
    document.getElementById('costo-pedido').value = pedido.costo || '0';
    document.getElementById('fecha-estimada-pedido').value = pedido.fecha_estimada || 'No disponible';

    // Estado del pedido (solo lectura)
    const estadoPedido = document.getElementById('estado-pedido');
    estadoPedido.textContent = pedido.estado || 'No disponible';

    // Muestra la imagen del pedido si existe
    const imagenPedido = document.getElementById('imagen-pedido');
    if (pedido.imagen_url) {
        imagenPedido.src = pedido.imagen_url;
    } else {
        imagenPedido.alt = "Imagen no disponible";
    }
}

// Evento para guardar cambios cuando el usuario hace clic en "guardar-cambios"
document.getElementById('guardar-cambios').addEventListener('click', function () {
    // Obtiene los nuevos valores del formulario
    const nombre = document.getElementById('nombre-pedido').value;
    const producto = document.getElementById('producto-pedido').value;
    const cantidad = document.getElementById('cantidad-pedido').value;
    const peso = document.getElementById('peso-pedido').value;
    const empaquetado = document.getElementById('empaquetado-pedido').value;
    const direccionOrigen = document.getElementById('direccion-origen-pedido').value;
    const direccionDestino = document.getElementById('direccion-destino-pedido').value;
    const descripcion = document.getElementById('descripcion-pedido').value;
    const costo = document.getElementById('costo-pedido').value;
    const fechaEstimada = document.getElementById('fecha-estimada-pedido').value;
    const estado = document.getElementById('estado-pedido').textContent;

    const pedidoRef = doc(db, "pedido1", pedidoId);

    // Verifica si se seleccionó una nueva imagen para subir
    const inputImagen = document.getElementById('input-imagen');
    let nuevaImagenURL = null;

    if (inputImagen.files.length > 0) {
        const archivo = inputImagen.files[0];
        const imagenRef = ref(storage, 'images/' + archivo.name);
        const uploadTask = uploadBytesResumable(imagenRef, archivo);

        // Seguimiento del progreso de subida
        uploadTask.on('state_changed', (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Progreso de subida: ' + progress + '%');
        }, (error) => {
            console.log('Error al subir la imagen:', error);
            alert("Error al subir la imagen.");
        }, () => {
            // Cuando la imagen termina de subir, obtenemos la URL
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                nuevaImagenURL = downloadURL;
                console.log("Imagen subida correctamente, URL:", nuevaImagenURL);

                // Llama a la función para actualizar el pedido con la nueva imagen
                actualizarPedido(pedidoRef, nombre, producto, cantidad, peso, empaquetado, direccionOrigen, direccionDestino, descripcion, costo, fechaEstimada, estado, nuevaImagenURL);
            });
        });
    } else {
        // No se subió nueva imagen, actualiza solo los datos
        actualizarPedido(pedidoRef, nombre, producto, cantidad, peso, empaquetado, direccionOrigen, direccionDestino, descripcion, costo, fechaEstimada, estado);
    }
});

// Función para actualizar el pedido en Firestore
function actualizarPedido(pedidoRef, nombre, producto, cantidad, peso, empaquetado, direccionOrigen, direccionDestino, descripcion, costo, fechaEstimada, estado, nuevaImagenURL) {
    // Datos a actualizar
    const datosActualizados = {
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
        estado
    };

    // Si hay una nueva imagen, añade su URL al objeto
    if (nuevaImagenURL) {
        datosActualizados.imagen_url = nuevaImagenURL;
    }

    // Actualiza el documento en Firestore
    updateDoc(pedidoRef, datosActualizados)
        .then(() => {
            alert("Pedido actualizado exitosamente");
            // Redirige a la página de detalles del pedido
            window.location.href = `detallesC.html?id=${pedidoId}`;
        })
        .catch((error) => {
            console.error("Error al actualizar el pedido:", error);
            alert("Hubo un error al actualizar el pedido.");
        });
}

// Botón para marcar el pedido como entregado exitosamente
document.getElementById('marcar-entregado').addEventListener('click', async () => {
    if (!pedidoId) {
        alert("No se ha encontrado el ID del pedido.");
        return;
    }

    const pedidoRef = doc(db, "pedido1", pedidoId);

    try {
        // Cambia el estado a "Entregado Exitosamente"
        await updateDoc(pedidoRef, {
            estado: "Entregado Exitosamente"
        });
        alert("El pedido ha sido marcado como entregado exitosamente.");
        document.getElementById('estado-pedido').textContent = "Entregado exitosamente";
    } catch (error) {
        console.error("Error al actualizar el estado del pedido:", error);
        alert("No se pudo actualizar el estado.");
    }
});
