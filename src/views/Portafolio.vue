<template>
  <section>
    <!-- Heyzine embed correcto -->
    <div class="heyzine-container">
      <div
        v-if="!isLoaded"
        class="loading-indicator"
        aria-label="Cargando portafolio"
      ></div>
      <iframe
        allowfullscreen="allowfullscreen"
        allow="autoplay; fullscreen; clipboard-write"
        scrolling="no"
        class="fp-iframe"
        style="border: 0px; width: 100%; height: 100%"
        src="https://heyzine.com/flip-book/536dfe8c26.html"
        title="Portafolio de Polett Villarroel"
        @load="isLoaded = true"
      ></iframe>
    </div>
  </section>
</template>

<script setup></script>
import { ref } from "vue";

const isLoaded = ref(false);

<style scoped>
.heyzine-container {
  width: 100%;
  position: relative;
  height: 75vh;
  overflow: hidden;
}
</style>
