<template>
  <div class="tile">
    <div v-lazy-container="{ selector: 'img' }" class="lazy-stretch">
      <img
        :src="require('~/assets/trump.jpg?lqip')"
        :data-src="require('~/assets/trump.jpg')"
        :data-loading="require('~/assets/trump.jpg?lqip')"
      />
    </div>
    <h1>
      The impact of covfefe and co.
    </h1>
    <p>How Donald Trump's tweets impact the stock markets.</p>
  </div>
</template>

<script>
export default {
  name: 'TrumpHero',
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
  transform: scale(1.05);
  transition: filter 0.5s ease-out, transform 0.5s ease-out;
}

.lazy-stretch > img[lazy='loaded'] {
  filter: blur(0);
  transform: scale(1);
}

h1 {
  font-size: 48px;
  animation: fade-in-text 1s cubic-bezier(0, 0, 0.2, 1);
}

p {
  animation: fade-in-text 1.1s cubic-bezier(0, 0, 0.2, 1);
}

@keyframes fade-in-text {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  50% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
