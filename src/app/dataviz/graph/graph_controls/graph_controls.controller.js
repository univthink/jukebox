(function () {

  'use strict';

  angular
    .module('jukebox')
    .controller('GraphControlsController', graphControlsController);

  function graphControlsController($scope) {
    $scope.changeXAxisCategory = function() {
      console.log($scope.xAxisCategory);
    };
    $scope.changeYAxisCategory = function() {
      for (var i = 0; i < $scope.musicTracks.length; i++) {
        $scope.musicTracks[i]["y_category"] = $scope.musicTracks[i]["audio_features"][$scope.yAxisCategory];
      }
      $scope.updateGraph();
    };
    $scope.changeTopTimePeriod = function() {
      document.getElementById("mygraph").classList = [];
      document.getElementById("mygraph").classList.add($scope.selectedTimePeriod);
      $scope.toggleHiddenNonTopTracks();
    };
    $scope.toggleHiddenNonTopTracks = function() {
      if ($scope.nonTopTracksHidden)
        document.getElementById("mygraph").classList.add("hide-non-top");
      else {
        document.getElementById("mygraph").classList.remove("hide-non-top");
      }
    }
  }

})();