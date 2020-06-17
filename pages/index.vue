<template>
  <el-container>
    <el-header>
      <el-row type="flex" justify="space-between">
        <span class="title">Trump Barometer</span>
        <el-menu mode="horizontal">
          <el-menu-item index="1">Start</el-menu-item>
          <el-menu-item index="2">Twitter Timeline</el-menu-item>
          <el-menu-item index="3">Impress</el-menu-item>
        </el-menu>
      </el-row>
    </el-header>
    <trump-hero />
    <el-footer>
      Footer
    </el-footer>
  </el-container>
</template>

<script lang="ts">
import Vue from 'vue'
import TrumpHero from '~/components/trump-hero.vue'

export default Vue.extend({
  components: {
    TrumpHero,
  },
})
</script>

<style>
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
  min-height: 100vh;
}
</style>
