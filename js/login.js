
    // Configuración de Firebase
    const firebaseConfig = {
      apiKey: "AIzaSyCZwSmxDytJUAXZ3GtKNqtWK4GElsjtBWk",
      authDomain: "hidratatejs.firebaseapp.com",
      projectId: "hidratatejs",
      storageBucket: "hidratatejs.firebasestorage.app",
      messagingSenderId: "29314241796",
      appId: "1:29314241796:web:5562277f1bfdc4b1306c51"
    };

    // Inicializa Firebase
    const app = firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // Muestra el modal de error
    function showModal(message) {
      document.getElementById('modalMessage').textContent = message;
      const modal = new bootstrap.Modal(document.getElementById('errorModal'));
      modal.show();
    }

    // Función de login
    async function login() {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        // Usar Firebase Authentication para el login
        await auth.signInWithEmailAndPassword(email, password);
        window.location.href = "dashboard.html";  // Redirige al dashboard
      } catch (error) {
        console.error("Error al iniciar sesión: ", error);
        showModal("Usuario no registrado o contraseña incorrecta.");
      }
    }

    // Función de registro
    async function register() {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      if (!email || !password) {
        showModal("Por favor ingresa un email y una contraseña.");
        return;
      }

      try {
        // Usar Firebase Authentication para registrar el usuario
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);

        // Al registrar, se agrega a Firestore
        await db.collection("users").doc(userCredential.user.uid).set({
          email: email,
          password: password,
        });

        showModal("Usuario registrado correctamente. Ahora puede iniciar sesión.");
      } catch (error) {
        console.error("Error al registrar: ", error);
        showModal("Error al registrar. Intente nuevamente.");
      }
    }
