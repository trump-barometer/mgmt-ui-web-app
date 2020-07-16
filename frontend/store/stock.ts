import * as moment from '~/node_modules/moment'

export const state = () => ({
  stockData: {
    '^GDAXI': [
      { time: '2020-06-17T10:00:00.000Z', value: 11 },
      { time: '2020-06-17T10:15:00.000Z', value: 12 },
      { time: '2020-06-17T10:30:00.000Z', value: 13 },
      { time: '2020-06-17T10:45:00.000Z', value: 15 },
      { time: '2020-06-17T11:00:00.000Z', value: 14 },
      { time: '2020-06-17T11:15:00.000Z', value: 13 },
      { time: '2020-06-17T11:30:00.000Z', value: 15 },
      { time: '2020-06-17T11:45:00.000Z', value: 14 },
      { time: '2020-06-17T12:00:00.000Z', value: 12 },
      { time: '2020-06-17T12:15:00.000Z', value: 13 },
      { time: '2020-06-17T12:30:00.000Z', value: 12 },
      { time: '2020-06-17T12:45:00.000Z', value: 14 },
      { time: '2020-06-17T13:00:00.000Z', value: 10 },
      { time: '2020-06-17T13:15:00.000Z', value: 9 },
      { time: '2020-06-17T13:30:00.000Z', value: 12 },
      { time: '2020-06-17T13:45:00.000Z', value: 14 },
      { time: '2020-06-17T14:00:00.000Z', value: 11 },
      { time: '2020-06-17T14:15:00.000Z', value: 10 },
      { time: '2020-06-17T14:30:00.000Z', value: 9 },
      { time: '2020-06-17T14:45:00.000Z', value: 8 },
      { time: '2020-06-17T15:00:00.000Z', value: 8 },
      { time: '2020-06-17T15:15:00.000Z', value: 10 },
      { time: '2020-06-17T15:30:00.000Z', value: 9 },
      { time: '2020-06-17T15:45:00.000Z', value: 12 },
      { time: '2020-06-17T16:00:00.000Z', value: 13 },
      { time: '2020-06-17T16:15:00.000Z', value: 11 },
      { time: '2020-06-17T16:30:00.000Z', value: 10 },
      { time: '2020-06-17T16:45:00.000Z', value: 11 },
      { time: '2020-06-17T17:00:00.000Z', value: 9 },
      { time: '2020-06-17T17:15:00.000Z', value: 10 },
      { time: '2020-06-17T17:30:00.000Z', value: 8 },
      { time: '2020-06-17T17:45:00.000Z', value: 12 },
      { time: '2020-06-17T18:00:00.000Z', value: 14 },
      { time: '2020-06-17T18:15:00.000Z', value: 15 },
      { time: '2020-06-17T18:30:00.000Z', value: 15 },
      { time: '2020-06-17T18:45:00.000Z', value: 14 },
      { time: '2020-06-17T19:00:00.000Z', value: 11 },
      { time: '2020-06-17T19:15:00.000Z', value: 10 },
      { time: '2020-06-17T19:30:00.000Z', value: 12 },
      { time: '2020-06-17T19:45:00.000Z', value: 8 },
      { time: '2020-06-17T20:00:00.000Z', value: 15 },
    ],
  },
})

export const mutations = {
  setStockData(state: any, payload: any) {
    state.stockData = payload
  },
}

export const actions = {
  async getData({ commit }: any): Promise<void> {
    const data: any[] = (await (this as any).$axios.$get(
      'http://localhost:3001/indices'
    )) as any[]
    const indices: { [key: string]: any[] } = {}
    for (const { indize } of data) {
      if (!indices[indize.symbol]) {
        indices[indize.symbol] = []
      }
      indices[indize.symbol].push({
        time: moment.utc(indize.timestamp).toISOString(),
        value: indize.open,
      })
    }
    console.log(indices)
    commit('setStockData', indices)
  },
}
