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

      },
      templateUrl: 'common/plusButton/plusButton.html',
      controller: ['$scope', function($scope) {
        $scope.openSearch = function() {
          console.log('Plus button clicked');
          $('#slide-bottom-popup').modal('show');
        };
      }]
    };
  }

})();