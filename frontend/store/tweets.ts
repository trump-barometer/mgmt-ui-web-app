import { Tweet } from '~/types/tweet'

export const state = () => ({
  list: [
    {
      text:
        'BIG COURT WIN against Bolton. Obviously, with the book already given out and leaked to many people and the media, nothing the highly respected Judge could have done about stopping it...BUT, strong & powerful statements & rulings on MONEY & on BREAKING CLASSIFICATION were made....',
      time: '2020-06-17T17:40:00Z',
      id: '8',
      impactful: true,
    },
    {
      text:
        'BIG COURT WIN against Bolton. Obviously, with the book already given out and leaked to many people and the media, nothing the highly respected Judge could have done about stopping it...BUT, strong & powerful statements & rulings on MONEY & on BREAKING CLASSIFICATION were made....',
      time: '2020-06-17T16:40:00Z',
      id: '7',
    },
    {
      text:
        'BIG COURT WIN against Bolton. Obviously, with the book already given out and leaked to many people and the media, nothing the highly respected Judge could have done about stopping it...BUT, strong & powerful statements & rulings on MONEY & on BREAKING CLASSIFICATION were made....',
      time: '2020-06-17T15:40:00Z',
      id: '6',
      impactful: true,
    },
    {
      text:
        'BIG COURT WIN against Bolton. Obviously, with the book already given out and leaked to many people and the media, nothing the highly respected Judge could have done about stopping it...BUT, strong & powerful statements & rulings on MONEY & on BREAKING CLASSIFICATION were made....',
      time: '2020-06-17T14:40:00Z',
      id: '5',
    },
    {
      text:
        'BIG COURT WIN against Bolton. Obviously, with the book already given out and leaked to many people and the media, nothing the highly respected Judge could have done about stopping it...BUT, strong & powerful statements & rulings on MONEY & on BREAKING CLASSIFICATION were made....',
      time: '2020-06-17T13:40:00Z',
      id: '4',
    },
    {
      text:
        'BIG COURT WIN against Bolton. Obviously, with the book already given out and leaked to many people and the media, nothing the highly respected Judge could have done about stopping it...BUT, strong & powerful statements & rulings on MONEY & on BREAKING CLASSIFICATION were made....',
      time: '2020-06-17T12:40:00Z',
      id: '3',
    },
    {
      text:
        'BIG COURT WIN against Bolton. Obviously, with the book already given out and leaked to many people and the media, nothing the highly respected Judge could have done about stopping it...BUT, strong & powerful statements & rulings on MONEY & on BREAKING CLASSIFICATION were made....',
      time: '2020-06-17T11:40:00Z',
      id: '2',
    },
    {
      text:
        'BIG COURT WIN against Bolton. Obviously, with the book already given out and leaked to many people and the media, nothing the highly respected Judge could have done about stopping it...BUT, strong & powerful statements & rulings on MONEY & on BREAKING CLASSIFICATION were made....',
      time: '2020-06-17T10:40:00Z',
      id: '1',
      impactful: true,
    },
  ] as Tweet[],
})

export const mutations = {
  setTweets(state: { list: Tweet[] }, payload: Tweet[]) {
    state.list = payload
  },
}

export const actions = {
  getTweets({ commit }: any): void {
    commit('setTweets', [])
  },
}
