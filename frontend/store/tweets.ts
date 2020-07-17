import { Tweet } from '~/types/tweet'
import * as moment from '~/node_modules/moment'

export const state = () => ({
  list: [] as Tweet[],
})

export const mutations = {
  setTweets(state: { list: Tweet[] }, payload: Tweet[]) {
    state.list = payload
  },
}

export const actions = {
  async getTweets({ commit }: any): Promise<void> {
    const tweets: any[] = ((await (this as any).$axios.$get(
      'http://localhost:3001/tweets'
    )) as any[])
      .reverse()
      .map((tweet, i) => {
        const time = moment.utc(tweet.timestamp)
        return {
          id: i + 1,
          nativeId: tweet.id,
          text: tweet.text,
          time,
          adjustedTime: moment
            .utc(time)
            .subtract(time.minute() % 15, 'minutes')
            .startOf('hour')
            .toISOString(),
        }
      })
    commit('setTweets', tweets)
  },
}
