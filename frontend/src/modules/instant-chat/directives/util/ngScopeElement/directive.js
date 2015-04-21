//http://stackoverflow.com/questions/15881453/angularjs-accessing-dom-elements-inside-directive-template

module.exports = () => {
  return {
    restrict: "A",
    compile: function compile(tElement, tAttrs, transclude) {
      return {
        pre: function preLink(scope, iElement, iAttrs, controller) {
          scope[iAttrs.ngScopeElement] = iElement;
        }
      };
    }
  };
};