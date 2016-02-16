(function () {
  'use strict';

  angular
    .module('jukebox', ['ngRoute', 'ngAnimate', 'ui.bootstrap'])
    .config(routeProvider);

  function routeProvider($routeProvider) {
    $routeProvider
      .when('/search/:roomId', {
        controller: 'SearchController',
        templateUrl: 'search/search.html'
      })
      .when('/:roomId?', {
        controller: 'QueueController',
        templateUrl: 'queue/queue.html'
      })
      .otherwise({
        redirectTo: '/'
      });
  }

})();
// angular.module('jukebox', [
//   'ngRoute',
//   'jukebox.todo'
// ])
// .config(function ($routeProvider) {
//   'use strict';
//   $routeProvider
//     .when('/todo', {
//       controller: 'TodoCtrl',
//       templateUrl: '/jukebox/todo/todo.html'
//     })
//     .otherwise({
//       redirectTo: '/todo'
//     });
// });
