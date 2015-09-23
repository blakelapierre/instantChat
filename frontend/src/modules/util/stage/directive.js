import _ from 'lodash';

module.exports = ['$compile', ($compile) => {
  return {
    restrict: 'E',
    compile: (element, attributes) => {
      const stage = element[0],
            {children} = stage,
            scenes = {},
            childLinks = [];

      let firstChildName = children.length > 0 ? children[0].localName : undefined;

      _.each(children, (child, index) => {
        let {localName} = child;

        localName = localName.replace('-', '');

        if (!scenes[localName]) {
          scenes[localName] = child;
        }

        child.setAttribute('ng-if', localName);
      });

      _.each(children, child => {
        childLinks.push($compile(child));
      });

      return link;

      function link($scope) {
        console.log(element, children, scenes, $scope);

        _.each(childLinks, link => link($scope));

        if (firstChildName) {
          show(firstChildName);
        }

        $scope.show = show;
        $scope.hide = hide;

        let lastDirection;
        function show(name, direction) {
          if (lastDirection) element.removeClass(lastDirection);
          element.addClass(direction);
          lastDirection = direction;

          name = name.replace('-', '');

          _.each(scenes, (el, sceneName) => {
            const isScene = name === sceneName;
            $scope[sceneName] = isScene;
          });
          $scope.currentScene = name;
          console.log('showed', name, direction, $scope);
        }

        function hide(name) {
          $scope[name] = false;
          console.log('hide', $scope);
        }
      }
    },
    controller: ['$scope', function($scope) {
      this.show = name => $scope.show(name);
      this.hide = name => $scope.hide(name);
      this.done = name => gotoNext(name);

      function gotoNext(name) {
        const {transitions} = $scope,
              next = transitions[name] || transitions.DEFAULT;
        console.log(name, 'is done; going to', next);
        $scope.show(next);
      }
    }]
  };
}];