<template>
  <div id="analysis">
    <div class="header">
      <div class="logo">
        <img src="../../assets/img/media-scanner-logo.svg">
      </div>
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
            <iframe
              :src="videoUrl"
              width="100%"
              height="300px"
              frameborder="0"
              allowfullscreen="true"
            ></iframe>
          </div>
        </div>
        <div class="content flex">
          <div class="col-third">
            <div class="filters">
              <div class="boxes">
                <div
                  v-for="(explanation, name) in filters"
                  :class="['box', 'box-' + name]"
                  @click="activateFilter(name)"
                  :key="name"
                >
                  {{ explanation }}
                </div>
              </div>
            </div>
          </div>
          <div
            :class="'col-two-thirds active-filter-' + (selectedFilter || 'all')"
            v-html="renderedText"
          ></div>
        </div>
        <div class="content flex">
          <div class="col-third"></div>
          <div class="col-two-thirds" v-html="analysisText"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Analysis',

  data() {
    return {
      selectedFilter: null,
      filters: {
        yellow: 'Nikalno / nepomembno',
        green: 'Osebe / relevantne spremembe',
        blue: 'Zapuščanje lokacije / pojasnjevanje',
        purple: 'Needninski zaimki / navajanje časa',
        orange: 'Navajanje komunikacije',
        pink: 'Manjkajoči čas',
        circled: 'Osebni zaimki in glagolske oblike',
        underline: 'Nepravilna raba časa',
        connection: 'Spremembe jezika',
      },
      sentences: [],
      analysisId: this.$route.params.analysisId,
      analysisText: '',
      videoUrl: '',
      title: '',
      date: '',
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
        this.title = response.body.title;

        const d = new Date(response.body.date);
        this.date = `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;
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
          $('body').append('<div class="arrow" id="arrow' + i + '"></div>');
        }

        if ($(e[0]).offset().left < $(e[1]).offset().left) {
          $('#arrow' + i).addClass('right');
          $('#arrow' + i).css({
            top: $(e[0]).offset().top + 10,
            left: $(e[0]).offset().left + 10,
            bottom: ($(window).height() - ($(e[1]).offset().top + $(e[1]).outerHeight())) + 25,
            right: ($(window).width() - ($(e[1]).offset().left + $(e[1]).outerWidth())) + 30,
          });
        } else {
          $('#arrow' + i).addClass('left');
          $('#arrow' + i).css({
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
  },
};
</script>

<style lang="scss" scoped>
  @import url('https://fonts.googleapis.com/css?family=Faustina:400,700&subset=latin-ext');
  @import url('https://fonts.googleapis.com/css?family=Open+Sans:300&subset=latin-ext');
  @import '../../styles/scaffolding';

  #analysis {
    width: 100%;

    .header {
      width: 100%;
      height: 120px;
      background-image: linear-gradient(-232deg, #5ec2a7 0%, #5fb7f5 100%);

      @include respond-to(mobile) {
        height: auto;
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
      }

      .titleblock {
        .titlecontainer {
          height: 100%;
          display: flex;
          flex-wrap: wrap;
          align-content: flex-end;

          .date {
            color: #000000;
            font-family: Faustina;
            font-size: 16px;
            font-weight: 400;
            line-height: 36px;
            letter-spacing: 1px;
            text-align: right;
            margin: 0;
            padding: 0;
            width: 100%;
          }
          .title {
            color: #000000;
            font-family: Faustina;
            font-size: 36px;
            font-weight: 700;
            line-height: 36px;
            letter-spacing: 2px;
            text-align: right;
            margin: 0;
            padding: 0;
            width: 100%;
            margin-bottom: 20px;
          }
        }
      }

      .content {
        border-top: 3px solid #efeeee;
        padding-top: 30px;

        .col-third {
          flex: 1;
          flex-shrink: 2;
          flex-grow: 1;

          .boxes {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            border-bottom: 13px solid transparent;
            margin: 0 auto;
            position: relative;
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
            width: 100%;
            height: 44px;
            padding-left: 60px;
            position: relative;
            line-height: 44px;
            font-size: 16px;
            font-family: Faustina;

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
        }
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

          p {
            margin: 0;
            padding: 0 20px 20px 20px;
          }
        }
      }
    }
  }
</style>
<style lang="scss">
.col-two-thirds {
  p {
    margin: 0;
    padding: 0 20px 20px 20px;
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
