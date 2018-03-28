<template>
  <div id="listing">
    <div class="header">
      <div class="logo">
        <img src="../../assets/img/media-scanner-logo.svg">
      </div>
      <p class="intro">Besedogled je analitično orodje za preverjanje skladnosti in koherentnosti besedil. Nastal je na preseku znanstveno-raziskovalnih in forenzično-preiskovalnih metod, ki se osredotočajo na jezik. Tehnike za preverjanje resničnosti, ki temeljijo na telesu, je mogoče zavesti, v jeziku pa se vsi neizogibno razgaljamo do nezavednega.</p>
    </div>

    <div class="container flex">
      <a
        class="post-card"
        v-for="analysis in publishedAnalyses"
        :href="analysis.url"
        :key="analysis.id"
      >
        <div class="img" :style="{ 'background-image': `url('${analysis.image}')` }"></div>
        <p class="date">{{ analysis.date || 'MANJKA DATUM' }}</p>
        <p class="name">{{ analysis.title }}</p>
      </a>
    </div>
    <b-footer></b-footer>
  </div>
</template>

<script>
import BFooter from '../Footer';

export default {
  name: 'Listing',

  components: {
    BFooter,
  },

  data() {
    return {
      publishedAnalyses: [],
    };
  },

  methods: {
    getpublishedAnalyses() {
      this.$http.get('http://admin.besedogled.si/getPublishedAnalyses/').then((response) => { // TODO fix url
        this.publishedAnalyses = response.body.map((analysis) => {
          const d = new Date(analysis.date);

          return {
            title: analysis.title,
            date: `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`,
            image: analysis.image || 'https://i.imgur.com/q1pqULl.jpg',
            url: `/analiza/${analysis.id}`,
          };
        });
      });
    },
  },

  mounted() {
    this.getpublishedAnalyses();
  },
};
</script>

<style lang="scss" scoped>
  @import url('https://fonts.googleapis.com/css?family=Faustina:400,700&subset=latin-ext');
  @import '../../styles/scaffolding';

  #listing {
    width: 100%;

    .header {
      width: 100%;
      // height: 500px;
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
        margin-top: 60px;
        padding: 30px;

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
      justify-content: flex-start;
      flex-wrap: wrap;
    }

    .post-card {
      width: 45%;
      overflow: hidden;
      background: #ffffff;
      height: 150px;
      margin-bottom: 47px;

      text-decoration: none;

      cursor: pointer;

      display: block;

      margin-left: 10px;
      margin-right: 10px;

      // &:nth-child(2n) {
      //   @include respond-to(desktop) {
      //     margin-left: 20px;
      //   }
      // }

      @include respond-to(mobile) {
        width: 80%;
        height: auto;
        margin-left: 10%;
        padding-bottom: 20px;
      }

      .img {
        width: 40%;
        height: 100%;
        display: block;
        float: left;
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;

        @include respond-to(mobile) {
          width: 100%;
          height: 200px;
          display: block;
          float: none;
        }
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

        width: 50%;
        float: left;
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

        width: 50%;
        float: left;
      }
    }
  }
</style>
