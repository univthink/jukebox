(function () {
  'use strict';

  angular
    .module('jukebox', ['ngRoute'])
    .config(routeProvider);

  function routeProvider($routeProvider) {
    $routeProvider
      .when('/', {
        controller: 'SongsController',
        templateUrl: 'songs/songs.html'
      })
      .when('/song/:songId?', {
        controller: 'SongInfoController',
        templateUrl: 'songs/song-info.html'
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
