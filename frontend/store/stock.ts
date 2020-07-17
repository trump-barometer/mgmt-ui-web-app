import * as moment from '~/node_modules/moment'

export const state = () => ({
  stockData: {
    NDX: [],
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
    for (const point of data) {
      if (!indices[point.index]) {
        indices[point.index] = []
      }
      indices[point.index].push({
        time: moment.utc(point.timestamp).toISOString(),
        value: point.value,
      })
    }
    commit('setStockData', indices)
  },
}
