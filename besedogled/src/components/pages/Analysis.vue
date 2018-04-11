<template>
  <div id="analysis">
    <div class="header">
      <a class="logo" href="/">
        <img src="../../assets/img/media-scanner-logo.svg">
      </a>
    </div>
    <div class="container">
      <div class="paper">
        <div class="titleblock flex">
          <div class="col-third">
            <div class="titlecontainer">
              <p class="date">{{ date }}</p>
              <p class="title">{{ title }}</p>
            </div>
          </div>
          <div class="col-two-thirds">
            <div class="player">
              <iframe
                :src="videoUrl"
                frameborder="0"
                allowfullscreen="true"
              ></iframe>
            </div>
          </div>
        </div>
        <div class="content flex">
          <div :class="['btn', 'btn-tab', {selected: displayAnalysis}]" @click="displayAnalysis = true"><img class="inline-img" src="../../assets/img/analiza.png">Analiza</div>
          <div :class="['btn', 'btn-tab', {selected: !displayAnalysis}]" @click="displayAnalysis = false"><img class="inline-img" src="../../assets/img/besedilo.png">Transkript</div>
        </div>
        <div class="flex" v-if="!displayAnalysis">
          <div class="col-third">
            <affix class="filters" relative-element-selector="#affixer" :enabled="!isMobile">
              <div class="boxes">
                <div
                  v-for="(explanation, name) in filters"
                  :class="['box', 'box-' + name, {selected: selectedFilter === name}]"
                  @click="activateFilter(name)"
                  :key="name"
                >
                  {{ explanation }}
                </div>
              </div>
            </affix>
          </div>
          <div
            id="affixer"
            :class="['col-two-thirds active-filter-' + (selectedFilter || 'all'), 'padme']"
            v-html="renderedText"
          >
            <div class="bubbles-container" v-if="sentences.length === 0">
              <div class="bubbles">
                <span></span>
                <span id="bubble2"></span>
                <span id="bubble3"></span>
              </div>
            </div>
          </div>
        </div>
        <div class="flex" v-if="displayAnalysis">
          <div class="bubbles-container" v-if="analysisText === ''">
            <div class="bubbles">
              <span></span>
              <span id="bubble2"></span>
              <span id="bubble3"></span>
            </div>
          </div>
          <div class="col-full analysis" v-html="analysisText"></div>
        </div>
      </div>
      <a href="/" class="goback">Nazaj na seznam analiz</a>
    </div>
    <b-footer></b-footer>
  </div>
</template>

<script>
/* globals $ */

import isMobile from 'ismobilejs';
import BFooter from '../Footer';

export default {
  name: 'Analysis',

  components: {
    BFooter,
  },

  data() {
    return {
      selectedFilter: null,
      filters: {
        yellow: 'Nikalna oblika ali/in odvečna vsebina',
        green: 'Osebe v izjavi ali/in zamenjava pojmovanja',
        blue: 'Navajanje zapuščanja lokacije ali/in navajanje razlogov',
        purple: 'Uporaba osebnega zaimkov mi/midva ali/in navajanje konkretnega časa',
        orange: 'Navajanje komuniciranja',
        pink: 'Odsotnost navedbe konkretnega časa',
        circled: 'Osebni zaimki in osebne glagolske oblike',
        underline: 'Uporaba trpnika',
        connection: 'Sled zamenjave jezika',
      },
      sentences: [],
      analysisId: this.$route.params.analysisId,
      analysisText: '',
      videoUrl: '',
      title: '',
      date: '',
      displayAnalysis: true,
      isMobile: isMobile.any,
    };
  },
  computed: {
    selectedFilterDescription() {
      if (this.selectedFilter) {
        return this.filters[this.selectedFilter];
      }
      return 'Za razlago min filtriranje SCAN parametrov klikni na zgornji barvni označevalec.';
    },
    renderedText() {
      const fullText = this.sentences.reduce((prev, cur, i) => {
        const sentence = cur.reduce((previ, curr, j) => {
          const word = curr[0];
          let classString = '';
          Object.keys(curr[4]).forEach((key) => {
            if (curr[4][key]) {
              classString += ` ${key}`;
            }
          });
          if (word.indexOf('\n\n') === -1) {
            return `${previ}<span class="${classString}" id="${i},${j}">${word}</span>`;
          }
          return `${previ}<span class="${classString}" id="${i},${j}">${word}</span><br><br>`;
        }, '');
        return prev + sentence;
      }, '');
      return fullText;
    },

    justText() {
      const fullText = this.sentences.reduce((prev, cur) => {
        const sentence = cur.reduce((previ, curr) => {
          const word = curr[0];
          return `${previ}${word}`;
        }, '');
        return prev + sentence;
      }, '');

      return fullText;
    },

    justWords() {
      const words = [];
      this.sentences.forEach((e, i) => {
        e.forEach((f, j) => {
          f.push([i, j]);
          words.push(f);
        });
      });

      return words;
    },
  },
  methods: {
    getAnalysisText() {
      this.$http.get(`http://admin.besedogled.si/getAnalysisText/?id=${this.analysisId}`).then((response) => { // TODO fix url
        this.analysisText = response.body;
      });
    },
    getAnalysisData() {
      this.$http.get(`http://admin.besedogled.si/getAnalysisData/?id=${this.analysisId}`).then((response) => { // TODO fix url
        this.sentences = response.body;
      });
    },
    getAnalysisMeta() {
      this.$http.get(`http://admin.besedogled.si/getAnalysisMeta/?id=${this.analysisId}`).then((response) => { // TODO fix url
      // this.$http.get(`http://localhost:8000/getAnalysisMeta/?id=${this.analysisId}`).then((response) => { // TODO fix url
        console.log(response);
        this.title = response.body.title;

        const d = new Date(response.body.date);
        this.date = `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;
      });
    },
    getAnalysisVideo() {
      this.$http.get(`http://admin.besedogled.si/getAnalysisVideo/?id=${this.analysisId}`).then((response) => {
        this.videoUrl = response.body
      });
    },
    createNew() {
      document.location.href = '/new/';
    },
    listAll() {
      document.location.href = '/all/';
    },
    activateFilter(name) {
      if (this.selectedFilter === name) {
        this.selectedFilter = null;
        // $('.arrow').removeClass('hidden');
      } else {
        this.selectedFilter = name;
        if (name === 'connection') {
          $('.arrow').removeClass('hidden');
        } else {
          $('.arrow').addClass('hidden');
        }
      }
    },

    drawConnections() {
      const pairs = [];
      $.each($('.connection'), (i, e) => {
        if (i > 0) {
          pairs.push([$('.connection')[i - 1], e]);
        }
      });
      pairs.forEach((e, i) => {
        console.log(i, e);
        if ($('.arrow').length < pairs.length) {
          $('body').append(`<div class="arrow" id="arrow${i}"></div>`);
        }

        if ($(e[0]).offset().left < $(e[1]).offset().left) {
          $(`#arrow${i}`).addClass('right');
          $(`#arrow${i}`).css({
            top: $(e[0]).offset().top + 10,
            left: $(e[0]).offset().left + 10,
            bottom: ($(window).height() - ($(e[1]).offset().top + $(e[1]).outerHeight())) + 25,
            right: ($(window).width() - ($(e[1]).offset().left + $(e[1]).outerWidth())) + 30,
          });
        } else {
          $(`#arrow${i}`).addClass('left');
          $(`#arrow${i}`).css({
            top: $(e[0]).offset().top + 10,
            left: $(e[1]).offset().left + 10,
            bottom: ($(window).height() - ($(e[1]).offset().top + $(e[1]).outerHeight())) + 25,
            right: ($(window).width() - ($(e[0]).offset().left + $(e[0]).outerWidth())) + 10,
          });
        }
      });
    },
  },
  mounted() {
    // WARNING! THIS IS A HACK
    window.setTimeout(() => {
      this.drawConnections();
    }, 100);
    $(window).on('resize', () => {
      this.drawConnections();
    });
    this.getAnalysisData();
    this.getAnalysisText();
    this.getAnalysisMeta();
    this.getAnalysisVideo();
  },
};
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Faustina:400,700&subset=latin-ext');
@import url('https://fonts.googleapis.com/css?family=Open+Sans:300&subset=latin-ext');
@import '../../styles/scaffolding';

.goback {
  color: #000000;
  font-family: 'Faustina', serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 40px;
  display: block;

  cursor: pointer;
  text-decoration: none;

  &:hover {
    text-decoration: underline
  }

  margin-top: 25px;
  margin-bottom: 10px;

  &::before {
    content: '';
    display: inline-block;
    position: relative;
    top: 8px;
    margin-right: 10px;
    width: 30px;
    height: 30px;
    background-image: url('../../assets/img/nazaj.png');
    background-size: contain;
    background-repeat: no-repeat;
  }
}

.vue-affix {
  padding-top: 20px;
  max-width: 300px;
}

#affixer {
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  line-height: 33px;
  color: #000000;
  padding-top: 20px;
}

#analysis {
  width: 100%;

  .header {
    width: 100%;
    height: 120px;
    background-image: linear-gradient(-232deg, #5ec2a7 0%, #5fb7f5 100%);

    @include respond-to(mobile) {
      height: auto;
      padding-bottom: 30px;
    }

    .logo {
      width: 100%;
      display: block;
      position: relative;
      margin: auto;
      padding-top: 24px;

      @include respond-to(mobile) {
        width: 70%;
        padding-left: 15%;
        padding-right: 15%;
      }

      img {
        max-width: 280px;
        display: block;
        position: relative;
        margin: auto;
      }
    }
  }

  .paper {
    background: #ffffff;
    padding: 30px;

    .col-third {
      flex: 1;
      flex-shrink: 2;
      flex-grow: 1;
    }
    .col-two-thirds {
      flex: 2;
      flex-shrink: 1;
      flex-grow: 2;

      &.padme {
        padding-left: 15px;
      }
    }
    .col-full {
      flex: 1 ;
      flex-shrink: 1;
      flex-grow: 1;
    }

    .titleblock {
      padding-bottom: 40px;
      .titlecontainer {
        height: 100%;
        display: flex;
        flex-wrap: wrap;
        align-content: flex-end;

        @include respond-to(desktop) {
          padding: 22px;
        }

        .date {
          color: #000000;
          font-family: 'Faustina', serif;
          font-size: 16px;
          font-weight: 400;
          line-height: 36px;
          letter-spacing: 1px;
          text-align: right;
          margin: 0;
          padding: 0;
          width: 100%;

          @include respond-to(mobile) {
            text-align: center;
          }
        }
        .title {
          color: #000000;
          font-family: 'Faustina', serif;
          font-size: 36px;
          font-weight: 700;
          line-height: 36px;
          letter-spacing: 2px;
          text-align: right;
          margin: 0;
          width: 100%;
          margin-bottom: 20px;

          @include respond-to(mobile) {
            text-align: center;
          }
        }
      }
    }

    .content {
      border-top: 3px solid #efeeee;
      padding-top: 30px;

      .col-two-thirds {
        flex: 2;
        flex-shrink: 1;
        flex-grow: 2;

        font-family: 'Open Sans';
        /* Style for "Spoštovani" */
        color: #000000;
        font-size: 16px;
        font-weight: 300;
        line-height: 28px;
      }
    }

    .filters  {
      z-index: 200;
    }
    .boxes {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      // border-bottom: 13px solid transparent;
      margin: 0 auto;
      position: relative;

      @include respond-to(mobile) {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        flex-wrap: nowrap;
        // border-bottom-width: 0px;
      }
    }

    @keyframes bounce {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(0.9);
      }
      100% {
        transform: scale(1);
      }
    }

    .box {
      width: 90%;
      max-width: 290px;
      height: 35px;
      padding-left: 60px;
      position: relative;
      line-height: 15px;
      font-size: 11px;
      font-family: 'Faustina', serif;
      vertical-align: bottom;
      padding-top: 5px;

      &::before {
        content: '';
        display: block;
        width: 44px;
        height: 44px;
        position: absolute;
        left: 0;
        top: 0;
      }
      cursor: pointer;

      @include respond-to(up-to-limbo) {
        font-size: 11px;
      }

      @include respond-to(mobile) {
        width: 44px;
        overflow: hidden;
        padding: 0;

        &.selected {
          border: 2px solid #525252;
          border-bottom: none;
          height: 42px;
        }
      }
    }

    .box:hover {
      animation-name: bounce;
      animation-duration: 0.4s;
    }

    .box-yellow::before {
      background-color: #fde858;
    }

    .box-green::before {
      background-color: #71cb95;
    }

    .box-blue::before {
      background-color: #5fb7f5;
    }

    .box-violet::before,
    .box-purple::before {
      background-color: #9561f5;
    }

    .box-orange::before {
      background-color: #ffb759;
    }

    .box-pink::before {
      background-color: #fa81c5;
    }

    .box-circle::before,
    .box-circled::before {
      background-color: #c3c3c3;
      background-image: url('../../assets/img/obkrozeno.png');
      background-repeat: no-repeat;
      background-position: center;
    }

    .box-underline::before {
      background-color: #d1d1d1;
      background-image: url('../../assets/img/podcrtano.png');
      background-repeat: no-repeat;
      background-position: center;
    }

    .box-connection::before {
      background-color: #e2e2e2;
      background-image: url('../../assets/img/puscica2.png');
      background-repeat: no-repeat;
      background-position: center;
      background-size: 80% 30%;
    }

    // BOXES BACKGROUND
    .box-yellow {
      background-color: rgba(253, 231, 88, 0.2);
    }

    .box-green {
      background-color: rgba(113, 203, 149, 0.2);
    }

    .box-blue {
      background-color: rgba(95, 183, 245, 0.2);
    }

    .box-violet,
    .box-purple {
      background-color: rgba(149, 97, 245, 0.2);
    }

    .box-orange {
      background-color: rgba(255, 183, 89, 0.2);
    }

    .box-pink {
      background-color: rgba(250, 129, 197, 0.2);
    }

    .box-circle,
    .box-circled {
      background-color: rgba(195, 195, 195, 0.2);
    }

    .box-underline {
      background-color: rgba(209, 209, 209, 0.2);
    }

    .box-connection {
      background-color: hsla(0, 0%, 89%, 0.2);
    }
  }
}

.player {
  position: relative;
  overflow: hidden;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;

  @include respond-to(mobile) {
    display: none;
  }

  iframe {
    margin: auto;
    position: relative;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}

.btn {
  display: block;
  width: 100%;
  text-align: center;
  text-transform: uppercase;
  padding: 10px;
  margin: 5px;
  border: 2px solid #71cb95;
  cursor: pointer;
  color: #525252;

  font-family: 'Faustina', serif;
  font-weight: 700;
  font-size: 22px;

  &.selected,
  &:hover {
    background-color: #71cb95;
    color: #ffffff;
  }
}

.btn-tab {
  @include respond-to(desktop) {
    &:first-child {
      margin-left: 0;
    }
    &:last-child {
      margin-right: 0;
    }
  }

  @include respond-to(mobile) {
    margin-left: 0;
    margin-right: 0;
    width: calc(100% - 25px);
  }

  .inline-img {
    filter: invert(0);
    height: 22px;
    width: auto;
    display: inline-block;
    position: relative;
    top: 5px;
    margin-right: 10px;
  }
  &.selected,
  &:hover {
    .inline-img {
      filter: invert(1);
    }
  }
}

.col-two-thirds {
  p {
    margin: 0;
    padding: 0;
  }
}

.analysis {
  padding-top: 20px;

  p {
    font-family: 'Open Sans', sans-serif;
    font-size: 16px;
    line-height: 28px;
    color: #000000;

    padding-left: 0px;
    padding-right: 0px;

    @include respond-to(desktop) {
      padding-left: 100px;
      padding-right: 100px;
    }
  }
}

.active-filter-yellow .yellow,
.active-filter-all .yellow {
  background-color: #ffea3a;
}

.active-filter-green .green,
.active-filter-all .green {
  background-color: #6fc679;
}

.active-filter-blue .blue,
.active-filter-all .blue {
  background-color: #89bbff;
}

.active-filter-violet .violet,
.active-filter-all .violet,
.active-filter-purple .purple,
.active-filter-all .purple {
  background-color: #ae96fd;
}

.active-filter-orange .orange,
.active-filter-all .orange {
  background-color: #ed9c4c;
}

.active-filter-pink .pink,
.active-filter-all .pink {
  background-color: #e999c8;
}

.active-filter-circle .circle,
.active-filter-all .circle,
.active-filter-circled .circled,
.active-filter-all .circled {
  box-shadow: 0 0 0 2px #292929;
  border-radius: 50%;
  z-index: 1;
  position: relative;
}

.active-filter-underline .underline,
.active-filter-all .underline {
  border-bottom: 2px solid black;
}

.active-filter-connection .connection,
.active-filter-all .connection {
  border-bottom: 2px solid #6fc679;
}
</style>
