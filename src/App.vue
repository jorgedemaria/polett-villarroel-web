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
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { layoutAnimated as layoutVisible } from "./utils/animationState";
import { preloadPortafolioHead } from "./utils/portafolioPreload";

const route = useRoute();

onMounted(() => {
  // precarga la foto de /contacto para que aparezca al instante al entrar
  const contactImg = new Image();
  contactImg.src = "/fotos/contacto.webp";

  if (!layoutVisible.value) {
    requestAnimationFrame(() => {
      layoutVisible.value = true;
    });
  }

  // precarga las primeras páginas del flipbook cuando el navegador está ocioso,
  // para que /portafolio abra ya con las primeras en caché (el resto se
  // precarga al llegar a esa vista)
  const kickPreload = () => preloadPortafolioHead();
  if ("requestIdleCallback" in window) {
    requestIdleCallback(kickPreload, { timeout: 3000 });
  } else {
    setTimeout(kickPreload, 1500);
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
