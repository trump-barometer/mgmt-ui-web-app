export interface PredictionResult {
  probability: number
  result: 'Up' | 'Down'
  // eslint-disable-next-line camelcase
  ground_truth?: 'Up' | 'Down'
}

export interface Tweet {
  time: string
  adjustedTime: string
  text: string
  id: string
  impactful: boolean
  predictions: {
    [key: string]: {
      [key: string]: { [key: string]: PredictionResult }
    }
  }
}
