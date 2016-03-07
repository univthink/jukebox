(function () {

  'use strict';

  angular
    .module('jukebox')
    .controller('SearchController', searchController);

  function searchController($scope, $routeParams, $http, backendAPI, sharedRoomData, $uibModalInstance) {
    $scope.roomId = $routeParams.roomId;

    $scope.querying = true;
    $scope.myData = {};
    $scope.myData.spotify = {};
    // $scope.myData.soundcloud = {};

    backendAPI.getTrendingSongs().success(function(data) {
      if (data.status === 'OK') {
        $scope.querying = false;
        console.log('OK backendAPI.getTrendingSongs', data);
        $scope.myData.spotify.suggestions = data.data.map(function(e) {
          return e.track;
        });
      } else {
        console.log('NOT OK backendAPI.getTrendingSongs', data);
      }
    }).error(function(error) {
      $scope.querying = false;
      console.log('ERROR backendAPI.getTrendingSongs', error);
    });

    $scope.myData.sendQuery = function() {
      //spotify API
      $scope.querying = true;
      var spotifyResponsePromise = $http.get('https://api.spotify.com/v1/search', {
        'params' : {
          'q' : $scope.searchText,
          'type' : 'track'
        }
      });
      spotifyResponsePromise.success(function(data) {
        $scope.querying = false;
        console.log('OK SearchController.sendQuery', data);
        //$scope.myData.spotify.query = data.tracks.href.split("?")[1].split("&")[0].split("=")[1];
        $scope.myData.spotify.results = data.tracks.items;
      });
      spotifyResponsePromise.error(function() {
        $scope.querying = false;
        $scope.myData.spotify.results = null;
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

    $scope.closeSearch = function() {
      $uibModalInstance.close();
    };

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
            getSongQueue(); // TODO: make this a service
            console.log('OK backendAPI.addSong', data);
          } else {
            console.log('NOT OK backendAPI.addSong', data);
          }
          $scope.closeSearch();
        }).error(function(error) {
          console.log('ERROR backendAPI.addSong', error);
        });

    };
  }

})();