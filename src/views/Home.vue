<template>
  <section class="min-h-[65vh] flex items-center justify-center">
    <a href="/portafolio" @click.prevent="goToPortfolio">
      <img
        src="/fotos/homecolor.webp"
        alt="Polett Villarroel"
        class="home-image max-w-xs w-full h-auto cursor-pointer"
        :class="{ 'is-visible': visible, 'is-leaving': leaving }"
      />
    </a>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { homeAnimated as visible } from "../utils/animationState";

const router = useRouter();
const leaving = ref(false);

function goToPortfolio() {
  if (leaving.value) return;

  requestAnimationFrame(() => {
    leaving.value = true;
    window.setTimeout(() => {
      router.push("/portafolio");
    }, 450);
  });
}

onMounted(() => {
  if (!visible.value) {
    requestAnimationFrame(() => {
      visible.value = true;
    });
  }
});
</script>

<style scoped>
.home-image {
  opacity: 0;
  transform: scale(1);
  border: 2px solid #000;
  filter: grayscale(1);
  transition: opacity 1500ms ease-in-out, transform 1500ms ease-in-out,
    filter 700ms ease-out;
  will-change: opacity, transform;
}

.home-image.is-visible {
  opacity: 1;
}

.home-image:hover {
  filter: grayscale(0);
}

.home-image.is-leaving {
  opacity: 0;
  transform: scale(1.25);
  transition-duration: 450ms;
}
</style>
