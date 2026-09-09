<template>
  <section class="pb-wrap">
    <div class="pb-book-area">
      <div
        v-if="!ready"
        class="loading-indicator"
        aria-label="Cargando portafolio"
      ></div>
      <div ref="hostEl" class="pb-book"></div>
    </div>

    <div class="pb-toolbar">
      <button class="pb-btn" @click="prev" :disabled="page <= 0">‹</button>
      <span class="pb-count">{{ page + 1 }} / {{ pageCount }}</span>
      <button class="pb-btn" @click="next" :disabled="page >= pageCount - 1">
        ›
      </button>
      <span class="pb-format">
        <router-link
          :to="{ path: '/portafolio-beta', query: { format: 'webp' } }"
          :class="{ active: format === 'webp' }"
        >
          webp
        </router-link>
        <span aria-hidden="true">·</span>
        <router-link
          :to="{ path: '/portafolio-beta', query: { format: 'png' } }"
          :class="{ active: format === 'png' }"
        >
          png
        </router-link>
      </span>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import { PageFlip } from "page-flip/dist/js/page-flip.module.js";

const TOTAL = 80;

const route = useRoute();
const format = computed(() => (route.query.format === "png" ? "png" : "webp"));

const hostEl = ref(null);
const page = ref(0);
const pageCount = ref(TOTAL);
const ready = ref(false);

let pageFlip = null;
let mountEl = null;
let readyFallback = null;
let resizeObserver = null;
let updateTimers = [];

function recalc() {
  // fuerza el recálculo de tamaño de StPageFlip (solo lo hace en su resize)
  if (pageFlip) window.dispatchEvent(new Event("resize"));
}

function scheduleUpdates() {
  updateTimers.forEach(clearTimeout);
  updateTimers = [50, 250, 600, 1200].map((ms) => window.setTimeout(recalc, ms));
}

// Modo HTML: cada página es un <img> real -> nitidez nativa (sin canvas
// reescalado, que era lo que degradaba la calidad en pantallas retina).
function buildPageElements() {
  return Array.from({ length: TOTAL }, (_, i) => {
    const n = String(i + 1).padStart(3, "0");
    const pageDiv = document.createElement("div");
    pageDiv.className = "pb-page";

    const img = document.createElement("img");
    img.src = `/portafolio-beta/${format.value}/${n}.${format.value}`;
    img.alt = `Página ${i + 1}`;
    img.draggable = false;
    img.loading = i < 4 ? "eager" : "lazy";

    pageDiv.appendChild(img);
    return pageDiv;
  });
}

function destroy() {
  if (readyFallback) {
    clearTimeout(readyFallback);
    readyFallback = null;
  }
  updateTimers.forEach(clearTimeout);
  updateTimers = [];
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (pageFlip) {
    try {
      pageFlip.destroy();
    } catch (e) {
      /* noop */
    }
    pageFlip = null;
  }
  if (hostEl.value) hostEl.value.innerHTML = "";
  mountEl = null;
}

async function build() {
  destroy();
  ready.value = false;
  await nextTick();
  if (!hostEl.value) return;

  // StPageFlip elimina del DOM el elemento que le pasamos al hacer destroy(),
  // así que montamos siempre sobre un hijo nuevo de un host estable.
  mountEl = document.createElement("div");
  hostEl.value.appendChild(mountEl);

  pageFlip = new PageFlip(mountEl, {
    width: 1071,
    height: 1500,
    size: "stretch",
    minWidth: 315,
    maxWidth: 620,
    minHeight: 441,
    maxHeight: 868,
    showCover: true,
    usePortrait: true,
    maxShadowOpacity: 0.5,
    mobileScrollSupport: false,
    flippingTime: 800,
    drawShadow: true,
  });

  pageFlip.on("flip", (e) => {
    page.value = e.data;
  });
  pageFlip.on("init", () => {
    pageCount.value = pageFlip.getPageCount() || TOTAL;
    ready.value = true;
  });

  pageFlip.loadFromHTML(buildPageElements());
  scheduleUpdates();

  if (window.ResizeObserver) {
    let first = true;
    resizeObserver = new ResizeObserver(() => {
      if (first) {
        first = false;
        return;
      }
      recalc();
    });
    resizeObserver.observe(hostEl.value);
  }

  readyFallback = window.setTimeout(() => {
    ready.value = true;
  }, 2500);
}

function next() {
  pageFlip && pageFlip.flipNext();
}
function prev() {
  pageFlip && pageFlip.flipPrev();
}
function onKey(e) {
  if (e.key === "ArrowRight") next();
  else if (e.key === "ArrowLeft") prev();
}

onMounted(() => {
  build();
  window.addEventListener("keydown", onKey);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKey);
  destroy();
});

watch(format, () => {
  page.value = 0;
  build();
});
</script>

<style scoped>
.pb-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0 2rem;
}

.pb-book-area {
  position: relative;
  width: 100%;
  max-width: 100%;
  min-height: 60vh;
  overflow: hidden;
}

.pb-book {
  width: 100%;
  min-width: 0;
  max-width: 1240px;
  margin: 0 auto;
}

.pb-toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #90a1b9;
}

.pb-btn {
  border: 1px solid #90a1b9;
  background: transparent;
  color: inherit;
  width: 1.75rem;
  height: 1.75rem;
  line-height: 1;
  border-radius: 999px;
  cursor: pointer;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
}

.pb-btn:hover:not(:disabled) {
  color: #000;
  border-color: #000;
}

.pb-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.pb-count {
  min-width: 4rem;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.pb-format {
  margin-left: 0.5rem;
  display: inline-flex;
  gap: 0.4rem;
}

.pb-format a {
  color: #90a1b9;
  text-decoration: none;
}

.pb-format a.active {
  color: #000;
  text-decoration: underline;
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
  animation: pb-spin 0.8s linear infinite;
}

@keyframes pb-spin {
  to {
    transform: rotate(360deg);
  }
}

/* StPageFlip inyecta su propio stylesheet para las clases .stf__* */
:deep(.stf__parent) {
  margin: 0 auto;
  max-width: 100%;
}

:deep(.pb-page) {
  background: #fff;
  overflow: hidden;
}

:deep(.pb-page img) {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: fill;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}
</style>
