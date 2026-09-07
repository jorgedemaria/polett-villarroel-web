<template>
  <section class="flex flex-col md:flex-row gap-10">
    <div
      class="space-y-8 text-sm transition-all duration-[1500ms] ease-out"
      :class="visible ? 'opacity-100' : 'opacity-0'"
    >
      <div>
        <p class="text-lg">
          alejandra polett villarroel medina,
        </p>
        <p class="">madrid</p>
      </div>
      <div class=" ">
        <p>
          arquitecta /
          <span class="">universidad austral de chile</span>
        </p>
        <p>
          m. conservación y restauración del patrimonio arquitectónico /
          universidad política de madrid
        </p>
      </div>
      <div class="space-y-1">
        <p>
          <a
            href="tel:+34642116584"
            class=" hover:text-blue-500 transition"
          >
            tel: +34 642 11 65 84
          </a>
        </p>
        <p>
          <a
            href="mailto:polettvillarroel@gmail.com"
            class=" hover:text-blue-500 transition"
          >
            polettvillarroel@gmail.com
          </a>
        </p>
        <p>
            <a
            href="https://www.instagram.com/orillaestudio"
            target="_blank"
            rel="noopener noreferrer"
            class="underline hover:text-blue-500 transition"
          >
            instagram.com/orillaestudio
          </a>
        </p>
      </div>
    </div>
    <div
      class="md:ml-auto md:w-1/4 transition-all duration-[1500ms] ease-out delay-200"
      :class="visible ? 'opacity-100' : 'opacity-0'"
    >
      <img
        src="/fotos/contacto.webp"
        alt="Polett Villarroel"
        class="w-full h-full object-cover"
      />
    </div>
  </section>
</template>

<script setup>
import { onMounted } from "vue";
import { contactoAnimated as visible } from "../utils/animationState";

onMounted(() => {
  if (!visible.value) {
    requestAnimationFrame(() => {
      visible.value = true;
    });
  }
});
</script>

<style scoped></style>