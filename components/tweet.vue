<template>
  <div class="tweet">
    <div class="header">
      <a
        href="https://twitter.com/realDonaldTrump"
        target="_blank"
        class="avatar-link"
      >
        <img :src="require('~/assets/avatar.jpg')" alt="Trump" class="avatar" />
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
    <div class="content">
      BIG COURT WIN against Bolton. Obviously, with the book already given out
      and leaked to many people and the media, nothing the highly respected
      Judge could have done about stopping it...BUT, strong & powerful
      statements & rulings on MONEY & on BREAKING CLASSIFICATION were made....
    </div>
    <div class="time">20. June 2020, 17:40</div>
    <div class="measures"></div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'tweet',
}
</script>

<style scoped>
.tweet {
  padding: 20px;
  background: #ffffff;
  border-radius: 20px;
  color: #000000;
  max-width: 600px;
  box-shadow: 0 3px 20px rgba(0, 0, 0, 0.2);
  margin-top: 100px;
  transition: transform 0.5s 1s cubic-bezier(0, 0, 0.2, 1),
    opacity 0.5s 1s cubic-bezier(0, 0, 0.2, 1);
}

.tweet.hidden {
  opacity: 0;
  transform: translateY(20px);
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
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
</style>
