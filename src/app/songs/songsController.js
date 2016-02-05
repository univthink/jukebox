(function () {

  'use strict';

  angular
    .module('jukebox')
    .controller('SongsController', songsController);

  function songsController($scope, $http) {
    $scope.songs = [
      { 'name': 'The Yellow Submarine', 'artist': 'The Beatles', 'price':1.29 },
      { 'name': 'Hello', 'artist': 'Adele', 'price': 0.99 },
      { 'name': 'Stairway to Heaven', 'artist':' Led Zeppelin', 'price': 0.59 }
    ];
    $scope.myData = {};
    $scope.myData.sendQuery = function() {
      var responsePromise = $http.get('https://api.spotify.com/v1/search', {
        'params' : {
          'q' : $scope.searchText,
          'type' : 'track'
        }
      });
      responsePromise.success(function(data) {
        $scope.myData.results = data.tracks.items;
      });
      responsePromise.error(function() {
        console.log('AJAX failed!');
      });
    };
  }

})();