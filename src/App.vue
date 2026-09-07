<template>
  <div class="min-h-screen flex flex-col">
    <header
      class="container flex justify-between items-center layout-element"
      :class="{ 'is-visible': layoutVisible }"
    >
      <nav class="space-x-6 text-sm">
        <router-link
          class="nav-link brand"
          :class="{ 'brand-home': route.path === '/' }"
          to="/"
        >
          polett villarroel
        </router-link>

        <router-link class="nav-link" to="/portafolio">
          portafolio
        </router-link>

        <router-link class="nav-link" to="/contacto"> @ </router-link>
      </nav>
    </header>

    <main class="container flex-1 w-full">
      <router-view />

      <!-- Embed de Heyzine persistente: se carga apenas se abre la web y
           solo se muestra en /portafolio (fuera de esa ruta queda aparcado
           fuera de pantalla, sin recargarse al navegar). Entra y sale con
           animación al navegar. -->
      <div
        class="heyzine-container"
        :class="{
          'heyzine-parked': !portafolioActive,
          'is-visible': portafolioVisible,
        }"
      >
        <div
          v-if="!heyzineLoaded"
          class="loading-indicator"
          aria-label="Cargando portafolio"
        ></div>
        <iframe
          allowfullscreen="allowfullscreen"
          allow="autoplay; fullscreen; clipboard-write"
          scrolling="no"
          class="fp-iframe"
          src="https://heyzine.com/flip-book/536dfe8c26.html"
          title="Portafolio de Polett Villarroel"
          @load="heyzineLoaded = true"
        ></iframe>
      </div>
    </main>

    <footer
      class="container w-full mt-auto pt-8 pb-4 text-right text-xs text-gray-400 max-sm:text-center max-sm:text-[10px] layout-element"
      :class="{ 'is-visible': layoutVisible }"
    >
      <span class="font-light">
        orilla estudio · arquitectura, patrimonio y territorio · 2026
      </span>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { layoutAnimated as layoutVisible } from "./utils/animationState";

const route = useRoute();
const heyzineLoaded = ref(false);

// --- animación de entrada del embed de portafolio (la salida es inmediata) ---
const portafolioActive = ref(route.path === "/portafolio"); // ocupa el layout
const portafolioVisible = ref(false); // controla opacidad / escala

function showPortafolio() {
  portafolioActive.value = true;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      portafolioVisible.value = true;
    });
  });
}

function hidePortafolio() {
  portafolioVisible.value = false;
  portafolioActive.value = false;
}

watch(
  () => route.path,
  (path) => {
    if (path === "/portafolio") showPortafolio();
    else if (portafolioActive.value) hidePortafolio();
  }
);

onMounted(() => {
  // precarga la foto de /contacto para que aparezca al instante al entrar
  const contactImg = new Image();
  contactImg.src = "/fotos/contacto.webp";

  if (route.path === "/portafolio") showPortafolio();

  if (!layoutVisible.value) {
    requestAnimationFrame(() => {
      layoutVisible.value = true;
    });
  }
});
</script>

<style>
.layout-element {
  opacity: 0;
  transform: scale(1.02);
  transition:
    opacity 1500ms ease-in-out,
    transform 1500ms ease-in-out;
  will-change: opacity, transform;
}

.layout-element.is-visible {
  opacity: 1;
  transform: scale(1);
}

/* HEYZINE */

.heyzine-container {
  width: 100%;
  position: relative;
  height: 75vh;
  overflow: hidden;
  opacity: 0;
  transform: scale(1.02);
  transition:
    opacity 650ms ease-in-out,
    transform 650ms ease-in-out;
  will-change: opacity, transform;
}

.heyzine-container.is-visible {
  opacity: 1;
  transform: scale(1);
}

/* fuera de /portafolio: se mantiene montado y cargado, pero fuera de vista */
.heyzine-container.heyzine-parked {
  position: fixed;
  left: -100vw;
  top: 0;
  pointer-events: none;
  opacity: 0;
}

.fp-iframe {
  border: 0;
  width: 100%;
  height: 100%;
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
  animation: heyzine-spin 0.8s linear infinite;
}

@keyframes heyzine-spin {
  to {
    transform: rotate(360deg);
  }
}

/* NAV */

.nav-link {
  color: inherit;
  text-decoration: none;
  position: relative;
  display: inline-block;
  padding-bottom: 4px;
  transition: color 0.2s ease;
}

.nav-link:not(.router-link-exact-active) {
  color: #90a1b9;
}

.nav-link:hover {
  color: #000;
}

.nav-link::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 100%;
  height: 2px;
  background: #90a1b9;
  transform: translateX(-50%) scaleX(0);
  transform-origin: center;
  transition: transform 0.06s ease;
}

.nav-link:hover::after {
  transition: transform 0.15s ease;
  transform: translateX(-50%) scaleX(1);
}

.nav-link.router-link-exact-active::after {
  transform: translateX(-50%) scaleX(1);
}

/* BRAND */

.brand {
  font-size: 0.875rem;
  font-weight: 600; /* semi bold */

  transition:
    font-size 300ms ease,
    color 200ms ease;
}

.brand-home {
  font-size: 1.2rem;
}
</style>
