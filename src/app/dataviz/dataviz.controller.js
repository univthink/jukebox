(function () {

  'use strict';

  angular
    .module('jukebox')
    .controller('DatavizController', datavizController);

  function datavizController($scope, $http, Spotify) {

    $scope.pageClass = 'dataviz-page';
    $scope.musicLoadingIsComplete = false;
    $scope.musicData = {}; // maps spotify ids to data objects
    $scope.savedTrackList = [];
    $scope.topTracks = {
      "long_term" : {},
      "medium_term": {},
      "short_term": {}
    };

    Spotify.login();

    $scope.login = function () {
      Spotify.login();
    };

    // Helper functions
    // TODO: Move these to a separate file / service.
    function isEmpty(obj) {
      return Object.keys(obj).length === 0;
    }
    $scope.$watch('musicLoadingIsComplete', function() {
      if ($scope.musicLoadingIsComplete) {
        console.log("Music loading is complete!", $scope.musicData);
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
          getAndAddAudioFeaturesToTracks(Object.keys($scope.musicData));
      }
    }, true);

    function getAndAddAudioFeaturesToTracks(idList) {
      var track_ids_str = "";
      for (var i = 0; i < idList.length; i++) {
        track_ids_str += idList[i] + ',';
        if ( ( (i+1) % 100 == 0 ) || ( i+1 == idList.length ) ) {
          track_ids_str = track_ids_str.slice(0, -1);
          Spotify.getTracksAudioFeatures(track_ids_str).then(function (data) {
            for (var j = 0; j < data["audio_features"].length; j++) {
              if ( this+1 == idList.length ) { // last run of getTracks
                if (idList[(this+1)-idList.length+j] != data["audio_features"][j].id) console.log("There is a problem!");
                $scope.musicData[idList[(this+1)-idList.length+j]]["audio_features"] = data["audio_features"][j];
                if ( j+1 == data["audio_features"].length ) { // features have been added to the last track
                  $scope.musicLoadingIsComplete = true;
                }
              } else if ( (this+1) % 100 == 0 ) { // mid run of getTracks
                if (idList[(this+1)-100+j] != data["audio_features"][j].id) console.log("There is a problem!");
                $scope.musicData[idList[(this+1)-100+j]]["audio_features"] = data["audio_features"][j];
              } else {
                console.log("This should never happen...");
              }
            }
          }.bind(i));
          track_ids_str = "";
        }
      }
    }

    function getSavedTracksFromSpotify(offset, limit) {
      Spotify.getSavedUserTracks({"offset":offset, "limit":limit}).then(function (data) {
        $scope.savedTrackList = $scope.savedTrackList.concat(data.items);
        if (data.items.length < limit) {
          console.log('Saved tracks finished loading!', $scope.savedTrackList);
          getTopTracksFromSpotify();
          return true;
        }
        getSavedTracksFromSpotify(offset+limit, limit);
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

    $scope.getSongs = function() {
      getSavedTracksFromSpotify(0, 50);
    }

    $scope.playSelectedSong = function(track_name, artist_name) {
      $scope.$broadcast('updateVideoEvent', track_name, artist_name);
    }

  }

})();