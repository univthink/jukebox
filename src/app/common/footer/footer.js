(function () {

  'use strict';

  angular
    .module('jukebox')
    .directive('footer', footer);

  function footer() {
    return {
      restrict: 'A',
      replace: true,
      scope: {

      },
      templateUrl: 'common/footer/footer.html'
    };
  }

})();