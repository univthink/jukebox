(function () {
  'use strict';

  angular
    .module('jukebox', [
      'ngRoute',
      'ui.bootstrap',
      'as.sortable',
      'ngTouch',
    ])
    // .config(function($locationProvider) {
    //   $locationProvider.html5Mode(true);
    // })
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
