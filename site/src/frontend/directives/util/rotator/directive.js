module.exports = ['$interval', ($interval) => {
  return {
    restrict: 'E',
    link: ($scope, element, attributes) => {
      var children = element[0].children,
          currentIndex = 0;

      console.log(element);

      if (children.length > 0) children[0].classList.add('active');

      $interval(rotate, parseInt(attributes.interval || "1000"));

      function rotate() {
        var active = children[currentIndex];
        if (active) active.classList.remove('active'); // The node may (!) have disappeared

        currentIndex = (currentIndex + 1) % children.length;
        children[currentIndex].classList.add('active');
      }
    }
  };
}];