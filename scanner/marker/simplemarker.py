import re
from os import path
import _pickle as pickle
import pycrfsuite

from .tokeniser.tokeniser import generate_tokenizer, process
from .tagger.train_lemmatiser import extract_features_lemma
from .tagger.train_tagger import extract_features_msd

# to render stuff in html
import fileinput
import json

reldir = path.dirname(path.abspath(__file__))
# test_text = open('test.txt', 'r').readlines()[0]

class Tokeniser:
    """
    Tokeniser wrapper class.
    Use tokenise(self, txt) for full result.
    Use only_tokens(self, processed) with output from tokenise(self, txt) to only get tokens.
    Use represent_from_tokeniser(self, processed) with output from tokenise(self, txt) to inspect/debug output.
    """

    def __init__(self):
        print('Tokeniser initialised.')

    def represent_from_tokeniser(self, processed):
        for sentence in processed:
            for token, start, end in sentence:
                if not token[0].isspace():
                    print(token)

    def test_me(self):
        tokenizer = generate_tokenizer('sl')
        represent_from_tokeniser(process['standard'](tokenizer, test_text, 'sl'))

    def tokenise(self, txt):
        tokenizer = generate_tokenizer('sl')
        return process['standard'](tokenizer, txt, 'sl')

    def only_tokens(self, processed):
        output = []

        for sentence in processed:
            for token, start, end in sentence:
                if not token[0].isspace():
                    output.append(token)
        
        return output

class Tagger:
    """
    Wraper class for the tagger
    Use tag_and_lemmatise_tokens()
    """

    trie = pickle.load(open(path.join(reldir, 'tagger/sl.marisa'), 'rb'), encoding='bytes')
    tagger = pycrfsuite.Tagger()
    tagger.open(path.join(reldir, 'tagger/sl.msd.model'))
    lemmatiser = {'model': pickle.load(open(path.join(reldir, 'tagger/sl.lexicon.guesser'), 'rb'), encoding="bytes"),
                  'lexicon': pickle.load(open(path.join(reldir, 'tagger/sl.lexicon'), 'rb'), encoding="bytes")}

    def __init__(self):
        print('Tagger initialised.')

    def tag_sent(self, sent):
        return self.tagger.tag(extract_features_msd(sent, self.trie))
    
    def tag_lemmatise_sent(self, sent):
        return [(a, self.get_lemma(b, a)) for a, b in zip(self.tag_sent(sent), sent)]
    
    def get_lemma(self, token, msd):
        lexicon = self.lemmatiser['lexicon']
        key = token.lower() + '_' + msd
        if key in lexicon:
            return lexicon[key][0].decode('utf8')
        if msd[:2] != 'Np':
            for i in range(len(msd) - 1):
                for key in lexicon.keys(key[:-(i + 1)]):
                    return lexicon[key][0].decode('utf8')
        return self.guess_lemma(token, msd)
    
    def guess_lemma(self, token, msd):
        if len(token) < 3:
            return self.apply_rule(token, "(0,'',0,'')", msd)
        model = self.lemmatiser['model']
        if msd not in model:
            return token
        else:
            lemma = self.apply_rule(token, model[msd].predict(extract_features_lemma(token))[0], msd)
            if len(lemma) > 0:
                return lemma
            else:
                return token
    
    def apply_rule(self, token, rule, msd):
        rule = list(eval(rule))
        if msd:
            if msd[:2] == 'Np':
                lemma = token
            else:
                lemma = token.lower()
        else:
            lemma = token.lower()
        rule[2] = len(token) - rule[2]
        lemma = rule[1] + lemma[rule[0]:rule[2]] + rule[3]
        return lemma

    def test_me(self):
        t = Tokeniser()
        totag = t.only_tokens(t.tokenise(test_text))
        print(totag)
        tags = self.tag_lemmatise_sent(totag)
        print(tags)
    
    def test_custom(self, txt):
        t = Tokeniser()
        totag = t.only_tokens(t.tokenise(txt))
        tags = self.tag_lemmatise_sent(totag)
    
    def tag_and_lemmatise_tokens(self, tokens):
        return self.tag_lemmatise_sent(tokens)

class SimpleMarker:
    """
    Simple marker class. Returns colored words and phrases from a list of tokens.
    TODO: Does not really anticipate phrases (expects full tokenization).
    """

    def __init__(self):
        print('Simple marker initialised.')
    
    def find_in_wordlist_file(self, filepath, tokens):
        """Returns words and phrases from a list of tokens in  a file."""
        words = []
        with open(filepath) as infile:
            words_to_match = [word.split('#')[0].strip() for word in infile.readlines()]
            
            for token in tokens:
                if token in words_to_match:
                    words.append(token)
        
        return words

    def get_purple(self, tokens):
        """
        Returns purple words and phrases from a list of tokens.
        TODO: Fix dirty hack where you split the string at '.' to remove punctuation. Update tokenizer maybe?
        TODO: "me" je lahko zaimek prve osebe ednine če govori oseba ženskega spola.
        TODO: Rethink use of .lower().
        """

        output = []
        purple_list = self.find_in_wordlist_file('marker/wordlists/purple.txt', tokens)
        time_regex = re.compile(r'\d\d?[hH\.]')
        # 1-grams
        for i, token in enumerate(tokens):
            if token.lower() in purple_list:
                output.append(token)
            if i < len(tokens) - 1:
                print(token + tokens[i + 1])
                if time_regex.match(token.lower() + tokens[i + 1].lower()):
                    output.append((token + tokens[i + 1]).split('.')[0])

        # go for ngrams
        # two_grams = [n_gram_to_string(n_gram) for n_gram in find_ngrams(tokens, 2)]
        # print(two_grams)
        # for n_gram in two_grams:
        #     if n_gram in purple_list:
        #         output.append(n_gram)
        
        return output
    
    class PurpleMarker:
        with open('marker/wordlists/purple.txt', 'r') as infile:
            purple_words = [line.split('#')[0].strip() for line in infile.readlines()]
        
        def is_purple(self, lemmatised_token):
            return lemmatised_token in self.purple_words
    
    def get_blue(self, tokens, tagger):
        """
        Return blue words and phrases from a list of tokens.
        """

        output = []

        lemmatised_tokens = [token[1] for token in tagger.tag_and_lemmatise_tokens(tokens)]
        blue_list = self.find_in_wordlist_file('marker/wordlists/blue.txt', lemmatised_tokens)

        return blue_list
    
    class BlueMarker:
        with open('marker/wordlists/blue.txt', 'r') as infile:
            blue_words = [line.split('#')[0].strip() for line in infile.readlines()]
        
        def is_blue(self, lemmatised_token):
            return lemmatised_token in self.blue_words

    
    def get_orange(self, tokens, tagger):
        """
        Return orange words and phrases from a list of tokens.
        """

        output = []

        lemmatised_tokens = [token[1] for token in tagger.tag_and_lemmatise_tokens(tokens)]
        orange_list = self.find_in_wordlist_file('marker/wordlists/orange.txt', lemmatised_tokens)

        return orange_list
    
    class OrangeMarker:
        with open('marker/wordlists/orange.txt', 'r') as infile:
            orange_words = [line.split('#')[0].strip() for line in infile.readlines()]
        
        def is_orange(self, lemmatised_token):
            return lemmatised_token in self.orange_words

    def get_pink(self, tokens, tagger):
        """
        Return pink words and phrases from a list of tokens.
        """

        output = []

        lemmatised_tokens = [token[1] for token in tagger.tag_and_lemmatise_tokens(tokens)]
        pink_list = self.find_in_wordlist_file('marker/wordlists/pink.txt', lemmatised_tokens)

        return pink_list
    
    class PinkMarker:
        with open('marker/wordlists/pink.txt', 'r') as infile:
            pink_words = [line.split('#')[0].strip() for line in infile.readlines()]
        
        def is_pink(self, lemmatised_token):
            return lemmatised_token in self.pink_words
    
    def get_circle(self, tokens, lemmatised_tokens):
        """
        Return circled words and phrases from a list of tokens.
        TODO: Osebne glagolske oblike.
        """

        output = []

        circle_list = self.find_in_wordlist_file('marker/wordlists/circle.txt', tokens)

        # lemmatised_tokens = tagger.tag_and_lemmatise_tokens(tokens)

        # in a perfect world
        # osebni_glagoli_re = re.compile('Vm..[123].*')
        for i, token in enumerate(lemmatised_tokens):
            print(token)
            # check if osebni glagol
            
            # if osebni_glagoli_re.match(token[0]):
            print(lemmatised_tokens)
            #    print(token[0], token[1], tokens[i])
            #    circle_list.append(tokens[i])

        return circle_list
    
    class SemiCircleMarker:
        with open('marker/wordlists/circle.txt', 'r') as infile:
            circle_words = [line.split('#')[0].strip() for line in infile.readlines()]
        
        def is_circle(self, lemmatised_token):
            return lemmatised_token in self.circle_words
    
    def mark_text(self, txt):
        tagger = Tagger()
        tokeniser = Tokeniser()
        marked_sentences = []
        
        # MARKERS
        blue_marker = self.BlueMarker()
        purple_marker = self.PurpleMarker()
        orange_marker = self.OrangeMarker()
        pink_marker = self.PinkMarker()
        circle_marker = self.SemiCircleMarker()
        

        sentences = tokeniser.tokenise(txt)
        
        for sentence in sentences:
            only_tokens = [token[0] for token in sentence]
            tagged_tokens = tagger.tag_and_lemmatise_tokens(only_tokens)

            # yellow_words = [False for token in only_tokens]
            # green_words = [False for token in only_tokens]
            # underlined_words = [False for token in only_tokens]
            blue_words = [blue_marker.is_blue(token[1].lower()) for token in tagged_tokens]
            purple_words = [purple_marker.is_purple(token.lower()) for token in only_tokens] # purple gets original input
            orange_words = [orange_marker.is_orange(token[1].lower()) for token in tagged_tokens]
            pink_words = [pink_marker.is_pink(token[1].lower()) for token in tagged_tokens]

            wordlist_circled_words = [circle_marker.is_circle(token[1].lower()) for token in tagged_tokens]
            # this was removed from below `and tagged_tokens[i][1] != 'biti'`
            tagger_circled_words = [(('VForm' in tagged_tokens[i][0]) and ('infinitive' not in tagged_tokens[i][0])) for i, token in  enumerate(only_tokens)]

            circled_words = [a or b for a, b in zip(wordlist_circled_words, tagger_circled_words)]

            marked_sentences.append(list(zip([token[0] for token in sentence],
                                             tagged_tokens,
                                             [token[1] for token in sentence],
                                             [token[2] for token in sentence],
                                             [{'yellow': False, 'green': False, 'underline': False, 'blue': blue, 'purple': purple, 'orange': orange, 'pink': pink, 'circled': circled} for blue, purple, orange, pink, circled in zip(blue_words, purple_words, orange_words, pink_words, circled_words)])))

        return marked_sentences
    
    def generate_class_string(self, classes):
        class_string = ''
        for c in classes:
            if classes[c]:
                class_string += ' ' + c
        
        return class_string.strip()

    def render_marked(self, marked_sentences):
        rendered_text = ''
        for sentence in marked_sentences:
            for token in sentence:
                class_string = self.generate_class_string(token[4])
                if class_string != '':
                    rendered_text += ' <span class="' + class_string + '">' + token[0] + '</span>'
                else:
                    rendered_text += token[0]
        
        return rendered_text
    
    def mark_render_display(self, txt):
        marked = self.mark_text(txt)
        # rendered = self.render_marked(marked)

        # found_mark = False
        # for line in fileinput.input('display/index.html', inplace=True):
        #     if found_mark:
        #         print(rendered)
        #         found_mark = False
        #     else:
        #         print(line.strip())
        #     if line.strip() == '<!-- content comes below -->':
        #         found_mark = True
        
        with open('display/data.js', 'w') as outfile:
            outfile.write('var thedata = ' + json.dumps(marked))
        
        print('Text marked and saved.')
