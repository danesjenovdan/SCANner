class SentenceTokenizer:
    """A simple sentence tokenizer."""

    def __init__(self):
        print('Sentence tokenizer initialised.')

    def split_at_punct(self, text):
        r = re.compile('[.!?]')
        return r.split(text)

class WordTokenizer:
    """A simple word tokenizer."""

    def __init__(self):
        print('Word tokenizer initialised.')
    
    def split_at_space(self, text):
        r = re.compile(' ')
        return r.split(text)

def find_ngrams(tokens, n):
    return zip(*[tokens[i:] for i in range(n)])

def n_gram_to_string(n_gram):
    result = ''
    for word in n_gram:
        if len(result) == 0:
            result += word
        else:
            result += word + ' '