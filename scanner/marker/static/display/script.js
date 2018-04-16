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
        activeConnectionGroup: null,
        connectionGroups: [],
      }
    },
    computed: {
      renderedText: function() {
        var fullText = this.sentences.reduce(function(prev, cur, i) {
          var sentence = cur.reduce(function(prev, cur, j) {
            var word = cur[0];
            var classString = '';
            for (key in cur[4]) {
              if (cur[4][key]) {
                if (key === 'connectionGroup') {
                  classString += ` cg cg-${cur[4][key]}`;
                } else {
                  classString += ` ${key}`;
                }
              }
            }
            if (word.indexOf('\n\n') === -1) {
              return `${prev}<span class="${classString}" id="${i},${j}" data-sentence="${i}" data-token="${j}">${word}</span>`;
            }
            return `${prev}<span class="${classString}" id="${i},${j}" data-sentence="${i}" data-token="${j}">${word}</span><br><br>`;
          }, '');
          return prev + sentence;
        }, '');

        return fullText;
      },

      justText: function() {
        var fullText = this.sentences.reduce(function(prev, cur) {
          var sentence = cur.reduce(function(prev, cur) {
            var token = cur[0];
            return `${prev}${token}`;
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
      addConnectionGroup: function() {
        this.activeConnectionGroup = this.connectionGroups.length + 1;
        this.connectionGroups.push(this.connectionGroups.length + 1);
      },
      updateData: function() {
        $.post('http://admin.besedogled.si/update-marked/', {
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
          // $('.arrow').removeClass('hidden');
        } else {
          this.selectedFilter = name;
          // if (name === 'connection') {
          //   $('.arrow').removeClass('hidden');
          // } else {
          //   $('.arrow').addClass('hidden');
          // }
        }
      },

      drawConnections: function(group) {
        for (group in this.connectionGroups) {
          var pairs = [];
          var _vueThis = this;
          $.each($(`.cg-${this.connectionGroups[group]}`), function(i, e) {
            if (0 < i) {
              pairs.push([$(`.cg-${_vueThis.connectionGroups[group]}`)[i - 1], e]);
            }
          });
          console.log(pairs);
          pairs.forEach(function(e, i) {
            // let's calculate the length of the diagonal
            var a = Math.abs($(e[0]).offset().left - $(e[1]).offset().left);
            var b = Math.abs($(e[0]).offset().top - $(e[1]).offset().top);
            var c = Math.sqrt((a * a) + (b * b));
            
            // now let's find the centre
            var centre_x = $(e[0]).offset().left + (a / 2);
            var centre_y = $(e[0]).offset().top + (b / 2);

            // and finally the angle
            var angle_right = Math.atan2(a, b) * 180 / Math.PI;
            var angle_left = Math.atan2(b, a) * 180 / Math.PI;

            console.log(`.arrow-group-${group}-${i}`);
            console.log($(`.arrow-group-${group}-${i}`).length);
            if ($(e[0]).offset().left > $(e[1]).offset().left) {
              if ($(`.arrow-group-${group}-${i}`).length < 1) {
                console.log('there is no arrow');
                $('.arrow-template').not('.arrow-display')
                  .clone()
                  .appendTo('body')
                  .addClass('arrow-display')
                  .addClass(`arrow-group-${group}-${i}`)
                  .css({
                    transform: `rotate(${180 - angle_left}deg)`,
                    width: `${c}px`,
                    left: centre_x - ((3 * a) / 2),
                    top: centre_y,
                  });
              } else {
                $(`.arrow-group-${group}-${i}`)
                  .css({
                    transform: `rotate(${180 - angle_left}deg)`,
                    width: `${c}px`,
                    left: centre_x - ((3 * a) / 2),
                    top: centre_y,
                  });
              }
            } else  {
              if ($(`.arrow-group-${group}-${i}`).length < 1) {
                $('.arrow-template').not('.arrow-display')
                  .clone()
                  .appendTo('body')
                  .addClass('arrow-display')
                  .addClass(`arrow-group-${group}-${i}`)
                  .css({
                    transform: `rotate(${90 - angle_right}deg)`,
                    width: `${c}px`,
                    left: centre_x - (a / 2),
                    top: centre_y,
                  });
              } else {
                console.log('there is an arrow');
                $(`.arrow-group-${group}-${i}`)
                  .css({
                    transform: `rotate(${90 - angle_right}deg)`,
                    width: `${c}px`,
                    left: centre_x - (a / 2),
                    top: centre_y,
                  });
              }
            }

            // mirror arrow if necessary
            // console.log($(e[0]).offset().left, $(e[1]).offset().left);
            // if ($(e[0]).offset().left > $(e[1]).offset().left) {
            //   currArrow.css({
            //     transform: `rotate(${90 - angle}deg) rotateX(-1)`,
            //   });
            // }
          });
        }
        // pairs.forEach(function(e, i) {
        //   console.log(i, e);
        //   if ($('.arrow').length < pairs.length) {
        //     $('body').append('<div class="arrow" id="arrow' + i + '"></div>');
        //   }

        //   if ($(e[0]).offset().left < $(e[1]).offset().left) {
        //     $('#arrow' + i).addClass('right');
        //     $('#arrow' + i).css({
        //       top: $(e[0]).offset().top + 10,
        //       left: $(e[0]).offset().left + 10,
        //       bottom: ($(window).height() - ($(e[1]).offset().top + $(e[1]).outerHeight())) + 25,
        //       right: ($(window).width() - ($(e[1]).offset().left + $(e[1]).outerWidth())) + 30,
        //     });
        //   } else {
        //     $('#arrow' + i).addClass('left');
        //     $('#arrow' + i).css({
        //       top: $(e[0]).offset().top + 10,
        //       left: $(e[1]).offset().left + 10,
        //       bottom: ($(window).height() - ($(e[1]).offset().top + $(e[1]).outerHeight())) + 25,
        //       right: ($(window).width() - ($(e[0]).offset().left + $(e[0]).outerWidth())) + 10,
        //     });
        //   }
        // });
      },

      selectText: function() {
        var selection = getSelectedText();
        console.log(selection);
        var selection_text = selection.toString();
        if (selection_text.length > 0) {
          if (this.selectedFilter) {
            // a filter is selected, time to find the words selected

            console.log('thing');
            
            // first word
            console.log(selection.anchorNode.parentElement);
            const sentence_i = selection.anchorNode.parentElement.dataset.sentence;
            const token_i = selection.anchorNode.parentElement.dataset.token;
            var firstWordCoords = [parseInt(sentence_i), parseInt(token_i)];

            // all other words
            var numberOfWords = selection_text.split(' ').length;
            console.log(numberOfWords);
            var numberOfOtherTokens = selection_text.length - selection_text.split(' ').reduce(function(prev, curr) {
              return prev + curr.length;
            }, 0);
            console.log(numberOfOtherTokens);

            // let's update all the sentences
            currentSentence = firstWordCoords[0];
            currentWord = firstWordCoords[1];

            var whileLimit = firstWordCoords[1] + numberOfWords + numberOfOtherTokens;
            
            while (currentWord < whileLimit) {
              if (currentWord === this.sentences[currentSentence].length) {
                whileLimit -= (currentWord - 1);
                currentWord = 0;
                currentSentence += 1;
              }
              console.log(this.sentences[currentSentence][currentWord][1][0]);
              // ignore punctuation for circled words
              if (!((this.sentences[currentSentence][currentWord][1][0] === 'Z') &&
                (this.selectedFilter === 'circled'))) {
                if (this.selectedFilter === 'connection') {
                  // special arrow behavior
                  
                  // first check if group is active
                  if (!this.activeConnectionGroup) {
                    alert('Prosim izberi aktivno skupino "puščic".')
                  } else  {
                    console.log('some group is active');
                    this.$set(this.sentences[currentSentence][currentWord][4], 'connectionGroup', this.activeConnectionGroup);
                    this.$set(this.sentences[currentSentence][currentWord][4], this.selectedFilter, !this.sentences[currentSentence][currentWord][4][this.selectedFilter]);
                    this.$nextTick(this.drawConnections);
                    // this.sentences[currentSentence][currentWord][4].connectionGroup = this.activeConnectionGroup;
                    // this.sentences[currentSentence][currentWord][4][this.selectedFilter] = !this.sentences[currentSentence][currentWord][4][this.selectedFilter];
                  }
                } else {
                  this.sentences[currentSentence][currentWord][4][this.selectedFilter] = !this.sentences[currentSentence][currentWord][4][this.selectedFilter];
                }
              }
              currentWord += 1;
            }
          } else {
            // filter not selected
            alert('Izberi filter!');
          }

          // clearSelection();
        }

      },
    },
    mounted() {
      this.$nextTick(this.drawConnections);
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