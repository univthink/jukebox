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
    //$ means a dependency injection
    $scope.coolNumber = 9000;
    $scope.songId = $routeParams.songId;
  });

  app.controller('SongsController', function($scope, $http) {
    // $scope.songs = [
    //   { "name":"The Yellow Submarine", "artist":"The Beatles", "price":1.29 },
    //   { "name":"Hello", "artist":"Adele", "price":.99 },
    //   { "name":"Stairway to Heaven", "artist":"Led Zeppelin", "price":.59 }
    // ]
    $scope.myData = {};
    $scope.myData.spotify = {};
    $scope.myData.soundcloud = {};
    $scope.myData.sendQuery = function() {

      //spotify API
      var spotifyResponsePromise = $http.get("https://api.spotify.com/v1/search", {
        "params" : {
          "q" : $scope.searchText,
          "type" : "track"
        }
      });
      spotifyResponsePromise.success(function(data, status, headers, config) {
        $scope.myData.spotify.results = data.tracks.items;
      });
      spotifyResponsePromise.error(function(data, status, headers, config) {
        console.log("AJAX failed!");
      });

      //soundcloud API
      var clientId = '09ae0464d724195b755f6205f2753390';
      var soundcloudResponsePromise = $http.get("http://api.soundcloud.com/tracks/", {
        "params" : {
          "q" : $scope.searchText,
          "client_id" : clientId
        }
      });
      soundcloudResponsePromise.success(function(data, status, headers, config) {
        $scope.myData.soundcloud.results = data;
      });
      soundcloudResponsePromise.error(function(data, status, headers, config) {
        console.log("AJAX failed!");
      });

    }

  });

})();