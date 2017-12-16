function getSelectedText() {
  t = (document.all) ? document.selection.createRange().text : document.getSelection();

  return t;
}

function clearSelection() {
  if (document.selection) {
    document.selection.empty();
  } else if (window.getSelection) {
    window.getSelection().removeAllRanges();
  }
}

function getIndicesOf(searchStr, str, caseSensitive) {
  var searchStrLen = searchStr.length;
  if (searchStrLen == 0) {
    return [];
  }
  var startIndex = 0,
    index, indices = [];
  if (!caseSensitive) {
    str = str.toLowerCase();
    searchStr = searchStr.toLowerCase();
  }
  while ((index = str.indexOf(searchStr, startIndex)) > -1) {
    indices.push(index);
    startIndex = index + searchStrLen;
  }
  return indices;
}

$(document).ready(function() {

  new Vue({
    el: '#statements',
    data: function() {
      return {
        selectedFilter: null,
        filters: {
          yellow: 'Z rumeno barvo označujemo stavke, ki so v nikalni obliki, ter nepomembne informacije, brez katerih bi zgodba še vedno “stala”.',
          green: 'Z zeleno barvo označujemo osebe v izjavi pa tudi relevantne spremembe jezika. V drugem primeru s puščico označimo besede, ki so v medsebojni relaciji.',
          blue: 'Z modro barvo označujemo izraze zapuščanja lokacije z glagoli, ki pomensko ustrezajo angl. besedi “leave”: zapustiti, oditi, odpraviti se itd. Poleg tega z modro barvo označujemo še vsakršno pojasnjevanje oz. navajanje razlogov (ker, zato, da bi, torej ipd.).',
          purple: 'Z vijoličasto barvo označujemo needninske zaimke v 1. osebi (mi, midva) ter navajanje točnega časa, kar dogajanje, ki je opisano v izjavi, umešča v objektiven časovni okvir.',
          orange: 'Z oranžno barvo označujemo navajanje vsakršne komunikacije (povedati, reči, odgovoriti …).',
          pink: 'Z roza barvo označujemo manjkajoč oz. relativen čas (npr. potem, zatem, prej, nato, takrat ipd.).',
          circled: 'Z obkroževanjem označujemo osebne zaimke in osebne glagolske oblike.',
          underline: 'S podčrtovanjem označujemo nepravilno uporabo časa.',
          connection: 'S puščicami povežemo besede, ki predstavljajo spremembe jezika. Slednje označujemo z zeleno barvo.'
        },
        sentences: thedata,
      }
    },
    computed: {
      selectedFilterDescription: function() {
        if (this.selectedFilter) {
          return this.filters[this.selectedFilter];
        } else {
          return 'Za razlago min filtriranje SCAN parametrov klikni na zgornji barvni označevalec.';
        }
      },
      renderedText: function() {
        var fullText = this.sentences.reduce(function(prev, cur) {
          var sentence = cur.reduce(function(prev, cur) {
            var word = cur[0];
            var classString = '';
            for (key in cur[4]) {
              if (cur[4][key]) {
                classString += ` ${key}`;
              }
            }
            return `${prev}<span class="${classString}">${word}</span>`;
          }, '');
          return prev + sentence;
        }, '');

        return fullText;
      },

      justText: function() {
        var fullText = this.sentences.reduce(function(prev, cur) {
          var sentence = cur.reduce(function(prev, cur) {
            var word = cur[0];
            return `${prev}${word}`;
          }, '');
          return prev + sentence;
        }, '');

        return fullText;
      },

      justWords: function() {
        var words = [];
        this.sentences.forEach(function(e, i) {
          e.forEach(function(f, j) {
            f.push([i, j]);
            words.push(f);
          });
        });

        return words;
      },
    },
    methods: {
      updateData: function() {
        console.log(this.sentences);
        $.post('http://127.0.0.1:8000/update-marked/', {
            id: document.location.href.split('id=')[1],
            data: JSON.stringify(this.sentences),
        }, function(r) {
          document.location.reload();
        });
      },
      createNew: function() {
        document.location.href = '/new/';
      },
      listAll: function()  {
        document.location.href = '/all/';
      },
      activateFilter: function(name) {
        if (this.selectedFilter === name) {
          this.selectedFilter = null
          $('.arrow').removeClass('hidden');
        } else {
          this.selectedFilter = name;
          if (name === 'connection') {
            $('.arrow').removeClass('hidden');
          } else {
            $('.arrow').addClass('hidden');
          }
        }
      },

      drawConnections: function() {
        var pairs = [];
        $.each($('.connection'), function(i, e) {
          if (0 < i) {
            pairs.push([$('.connection')[i - 1], e]);
          }
        });
        pairs.forEach(function(e, i) {
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

      selectText: function() {
        var selection = getSelectedText();
        console.log(selection);
        var selection_text = selection.toString();
        if (selection_text.length > 0) {
          // something is selected
          if (selection.anchorOffset > 0) {
            alert('Prosim izbiraj pazljivo. Samo cele besede. :)')
          } else if (this.selectedFilter) {
            // a filter is selected, time to find the words selected
            console.log(selection_text);
            console.log(selection);
            indexOfSelectionText = this.justText.indexOf(selection_text);
            console.log(indexOfSelectionText);

            // find first word index
            var firstWords = this.justWords.filter(function(e, i) {
              return e[2] === indexOfSelectionText;
            });
            if (firstWords.length === 1) {
              var firstWordCoords = firstWords[0][5];
            } else {
              alert('Našel sem več kot eno prvo besedo ...');
            }
            // var firstWord = this.justWords[$(selection.anchorNode).parent().index()];
            // console.log($(selection.anchorNode).parent().index());
            // var firstWordCoords = firstWord[5];
            // console.log(firstWordCoords);

            // find last word index
            var lastWords = this.justWords.filter(function(e, i) {
              return e[3] === indexOfSelectionText + selection_text.length;
            });
            if (lastWords.length === 1) {
              var lastWordCoords = lastWords[0][5];
            } else {
              alert('Našel sem več kot eno zadnjo besedo ...')
            }

            console.log(firstWordCoords, lastWordCoords);

            // let's update all the sentences
            currentSentence = firstWordCoords[0];
            currentWord = firstWordCoords[1];
            lastSentence = lastWordCoords[0];
            lastWord = lastWordCoords[1];

            // while currentSentence isn't the last one, we can mark all the words
            while (currentSentence < lastSentence) {
              console.log(currentSentence, lastSentence);
              while (currentWord < this.sentences[currentSentence].length) {
                console.log(currentWord, this.sentences[currentSentence].length);
                this.sentences[currentSentence][currentWord][4][this.selectedFilter] = !this.sentences[currentSentence][currentWord][4][this.selectedFilter];
                // increment currentWord
                currentWord += 1;
              }
              // increment sentence
              currentSentence += 1;
              // reset word count
              currentWord = 0;
            }

            if (currentSentence === lastSentence) {
              while (currentWord <= lastWord) {
                console.log(currentWord, this.sentences[currentSentence].length);
                this.sentences[currentSentence][currentWord][4][this.selectedFilter] = !this.sentences[currentSentence][currentWord][4][this.selectedFilter];
                // increment currentWord
                currentWord += 1;
              }
            }

            // var span = document.createElement('span');
            // $(span).addClass(this.selectedFilter);
            // span.textContent = selection_text;

            // var range = selection.getRangeAt(0);
            // range.deleteContents();
            // range.insertNode(span);
          } else {
            // filter not selected
            alert('Izberi filter!');
          }

          // clearSelection();
        }
      },
    },
    mounted() {
      // WARNING! THIS IS A HACK
      var _this = this;
      window.setTimeout(function() {
        _this.drawConnections();
      }, 100);
      $(window).on('resize', function() {
        _this.drawConnections();
      });
    }
  });

});


// TODO
// dodaj združevanje
// avtomatska grupacija rumeno, zeleno, modro, vijoličasto, podčrtovanje
// pri puščičah rabimo dve barvi, eno je zelena, eno pa rabimo za takrat, ko se odstopa, lahko je rdeča (podčrtano)
// na display sajtu verjetno najprej opis, pa potem vse ostalo

// RAČUNI
// Jasmina izdaj račun za 500 EUR
// Pogodba a je šla naprej?