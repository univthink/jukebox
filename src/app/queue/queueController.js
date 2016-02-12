(function () {

  'use strict';

  angular
    .module('jukebox')
    .controller('QueueController', function($scope, $routeParams, $http, backendAPI) { // TODO: Remove $http when song search is moved to a separate factory

      $scope.status = '';
      $scope.roomId = $routeParams.roomId;

      // Example usage of backendAPI factory
      function joinRoom() {
        backendAPI.joinRoom({
          room_id: $scope.roomId,
          user_id: '5838406743490560', // TODO: Update this
          //password: '', TODO: Update this
        }).success(function(data) {
          console.log(data);
          if (data.status == "NOT OK") {
            $scope.status = data.message;
          } else {
            console.log("Join room was a success!");
            console.log(data);
          }
        }).error(function(error) {
          $scope.status = error.message;
        });
      }

      joinRoom();

      $scope.myData = {};
      $scope.myData.spotify = {};
      $scope.myData.soundcloud = {};
      // $scope.myData.sendQuery = function() {
      //   //spotify API
      //   var spotifyResponsePromise = $http.get("https://api.spotify.com/v1/search", {
      //     "params" : {
      //       "q" : $scope.searchText,
      //       "type" : "track"
      //     }
      //   });
      //   spotifyResponsePromise.success(function(data, status, headers, config) {
      //     $scope.myData.spotify.results = data.tracks.items;
      //   });
      //   spotifyResponsePromise.error(function(data, status, headers, config) {
      //     console.log("AJAX failed!");
      //   });

      //   //soundcloud API
      //   var clientId = '09ae0464d724195b755f6205f2753390';
      //   var soundcloudResponsePromise = $http.get("http://api.soundcloud.com/tracks/", {
      //     "params" : {
      //       "q" : $scope.searchText,
      //       "client_id" : clientId
      //     }
      //   });
      //   soundcloudResponsePromise.success(function(data, status, headers, config) {
      //     $scope.myData.soundcloud.results = data;
      //   });
      //   soundcloudResponsePromise.error(function(data, status, headers, config) {
      //     console.log("AJAX failed!");
      //   });
      // };

  });

})();