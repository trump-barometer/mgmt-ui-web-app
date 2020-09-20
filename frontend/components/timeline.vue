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
          <el-radio-button label="Correct prediction"></el-radio-button>
          <el-radio-button label="Wrong prediction"></el-radio-button>
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
            <Tweet
              :item="item"
              :index="selectedIndice"
              :algorithm="algorithm"
              :learning-type="learningType"
            ></Tweet>
          </div>
        </RecycleScroller>
        <el-button
          v-if="moreDataAvailable"
          v-loading="loading"
          v-observe-visibility="{
            callback: loadMoreData,
            intersection: {
              rootMargin: '1000px',
            },
            throttleOptions: {
              leading: 'both',
            },
          }"
          class="loading-button"
          @click="loadMoreData"
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
import { StockData } from '~/types/stock-data'

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
      width: typeof window === 'undefined' ? 0 : window.innerWidth,
      learningType: 'deep_learning',
      algorithm: 'bert',
    }
  },
  computed: {
    indices(): string[] {
      return Object.keys((this as any).$store.state.stock.stockData)
    },
    moreDataAvailable(): boolean {
      return (this as any).$store.state.stock.from > '2020-04-05T00:00:00.000Z'
    },
    tweets(): TweetType[] {
      const tweets = (this as any).$store.state.tweets.list as TweetType[]
      const tweetFilter = (this as any).tweetFilter
      const learningType = (this as any).learning_type as string
      const algorithm = (this as any).algorithm as string
      const selectedIndice = (this as any).selectedIndice as string
      if (tweetFilter === 'All tweets') {
        return tweets
      } else {
        return tweets.filter((tweet) => {
          const prediction =
            // eslint-disable-next-line camelcase
            tweet.predictions?.[learningType]?.[algorithm]?.[selectedIndice]
          if (!prediction) {
            return false
          }
          return tweetFilter === 'Correct prediction'
            ? prediction.ground_truth === prediction.result
            : prediction.ground_truth !== prediction.result
        })
      }
    },
    chartOptions(): any {
      const tweets = (this as any).adjustTweetsToMarketHours(
        (this as any).tweets,
        (this as any).$store.state.stock.indexedDates[
          (this as any).selectedIndice
        ] || {}
      )
      const visibleTweets = tweets.slice(
        (this as any).visibleTweets?.start || 0,
        (this as any).visibleTweets?.end || 0
      )
      let [from, to]: [Moment, Moment] = (this as any).getBounds(
        tweets,
        visibleTweets
      )
      const additionalBound = Math.max(to.diff(from) * 0.2, 86400000)
      from = (this as any).getNextQuarter(from.subtract(additionalBound), true)
      to = (this as any).getNextQuarter(to.add(additionalBound), false)
      const fromIso = from.toISOString()
      const toIso = to.toISOString()
      const filteredStockData = ((this as any).$store.state.stock.stockData[
        (this as any).selectedIndice
      ] as StockData[]).filter(
        (value: any) => value.time >= fromIso && value.time <= toIso
      )
      const chartStockData = filteredStockData.map((value) => [
        value.time,
        value.value,
      ])
      const chartBacktestingData = filteredStockData
        .filter(
          (value) =>
            typeof value.backtesting?.[(this as any).algorithm] === 'number'
        )
        .map((value: any) => [
          value.time,
          value.backtesting?.[(this as any).algorithm],
        ])
      const chartVisibleTweets = tweets.filter(
        (tweet: TweetType) =>
          tweet.adjustedTime >= fromIso && tweet.adjustedTime <= toIso
      )
      return {
        tooltip: {
          trigger: 'axis',
        },
        grid:
          (this as any).width < 1024
            ? {
                top: 40,
                left: 15,
                right: 16,
                bottom: 1,
              }
            : {},
        legend: {
          show: true,
        },
        xAxis: {
          type: 'category',
          show: (this as any).width >= 1024,
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
        yAxis: [
          {
            type: 'value',
            show: (this as any).width >= 1024,
            name: (this as any).selectedIndice,
            axisLabel: {
              formatter: '{value}',
            },
            axisPointer: {
              label: {
                formatter: '{value}',
              },
            },
            splitLine: {
              show: false,
            },
            scale: true,
          },
          {
            type: 'value',
            name: 'Virtual Invest',
            show: (this as any).width >= 1024,
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
        ],
        series: [
          {
            name: 'Virtual invest',
            type: 'line',
            yAxisIndex: 1,
            data: chartBacktestingData,
            lineStyle: {
              color: 'rgba(0, 0, 0, 0.2)',
            },
            itemStyle: {
              color: 'rgba(0, 0, 0, 0.2)',
            },
            areaStyle: {
              color: new graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(0, 0, 0, 0.2)',
                },
                {
                  offset: 1,
                  color: 'rgba(0, 0, 0, 0)',
                },
              ]),
            },
          },
          {
            name: (this as any).selectedIndice,
            type: 'line',
            yAxisIndex: 0,
            data: chartStockData,
            markPoint: {
              data: (this as any).generateTweetMarks(
                chartVisibleTweets,
                chartStockData,
                (this as any).selectedIndice
              ),
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
                  color: 'rgba(0, 100, 128, 0)',
                },
              ]),
            },
          },
        ],
      }
    },
  },
  mounted() {
    ;(this as any).$nextTick(() => {
      if (window) {
        window.addEventListener('resize', (this as any).onResize)
      }
    })
  },

  beforeDestroy() {
    if (window) {
      window.removeEventListener('resize', (this as any).onResize)
    }
  },
  methods: {
    onResize() {
      ;(this as any).width = window.innerWidth
    },
    visibilityChanged(visible: boolean, entry: any): void {
      visible
        ? entry.target.classList.remove('hidden')
        : entry.target.classList.add('hidden')
    },
    async loadMoreData(visible: boolean): Promise<void> {
      if (visible && !(this as any).loading) {
        ;(this as any).loading = true
        const start = moment.utc((this as any).$store.state.tweets.from)
        const to = start.toISOString()
        const from = start
          .clone()
          .subtract(3, 'days')
          .toISOString()
        await Promise.all([
          (this as any).$store.dispatch('tweets/getTweets', { to, from }),
          await (this as any).$store.dispatch('stock/getData', { to, from }),
        ])
        ;(this as any).loading = false
      }
    },
    getBounds(
      tweets: TweetType[],
      visibleTweets: TweetType[]
    ): [Moment, Moment] {
      if (!visibleTweets.length) {
        if (tweets.length) {
          return [
            moment(tweets[tweets.length - 1].adjustedTime),
            moment(tweets[0].adjustedTime),
          ]
        } else {
          return [moment(), moment()]
        }
      }
      return [
        moment.utc(visibleTweets[0].adjustedTime),
        moment.utc(visibleTweets[visibleTweets.length - 1].adjustedTime),
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
    adjustTweetsToMarketHours(
      tweets: TweetType[],
      indexedDates: { [key: string]: number }
    ): TweetType[] {
      const timestamps = Object.keys(indexedDates)
      return tweets.map((tweet) => {
        if (indexedDates[tweet.adjustedTime]) {
          return tweet
        } else {
          return {
            ...tweet,
            adjustedTime:
              timestamps.find((timestamp) => timestamp > tweet.adjustedTime) ||
              '9999-12-31T00:00:00.000Z',
          }
        }
      })
    },
    generateTweetMarks(
      tweets: TweetType[],
      stockData: [string, number][],
      selectedIndice: string
    ): any[] {
      interface TweetTypeReduced extends TweetType {
        sameTimeUntilId?: string
        prediction: number | null
      }
      const adjustedTweets: TweetTypeReduced[] = tweets.map((tweet) => {
        const prediction =
          // eslint-disable-next-line camelcase
          tweet.predictions?.[(this as any).learning_type]?.[
            (this as any).algorithm
          ]?.[selectedIndice]?.result
        return {
          ...tweet,
          prediction: prediction ? (prediction === 'Up' ? 1 : -1) : 0,
        }
      })
      const reducedTweets = adjustedTweets.reduce<TweetTypeReduced[]>(
        (list, tweet) => {
          const sameAdjustedTimeTweet = list.find(
            (reducedTweet) => reducedTweet.adjustedTime === tweet.adjustedTime
          )
          if (sameAdjustedTimeTweet) {
            return list.map((reducedTweet) =>
              reducedTweet === sameAdjustedTimeTweet
                ? {
                    ...reducedTweet,
                    sameTimeUntilId: tweet.id,
                    prediction:
                      (reducedTweet.prediction || 0) + (tweet.prediction || 0),
                  }
                : reducedTweet
            )
          } else {
            return [...list, tweet]
          }
        },
        [] as TweetTypeReduced[]
      )
      return ([] as any[]).concat(
        ...reducedTweets.map((tweet: TweetTypeReduced) => {
          const tweetMark = {
            coord: [
              tweet.adjustedTime,
              (this as any).getStockValue(tweet.adjustedTime, stockData),
            ],
            value: tweet.sameTimeUntilId
              ? `${tweet.id}-${tweet.sameTimeUntilId}`
              : tweet.id,
          }
          if (tweet.prediction) {
            return [
              tweetMark,
              {
                coord: [
                  tweet.adjustedTime,
                  (this as any).getStockValue(tweet.adjustedTime, stockData),
                ],
                symbol:
                  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
                itemStyle: {
                  color: 'transparent',
                },
                symbolOffset: ['15px', '-80%'],
                label: {
                  fontFamily: 'element-icons',
                  color: '#333333',
                },
                value: tweet.prediction > 0 ? '' : '',
              },
            ]
          } else {
            return [tweetMark]
          }
        })
      )
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

@media (max-width: 1023px) {
  .title-bar {
    flex-direction: column;
    overflow-x: hidden;
    margin: -20px -20px 0;
    padding: 40px 20px;
  }

  .el-radio-group {
    display: flex;
    overflow-x: auto;
    max-width: calc(100% + 40px);
    margin: 0 -20px;
    padding: 0 20px;
  }

  .split {
    flex-direction: column;
  }

  .chart {
    margin: 0;
    bottom: 0;
    top: initial;
    box-shadow: 0 -5px 5px 5px rgba(255, 255, 255, 0.9);
  }

  .echarts {
    width: 100%;
    height: 200px;
    background: rgba(255, 255, 255, 0.9);
  }
}
</style>
