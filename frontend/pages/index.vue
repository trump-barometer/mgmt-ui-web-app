<template>
  <div>
    <el-container>
      <trump-hero />
      <timeline />
    </el-container>
    <impress />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import TrumpHero from '~/components/trump-hero.vue'
import Timeline from '~/components/timeline.vue'
import Impress from '~/components/impress.vue'

export default Vue.extend({
  components: {
    Timeline,
    TrumpHero,
    Impress,
  },
  middleware: 'fill-data',
})
</script>

<style>
.tile {
  position: relative;
  width: 100%;
  min-height: 600px;
  flex-grow: 1;
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 40px;
}

.title {
  font-size: 18px;
  line-height: 1.5;
  align-self: center;
}

header {
  height: 61px !important;
  border-bottom: 1px solid #dcdfe6;
  background: #ffffff;
}

.el-container {
  display: block !important;
}

@media (max-width: 1023px) {
  .tile {
    padding: 40px 20px;
  }
}
</style>
