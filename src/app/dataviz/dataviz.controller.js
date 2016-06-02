(function () {

  'use strict';

  angular
    .module('jukebox')
    .controller('DatavizController', datavizController);

  function datavizController($scope, Spotify) {

    $scope.pageClass = 'dataviz-page';
    $scope.songList = []

    Spotify.login();

    $scope.login = function () {
      Spotify.login();
    };

    function getSavedTracksFromSpotify(offset, limit) {
      Spotify.getSavedUserTracks({"offset":offset, "limit":limit}).then(function (data) {
        console.log(data.items);
        $scope.songList = $scope.songList.concat(data.items);
        if (data.items.length < limit) {
          console.log($scope.songList);
          return true;
        }
        getSavedTracksFromSpotify(offset+limit, limit);
      });
    }

    $scope.getSongs = function() {
      getSavedTracksFromSpotify(0, 20);
    }

    $scope.playSelectedSong = function(track_name, artist_name) {
      $scope.$broadcast('updateVideoEvent', track_name, artist_name);
    }

  }

})();