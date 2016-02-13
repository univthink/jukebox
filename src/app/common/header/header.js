(function () {

  'use strict';

  angular
    .module('jukebox')
    .directive('header', header);

  function header() {
    return {
      restrict: 'A',
      replace: true,
      scope: {

      },
      templateUrl: 'common/header/header.html'
    };
  }

})();