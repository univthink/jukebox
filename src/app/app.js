(function () {
  'use strict';

  angular
    .module('jukebox', ['ngRoute', 'ngAnimate', 'ui.bootstrap', 'as.sortable', 'ngTouch', 'ngCookies', 'matchMedia', 'spotify'])
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
    .config(['$compileProvider', '$routeProvider', '$locationProvider', 'SpotifyProvider', function ($compileProvider, $routeProvider, $locationProvider, SpotifyProvider) {

      $compileProvider.debugInfoEnabled(false);

      $routeProvider
        .when('/dataviz', {
          controller: 'DatavizController',
          templateUrl: 'dataviz/dataviz.html'
        })
        .when('/spotify_login', {
          templateUrl: 'dataviz/spotify_login.html'
        })
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

      // use the HTML5 History API
      $locationProvider.html5Mode(true);

      SpotifyProvider.setClientId('39903cb10e0a4f6da882d6c53db62776');
      //SpotifyProvider.setRedirectUri('http://127.0.0.1:8080/spotify_login/');
      SpotifyProvider.setRedirectUri('http://localhost:8080/spotify_login/');
      SpotifyProvider.setScope('user-library-read user-top-read');
      // If you already have an auth token
      // SpotifyProvider.setAuthToken('zoasliu1248sdfuiknuha7882iu4rnuwehifskmkiuwhjg23');
    }]);

})();
