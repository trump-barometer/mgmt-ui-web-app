import { Tweet } from '~/types/tweet'
import * as moment from '~/node_modules/moment'

export const state = () => ({
  list: [] as Tweet[],
  from: null,
  to: null,
})

export const mutations = {
  addTweets(
    state: { list: Tweet[]; from: string; to: string },
    { tweets, from, to }: { tweets: Tweet[]; from: string; to: string }
  ) {
    state.list = [...state.list, ...tweets]
    state.from = [state.from, from].sort()[0]
    state.to = [state.to, to].sort()[1]
  },
}

export const actions = {
  async getTweets(
    { commit, state }: any,
    { from, to }: { from: string; to: string }
  ): Promise<void> {
    const offset = state.list.length
    const tweets: any[] = ((await (this as any).$axios.$get(
      `http${process.env.port === '443' ? 's' : ''}://${process.env.hostname}:${
        process.env.port
      }/tweets`,
      { params: { from, to } }
    )) as any[]).map((tweet, i) => {
      const time = moment.utc(tweet.timestamp)
      return {
        id: i + 1 + offset,
        nativeId: tweet.id,
        text: tweet.text,
        time,
        adjustedTime: moment
          .utc(time)
          .subtract(time.minute() % 15, 'minutes')
          .startOf('hour')
          .toISOString(),
        predictions: tweet.predictions,
      }
    })
    commit('addTweets', { tweets, from, to })
  },
}
