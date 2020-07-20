export interface StockDataRaw {
  index: string
  timestamp: string
  value: number
  backtesting?: {
    // eslint-disable-next-line camelcase
    deep_learning?: { [key: string]: number | undefined }
  }
}

export interface StockData {
  time: string
  value: number
  backtesting: { [key: string]: number | undefined }
}
