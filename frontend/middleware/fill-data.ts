export default function({ store }: { store: any }) {
  return Promise.all([
    store.dispatch('tweets/getTweets'),
    store.dispatch('stock/getData'),
  ])
}
