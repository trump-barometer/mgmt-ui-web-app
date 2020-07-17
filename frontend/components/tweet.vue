<template>
  <div class="tweet">
    <div class="header-outer">
      <div class="header">
        <a
          href="https://twitter.com/realDonaldTrump"
          target="_blank"
          class="avatar-link"
        >
          <img
            :src="require('~/assets/avatar.jpg')"
            alt="Trump"
            class="avatar"
          />
        </a>
        <a
          href="https://twitter.com/realDonaldTrump"
          target="_blank"
          class="name-link"
        >
          <span class="name">Donald J. Trump</span>
          <span class="tag">@realDonaldTrump</span>
        </a>
      </div>
      <div v-if="!hideId" class="id">{{ item.id }}</div>
    </div>
    <div class="content">
      {{ item.text }}
    </div>
    <div class="time" :title="getTimeStringFull(item.time)">
      {{ getTimeString(item.time) }}
    </div>
    <div class="measures"></div>
  </div>
</template>

<script lang="ts">
import moment from 'moment'
import { PropOptions } from '~/node_modules/vue'
interface Tweet {
  time: string
  text: string
  id: string
}
export default {
  name: 'Tweet',
  props: {
    item: { type: Object, required: true } as PropOptions<Tweet>,
    hideId: { type: Boolean, required: false, default: false } as PropOptions<
      boolean
    >,
  },
  methods: {
    getTimeString(time: string) {
      return moment(time).fromNow()
    },
    getTimeStringFull(time: string) {
      return moment(time).toString()
    },
  },
}
</script>

<style scoped>
.tweet {
  padding: 20px;
  background: #ffffff;
  border-radius: 20px;
  color: #000000;
  max-width: 600px;
  height: 240px;
  display: flex;
  flex-direction: column;
  /*box-shadow: 0 3px 20px rgba(0, 0, 0, 0.2);*/
  border: 1px solid #dddddd;
  transition: transform 0.5s 1s cubic-bezier(0, 0, 0.2, 1),
    opacity 0.5s 1s cubic-bezier(0, 0, 0.2, 1);
}

.content {
  flex: 1;
}

.tweet.hidden {
  opacity: 0;
  transform: translateY(20px);
}

.header-outer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.header {
  display: flex;
  align-items: center;
}

.avatar-link,
.avatar-link:visited,
.avatar-link:focus {
  outline: none;
}

.avatar {
  border: none;
  border-radius: 50%;
  height: 48px;
  width: 48px;
  display: block;
}

.name-link {
  display: flex;
  flex-direction: column;
  color: initial;
  text-decoration: none;
  margin-left: 10px;
}

.name-link:hover > .name,
.name-link:focus > .name {
  text-decoration: underline;
}

.name {
  font-weight: bold;
}

.tag,
.time {
  color: #7f828b;
}

.time {
  margin-top: 10px;
}

.id {
  color: #666666;
}

.id::before {
  content: '# ';
  color: #999999;
}
</style>
