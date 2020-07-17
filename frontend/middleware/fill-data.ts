import moment from 'moment'

export default function({ store }: { store: any }) {
  const toMoment = moment
    .utc()
    .startOf('day')
    .add(1, 'day')
  const to = toMoment.toISOString()
  const from = toMoment
    .clone()
    .subtract(3, 'days')
    .toISOString()
  return Promise.all([
    store.dispatch('tweets/getTweets', { from, to }),
    store.dispatch('stock/getData', { from, to }),
  ])
}
