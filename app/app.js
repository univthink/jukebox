(function () {
  'use strict';

  var app = angular
    .module('jukebox', [
      'jukebox.jb-footer',
      'jukebox.jb-header',
      'jukebox.queue',
      'jukebox.spotify-search',
      'ngRoute'
    ]);

  // routeProvider marries a view with a controller!
  app.config(function($routeProvider) {
    $routeProvider.when('/', {
      controller: 'SongsController',
      templateUrl: 'views/songs.html'
    })
    .when('/song/:songId?', {
      controller: 'SongInfoController',
      templateUrl: 'views/song-info.html'
    })
    .otherwise({
      redirectTo: '/'
    });
  });

  app.controller('SongInfoController', function($scope, $routeParams) {
    //$ means dependency injection
    $scope.coolNumber = 9000;
    $scope.songId = $routeParams.songId;
  });

  app.controller('SongsController', function($scope) {
    $scope.songs = [
      { "name":"The Yellow Submarine", "artist":"The Beatles", "price":1.29 },
      { "name":"Hello", "artist":"Adele", "price":.99 },
      { "name":"Stairway to Heaven", "artist":"Led Zeppelin", "price":.59 }
    ]
  });

})();