(function () {

  'use strict';

  angular
    .module('jukebox')
    .directive('plusButton', plusButton);

  function plusButton() {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'common/plusButton/plusButton.html',
      controller: ['$scope', '$uibModal', function($scope, $uibModal) {
        $scope.showSearch = function() {
          $uibModal.open({
            templateUrl: 'search/search.html',
            controller: 'SearchController',
            windowClass: 'search-page',
            keyboard: false
          });
        };
      }]
    };
  }

})();