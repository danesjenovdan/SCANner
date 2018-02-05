<template>
  <div id="listing">
    <div class="header">
      <div class="logo">
        <img src="../../assets/img/media-scanner-logo.svg">
      </div>
      <p class="intro">Lorem ipsum dolor sit amet, consectetur adipisicing
        elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
        ut aliquip ex ea commodo consequat.</p>
    </div>

    <div class="container flex">
      <div class="post-card">
        <img src="https://i.imgur.com/q1pqULl.jpg">
        <p class="date">25. 2. 2018</p>
        <p class="name">Igor Lukšič</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Listing',
};
</script>

<style lang="scss" scoped>
  @import url('https://fonts.googleapis.com/css?family=Faustina:400,700&subset=latin-ext');
  @import '../../styles/scaffolding';

  #listing {
    width: 100%;

    .header {
      width: 100%;
      height: 500px;
      background-image: linear-gradient(-232deg, #5ec2a7 0%, #5fb7f5 100%);

      @include respond-to(mobile) {
        height: auto;
      }

      .logo {
        width: 100%;
        display: block;
        position: relative;
        margin: auto;
        padding-top: 94px;

        @include respond-to(mobile) {
          width: 70%;
          padding-left: 15%;
          padding-right: 15%;
        }

        img {
          max-width: 565px;
          display: block;
          position: relative;
          margin: auto;
        }
      }

      .intro {
        max-width: 1041px;
        color: #000000;
        font-family: Faustina;
        font-size: 24px;
        font-weight: 700;
        line-height: 36px;
        /* Text style for "L, orem ip" */
        letter-spacing: 1.92px;

        // reset
        padding: 0;
        margin: 0;

        // do
        text-align: center;
        margin: auto;
        margin-top: 90px;

        @include respond-to(mobile) {
          width: 80%;
          padding-left: 10%;
          padding-right: 10%;

          font-size: 20px;
          line-height: 24px;
          padding-bottom: 30px;
        }
      }
    }

    .container {
      justify-content: space-between;
    }

    .post-card {
      width: 30%;
      max-width: 393px;
      overflow: hidden;
      background: #ffffff;
      height: 270px;
      margin-bottom: 47px;

      cursor: pointer;

      @include respond-to(mobile) {
        width: 80%;
        height: auto;
        max-width: 80%;
        margin-left: 10%;
        padding-bottom: 20px;
      }

      img {
        width: 100%;
        height: 184px;
        display: block;
      }

      .date {
        color: #000000;
        font-family: 'Faustina', serif;
        font-size: 14px;
        line-height: 14px;
        font-weight: 400;
        letter-spacing: 1.12px;

        // reset
        padding: 0;
        margin: 0;

        // do
        margin-top: 20px;
        margin-left: 24px;
      }

      .name {
        color: #000000;
        font-family: 'Faustina', serif;
        font-size: 20px;
        line-height: 20px;
        font-weight: 700;
        letter-spacing: 1.6px;

        // reset
        padding: 0;
        margin: 0;

        // do
        margin-top: 9px;
        margin-left: 24px;
      }
    }
  }
</style>
