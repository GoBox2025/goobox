// Cargar Leaflet desde CDN
const leafletCSS = document.createElement('link');
leafletCSS.rel = 'stylesheet';
leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
document.head.appendChild(leafletCSS);

const leafletScript = document.createElement('script');
leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
leafletScript.onload = initMap;
document.body.appendChild(leafletScript);

let map, markerA, markerB, polyline;

// Inicializar el mapa
function initMap() {
  map = L.map('map').setView([13.7, -89.2], 8);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);

  document.getElementById('direccion_origen').addEventListener('input', debounceUpdateMap);
  document.getElementById('direccion_destino').addEventListener('input', debounceUpdateMap);
}

// Debounce para evitar llamadas excesivas a la API
let debounceTimeout;
function debounceUpdateMap() {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(updateMap, 500);
}

// Validar que la ubicación esté en El Salvador o Estados Unidos
function validarUbicacion(direccion) {
  if (!direccion) return false;
  const paisPermitido = ["estados unidos", "el salvador"];
  return paisPermitido.some(pais => direccion.toLowerCase().includes(pais));
}

// Formato personalizado según país
function formatearDireccion(displayName) {
  const partes = displayName.split(',').map(p => p.trim());
  const pais = partes[partes.length - 1]?.toLowerCase();

  if (pais === "el salvador") {
    const colonia = partes[0];
    const ciudad = partes.length >= 3 ? partes[partes.length - 3] : "";
    return `${colonia} - ${ciudad} - El Salvador`;
  } else if (pais === "united states" || pais === "estados unidos") {
    const ciudad = partes[0];
    const estado = partes.length >= 3 ? partes[partes.length - 2] : "";
    return `${ciudad} - ${estado} - Estados Unidos`;
  }

  return displayName;
}

// Geocodificación
async function geocode(address) {
  if (!address) return null;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
    }
  } catch (error) {
    console.error('Error en geocoding:', error);
  }

  return null;
}

// Actualizar mapa
async function updateMap() {
  const addressA = document.getElementById('direccion_origen').value;
  const addressB = document.getElementById('direccion_destino').value;

  const coordA = await geocode(addressA);
  const coordB = await geocode(addressB);

  if (coordA && !validarUbicacion(coordA.display_name)) {
    alert("La dirección de origen debe estar en Estados Unidos o El Salvador.");
    return;
  }

  if (coordB && !validarUbicacion(coordB.display_name)) {
    alert("La dirección de destino debe estar en Estados Unidos o El Salvador.");
    return;
  }

  // Remover elementos anteriores
  if (markerA) map.removeLayer(markerA);
  if (markerB) map.removeLayer(markerB);
  if (polyline) map.removeLayer(polyline);

  // Marcador de origen
  if (coordA) {
    const formateadaA = formatearDireccion(coordA.display_name);
    markerA = L.marker([coordA.lat, coordA.lon]).addTo(map).bindPopup(formateadaA).openPopup();
    document.getElementById('direccion_origen').value = formateadaA;
  }

  // Marcador de destino
  if (coordB) {
    const formateadaB = formatearDireccion(coordB.display_name);
    markerB = L.marker([coordB.lat, coordB.lon]).addTo(map).bindPopup(formateadaB).openPopup();
    document.getElementById('direccion_destino').value = formateadaB;
  }

  // Dibujar línea entre ambos puntos
  if (coordA && coordB) {
    polyline = L.polyline(
      [
        [coordA.lat, coordA.lon],
        [coordB.lat, coordB.lon],
      ],
      { color: 'orange' }
    ).addTo(map);

    const group = new L.featureGroup([markerA, markerB]);
    map.fitBounds(group.getBounds().pad(0.5));
  } else if (coordA) {
    map.setView([coordA.lat, coordA.lon], 12);
  } else if (coordB) {
    map.setView([coordB.lat, coordB.lon], 12);
  }
}
