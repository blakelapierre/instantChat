module.exports = ['$interval', ($interval) => {
  return {
    restrict: 'E',
    scope: {},
    link: ($scope, element, attributes) => {
      const children = element[0].children;

      if (children.length > 0) children[0].classList.add('active');

      const interval = $interval(rotate, parseInt(attributes.interval || "1000"));

      $scope.$on('$destroy', () => {
        console.log('destroyed interval');
        $interval.cancel(interval);
      });

      let currentIndex = 0;
      function rotate() {
        const active = children[currentIndex];
        if (active) active.classList.remove('active'); // The node may (!) have disappeared

        currentIndex = (currentIndex + 1) % children.length;
        children[currentIndex].classList.add('active');
      }
    }
  };
}];