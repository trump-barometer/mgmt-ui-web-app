<template>
  <div class="tile">
    <div v-lazy-container="{ selector: 'img' }" class="lazy-stretch">
      <img
        :src="require('~/assets/trump.jpg?lqip')"
        :data-src="require('~/assets/trump.jpg')"
        :data-loading="require('~/assets/trump.jpg?lqip')"
      />
    </div>
    <h1
      v-observe-visibility="{
        callback: visibilityChanged,
        intersection: {
          rootMargin: '20px',
          threshold: 0.3,
          once: true,
        },
      }"
      class="hidden"
    >
      The impact of covfefe and co.
    </h1>
    <p
      v-observe-visibility="{
        callback: visibilityChanged,
        intersection: {
          rootMargin: '20px',
          threshold: 0.3,
          once: true,
        },
      }"
      class="hidden"
    >
      How Donald Trump's tweets impact the stock markets.
    </p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ObserveVisibility } from 'vue-observe-visibility'

Vue.directive('observe-visibility', ObserveVisibility)

export default {
  name: 'TrumpHero',
  methods: {
    visibilityChanged(visible: boolean, entry: any) {
      visible
        ? entry.target.classList.remove('hidden')
        : entry.target.classList.add('hidden')
    },
  },
}
</script>

<style scoped>
.tile {
  position: relative;
  width: 100%;
  height: calc(80vh - 120px);
  min-height: 600px;
  overflow: hidden !important;
  flex-grow: 1;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
}

.lazy-stretch {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  user-select: none;
}

.lazy-stretch > img {
  height: 100%;
  width: 100%;
  object-fit: cover;
  object-position: 65% 20%;
  filter: blur(25px);
  transform: scale(1.1);
  transition: filter 0.5s ease-out, transform 0.5s ease-out;
}

.lazy-stretch > img[lazy='loaded'] {
  filter: blur(0);
  transform: scale(1);
}

h1 {
  font-size: 48px;
}

h1,
p {
  transition: transform 0.5s 0.5s cubic-bezier(0, 0, 0.2, 1),
    opacity 0.5s 0.5s cubic-bezier(0, 0, 0.2, 1);
}

p {
  animation-delay: 0.6s;
}

h1.hidden,
p.hidden {
  opacity: 0;
  transform: translateY(20px);
}
</style>
