module.exports = () => {
  return {
    restrict: 'A',
    require: '?ngModel',
    link: function(scope, element, attr, ngModel) {
      if (!ngModel) return;

      ngModel.$render = () => element.html(ngModel.$viewValue);

      element.bind('blur', () => {
        if (ngModel.$viewValue !== element.html().trim()) {
          return scope.$apply(read);
        }
      });

      function read() {
        console.log("read()");
        return ngModel.$setViewValue(element.html().trim());
      }
    }
  };
};