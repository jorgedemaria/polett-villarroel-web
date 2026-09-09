<template>
  <!--
    Ruta oculta (sin enlace en el nav): el portafolio activo en /portafolio
    es ahora PortafolioBeta.vue (flipbook propio). Este embed de Heyzine
    queda accesible por si hace falta volver a él, pero solo se monta y
    carga cuando se entra a esta ruta directamente.
  -->
  <section
    class="heyzine-container"
    :class="{ 'is-visible': visible }"
    aria-label="Portafolio de Polett Villarroel"
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
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";

const heyzineLoaded = ref(false);
const visible = ref(false);

onMounted(() => {
  requestAnimationFrame(() => {
    visible.value = true;
  });
});
</script>

<style scoped>
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
</style>
