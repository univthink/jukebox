(function () {

  'use strict';

  angular
    .module('jukebox')
    .directive('plusButton', plusButton);

  function plusButton() {
    return {
      restrict: 'A',
      replace: true,
      scope: {
        roomId: '='
      },
      templateUrl: 'common/plusButton/plusButton.html',
      controller: ['$scope', function($scope) {
        console.log($scope.roomId);
      }]
    };
  }

})();