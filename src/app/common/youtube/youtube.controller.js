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

      $scope.$watch('room.queue', function() {
        if ($scope.room.queue[0].unique_id !== firstTrackUUID) {
          updateCurrentVideo();
        }
      });

      $rootScope.$watch('responsiveVersion', function() {
        if ($rootScope.responsiveVersion == 'desktop') {
          if ($scope.room.queue[0].unique_id !== firstTrackUUID) {
            updateCurrentVideo();
          }
        } else {
          // $scope.yt_video_id = '';
        }
      });

      function updateCurrentVideo() {
        firstTrackUUID = sharedRoomData.queue[0].unique_id;
        if ($rootScope.responsiveVersion == 'desktop') {
          getMusicVideos()
            .success(function(data) {
              console.log(data);
              if (data.items.length >= 1) {
                $scope.yt_video_id = data.items[0].id.videoId;
              }
            })
            .error(function(error) {
              console.log(error);
            });
          }
      }

      function getMusicVideos() {
        return $http({
          url: 'https://www.googleapis.com/youtube/v3/search',
          method: 'GET',
          params: {
            part: 'snippet',
            key: yt_api_key,
            q: $scope.room.queue[0].track + ' ' + $scope.room.queue[0].artist,
            type: 'video',
            videoEmbeddable: 'true',
          }
        });
      }

    }

})();