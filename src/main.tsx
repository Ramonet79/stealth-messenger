
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Asegurar que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById("root");
  if (root) {
    createRoot(root).render(<App />);
  } else {
    console.error("No se encontró el elemento root para renderizar la aplicación");
  }
});
