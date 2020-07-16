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
          threshold: 0.1,
        },
        once: true,
      }"
      class="split hidden"
    >
      <div class="tweets">
        <Tweet
          v-for="tweet in tweets"
          :key="tweet.id"
          v-observe-visibility="{
            callback: (...args) => tweetVisibilityChanged(...args, tweet.id),
            intersection: {
              rootMargin: '20px',
              threshold: 0.1,
            },
            throttle: 10000,
            throttleOptions: {
              leading: 'both',
            },
          }"
          :tweet="tweet"
          :show-id="true"
        ></Tweet>
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
import Tweet from '~/components/tweet.vue'
import { Tweet as TweetType } from '~/types/tweet'
import { Moment } from '~/node_modules/moment'

Vue.component('v-chart', ECharts)
Vue.directive('observe-visibility', ObserveVisibility)
export default {
  name: 'Timeline',
  components: { Tweet },
  data() {
    return {
      visibleTweets: [],
      tweetFilter: 'All tweets',
      selectedIndice: '^GDAXI',
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
      let [from, to]: [Moment, Moment] = (this as any).getBounds(
        tweets,
        (this as any).visibleTweets
      )
      const additionalBound = to.diff(from) * 0.2 || 100000000
      from = (this as any).getNextQuarter(from.subtract(additionalBound), true)
      to = (this as any).getNextQuarter(to.add(additionalBound), false)
      const fromIso = from.toISOString()
      const toIso = to.toISOString()
      const stockData = (this as any).$store.state.stock.stockData[
        (this as any).selectedIndice
      ]
        .filter((value: any) => value.time >= fromIso && value.time <= toIso)
        .map((value: any) => [value.time, value.value])
      const visibleTweetObjects = (this as any).visibleTweets
        .map((i: number) => tweets[i])
        .filter((tweet: TweetType) => !!tweet)
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
        },
        series: [
          {
            name: 'S&P 500',
            type: 'line',
            data: stockData,
            markPoint: {
              data: visibleTweetObjects.map((tweet: TweetType) => ({
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
  watch: {
    tweets(newValue: TweetType[]): void {
      Vue.set(
        this,
        'visibleTweets',
        (this as any).visibleTweets.filter((id: string) =>
          newValue.find((tweet) => tweet.id === id)
        )
      )
    },
  },
  methods: {
    visibilityChanged(visible: boolean, entry: any): void {
      visible
        ? entry.target.classList.remove('hidden')
        : entry.target.classList.add('hidden')
    },
    tweetVisibilityChanged(visible: boolean, _entry: any, id: string): void {
      if (visible && !(this as any).visibleTweets.includes(id)) {
        Vue.set(this, 'visibleTweets', [...(this as any).visibleTweets, id])
      } else if (!visible && (this as any).visibleTweets.includes(id)) {
        Vue.set(
          this,
          'visibleTweets',
          (this as any).visibleTweets.filter(
            (innerId: string) => innerId !== id
          )
        )
      }
    },
    getBounds(tweets: TweetType[], visibleTweets: string[]): [Moment, Moment] {
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
      const filteredMoments = tweets
        .filter((tweet) => visibleTweets.includes(tweet.id))
        .map((tweet) => moment(tweet.time))
      return [moment.min(filteredMoments), moment.max(filteredMoments)]
    },
    getNextQuarter(time: Moment, preferEarly: boolean) {
      const remainder = time.minute() % 15
      return time.add((preferEarly ? 0 : 15) - remainder, 'minutes')
    },
    getStockValue(adjustedTime: string, stockData: [string, number][]): number {
      return stockData.find(([time]) => time === adjustedTime)?.[1] || 0
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

.tweet:not(:last-child) {
  margin-bottom: 16px;
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
