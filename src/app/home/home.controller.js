(function () {

  'use strict';

  angular
    .module('jukebox')
    .controller('HomeController', homeController);

  function homeController($scope, $location, backendAPI, $http) {

    var GEOLOCATION_TIMEOUT = 30; // in seconds
    var OLDEST_CACHED_GEOLOCATION_TO_ACCEPT = 60; // in seconds

    $scope.pageClass = 'home-page';
    $scope.coordinates = [];

    // $scope.logoFill = 'black';

    function getLocation(callbackOnSuccess, callbackOnFailure) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function(position) {
            $scope.logoFill = 'url(#lg)';
            console.log('Location acquired.');
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            $scope.coordinates = [lat, lng];
            console.log($scope.coordinates);
            if (callbackOnSuccess) callbackOnSuccess();
          },
          function() {
            if (callbackOnFailure) callbackOnFailure();
          },
          { timeout: GEOLOCATION_TIMEOUT * 1000 },
          { maximumAge: OLDEST_CACHED_GEOLOCATION_TO_ACCEPT * 1000 } // I'm not sure if this is helpful
        );
      } else {
        if (callbackOnFailure) callbackOnFailure(); // browser/device does not support geolocation
      }
    }

    getLocation(
      function() { // success
        backendAPI.searchRooms({
          coordinates: $scope.coordinates[0] + ',' + $scope.coordinates[1],
          distance: '10000'
        }).success(function(data) {
          if (data.status === 'OK') {
            console.log('OK backendAPI.searchRooms', data);
            if (data.data.length >= 1) {
              $location.path(data.data[0].id);
            } else {
              console.log('No nearby rooms available.');
            }
          } else {
            console.log('NOT OK backendAPI.searchRooms', data);
          }
        }).error(function(data) {
          console.log('NOT OK backendAPI.searchRooms', data);
        });
      },
      function() { // failure
        console.log("Could not get location.");
      });

  }

})();