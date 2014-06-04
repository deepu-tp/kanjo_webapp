/*****************************************************************************/
/* Wordcloud Methods */
/*****************************************************************************/

// From Jonathan Feinberg's cue.language, see lib/cue.language/license.txt.
var stopWords = /^(url|user|media|i|me|my|myself|we|us|our|ours|ourselves|you|your|yours|yourself|yourselves|he|him|his|himself|she|her|hers|herself|it|its|itself|they|them|their|theirs|themselves|what|which|who|whom|whose|this|that|these|those|am|is|are|was|were|be|been|being|have|has|had|having|do|does|did|doing|will|would|should|can|could|ought|i'm|you're|he's|she's|it's|we're|they're|i've|you've|we've|they've|i'd|you'd|he'd|she'd|we'd|they'd|i'll|you'll|he'll|she'll|we'll|they'll|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|doesn't|don't|didn't|won't|wouldn't|shan't|shouldn't|can't|cannot|couldn't|mustn't|let's|that's|who's|what's|here's|there's|when's|where's|why's|how's|a|an|the|and|but|if|or|because|as|until|while|of|at|by|for|with|about|against|between|into|through|during|before|after|above|below|to|from|up|upon|down|in|out|on|off|over|under|again|further|then|once|here|there|when|where|why|how|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|say|says|said|shall)$/,
    punctuation = /[!"&()*+,-\.\/:;<=>?\[\\\]^`\{|\}~]+/g,
    wordSeparators = /[\s\u3031-\u3035\u309b\u309c\u30a0\u30fc\uff70]+/g,
    discard = /^(@|https?:)/,
    htmlTags = /(<[^>]*?>|<script.*?<\/script>|<style.*?<\/style>|<head.*?><\/head>)/g,
    matchTwitter = /^https?:\/\/([^\.]*\.)?twitter\.com/;


tokenCounts = function(text){
  token = {};
  var cases = {};
  text.split(wordSeparators).forEach(function(word) {
    if (discard.test(word)) return;
    word = word.replace(punctuation, "");
    if (stopWords.test(word.toLowerCase())) return;
    token[word = word.toLowerCase()] = (token[word] || 0) + 1;
  });
  return token
}


Meteor.methods({
  '/app/wordcloud': function (query, location, start_date, end_date) {
    cur = Tweets.find(
        {
            created_at : {$gte : start_date.getTime() / 1000,
                          $lt : end_date.getTime() / 1000},
            query : query,
            geo_string: {
                  $regex : new RegExp('^'+location, 'i')
            }
        },
        {
            fields : {'text' : 1}
        }
    )

    var tweets = _.pluck(cur.fetch(), 'text')
    var tokens = tokenCounts(tweets.join(' '))
    var words = _.map(_.pairs(tokens), function(t){
        return {'text' : t[0], 'size' : t[1]}
    })

    words = _.sortBy(words, function(x){
      return -x['size']
    })

    words = words.slice(0, 200)
    return words


  }
});
