// ✅ FIREBASE CDN - INVCAS v4.0.0
// Firebase está disponible globalmente desde el CDN

// ✅ CREDENCIALES REALES DE FIREBASE - INVCAS v4.0.0
const firebaseConfig = {
  apiKey: "AIzaSyCq4F3oHl8RuYAFaFuDjmLx2OUenz8lA7k",
  authDomain: "invcas-v4.firebaseapp.com",
  projectId: "invcas-v4",
  storageBucket: "invcas-v4.firebasestorage.app",
  messagingSenderId: "765675004806",
  appId: "1:765675004806:web:93108473a3cea37e754207",
  measurementId: "G-6LLKGQ611W"
};

// Inicializar Firebase usando el global del CDN
const app = firebase.initializeApp(firebaseConfig);

// Inicializar Firestore (configuración simple)
export const db = firebase.firestore();

// Inicializar Auth con configuración mínima
export const auth = firebase.auth();

// Ignorar errores de configuración de Auth en producción
try {
  // Intentar configurar settings si está disponible
  if (typeof auth.settings === 'function') {
    auth.settings({ appVerificationDisabledForTesting: true });
  }
} catch (error) {
  // Ignorar errores - la app seguirá funcionando
}

export default app;
