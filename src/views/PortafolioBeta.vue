<template>
  <section
    ref="wrapEl"
    class="pb-wrap"
    :class="{ 'is-visible': pageVisible, 'is-single': view === 'single' }"
  >
    <!-- vista página/pliego + zoom + pantalla completa + descargar: una sola
         fila normal (sin superponerse al libro): vista a la izquierda,
         zoom/pantalla completa/descargar a la derecha -->
    <div class="pb-controls">
      <div class="pb-controls-left">
        <button
          type="button"
          :class="{ active: view === 'single' }"
          @click="setView('single')"
        >
          página
        </button>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          :class="{ active: view === 'spread' }"
          @click="setView('spread')"
        >
          pliego
        </button>
      </div>

      <div class="pb-controls-right">
        <button
          class="pb-btn"
          @click="zoomOut"
          :disabled="zoom <= ZOOM_MIN"
          aria-label="Alejar"
        >
          −
        </button>
        <button
          type="button"
          class="pb-zoom-pct"
          @click="resetZoom"
          :disabled="zoom === 1"
          title="Restablecer zoom"
        >
          {{ Math.round(zoom * 100) }}%
        </button>
        <button
          class="pb-btn"
          @click="zoomIn"
          :disabled="zoom >= ZOOM_MAX"
          aria-label="Acercar"
        >
          +
        </button>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          class="pb-btn pb-btn-fs"
          @click="toggleFullscreen"
          :aria-label="isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'"
          :title="isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'"
        >
          <svg
            v-if="!isFullscreen"
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M8 3H5a2 2 0 0 0-2 2v3" />
            <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
            <path d="M3 16v3a2 2 0 0 0 2 2h3" />
            <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M8 3v3a2 2 0 0 1-2 2H3" />
            <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
            <path d="M3 16h3a2 2 0 0 1 2 2v3" />
            <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
          </svg>
        </button>
        <span aria-hidden="true">·</span>
        <a
          class="pb-btn pb-btn-download"
          href="/portafolio.pdf"
          download="polett-villarroel-portafolio.pdf"
          aria-label="Descargar portafolio en PDF"
          title="Descargar portafolio en PDF"
        >
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 3v12" />
            <path d="M7 10l5 5 5-5" />
            <path d="M4 19h16" />
          </svg>
        </a>
      </div>
    </div>

    <div
      class="pb-book-area"
      :class="{ 'is-zoomed': zoom > 1, 'is-loading': !ready }"
    >
      <div
        v-if="!ready"
        class="loading-indicator"
        aria-label="Cargando portafolio"
      ></div>
      <div
        ref="hostEl"
        class="pb-book"
        :class="[`deco-${bookDeco}`, { 'is-single': view === 'single' }]"
        :style="{ transform: `scale(${zoom})` }"
      ></div>
    </div>

    <div class="pb-toolbar">
      <button class="pb-btn" @click="prev" :disabled="page <= 0">‹</button>
      <span class="pb-count">{{ page + 1 }} / {{ pageCount }}</span>
      <button class="pb-btn" @click="next" :disabled="page >= pageCount - 1">
        ›
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { PageFlip } from "page-flip/dist/js/page-flip.module.js";
import {
  PORTAFOLIO_TOTAL,
  portafolioPageUrl,
  preloadPortafolioRest,
} from "../utils/portafolioPreload";
import { portafolioAnimated as pageVisible } from "../utils/animationState";

const VIEW_KEY = "pb-view-mode";
const EAGER_PAGES = 12; // el resto se cargan en diferido / vía precarga de fondo
// ancho CSS máx. por página según modo (súbelo para ver más detalle)
const MAX_PAGE_WIDTH = { spread: 620, single: 780 };
// en pantalla completa el libro debe crecer, no quedarse en el tamaño de
// escritorio normal
const MAX_PAGE_WIDTH_FULLSCREEN = { spread: 900, single: 1200 };
const ZOOM_MIN = 1;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.25;
const DESKTOP_QUERY = "(min-width: 768px)";

const wrapEl = ref(null);
const hostEl = ref(null);
const page = ref(0);
const pageCount = ref(PORTAFOLIO_TOTAL);
const ready = ref(false);
const view = ref(readInitialView()); // "single" | "spread"
const zoom = ref(1);
const isFullscreen = ref(false);

// qué zona del "libro" está visible, para colocar sombra + pila de hojas
const bookDeco = computed(() => {
  if (view.value === "single") return "single";
  if (page.value <= 0) return "cover"; // portada sola (mitad derecha)
  if (page.value >= pageCount.value - 1) return "back"; // contra sola (mitad izq.)
  return "full";
});

let pageFlip = null;
let mountEl = null;
let spineEl = null;
let readyFallback = null;
let resizeObserver = null;
let updateTimers = [];
let pendingJump = null;

// La sombra del lomo va DENTRO de .stf__block (mismo contexto de apilado que
// las páginas) con z-index entre la página en reposo (1) y la que voltea (5),
// así la hoja que gira pasa por encima de la sombra.
function updateSpine() {
  if (!spineEl) return;
  const show =
    view.value === "spread" &&
    page.value > 0 &&
    page.value < pageCount.value - 1;
  spineEl.style.display = show ? "" : "none";
}

function readInitialView() {
  try {
    const v = localStorage.getItem(VIEW_KEY);
    if (v === "single" || v === "spread") return v;
  } catch (e) {
    /* noop */
  }
  // por defecto: pliego en escritorio, 1 página en móvil
  const wide = typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches;
  return wide ? "spread" : "single";
}

function setView(v) {
  if (v === view.value) return;
  view.value = v;
  try {
    localStorage.setItem(VIEW_KEY, v);
  } catch (e) {
    /* noop */
  }
  pendingJump = page.value; // mantener la página actual al reconstruir
  build();
}

// si se está viendo "1 página" (típico en mobile) y la ventana crece hasta
// ancho de escritorio, pasa a "pliego" automáticamente
let desktopMql = null;
function onDesktopChange(e) {
  if (e.matches && view.value === "single") setView("spread");
}

function recalc() {
  // fuerza el recálculo de tamaño de StPageFlip (solo lo hace en su resize)
  if (pageFlip) window.dispatchEvent(new Event("resize"));
}

function scheduleUpdates() {
  updateTimers.forEach(clearTimeout);
  updateTimers = [50, 250, 600, 1200].map((ms) => window.setTimeout(recalc, ms));
}

// Modo HTML: cada página es un <img> real -> nitidez nativa (sin canvas
// reescalado, que degradaba la calidad en pantallas retina).
function buildPageElements() {
  return Array.from({ length: PORTAFOLIO_TOTAL }, (_, i) => {
    const pageDiv = document.createElement("div");
    pageDiv.className = "pb-page";

    const img = document.createElement("img");
    img.src = portafolioPageUrl(i);
    img.alt = `Página ${i + 1}`;
    img.draggable = false;
    img.decoding = "async";
    if (i >= EAGER_PAGES) img.loading = "lazy";

    pageDiv.appendChild(img);
    return pageDiv;
  });
}

function destroy() {
  if (readyFallback) {
    clearTimeout(readyFallback);
    readyFallback = null;
  }
  updateTimers.forEach(clearTimeout);
  updateTimers = [];
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (pageFlip) {
    try {
      pageFlip.destroy();
    } catch (e) {
      /* noop */
    }
    pageFlip = null;
  }
  if (mountEl && mountEl.parentNode) mountEl.remove();
  mountEl = null;
  spineEl = null;
}

async function build() {
  destroy();
  ready.value = false;
  await nextTick();
  if (!hostEl.value) return;

  // StPageFlip elimina del DOM el elemento que le pasamos al hacer destroy(),
  // así que montamos siempre sobre un hijo nuevo de un host estable.
  mountEl = document.createElement("div");
  hostEl.value.appendChild(mountEl);

  const single = view.value === "single";
  const widths = isFullscreen.value ? MAX_PAGE_WIDTH_FULLSCREEN : MAX_PAGE_WIDTH;

  pageFlip = new PageFlip(mountEl, {
    // width/height solo definen la proporción de página en modo "stretch"
    width: 1786,
    height: 2500,
    size: "stretch",
    usePortrait: single,
    // minWidth enorme en "1 página" fuerza página simple a cualquier ancho;
    // en "pliego" el valor normal decide 1/2 páginas según el ancho disponible
    minWidth: single ? 100000 : 315,
    maxWidth: single ? widths.single : widths.spread,
    minHeight: 441,
    maxHeight: 2000,
    showCover: true,
    maxShadowOpacity: 0.5,
    mobileScrollSupport: false,
    flippingTime: 800,
    drawShadow: true,
  });

  pageFlip.on("flip", (e) => {
    page.value = e.data;
    updateSpine();
  });
  pageFlip.on("init", () => {
    pageCount.value = pageFlip.getPageCount() || PORTAFOLIO_TOTAL;
    if (pendingJump != null) {
      try {
        pageFlip.turnToPage(pendingJump);
      } catch (e) {
        /* noop */
      }
      page.value = pendingJump;
      pendingJump = null;
    }
    updateSpine();
    ready.value = true;
  });

  pageFlip.loadFromHTML(buildPageElements());

  // deshacer el min-width/height inline que añade la librería tras loadFromHTML
  // (en "1 página" sería enorme y rompería el layout); la orientación ya está
  // decidida por el número que pasamos en `minWidth`, no por este estilo.
  mountEl.style.minWidth = "0px";
  mountEl.style.minHeight = "0px";

  // sombra del lomo dentro del contexto de apilado de las páginas
  const block = mountEl.querySelector(".stf__block");
  if (block && !single) {
    spineEl = document.createElement("div");
    spineEl.className = "pb-spine";
    block.appendChild(spineEl);
    updateSpine();
  }

  scheduleUpdates();

  if (window.ResizeObserver) {
    let first = true;
    resizeObserver = new ResizeObserver(() => {
      if (first) {
        first = false;
        return;
      }
      recalc();
    });
    resizeObserver.observe(hostEl.value);
  }

  readyFallback = window.setTimeout(() => {
    ready.value = true;
  }, 2500);
}

function next() {
  pageFlip && pageFlip.flipNext();
}
function prev() {
  pageFlip && pageFlip.flipPrev();
}
function onKey(e) {
  if (e.key === "ArrowRight") next();
  else if (e.key === "ArrowLeft") prev();
}

// --- zoom: escala visual vía CSS transform, no toca la geometría interna de
// StPageFlip (el área se vuelve scrolleable con overflow: auto) ---
function clampZoom(z) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));
}
function zoomIn() {
  zoom.value = clampZoom(Math.round((zoom.value + ZOOM_STEP) * 100) / 100);
}
function zoomOut() {
  zoom.value = clampZoom(Math.round((zoom.value - ZOOM_STEP) * 100) / 100);
}
function resetZoom() {
  zoom.value = 1;
}

// --- pantalla completa ---
function fsElement() {
  return (
    document.fullscreenElement || document.webkitFullscreenElement || null
  );
}

function onFullscreenChange() {
  isFullscreen.value = fsElement() === wrapEl.value;
  zoom.value = 1; // el ancho disponible cambia mucho al entrar/salir
  // maxWidth es un valor fijo al construir el PageFlip (no se puede cambiar
  // en caliente), así que hay que reconstruirlo para que el libro realmente
  // crezca al entrar a pantalla completa (y vuelva a achicarse al salir)
  pendingJump = page.value;
  build();
}

async function toggleFullscreen() {
  if (!wrapEl.value) return;
  try {
    if (!fsElement()) {
      const el = wrapEl.value;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } else if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  } catch (e) {
    /* el usuario canceló o el navegador lo bloqueó */
  }
}

onMounted(() => {
  preloadPortafolioRest(); // primeras páginas + resto en segundo plano
  build();
  window.addEventListener("keydown", onKey);
  document.addEventListener("fullscreenchange", onFullscreenChange);
  document.addEventListener("webkitfullscreenchange", onFullscreenChange);

  if (typeof window !== "undefined" && window.matchMedia) {
    desktopMql = window.matchMedia(DESKTOP_QUERY);
    if (desktopMql.addEventListener) {
      desktopMql.addEventListener("change", onDesktopChange);
    } else if (desktopMql.addListener) {
      desktopMql.addListener(onDesktopChange); // Safari viejo
    }
  }

  // animación de entrada de la página (una sola vez por sesión, como en Home)
  if (!pageVisible.value) {
    requestAnimationFrame(() => {
      pageVisible.value = true;
    });
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKey);
  document.removeEventListener("fullscreenchange", onFullscreenChange);
  document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
  if (desktopMql) {
    if (desktopMql.removeEventListener) {
      desktopMql.removeEventListener("change", onDesktopChange);
    } else if (desktopMql.removeListener) {
      desktopMql.removeListener(onDesktopChange);
    }
  }
  destroy();
});
</script>

<style scoped>
.pb-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  /* poco espacio arriba: el <main> ya trae su propio padding respecto al nav */
  padding: 0.75rem 0 1rem;
  overflow-x: clip; /* corta un posible sobreancho transitorio al montar */
  background: #fbfbfb; /* mismo fondo que el resto del sitio */
}

/* animación de entrada de la página, igual que la foto de /home */
.pb-wrap {
  opacity: 0;
  transform: scale(1.02);
  transition:
    opacity 1500ms ease-in-out,
    transform 1500ms ease-in-out;
  will-change: opacity, transform;
}

.pb-wrap.is-visible {
  opacity: 1;
  transform: scale(1);
}

/* pantalla completa: la propia API ya pone el elemento a tamaño de viewport;
   mantenemos el mismo fondo del sitio (la sombra del libro se sigue viendo),
   centramos todo y le damos bastante margen a los lados para que los
   controles no queden pegados al borde de la pantalla */
.pb-wrap:fullscreen,
.pb-wrap:-webkit-full-screen {
  justify-content: center;
  padding: 3rem clamp(1.5rem, 6vw, 6rem);
  background: #fbfbfb;
}

/* el libro debe crecer en pantalla completa, no quedarse en el tamaño de
   escritorio normal — estos valores deben coincidir con
   MAX_PAGE_WIDTH_FULLSCREEN (2× para el pliego, porque son dos páginas) */
.pb-wrap:fullscreen .pb-book,
.pb-wrap:-webkit-full-screen .pb-book {
  max-width: 1800px;
}
.pb-wrap:fullscreen .pb-book.is-single,
.pb-wrap:-webkit-full-screen .pb-book.is-single {
  max-width: 1200px;
}

/* los controles acompañan el ancho del libro en vez de estirarse hasta el
   borde real de la pantalla */
.pb-wrap:fullscreen .pb-controls,
.pb-wrap:-webkit-full-screen .pb-controls {
  width: 100%;
  max-width: 1800px;
  margin: 0 auto;
}
.pb-wrap.is-single:fullscreen .pb-controls,
.pb-wrap.is-single:-webkit-full-screen .pb-controls {
  max-width: 1200px;
}

.pb-book-area {
  position: relative;
  width: 100%;
  max-width: 100%;
  /* deja aire alrededor para la sombra y la pila de hojas */
  padding: 0 22px;
}

/* min-height solo mientras carga (para el spinner): una vez montado, el
   área toma la altura real del libro. Si quedara fija, en "pliego" dentro
   de una pantalla angosta (donde el pliego da páginas chicas) sobraba un
   hueco vacío pensado para "página" (más alta). */
.pb-book-area.is-loading {
  min-height: 52vh;
}

/* con zoom > 100% el área se vuelve scrolleable para poder pasear la página */
.pb-book-area.is-zoomed {
  overflow: auto;
  max-height: 78vh;
}

.pb-book {
  position: relative;
  width: 100%;
  min-width: 0;
  /* == 2 × MAX_PAGE_WIDTH.spread, para que el bloque de StPageFlip coincida
     exactamente con el rectángulo de páginas y la decoración calce */
  max-width: 1240px;
  margin: 0 auto;
  transform-origin: 50% 0%;
  transition: transform 0.18s ease;
}

/* vista de 1 página: == MAX_PAGE_WIDTH.single */
.pb-book.is-single {
  max-width: 780px;
}

/* ---- aspecto de libro: sombra + pila de hojas ---- */

.pb-book {
  /* pila de hojas: canto derecho e izquierdo por separado */
  --stack-right:
    3px 0 0 -1px #eceae4, 5px 0 0 -2px #f4f2ec, 7px 0 0 -3px #eceae4,
    9px 0 1px -3px rgba(0, 0, 0, 0.22);
  --stack-left:
    -3px 0 0 -1px #eceae4, -5px 0 0 -2px #f4f2ec, -7px 0 0 -3px #eceae4,
    -9px 0 1px -3px rgba(0, 0, 0, 0.22);
  --drop:
    0 16px 30px -14px rgba(0, 0, 0, 0.4), 0 6px 14px -10px rgba(0, 0, 0, 0.3);
}

/* sombra proyectada bajo el libro */
.pb-book::before {
  content: "";
  position: absolute;
  z-index: -2;
  inset: 0;
  box-shadow: var(--drop);
}

/* cantos de las hojas apiladas a los lados */
.pb-book::after {
  content: "";
  position: absolute;
  z-index: -1;
  inset: 0;
  pointer-events: none;
  border-radius: 1px;
  box-shadow: var(--stack-right), var(--stack-left);
}

/* portada sola: rectángulo de página = mitad derecha. Canto interior
   reducido a un pequeño lomo pegado al borde; la sombra proyectada se
   desplaza a la derecha para no invadir el vacío de la izquierda. */
.pb-book.deco-cover::before,
.pb-book.deco-cover::after {
  left: 50%;
}
.pb-book.deco-cover {
  /* pequeño lomo pegado al borde izquierdo de la portada */
  --stack-left:
    -2px 0 0 -1px #d4d0c6, -4px 0 0 -2px #e3dfd5,
    -6px 0 5px -3px rgba(0, 0, 0, 0.34);
  --drop:
    7px 18px 30px -14px rgba(0, 0, 0, 0.4),
    4px 7px 14px -10px rgba(0, 0, 0, 0.3);
}

/* contraportada sola: mitad izquierda, espejo */
.pb-book.deco-back::before,
.pb-book.deco-back::after {
  right: 50%;
}
.pb-book.deco-back {
  /* pequeño lomo pegado al borde derecho de la contraportada */
  --stack-right:
    2px 0 0 -1px #d4d0c6, 4px 0 0 -2px #e3dfd5,
    6px 0 5px -3px rgba(0, 0, 0, 0.34);
  --drop:
    -7px 18px 30px -14px rgba(0, 0, 0, 0.4),
    -4px 7px 14px -10px rgba(0, 0, 0, 0.3);
}

/* La portada / contraportada son páginas "hard" (rígidas). Ocultamos sus
   sombras de giro: StPageFlip las dibuja partidas en triángulos y aparecen
   como una mancha rota en el centro / mitad vacía. */
:deep(.stf__hardShadow),
:deep(.stf__hardInnerShadow) {
  display: none !important;
}

/* sombra del lomo — se inyecta dentro de .stf__block; z-index 4 la deja por
   encima de la página en reposo (1) y por debajo de la que voltea (5), así la
   hoja que gira pasa por encima */
:deep(.pb-spine) {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 52px;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 4;
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.1) 42%,
    rgba(0, 0, 0, 0.16) 50%,
    rgba(0, 0, 0, 0.1) 58%,
    rgba(0, 0, 0, 0) 100%
  );
}

.pb-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #90a1b9;
}

.pb-btn {
  border: 0;
  background: transparent;
  color: inherit;
  width: 1.75rem;
  height: 1.75rem;
  line-height: 1;
  cursor: pointer;
  transition: color 0.2s ease;
}

.pb-btn:hover:not(:disabled) {
  color: #000;
}

.pb-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.pb-count {
  min-width: 4rem;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

/* vista página/pliego + zoom + pantalla completa + descargar: una sola fila
   normal (sin fondo, sin superponerse al libro en ningún tamaño de
   pantalla) — vista a la izquierda, el resto a la derecha */
.pb-controls {
  align-self: stretch;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  color: #90a1b9;
  font-size: 0.75rem;
}

.pb-controls-left,
.pb-controls-right {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.pb-controls button {
  border: 0;
  padding: 0;
  background: none;
  font: inherit;
  color: #90a1b9;
  cursor: pointer;
  transition: color 0.2s ease;
}

.pb-controls button:hover:not(:disabled) {
  color: #000;
}

.pb-controls button.active {
  color: #000;
  text-decoration: underline;
}

.pb-zoom-pct {
  border: 0;
  background: none;
  font: inherit;
  font-size: 0.75rem;
  color: #90a1b9;
  cursor: pointer;
  min-width: 2.75rem;
  text-align: center;
  font-variant-numeric: tabular-nums;
  transition: color 0.2s ease;
}

.pb-zoom-pct:hover:not(:disabled) {
  color: #000;
}

.pb-zoom-pct:disabled {
  cursor: default;
}

.pb-btn-fs,
.pb-btn-download {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 28px;
  height: 28px;
  margin: -14px 0 0 -14px;
  border: 2px solid #90a1b9;
  border-top-color: transparent;
  border-radius: 50%;
  animation: pb-spin 0.8s linear infinite;
}

@keyframes pb-spin {
  to {
    transform: rotate(360deg);
  }
}

/* StPageFlip inyecta su propio stylesheet para las clases .stf__* */
:deep(.stf__parent) {
  margin: 0 auto;
  max-width: 100%;
}

:deep(.pb-page) {
  background: #fff;
  overflow: hidden;
}

:deep(.pb-page img) {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: fill;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}
</style>
