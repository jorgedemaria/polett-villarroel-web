<template>
  <section class="min-h-[65vh] flex items-center justify-center">
    <router-link to="/portafolio">
      <img
        src="/fotos/home.png"
        alt="Polett Villarroel"
        class="max-w-xs w-full h-auto transition-all duration-[1500ms] ease-out cursor-pointer hover:opacity-90"
        :class="visible ? 'opacity-100' : 'opacity-0'"
      />
    </router-link>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";

const visible = ref(false);

onMounted(() => {
  requestAnimationFrame(() => {
    visible.value = true;
  });
});
</script>
