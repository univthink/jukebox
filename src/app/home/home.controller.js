(function () {

  'use strict';

  angular
    .module('jukebox')
    .controller('HomeController', homeController);

  function homeController($scope) {
    $scope.pageClass = 'home-page';
  }

})();