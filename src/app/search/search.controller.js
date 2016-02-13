(function () {

  'use strict';

  angular
    .module('jukebox')
    .controller('SearchController', searchController);

  function searchController($scope, $routeParams, $http) {
    $scope.myData = {};
    $scope.myData.spotify = {};
    $scope.myData.soundcloud = {};

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
        console.log('AJAX failed!');
      });

      //soundcloud API
      var clientId = '09ae0464d724195b755f6205f2753390';
      var soundcloudResponsePromise = $http.get('http://api.soundcloud.com/tracks/', {
        'params' : {
          'q' : $scope.searchText,
          'client_id' : clientId
        }
      });
      soundcloudResponsePromise.success(function(data) {
        $scope.myData.soundcloud.results = data;
      });
      soundcloudResponsePromise.error(function() {
        console.log('AJAX failed!');
      });
    };
  }

})();