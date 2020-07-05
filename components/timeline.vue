<template>
  <div class="tile">
    <h1
      v-observe-visibility="{
        callback: visibilityChanged,
        intersection: {
          rootMargin: '20px',
          threshold: 0.7,
        },
        once: true,
      }"
      class="hidden"
    >
      A glympse at Trump's tweets and their impact {{ visibleTweets }}
    </h1>
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
import { Moment } from '~/node_modules/moment'
interface Tweet {
  time: string
  text: string
  id: string
}

Vue.component('v-chart', ECharts)
Vue.directive('observe-visibility', ObserveVisibility)
export default {
  name: 'Timeline',
  components: { Tweet },
  data() {
    return {
      visibleTweets: [],
    }
  },
  computed: {
    tweets(): Tweet[] {
      return (this as any).$store.state.tweets.list
    },
    chartOptions(): any {
      const tweets = (this as any).$store.state.tweets.list
      const [from, to] = (this as any).getBounds(
        tweets,
        (this as any).visibleTweets
      )
      const fromMoment = moment(from)
      const toMoment = moment(to)
      const additionalBound = toMoment.diff(fromMoment) * 0.2 || 100000000
      return {
        title: {
          text: 'S&P 500',
          subtext: 'Stock data by NYSE',
        },
        tooltip: {
          trigger: 'axis',
        },
        dataZoom: [
          {
            type: 'inside',
            startValue: fromMoment.subtract(additionalBound).toISOString(),
            endValue: toMoment.add(additionalBound).toISOString(),
          },
          {},
        ],
        xAxis: {
          type: 'time',
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
            data: [
              ['2020-06-17T10:22:33Z', 11],
              ['2020-06-17T11:27:33Z', 11],
              ['2020-06-17T12:22:33Z', 15],
              ['2020-06-17T13:22:33Z', 13],
              ['2020-06-17T14:22:33Z', 12],
              ['2020-06-17T15:22:33Z', 11],
              ['2020-06-17T16:22:33Z', 14],
              ['2020-06-17T17:22:33Z', 13],
              ['2020-06-17T18:22:33Z', 16],
              ['2020-06-17T19:22:33Z', 16],
              ['2020-06-17T20:22:33Z', 15],
              ['2020-06-17T21:22:33Z', 17],
            ],
            markPoint: {
              data: [
                { coord: ['2012-03-03T12:22:33Z', 5], name: '最大值' },
                { coord: ['2012-03-02T13:22:33Z', 15], name: '最小值' },
              ],
            },
            areaStyle: {
              color: new graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgb(255, 158, 68)',
                },
                {
                  offset: 1,
                  color: 'rgb(255, 70, 131)',
                },
              ]),
            },
          },
        ],
      }
    },
  },
  watch: {
    tweets(newValue: Tweet[]): void {
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
    getBounds(tweets: Tweet[], visibleTweets: string[]): [Moment, Moment] {
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
  },
}
</script>

<style scoped>
.tile {
  color: #333;
}

h1 {
  transition: transform 0.5s 0.3s cubic-bezier(0, 0, 0.2, 1),
    opacity 0.5s 0.3s cubic-bezier(0, 0, 0.2, 1);
  position: sticky;
  top: 0;
  padding: 40px;
  margin: -40px -40px 0;
  background: rgb(255, 255, 255);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 255, 255, 1) 60%,
    rgba(255, 255, 255, 0.75) 80%,
    rgba(255, 255, 255, 0) 100%
  );
  z-index: 1;
}

.split {
  transition: transform 0.5s 0.5s cubic-bezier(0, 0, 0.2, 1),
    opacity 0.5s 0.5s cubic-bezier(0, 0, 0.2, 1);
}

h1.hidden,
.split.hidden {
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
}
</style>
