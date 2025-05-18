// firebase.js

// Importa solo si usas módulos (si no, usa los scripts CDN en HTML)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCZwSmxDytJUAXZ3GtKNqtWK4GElsjtBWk",
    authDomain: "hidratatejs.firebaseapp.com",
    projectId: "hidratatejs",
    storageBucket: "hidratatejs.firebasestorage.app",
    messagingSenderId: "29314241796",
    appId: "1:29314241796:web:5562277f1bfdc4b1306c51",
    measurementId: "G-6E22M5Z4T1"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

// Escuchar el estado de autenticación
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    console.log("Usuario logueado:", user.uid);
    cargarRegistros();
  } else {
    currentUser = null;
    console.log("Usuario no logueado");
    // Aquí podrías limpiar o mostrar que no hay datos cargados
  }
});

// Función para cargar registros del usuario actual desde Firestore
async function cargarRegistros() {
  if (!currentUser) return;

  const docRef = doc(db, "registrosHidratacion", currentUser.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();

    // Actualizamos las variables globales del app.js
    // Asumiendo que están en el scope global, si no hay que ajustar export/import
    window.registrosAgua = data.registrosAgua || [];
    window.registrosOrina = data.registrosOrina || [];

    // Actualizar UI con los datos cargados
    if (typeof window.renderizarRegistros === "function") {
      window.renderizarRegistros();
    }
  } else {
    console.log("No hay datos guardados para este usuario.");
    window.registrosAgua = [];
    window.registrosOrina = [];
    if (typeof window.renderizarRegistros === "function") {
      window.renderizarRegistros();
    }
  }
}

// Función para guardar registros en Firestore para el usuario actual
async function guardarRegistrosEnFirestore(registrosAgua, registrosOrina) {
  if (!currentUser) return;

  const docRef = doc(db, "registrosHidratacion", currentUser.uid);

  try {
    await setDoc(docRef, {
      registrosAgua,
      registrosOrina
    });
    console.log("Registros guardados en Firestore");
  } catch (error) {
    console.error("Error al guardar en Firestore:", error);
  }
}
