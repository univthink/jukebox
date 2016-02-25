(function () {
  'use strict';

  angular
    .module('jukebox', ['ngRoute', 'ngAnimate', 'ui.bootstrap', 'as.sortable', 'ngTouch', 'ngCookies', 'matchMedia'])
    .directive('compile', function($compile, $timeout) {
      return {
        restrict: 'A',
        link: function(scope, elem, attrs) {
          $timeout(function() {
            $compile(elem.contents())(scope);
          });
        }
      }
    })
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
