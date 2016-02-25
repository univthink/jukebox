(function () {
  'use strict';

  angular
    .module('jukebox', ['ngRoute', 'ngAnimate', 'ui.bootstrap', 'as.sortable', 'ngTouch', 'ngCookies', 'matchMedia'])
    .config(routeProvider);

  function routeProvider($routeProvider) {
    $routeProvider
      .when('/:roomId', {
        controller: 'QueueController',
        templateUrl: 'queue/queue.html'
      })
      .when('/', {
        controller: 'HomeController',
        templateUrl: 'home/home.html'
      })
      .otherwise({
        redirectTo: '/'
      });
  }
})();
