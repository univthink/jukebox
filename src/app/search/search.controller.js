(function () {

  'use strict';

  angular
    .module('jukebox')
    .controller('SearchController', searchController);

  function searchController($scope, $routeParams, $http, backendAPI, sharedRoomData) {
    $scope.pageClass = 'search-page';

    $scope.roomId = $routeParams.roomId;

    $scope.myData = {};
    $scope.myData.spotify = {};
    // $scope.myData.soundcloud = {};

    $scope.myData.sendQuery = function() {
      //spotify API
      var spotifyResponsePromise = $http.get('https://api.spotify.com/v1/search', {
        'params' : {
          'q' : $scope.searchText,
          'type' : 'track'
        }
      });
      spotifyResponsePromise.success(function(data) {
        $scope.myData.spotify.results = data.tracks.items;
        console.log($scope.myData.spotify.results);
      });
      spotifyResponsePromise.error(function() {
        $scope.myData.spotify = {};
        console.log('AJAX failed!');
      });

      // // soundcloud API
      // var clientId = '09ae0464d724195b755f6205f2753390';
      // var soundcloudResponsePromise = $http.get('http://api.soundcloud.com/tracks/', {
      //   'params' : {
      //     'q' : $scope.searchText,
      //     'client_id' : clientId
      //   }
      // });
      // soundcloudResponsePromise.success(function(data) {
      //   $scope.myData.soundcloud.results = data;
      // });
      // soundcloudResponsePromise.error(function() {
      //   $scope.myData.soundcloud = {};
      //   console.log('AJAX failed!');
      // });
    };

    // TODO: this is duplicate code from queueController, it should be made into a service
    function getSongQueue() {
      backendAPI.getSongQueue({
        room_id: sharedRoomData.roomId,
        password: sharedRoomData.password,
      }).success(function(data) {
        if (data.status === 'OK') {
          sharedRoomData.roomName = data.room_name;
          sharedRoomData.queue = data.data;
        } else {
          console.log('getSongQueue ->', data);
        }
      }).error(function(error) {
        console.log(error);
      });
    }

    $scope.addSong = function(url, name, artist, album, album_art_url) {

        backendAPI.addSong({
          room_id: sharedRoomData.roomId,
          user_id: sharedRoomData.userId,
          password: sharedRoomData.password,
          url: url,
          track: name,
          artist: artist,
          album: album,
          album_art_url: album_art_url
        }).success(function(data) {
          console.log(data);
          if (data.status === 'NOT OK') {
            console.log('NOT OK', data);
          } else {
            console.log('OK', data);

            $('#slide-bottom-popup').modal('hide'); // TODO: Don't do this

            // refresh song queue, call getSongQueue() from queueController
            getSongQueue(); // TODO: make this a service

          }
        }).error(function(error) {
          console.log('FAIL', data.message);
        });

    }
  }

})();