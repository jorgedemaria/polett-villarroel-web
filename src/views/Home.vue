<template>
  <section class="min-h-[65vh] flex items-center justify-center">
    <router-link to="/portafolio">
      <img
        src="/fotos/home.webp"
        alt="Polett Villarroel"
        class="max-w-xs w-full h-auto transition-all duration-[1500ms] ease-out cursor-pointer hover:opacity-90"
        :class="visible ? 'opacity-100' : 'opacity-0'"
      />
    </router-link>
  </section>
</template>

<script setup>
import { onMounted } from "vue";
import { homeAnimated as visible } from "../utils/animationState";

onMounted(() => {
  if (!visible.value) {
    requestAnimationFrame(() => {
      visible.value = true;
    });
  }
});
</script>
