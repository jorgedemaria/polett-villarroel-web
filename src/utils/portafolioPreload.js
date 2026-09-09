// Precarga del portafolio (flipbook StPageFlip, ruta /portafolio). Las
// imágenes en sí siguen sirviéndose desde public/portafolio-beta/webp/ (el
// nombre de esa carpeta quedó del período de prueba, pero moverla implicaría
// re-subir ~50 MB de páginas sin necesidad real).
//
// Estrategia:
//  - al entrar a la web se precargan solo las primeras N páginas (ligero).
//  - el resto se precarga en segundo plano únicamente cuando el usuario
//    ya está en /portafolio, a baja concurrencia.
import { ref } from "vue";

export const PORTAFOLIO_TOTAL = 80;
export const PORTAFOLIO_HEAD = 10;

export const preloadLoaded = ref(0);
export const preloadDone = ref(false);

export function portafolioPageUrl(i) {
  // el set se nombra 01..09, 010..080 (prefijo "0" + número de página)
  return `/portafolio-beta/webp/0${i + 1}.webp`;
}

const phases = new Set();

function loadRange(from, to, concurrency) {
  let next = from;
  const one = () => {
    if (next >= to) return;
    const img = new Image();
    img.onload = img.onerror = () => {
      preloadLoaded.value += 1;
      if (preloadLoaded.value >= PORTAFOLIO_TOTAL) preloadDone.value = true;
      one();
    };
    img.src = portafolioPageUrl(next++);
  };
  for (let i = 0; i < concurrency; i++) one();
}

// Primeras páginas — se llama al entrar a la web (idle).
export function preloadPortafolioHead() {
  if (phases.has("head") || typeof window === "undefined") return;
  phases.add("head");
  loadRange(0, Math.min(PORTAFOLIO_HEAD, PORTAFOLIO_TOTAL), 5);
}

// Resto de páginas — se llama solo desde /portafolio.
export function preloadPortafolioRest() {
  if (phases.has("rest") || typeof window === "undefined") return;
  phases.add("rest");
  preloadPortafolioHead();
  loadRange(PORTAFOLIO_HEAD, PORTAFOLIO_TOTAL, 3);
}
