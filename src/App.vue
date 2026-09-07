<template>
  <div class="min-h-screen flex flex-col">
    <header class="container flex justify-between items-center">
      <nav class="space-x-6 text-sm">
        <router-link class="nav-link font-bold brand" to="/"
          >polett villarroel</router-link
        >
        <router-link class="nav-link" to="/portafolio">portafolio</router-link>
        <router-link class="nav-link" to="/contacto">@</router-link>
      </nav>
    </header>

    <main class="container flex-1 w-full">
      <router-view />
    </main>

    <footer
      class="container w-full mt-auto pt-8 pb-4 text-right text-xs text-gray-400"
    >
      orilla estudio · arquitectura, patrimonio y territorio · 2026
    </footer>
  </div>
</template>

<script setup></script>

<style>
.nav-link {
  color: inherit;
  text-decoration: none;
  position: relative;
  display: inline-block;
  padding-bottom: 4px;
}

.nav-link::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 100%;
  height: 2px;
  background: oklch(87.2% 0.01 258.338);
  transform: translateX(-50%) scaleX(0);
  transform-origin: center;
  transition: transform 0.06s ease;
}

.nav-link:hover::after {
  transition: transform 0.15s ease;
  transform: translateX(-50%) scaleX(1);
}

.nav-link.router-link-active {
  color: oklch(44.6% 0.043 257.281);
}

.nav-link.router-link-active::after {
  transform: translateX(-50%) scaleX(1);
}

.brand.router-link-active {
  color: inherit;
}

.brand::after {
  display: none;
}
</style>
