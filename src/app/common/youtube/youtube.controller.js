(function () {

  'use strict';

  angular
    .module('jukebox')
    .controller('YoutubeController', YoutubeController)
    .filter('youtubeEmbedUrl', function($sce) {
      return function(youtubeVideoId) {
        return $sce.trustAsResourceUrl('http://www.youtube.com/embed/' + youtubeVideoId + '?autoplay=1&iv_load_policy=3&origin=http://letsjukebox.com/');
      };
    });


    function YoutubeController($scope, $rootScope, $http, $sce, sharedRoomData) {

      var yt_api_key = 'AIzaSyALGbklexv5u7P3zjV4xJCYfEYLwwukfkE';

      $scope.room = sharedRoomData;
      $scope.yt_video_id = '';
      var firstTrackUUID = '';

      // TODO: Reimplement these!

      // $rootScope.$watch('responsiveVersion', function() {
      //   updateVideoToCurrentTopTrack();
      // });

      // $scope.$watch('room.queue', function() {
      //   updateVideoToCurrentTopTrack();
      // });

      $scope.$on('updateVideoEvent', function(event, track_name, artist_name) {
        updateCurrentVideo(track_name, artist_name);
      });

      function updateCurrentVideo(track_name, artist_name) {
        getMusicVideos(track_name, artist_name)
          .success(function(data) {
            // console.log('OK YoutubeController.updateCurrentVideo', data);
            if (data.items.length >= 1) {
              $scope.yt_video_id = data.items[0].id.videoId;
            }
          })
          .error(function(error) {
            console.log('ERROR YoutubeController.updateCurrentVideo', error);
          });
      }

      function updateVideoToCurrentTopTrack() {
        if ($rootScope.responsiveVersion == 'mobile' && $scope.yt_video_id === '') return; // don't query on mobile
        if ($scope.room.queue[0].unique_id == firstTrackUUID) return; // no need to requery youtube if the query hasn't changed
        firstTrackUUID = sharedRoomData.queue[0].unique_id;
        getMusicVideos($scope.room.queue[0].track, $scope.room.queue[0].artist)
          .success(function(data) {
            console.log('OK YoutubeController.updateVideoToCurrentTopTrack', data);
            if (data.items.length >= 1) {
              $scope.yt_video_id = data.items[0].id.videoId;
            }
          })
          .error(function(error) {
            console.log('ERROR YoutubeController.updateVideoToCurrentTopTrack', error);
          });
      }

      function getMusicVideos(track_name, artist_name) {
        return $http({
          url: 'https://www.googleapis.com/youtube/v3/search',
          method: 'GET',
          params: {
            part: 'snippet',
            key: yt_api_key,
            q: track_name + ' ' + artist_name,
            type: 'video',
            videoEmbeddable: 'true',
          }
        });
      }

    }

})();