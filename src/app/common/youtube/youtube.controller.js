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

      $rootScope.$watch('responsiveVersion', function() {
        updateCurrentVideo();
      });

      $scope.$watch('room.queue', function() {
        updateCurrentVideo();
      });

      function updateCurrentVideo() {
        if ($rootScope.responsiveVersion == 'mobile' && $scope.yt_video_id === '') return; // don't query on mobile
        if ($scope.room.queue[0].unique_id == firstTrackUUID) return; // no need to requery youtube if the query hasn't changed
        firstTrackUUID = sharedRoomData.queue[0].unique_id;
        getMusicVideos()
          .success(function(data) {
            console.log('OK YoutubeController.updateCurrentVideo', data);
            if (data.items.length >= 1) {
              $scope.yt_video_id = data.items[0].id.videoId;
            }
          })
          .error(function(error) {
            console.log('ERROR YoutubeController.updateCurrentVideo', error);
          });
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