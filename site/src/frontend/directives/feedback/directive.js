module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    scope: true,
    controller: ['$scope', '$resource', ($scope, $resource) => {
      var Suggestions = $resource('/suggestions/:id', {id: '@id'});

      $scope.submitSuggestion = () => {
        Suggestions.save({
          text: $scope.newSuggestion,
          image: null // include user's picture
        }, () => {
          $scope.newSuggestion = '';
          getSuggestions();
        });
      };

      $scope.voteDown = suggestion => {
        Suggestions.save({
          id: suggestion.id,
          vote: 'down'
        }, response => {
          _.extend(suggestion, response.suggestion);
        });
      };

      $scope.voteUp = suggestion => {
        Suggestions.save({
          id: suggestion.id,
          vote: 'up'
        }, response => {
          _.extend(suggestion, response.suggestion);
        });
      };

      function getSuggestions() {
        Suggestions.get(null, suggestions => {
          console.log(suggestions);
          $scope.suggestions = suggestions.suggestions;
        });
      }

      getSuggestions();
    }]
  };
};