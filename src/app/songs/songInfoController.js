(function () {

  'use strict';

  angular
    .module('jukebox')
    .controller('SongInfoController', songInfoController);

  function songInfoController($scope, $routeParams) {
    //$ means a dependency injection
    $scope.coolNumber = 9000;
    $scope.songId = $routeParams.songId;
  }

})();