import * as moment from '~/node_modules/moment'
import { StockData, StockDataRaw } from '~/types/stock-data'

export const state = () => ({
  stockData: {
    NDX: [],
  },
  indexedDates: {
    NDX: {},
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
    const stockData = { ...state.stockData }
    for (const [key, entries] of Object.entries(indices)) {
      stockData[key] = [...entries, ...(state.stockData[key] || [])]
    }
    const indexedDates: { [key: string]: { [key: string]: number } } = {}
    for (const [key, entries] of Object.entries(stockData) as [
      string,
      StockData[]
    ][]) {
      indexedDates[key] = {}
      entries.forEach(
        (entry: StockData, index: number) =>
          (indexedDates[key][entry.time] = index)
      )
    }
    state.stockData = stockData
    state.indexedDates = indexedDates
    state.from = [state.from, from].sort()[0]
    state.to = [state.to, to].sort()[1]
  },
}

export const actions = {
  async getData(
    { commit }: any,
    { from, to }: { from: string; to: string }
  ): Promise<void> {
    const data: StockDataRaw[] = await (this as any).$axios.$get(
      `http${process.env.port === '443' ? 's' : ''}://${process.env.hostname}:${
        process.env.port
      }/indices`,
      { params: { from, to } }
    )
    const indices: { [key: string]: StockData[] } = {}
    for (const point of data.reverse()) {
      if (!indices[point.index]) {
        indices[point.index] = []
      }
      indices[point.index].push({
        time: moment.utc(point.timestamp).toISOString(),
        value: point.value,
        backtesting: {
          // eslint-disable-next-line camelcase
          ...(point.backtesting?.deep_learning || {}),
        },
      })
    }
    commit('setStockData', { indices, from, to })
  },
}
