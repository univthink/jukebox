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
      });
      spotifyResponsePromise.error(function() {
        $scope.myData.spotify = {};
        console.log('ERROR returning results from spotify');
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
          console.log('OK backendAPI.getSongQueue', data);
        } else {
          console.log('NOT OK backendAPI.getSongQueue', data);
        }
      }).error(function(error) {
        console.log('ERROR backendAPI.getSongQueue', error);
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
          if (data.status === 'OK') {
            $('#slide-bottom-popup').modal('hide'); // TODO: Don't do this
            // refresh song queue, call getSongQueue() from queueController
            getSongQueue(); // TODO: make this a service
            console.log('OK backendAPI.addSong', data);
          } else {
            console.log('NOT OK backendAPI.addSong', data);
          }
        }).error(function(error) {
          console.log('ERROR backendAPI.addSong', error);
        });

    }
  }

})();