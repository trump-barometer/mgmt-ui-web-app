import * as moment from '~/node_modules/moment'

export const state = () => ({
  stockData: {
    NDX: [],
  },
  from: null,
  to: null,
})

export const mutations = {
  setStockData(
    state: any,
    {
      indices,
      from,
      to,
    }: { indices: { [key: string]: any[] }; from: string; to: string }
  ) {
    for (const [key, entries] of Object.entries(indices)) {
      state.stockData[key] = [...entries, ...(state.stockData[key] || [])]
    }
    state.from = [state.from, from].sort()[0]
    state.to = [state.to, to].sort()[1]
  },
}

export const actions = {
  async getData(
    { commit }: any,
    { from, to }: { from: string; to: string }
  ): Promise<void> {
    console.log(from, to)
    const data: any[] = (await (this as any).$axios.$get(
      `http${process.env.port === '443' ? 's' : ''}://localhost:${
        process.env.port
      }/indices`,
      { params: { from, to } }
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
    commit('setStockData', { indices, from, to })
  },
}
