(function () {
  'use strict';

  angular
    .module('jukebox', ['ngRoute', 'ngAnimate', 'ui.bootstrap', 'as.sortable', 'ngTouch', 'ngCookies'])
    .config(routeProvider);

  function routeProvider($routeProvider) {
    $routeProvider
      .when('/:roomId?', {
        controller: 'QueueController',
        templateUrl: 'queue/queue.html'
      })
      .otherwise({
        redirectTo: '/'
      });
  }
})();
