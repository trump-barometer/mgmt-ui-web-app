<template>
  <div class="impress">
    <el-button class="trigger" :class="{ expanded }" @click="toggleExpand">
      About us / Impress
    </el-button>
    <transition name="fade">
      <div v-show="expanded" class="impress-content">
        <el-button class="close" size="small" @click="toggleExpand">
          Close
        </el-button>
        <div class="impress-grid">
          <div>
            <h4>Impress (According to § 5 TMG)</h4>
            <p>
              Sven Schmeier<br />
              Alt-Moabit 91c<br />
              10559 Berlin<br />
              Telefon: +49-30-238 95-1815<br />
              E-Mail: sven@schmeier.com
            </p>
          </div>
          <div>
            <h4>About us</h4>
            <p>
              This analysis was conducted in 2020 within the lecture "Advanced
              Data Mining and Web Mining" at the Center for Advanced Studies of
              Baden-Wuerttemberg Cooperative State University (DHBW). The main
              goal was to research a correlation between Donald Trump's tweets
              and the stock market. We looked at a selection of general stock
              market indicators and multiple models to predict stock market
              changes on the tweets. The "Virtual Invest" data represents our
              backtesting mechanism where we do virtual trades based on our
              model's predictions.
            </p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import smoothReflow from 'vue-smooth-reflow'
export default {
  name: 'Impress',
  mixins: [smoothReflow],
  data() {
    return {
      expanded: false,
    }
  },
  mounted(): void {
    ;(this as any).$smoothReflow({
      transitionEvent: {
        selector: '.impress-content',
        propertyName: 'opacity',
      },
    })
  },
  methods: {
    toggleExpand() {
      ;(this as any).expanded = !(this as any).expanded
    },
  },
}
</script>

<style scoped>
.impress {
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  z-index: 2001;
  pointer-events: none;
  max-height: 100vh;
  overflow: auto;
  padding-top: 10px;
}
.trigger {
  display: inline-block;
  margin-right: 40px;
  margin-bottom: 40px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.9);
  pointer-events: all;
  transition: opacity 0.2s 0.2s;
  box-shadow: rgba(0, 0, 0, 0.3) 0 3px 10px;
}
.trigger.expanded {
  opacity: 0;
  transition: opacity 0.2s;
}
.impress-content {
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  pointer-events: all;
  padding: 40px;
  border-top: 1px solid #cccccc;
  position: relative;
  box-shadow: rgba(0, 0, 0, 0.1) 0 -3px 10px;
}
.impress-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 40px;
}
.close {
  position: absolute;
  right: 40px;
  top: 0;
  transform: translateY(-50%);
  box-shadow: rgba(0, 0, 0, 0.1) 0 -3px 10px;
}
.fade-leave-active {
  transition: opacity 0.2s ease-in;
}
.fade-leave-to {
  opacity: 0;
}
@media (max-width: 768px) {
  .impress-grid {
    display: grid;
    grid-template-columns: 1fr;
    grid-row-gap: 20px;
  }
  .trigger {
    margin-right: 20px;
    margin-bottom: 20px;
  }
  .close {
    right: 20px;
  }
  .impress-content {
    padding: 20px;
  }
}
</style>
