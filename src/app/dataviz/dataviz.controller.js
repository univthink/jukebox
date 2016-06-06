(function () {

  'use strict';

  angular
    .module('jukebox')
    .controller('DatavizController', datavizController);

  function datavizController($scope, $http, $timeout, Spotify) {
    $scope.loadFromSampleData = "";
    $scope.pageClass = 'dataviz-page';
    $scope.musicLoadingIsComplete = false;
    $scope.getSongsClicked = false;
    $scope.errorText = "";
    $scope.tutorialVisible = true;

    // initialize data objects
    $scope.musicData = {}; // maps spotify ids to data objects
    $scope.musicTracks = [];
    $scope.savedTrackList = [];
    $scope.topTracks = {
      "long_term" : {},
      "medium_term": {},
      "short_term": {}
    };

    $scope.userIsLoggedIn = false;
    $scope.login = function () {
      Spotify.login();
      $scope.userIsLoggedIn = true;
    };

    // Helper functions
    // TODO: Move these to a separate file / service.
    function isEmpty(obj) {
      return Object.keys(obj).length === 0;
    }

    $scope.getSongs = function() {
      $scope.errorText = "";
      $scope.getSongsClicked = true;
      $scope.loadFromSampleData = "";
      $scope.musicLoadingIsComplete = false;
      $scope.musicData = {}; // maps spotify ids to data objects
      $scope.musicTracks = [];
      $scope.savedTrackList = [];
      $scope.topTracks = {
        "long_term" : {},
        "medium_term": {},
        "short_term": {}
      };
      getSavedTracksFromSpotify(0, 50);
    }

    $scope.loadFromDataSet = function(str) {
      $scope.loadFromSampleData = str;
      //$scope.userIsLoggedIn = true;
      //$scope.getSongsClicked = true;
      $scope.musicLoadingIsComplete = true;
      if ($scope.tutorialVisible) $timeout(function() { $scope.tutorialVisible = false; }, 10000);
    }

    $scope.playSelectedSong = function(track_name, artist_name) {
      $scope.$broadcast('updateVideoEvent', track_name, artist_name);
    }

    $scope.$watch('featureRequestsToMake', function() {
      //console.log($scope.featureRequestsToMake);
      if ($scope.featureRequestsToMake == 0) {
        console.log("Music loading is complete!", $scope.musicData);
        $scope.musicTracks = Object.keys($scope.musicData).map(key => $scope.musicData[key]);
        $scope.musicLoadingIsComplete = true; // triggers initializing the GraphController
        if ($scope.tutorialVisible) $timeout(function() { $scope.tutorialVisible = false; }, 10000);
      }
    });

    $scope.$watch('topTracks', function() {
      // listener function
      if ( !isEmpty($scope.topTracks["long_term"]) && !isEmpty($scope.topTracks["medium_term"]) && !isEmpty($scope.topTracks["short_term"]) ) {
          console.log("All top tracks finished loading!", $scope.topTracks);
          // getAudioFeaturesFromTracks($scope.savedTrackList);
          for (let item of $scope.savedTrackList) {
            var track_obj = item.track;
            track_obj["added_at"] = item["added_at"];
            track_obj["is_top"] = [];
            if ($scope.topTracks["long_term"][track_obj.id]) track_obj["is_top"].push("long_term");
            if ($scope.topTracks["medium_term"][track_obj.id]) track_obj["is_top"].push("medium_term");
            if ($scope.topTracks["short_term"][track_obj.id]) track_obj["is_top"].push("short_term");
            $scope.musicData[track_obj.id] = track_obj;
          }
          addAudioFeaturesToTracks(Object.keys($scope.musicData));
      }
    }, true);

    function getTracksAudioFeatures(track_ids_str, offset, idList) {
      Spotify.getTracksAudioFeatures(track_ids_str).then(function (data) {
        $scope.featureRequestsToMake -= 1;
        for (var j = 0; j < data["audio_features"].length; j++) {
          if ( offset+1 == idList.length ) { // last run of getTracks
            if (idList[idList.length-(idList.length % 100)+j] != data["audio_features"][j].id) console.log("There is a problem at ", offset, j);
            $scope.musicData[idList[idList.length-(idList.length % 100)+j]]["audio_features"] = data["audio_features"][j];
          } else if ( (offset+1) % 100 == 0 ) { // mid run of getTracks
            if (idList[(offset+1)-100+j] != data["audio_features"][j].id) console.log("There is a problem at ", offset, j);
            $scope.musicData[idList[(offset+1)-100+j]]["audio_features"] = data["audio_features"][j];
          } else {
            console.log("This should never happen...");
          }
        }
      }).catch(function(e) {
        console.log("Something went wrong!");
        console.log(e); // "oh, no!"
      });
    }

    function addAudioFeaturesToTracks(idList) {
      $scope.featureRequestsToMake = Math.ceil(idList.length / 100);
      var track_ids_str = "";
      for (var i = 0; i < idList.length; i++) {
        track_ids_str += idList[i] + ',';
        if ( ( (i+1) % 100 == 0 ) || ( i+1 == idList.length ) ) {
          track_ids_str = track_ids_str.slice(0, -1);
          getTracksAudioFeatures(track_ids_str, i, idList);
          track_ids_str = "";
        }
      }
    }

    function getSavedTracksFromSpotify(offset, limit) {
      Spotify.getSavedUserTracks({"offset":offset, "limit":limit}).then(function (data) {
        console.log(offset, data.items);
        $scope.savedTrackList = $scope.savedTrackList.concat(data.items);
        if (data.items.length < limit) {
          console.log('Saved tracks finished loading!', $scope.savedTrackList);
          getTopTracksFromSpotify();
          return true;
        }
        setTimeout(function() {
          getSavedTracksFromSpotify(offset+limit, limit);
        }, 100);
      }).catch(function(e) {
        console.log("Something went wrong!");
        console.log(e); // "oh, no!"
        $scope.errorText = 'Error importing Spotify library. Please click Get Songs again.';
      });
    }

    function getTopTracksFromSpotify() {
      Spotify.getUserTopTracks({"limit":50, "time_range":"long_term"}).then(function (data) {
        for (var i = 0; i < data.items.length; i++) {
          $scope.topTracks["long_term"][data.items[i].id] = data.items[i];
        }
        // console.log('Top tracks: long_term', $scope.topTracks["long_term"]);
        return true;
      });
      Spotify.getUserTopTracks({"limit":50, "time_range":"medium_term"}).then(function (data) {
        for (var i = 0; i < data.items.length; i++) {
          $scope.topTracks["medium_term"][data.items[i].id] = data.items[i];
        }
        // console.log('Top tracks: medium_term', $scope.topTracks["medium_term"]);
        return true;
      });
      Spotify.getUserTopTracks({"limit":50, "time_range":"short_term"}).then(function (data) {
        for (var i = 0; i < data.items.length; i++) {
          $scope.topTracks["short_term"][data.items[i].id] = data.items[i];
        }
        // console.log('Top tracks: short_term', $scope.topTracks["short_term"]);
        return true;
      });
    }

  }

})();