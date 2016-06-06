(function () {

  'use strict';

  angular
    .module('jukebox')
    .controller('GraphControlsController', graphControlsController);

  function graphControlsController($scope) {

    $scope.changeXAxisCategory = function() {
      if ($scope.axisCategory.x.value == 'time') {
        for (var i = 0; i < $scope.musicTracks.length; i++) {
          $scope.musicTracks[i]["x_category"] = $scope.musicTracks[i]["date"];
          $scope.musicTracks[i]["x_category_val"] = 'time';
        }
        $scope.changeXScaleToDate();
      } else {
        for (var i = 0; i < $scope.musicTracks.length; i++) {
          $scope.musicTracks[i]["x_category"] = $scope.musicTracks[i]["audio_features"][$scope.axisCategory.x.value];
          $scope.musicTracks[i]["x_category_val"] = $scope.axisCategory.x.value;
        }
        $scope.changeXScaleToFeature();
      }
      $scope.updateAxisLabels();
      $scope.updateGraph();
    };

    $scope.changeYAxisCategory = function() {
      for (var i = 0; i < $scope.musicTracks.length; i++) {
        $scope.musicTracks[i]["y_category"] = $scope.musicTracks[i]["audio_features"][$scope.axisCategory.y.value];
        $scope.musicTracks[i]["y_category_val"] = $scope.axisCategory.y.value;
      }
      $scope.updateAxisLabels();
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