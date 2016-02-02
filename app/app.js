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

  app.config(function($routeProvider) {
    $routeProvider.when('/', {
      controller: 'SongsController',
      templateUrl: 'app/views/songs.html'
    })
    .when('/search', {
      controller: 'UnknownController',
      templateUrl: 'app/views/unknown.html'
    });
  });

  app.controller('UnknownController', function($scope) {

  });

  app.controller('SongsController', function($scope) {
    $scope.songs = [
      { "name":"The Yellow Submarine", "artist":"The Beatles", "price":1.29 },
      { "name":"Hello", "artist":"Adele", "price":.99 },
      { "name":"Stairway to Heaven", "artist":"Led Zeppelin", "price":.59 }
    ]
  });

})();