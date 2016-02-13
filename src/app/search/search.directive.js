(function () {

  'use strict';

  angular
    .module('jukebox')
    .directive('search', search);

  function search() {
    return {
      restrict: 'A',
      replace: true,
      scope: {

      },
      templateUrl: 'search/search.html',
      controller: ['$scope', function($scope) {

      }]
    };
  }

})();