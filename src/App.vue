<template>
  <div>
    <header class="container flex justify-between items-center">
      <nav class="space-x-6 text-sm">
        <router-link class="nav-link font-bold brand" to="/"
          >polett villarroel</router-link
        >
        <router-link class="nav-link" to="/portafolio">portafolio</router-link>
        <router-link class="nav-link" to="/contacto">@</router-link>
      </nav>
    </header>

    <main class="container">
      <router-view />
    </main>
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
  background: #3b82f6;
  transform: translateX(-50%) scaleX(0);
  transform-origin: center;
  transition: transform 0.06s ease;
}

.nav-link:hover::after {
  transition: transform 0.15s ease;
  transform: translateX(-50%) scaleX(1);
}

.nav-link.router-link-active {
  color: #3b82f6;
}

.nav-link.router-link-active::after {
  transform: translateX(-50%) scaleX(1);
}

.brand.router-link-active {
  color: inherit;
}

.brand.router-link-active::after {
  background: transparent;
}
</style>
