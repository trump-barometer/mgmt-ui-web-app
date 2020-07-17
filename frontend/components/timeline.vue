<template>
  <div class="tile">
    <div
      v-observe-visibility="{
        callback: visibilityChanged,
        intersection: {
          rootMargin: '20px',
          threshold: 0.7,
        },
        once: true,
      }"
      class="title-bar hidden"
    >
      <h1>
        A glympse at Trump's tweets and their impact
      </h1>
      <div>
        <el-radio-group v-model="tweetFilter" class="btn-group" size="small">
          <el-radio-button label="All tweets"></el-radio-button>
          <el-radio-button label="Impactful"></el-radio-button>
        </el-radio-group>
        <el-select v-model="selectedIndice" placeholder="Index" size="small">
          <el-option
            v-for="item in indices"
            :key="item"
            :label="item"
            :value="item"
          >
          </el-option>
        </el-select>
      </div>
    </div>
    <div
      v-observe-visibility="{
        callback: visibilityChanged,
        intersection: {
          rootMargin: '20px',
        },
        once: true,
      }"
      class="split hidden"
    >
      <div class="tweets">
        <RecycleScroller
          v-slot="{ item }"
          class="scroller"
          :items="tweets"
          :item-size="256"
          key-field="id"
          page-mode
          :emit-update="true"
          @update="setVisibleTweets"
        >
          <div>
            <Tweet :item="item"></Tweet>
          </div>
        </RecycleScroller>
        <el-button
          v-loading="loading"
          v-observe-visibility="{
            callback: loadMoreData,
            throttle: 10000,
            throttleOptions: {
              leading: 'both',
            },
          }"
          class="loading-button"
        >
          Load more
        </el-button>
      </div>
      <div class="chart">
        <client-only>
          <v-chart :options="chartOptions" :autoresize="true"></v-chart>
        </client-only>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import ECharts from 'vue-echarts'
import 'echarts/lib/chart/line'
import { graphic } from 'echarts'
import moment from 'moment'
import Vue from 'vue'
import { ObserveVisibility } from 'vue-observe-visibility'
import { RecycleScroller } from 'vue-virtual-scroller'
import Tweet from '~/components/tweet.vue'
import { Tweet as TweetType } from '~/types/tweet'
import { Moment } from '~/node_modules/moment'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

Vue.component('v-chart', ECharts)
Vue.component('recycle-scroller', RecycleScroller)
Vue.directive('observe-visibility', ObserveVisibility)
export default {
  name: 'Timeline',
  components: { Tweet, RecycleScroller },
  data() {
    return {
      visibleTweets: null,
      tweetFilter: 'All tweets',
      selectedIndice: 'NDX',
      loading: false,
    }
  },
  computed: {
    indices(): string[] {
      return Object.keys((this as any).$store.state.stock.stockData)
    },
    tweets(): TweetType[] {
      const tweets = (this as any).$store.state.tweets.list as TweetType[]
      if ((this as any).tweetFilter === 'Impactful') {
        return tweets.filter((tweet) => tweet.impactful)
      } else {
        return tweets
      }
    },
    chartOptions(): any {
      const tweets = (this as any).tweets
      const visibleTweets = tweets.slice(
        (this as any).visibleTweets?.start || 0,
        (this as any).visibleTweets?.end || 0
      )
      let [from, to]: [Moment, Moment] = (this as any).getBounds(
        tweets,
        visibleTweets
      )
      const additionalBound = Math.max(to.diff(from) * 0.2, 40000000)
      from = (this as any).getNextQuarter(from.subtract(additionalBound), true)
      to = (this as any).getNextQuarter(to.add(additionalBound), false)
      const fromIso = from.toISOString()
      const toIso = to.toISOString()
      const stockData = (this as any).$store.state.stock.stockData[
        (this as any).selectedIndice
      ]
        .filter((value: any) => value.time >= fromIso && value.time <= toIso)
        .map((value: any) => [value.time, value.value])
      const chartVisibleTweets = tweets.filter(
        (tweet: TweetType) =>
          tweet.adjustedTime >= fromIso && tweet.adjustedTime <= toIso
      )
      return {
        grid: {
          left: 80,
          right: 20,
        },
        tooltip: {
          trigger: 'axis',
        },
        xAxis: {
          type: 'category',
          axisLabel: {
            formatter: (value: string) =>
              moment.utc(value).format('YYYY-MM-DD HH:mm'),
          },
          axisPointer: {
            label: {
              formatter: ({ value }: { value: string }) =>
                moment.utc(value).format('YYYY-MM-DD HH:mm'),
            },
          },
          boundaryGap: false,
          splitLine: {
            show: false,
          },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value} $',
          },
          axisPointer: {
            label: {
              formatter: '{value} $',
            },
          },
          splitLine: {
            show: false,
          },
          scale: true,
        },
        series: [
          {
            name: (this as any).selectedIndice,
            type: 'line',
            data: stockData,
            markPoint: {
              data: chartVisibleTweets.map((tweet: TweetType) => ({
                coord: [
                  tweet.adjustedTime,
                  (this as any).getStockValue(tweet.adjustedTime, stockData),
                ],
                value: tweet.id,
              })),
            },
            lineStyle: {
              color: 'rgb(0, 100, 128)',
            },
            itemStyle: {
              color: 'rgb(0, 100, 128)',
            },
            areaStyle: {
              color: new graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgb(0, 100, 128)',
                },
                {
                  offset: 1,
                  color: 'rgb(255, 255, 255)',
                },
              ]),
            },
          },
        ],
      }
    },
  },
  methods: {
    visibilityChanged(visible: boolean, entry: any): void {
      visible
        ? entry.target.classList.remove('hidden')
        : entry.target.classList.add('hidden')
    },
    loadMoreData(visible: boolean): void {
      if (visible && !(this as any).loading) {
        ;(this as any).loading = true
      }
    },
    getBounds(
      tweets: TweetType[],
      visibleTweets: TweetType[]
    ): [Moment, Moment] {
      if (!visibleTweets.length) {
        if (tweets.length) {
          return [
            moment(tweets[tweets.length - 1].time),
            moment(tweets[0].time),
          ]
        } else {
          return [moment(), moment()]
        }
      }
      return [
        moment.utc(visibleTweets[0].time),
        moment.utc(visibleTweets[visibleTweets.length - 1].time),
      ]
    },
    getNextQuarter(time: Moment, preferEarly: boolean) {
      const remainder = time.minute() % 15
      return time.add((preferEarly ? 0 : 15) - remainder, 'minutes')
    },
    getStockValue(adjustedTime: string, stockData: [string, number][]): number {
      return stockData.find(([time]) => time === adjustedTime)?.[1] || 0
    },
    setVisibleTweets(start: number, end: number) {
      Vue.set(this, 'visibleTweets', { start, end })
    },
  },
}
</script>

<style scoped>
.tile {
  color: #333;
}

.title-bar {
  transition: transform 0.5s 0.3s cubic-bezier(0, 0, 0.2, 1),
    opacity 0.5s 0.3s cubic-bezier(0, 0, 0.2, 1);
  position: sticky;
  top: 0;
  pointer-events: none;
  padding: 40px;
  margin: -40px -40px 0;
  background: rgb(255, 255, 255);
  background: linear-gradient(
    hsl(0, 0%, 100%) 50%,
    hsla(0, 0%, 100%, 0.738) 59.5%,
    hsla(0, 0%, 100%, 0.541) 67%,
    hsla(0, 0%, 100%, 0.382) 73.5%,
    hsla(0, 0%, 100%, 0.278) 78.25%,
    hsla(0, 0%, 100%, 0.194) 82.5%,
    hsla(0, 0%, 100%, 0.126) 86.5%,
    hsla(0, 0%, 100%, 0.075) 90.1%,
    hsla(0, 0%, 100%, 0.042) 93.05%,
    hsla(0, 0%, 100%, 0.021) 95.5%,
    hsla(0, 0%, 100%, 0.008) 97.6%,
    hsla(0, 0%, 100%, 0.002) 99.1%,
    hsla(0, 0%, 100%, 0) 100%
  );
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-bar > * {
  pointer-events: all;
}

.btn-group {
  margin-left: 20px;
}

h1 {
  margin: 0;
  color: #333333;
  text-shadow: 0 0 1px #ffffff;
}

.split {
  transition: transform 0.5s 0.5s cubic-bezier(0, 0, 0.2, 1),
    opacity 0.5s 0.5s cubic-bezier(0, 0, 0.2, 1);
}

.hidden {
  opacity: 0;
  transform: translateY(20px);
}

.tweet {
  margin-bottom: 16px;
}

.tweets {
  flex-basis: 600px;
}

.split {
  display: flex;
  justify-content: stretch;
}

.chart {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: sticky;
  top: 0;
  max-height: 100vh;
  margin-left: 40px;
}

.echarts {
  width: 100%;
  height: calc(100% - 200px);
}
</style>
