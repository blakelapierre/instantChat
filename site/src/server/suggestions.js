var _ = require('lodash');

module.exports = function(router) {
  console.log('mounting /suggestions');

  var suggestions = [];

  router.get('/suggestions', function(req, res) {
    res.json({suggestions: suggestions});
  });

  router.post('/suggestions', function(req, res) {
    var text = req.body.text;

    var suggestion = {
      id: suggestions.length,
      text: text,
      created_at: new Date().getTime(),
      up_count: 1,
      down_count: 0,
      power: 1
    };

    suggestions.push(suggestion);

    res.json({suggestion: suggestion});
  });

  router.post('/suggestions/:id', function(req, res) {
    var id = parseInt(req.params.id),
        vote = req.body.vote,
        suggestion = _.find(suggestions, {id: id});

    if (suggestion) {
      if (vote == 'down') suggestion.down_count++;
      else if (vote == 'up') suggestion.up_count++;

      suggestion.power = ((suggestion.up_count + 1) / (suggestion.down_count + 1)) * Math.log(suggestion.down_count + suggestion.up_count);

      updateOrder();

      res.json({suggestion: suggestion});
      return;
    }

    res.head(404);
    res.end();
  });

  var updateOrder = _.debounce(function() {
    suggestions.sort(function(a, b) {
      return a.power >= b.power ? -1 : 1;
    });
  }, 1000);
};